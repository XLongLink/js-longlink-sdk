import Client from './client';
import algosdk from 'algosdk';
import { ALGORAND_CHAIN_ID, MAINNET } from '../utils/constants';
import { isNode, isBrowser, formatJsonRpcRequest } from '@json-rpc-tools/utils';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import * as nobleEd25519 from '@noble/ed25519';

/*

    Login function
    if there is no connection already active, create a connection
    PARMS: 
        openQRCode: boolean
        if true in browser open a popup of the qrcode
        if true in nodejs print the uri in console
    
    return a promise
    
*/
export function login(this: Client, openQRCode = true) {
    return new Promise((resolve) => {
        if (!this.connector.connected) {
            this.connector.off('display_uri');
            this.connector
                .createSession({ chainId: ALGORAND_CHAIN_ID })
                .then(() => {
                    if (openQRCode && isBrowser())
                        QRCodeModal.open(this.connector.uri, () => {});
                    if (openQRCode && isNode()) console.log(this.connector.uri);
                    this.uri = this.connector.uri;
                    resolve({ uri: this.uri });
                });
        } else {
            this.uri = this.connector.uri;
            resolve({ uri: this.uri });
        }
    });
}

/*

    Authentication function
    if user is logged (and), create a authetication transaction.
    It's a zero fee transaction that get refused by the network

    Base of the code: https://github.com/AlgoDoggo/statelessAuth/blob/main/src/helpers/draftAuthTx.js
    ARC-0014 discussion: https://github.com/algorandfoundation/ARCs/pull/84/files

    [to do] expire time
    [to do] chose network
    [to do] error on not logged
    [to do] modify note into json, add time, project id, ...
    [to do] if token has expired

*/
const day1 = 86400000;
export function authenticate(this: Client) {
    return new Promise(async (resolve) => {
        if (this.isLogged && this.connector.connected) {
            const enc = new TextEncoder();
            const notePlainText = `https://stateless-auth.vercel.app/ ${
                Date.now() + day1
            }`;
            const note = enc.encode(notePlainText);

            const authTransaction =
                algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    suggestedParams: {
                        fee: 0,
                        firstRound: 10,
                        flatFee: true,
                        genesisHash: MAINNET.hash,
                        genesisID: MAINNET.id,
                        lastRound: 10
                    },
                    from: this.wallet,
                    to: this.wallet,
                    amount: 0,
                    note
                });

            const txnToSign = [
                {
                    txn: Buffer.from(
                        algosdk.encodeUnsignedTransaction(authTransaction)
                    ).toString('base64'),
                    message:
                        'This transaction is free and for authentication purposes.'
                }
            ];

            const requestParams = [txnToSign];
            const request = formatJsonRpcRequest('algo_signTxn', requestParams);
            const result = await this.connector.sendCustomRequest(request);
            this.token = Array.isArray(result[0])
                ? Buffer.from(result[0]).toString('base64')
                : result[0];
            resolve({ token: this.token });
            this.trigger('authenticate', []);
        }
    });
}

/*
    Token Validy function
    Check it the token is valid for the active account

    Base of the code: https://github.com/AlgoDoggo/statelessAuth/blob/main/middleware/auth.js

    Return: 
        True if valid
        False if invalid

    [to do] catch error for invalid token sign
*/
export const minutes30 = 1800000;
export async function verifyToken(this: Client) {
    if (this.token) {
        //converting the base64 encoded tx back to binary data
        const decodeToken = new Uint8Array(Buffer.from(this.token, 'base64'));

        //getting a SignedTransaction object from the array buffer
        const decodedTx = algosdk.decodeSignedTransaction(decodeToken);

        //auth tx whose params we'll check
        const toCheck = decodedTx.txn;

        // get the signature from the signed transaction
        const signature = decodedTx.sig;
        if (signature) signature.toString();
        else return false;

        // parse the note back to utf-8
        const note = new TextDecoder().decode(toCheck.note);
        const decodedNote = note.split(' ');

        // "from" and "to" are distincts ArrayBuffers,
        // comparing them directly would always return false.
        // We therefore convert them back to base32 for comparison.
        const from = algosdk.encodeAddress(toCheck.from.publicKey);
        const to = algosdk.encodeAddress(toCheck.to.publicKey);

        // Guard clause to make sure the token has not expired.
        // We also check the token expiration is not too far out, which would be a red flag.
        if (
            Number(decodedNote[1]) < Date.now() ||
            Number(decodedNote[1]) > Date.now() + day1 + minutes30
        ) {
            throw new Error('Token expired, authenticate again');
        }
        if (toCheck.firstRound !== 10 || toCheck.lastRound !== 10) return false;
        if (from !== to && from !== this.wallet) return false;
        if (decodedNote[0] !== 'https://stateless-auth.vercel.app/')
            return false;
        // verify signature and return if it succeeds
        const verified = await nobleEd25519.verify(
            signature,
            toCheck.bytesToSign(),
            toCheck.from.publicKey
        );
        if (verified) return true;
    }
    return false;
}
