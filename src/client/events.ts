import Client from './client';
import {
    SessionConnectResponse,
    SessionDisconnectResponse,
    SessionUpdateResponse
} from '../utils/interfaces';

/*
    Current used events:
    login -> user is logged
    update -> wc session update
    disconnect -> user disconnect
    authenticate -> user authenticate
*/

/*
    EventManager
*/
interface EventEmitter {
    event: string;
    callback: any; // has to be changed with a function ???
}

export default class EventManager {
    public _eventEmitters: Array<EventEmitter>;
    public test = 'ciao';

    constructor() {
        this._eventEmitters = [];
    }

    subscribe(event: string, callback: any) {
        const eventEmitter = {
            event,
            callback
        };
        if (!this._eventEmitters) return;
        this._eventEmitters.push(eventEmitter);
    }

    unsubscribe(event: string) {
        this._eventEmitters = this._eventEmitters.filter(
            (x) => x.event !== event
        );
    }

    trigger(name: string, args: Array<string>) {
        //filter event's by name
        let eventEmitters = this._eventEmitters.filter((x) => x.event === name);
        // trigger all filtred event's with parms
        eventEmitters.forEach((event) => {
            event.callback(...args);
        });
    }
}

/*
    Handle walletconnect events
    [to do] handle error
*/
export function connectorEvents(this: Client) {
    this.connector.on('connect', (_err, payload) => {
        const { accounts }: SessionConnectResponse = payload.params[0];
        this.wallet = accounts[0];
        this.isLogged = true;
        this.trigger('login', []);
    });

    this.connector.on('session_update', (_err, payload) => {
        const { accounts }: SessionUpdateResponse = payload.params[0];
        this.wallet = accounts[0];
        this.trigger('update', []);
    });

    this.connector.on('disconnect', (_err, payload) => {
        const { message }: SessionDisconnectResponse = payload.params[0];
        this.isLogged = false;
        this.trigger('disconnect', []);
    });
}
