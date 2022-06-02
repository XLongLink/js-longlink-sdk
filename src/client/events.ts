import Client from './client';
import {
    SessionConnectResponse,
    SessionDisconnectResponse,
    SessionUpdateResponse
} from '../utils/interfaces';

export function onConnect(
    this: Client,
    handler: (error: Error | null) => unknown
) {
    this.connector.on('connect', (err, payload) => {
        const { peerId, peerMeta, accounts }: SessionConnectResponse =
            payload.params[0];
        this.peerId = peerId;
        this.peerMeta = peerMeta;
        this.wallet = accounts[0];
        this.isLogged = true;
        handler(err);
    });
}

export function onUpdate(
    this: Client,
    handler: (error: Error | null, response: SessionUpdateResponse) => unknown
) {
    this.connector.on('session_update', (err, payload) => {
        const { accounts }: SessionUpdateResponse = payload.params[0];
        this.wallet = accounts[0];
        handler(err, { accounts });
    });
}

export function onDisconnect(
    this: Client,
    handler: (
        error: Error | null,
        payload: SessionDisconnectResponse
    ) => unknown
) {
    this.connector.on('disconnect', (err, payload) => {
        const { message }: SessionDisconnectResponse = payload.params[0];
        this.isLogged = false;
        handler(err, { message });
    });
}
