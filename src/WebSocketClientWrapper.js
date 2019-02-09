import {EventEmitter} from 'events';
import WebSocketFilteredClient from "./WebSocketFilteredClient";
import WebSocketJsonClient from "./WebSocketJsonClient";

const WebSocketClientState = {
    disconnected: 'disconnected',
    connected: 'connected',
};

export default class WebSocketClientWrapper extends EventEmitter {
    state = WebSocketClientState.disconnected;

    constructor(ws) {
        super();
        this.ws = ws;
        ws.on('open', e => this._handleOpen(e));
        ws.on('message', (event, flags) => this._handleMessage(event, flags));
        ws.on('error', e => this._handleOpen(e));
        ws.on('close', e => this._handleClose(e));
    }

    whenReadyCallbacks = [];

    whenReady(cb) {
        if (this.state === WebSocketClientState.connected) cb(this);
        this.whenReadyCallbacks.push(cb);
    }

    _handleOpen(e) {
        this.state = WebSocketClientState.connected;
        this.onopen(e);
        this.emit('open', e);

        this.whenReadyCallbacks.forEach(cb => cb(this));
        this.whenReadyCallbacks = [];
    }

    _handleMessage(event, flags) {
        this.onmessage(event, flags);
        this.emit('message', event, flags);
    }

    _handleError(e) {
        this.onerror(e);
        this.emit('error', e);
    }

    _handleClose(e) {
        this.state = WebSocketClientState.disconnected;
        this.onclose(e);
        this.emit('close', e);
    }

    send(data, option) {
        this.ws.send(data, option);
    }

    onopen(e) {
    }

    onmessage(e) {
    }

    onerror(e) {
    }

    onclose(e) {
    }

    filter(predicate) {
        return WebSocketFilteredClient(this, predicate);
    }

    jsonify() {
        return WebSocketJsonClient(this);
    }
}
