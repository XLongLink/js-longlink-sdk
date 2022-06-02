import ll from '../src/client';

import algosdk from 'algosdk';
import { AlgorandWCClient } from './algo';

export async function LLtestLogin() {
    /*
        Generate account for testing
        has to be chainged with an account with founds for testnet
    */
    const account = algosdk.generateAccount();
    console.log('Client account:', account.addr);
    //console.log('Client sk:', algosdk.secretKeyToMnemonic(account.sk));

    const client = new AlgorandWCClient({
        description: 'This is a test client!',
        url: 'https://example.com/client',
        icons: [],
        name: 'Test Client'
    });

    /*
        Inizialize ll login, in browser shuld automatically open qr code.
        In any case it create the uri of walletconenct

        the paramater openQRCode (default true) decide if the qrcode has to be displyed or printed in console
    */

    await ll.login(false);
    console.log(ll.uri);
    /*
        Simulate a session, this in handled by the wallet
    */
    if (ll.uri) {
        const session = client.newSession(ll.uri);

        session.onError((err) => {
            console.error('Session error:', err);
        });

        session.onDisconnect(() => {
            console.log('Session disconnected');
        });

        await session.connect((peerMeta) => {
            return [account.addr];
        });

        session.onSigningRequest((txns, message) => {
            let success = true;
            let result: Array<Uint8Array | null> = [];

            for (const walletTxn of txns) {
                const shouldSign =
                    walletTxn.signers == null || walletTxn.signers.length !== 0;

                if (!shouldSign) {
                    console.log(
                        `Txn ${walletTxn.txn.txID()} received, no sig required`
                    );
                    result.push(null);
                    continue;
                }

                if (
                    (walletTxn.signers && walletTxn.signers.length > 1) ||
                    walletTxn.msig
                ) {
                    success = false;
                    console.log(`Txn is multisig`);
                    result.push(null);
                    continue;
                }

                const signer = walletTxn.signers
                    ? walletTxn.signers[0]
                    : algosdk.encodeAddress(walletTxn.txn.from.publicKey);

                if (signer !== account.addr) {
                    success = false;
                    console.log(
                        `Txn ${walletTxn.txn.txID()} has unknown signer: ${signer}`
                    );
                    result.push(null);
                    continue;
                }

                console.log(
                    `Txn ${walletTxn.txn.txID()} received, signing with ${signer}`
                );

                const signedTxn = walletTxn.txn.signTxn(account.sk);
                result.push(signedTxn);
            }

            if (success) {
                return result;
            }

            throw new Error('Transaction signing not successful');
        });
    }

    /* 
        once the user is connected with walletconnect, ask for autheticazion.
        This shuld be done in 2 diffrent steps because of a bug in pera wallet:

        Report: https://github.com/perawallet/pera-wallet/issues/77
    */

    ll.onConnect(async () => {
        await ll.authenticate();
        console.log(ll.token);
    });
}
