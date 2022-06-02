import { login, authenticate, verifyToken } from './auth';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import EventManager, { connectorEvents } from './events';
import { BRIDGE } from '../utils/constants';

class Client {
    id: string | undefined;
    url: string | undefined;
    connector: WalletConnect;
    isLogged = false;
    isAuthenticate = false;
    wallet: any;
    token: string | undefined;
    uri: string | undefined;
    login = login;
    authenticate = authenticate;
    verifyToken = verifyToken;
    // events
    private eventMagager = new EventManager();
    private connectorEvents = connectorEvents;

    constructor() {
        this.connector = new WalletConnect({
            bridge: BRIDGE,
            qrcodeModal: QRCodeModal
        });

        // subscribe to walletconnect events
        this.connectorEvents();
    }

    /*
        connect eventmager event's to Client function
    */
    on(event: string, callback: any) {
        this.eventMagager.subscribe(event, callback);
    }

    off(event: string) {
        this.eventMagager.unsubscribe(event);
    }

    trigger(name: string, args: Array<string>) {
        this.eventMagager.trigger(name, args);
    }
}

export default Client;
