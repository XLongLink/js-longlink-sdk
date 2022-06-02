import { login, authenticate } from './auth';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import { onConnect, onDisconnect, onUpdate } from './events';
import { BRIDGE } from '../utils/constants';

class Client {
    connector: WalletConnect;
    public id: string;
    public url: string;
    public isLogged = false;
    public isAuthenticate = false;
    public peerId: any;
    public peerMeta: any;
    public wallet: any;
    public token: string | undefined;
    public uri: string | undefined;
    public login = login;
    public authenticate = authenticate;
    public onConnect = onConnect;
    public onDisconnect = onDisconnect;
    public onUpdate = onUpdate;

    constructor(id = '', url = '') {
        this.id = id;
        this.url = url;
        this.connector = new WalletConnect({
            bridge: BRIDGE,
            qrcodeModal: QRCodeModal
        });
    }
}

export default Client;
