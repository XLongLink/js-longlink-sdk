import Client from './client';
import algosdk from 'algosdk';
import { ALGORAND_CHAIN_ID, MAINNET } from '../utils/constants';
import { isNode, isBrowser } from '@json-rpc-tools/utils';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import { formatJsonRpcRequest } from '@json-rpc-tools/utils';

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
        }
    });
}
