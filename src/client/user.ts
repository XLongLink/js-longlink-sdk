import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import algosdk from 'algosdk';
import { formatJsonRpcRequest } from '@json-rpc-tools/utils';

/*
    Class user

    [to do] move User class in diffrent folder, 
    in browser only 1 client can exist, but server can have multiple active clients
    [to do] Login
    [to do] autehticazion
*/

const connector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org', // Required
    qrcodeModal: QRCodeModal
});

class User {
    isConnected = false;
    constructor() {}

    login() {
        console.log(connector.connected);
        if (connector.connected) {
            // create new session
            connector.createSession();
            QRCodeModal.open(connector.uri, () => {});
        }
        return 'Hello, ';
    }

    authenticate() {
        return 'Hello, ';
    }
}

// create client
const client = new User();

// handle connector
connector.on('connect', (error, payload) => {
    client.isConnected = true;
    if (error) {
        throw error;
    }

    // Get provided accounts
    const { accounts } = payload.params[0];
});

connector.on('session_update', (error, payload) => {
    if (error) {
        throw error;
    }

    // Get updated accounts
    const { accounts } = payload.params[0];
});

connector.on('disconnect', (error, payload) => {
    client.isConnected = false;
    if (error) {
        throw error;
    }
});

/*
    Only one client shuld exist in a webpage
    create it here and export it

*/

export default client;
