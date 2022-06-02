import { IClientMeta } from '@walletconnect/types';

export interface SessionConnectResponse {
    peerId: string;
    peerMeta?: IClientMeta;
    accounts: string[];
}

export interface SessionDisconnectResponse {
    message?: string;
}

export interface SessionUpdateResponse {
    accounts: string[];
}
