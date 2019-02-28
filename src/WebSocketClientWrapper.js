import {EventEmitter} from 'events';

const WebSocketClientState = {
    disconnected: 'disconnected',
    connected: 'connected',
};

export class WebSocketClientWrapper extends EventEmitter {
    get state(){
        return this.ws.readyState === 1 ? WebSocketClientState.connected : WebSocketClientState.disconnected;
    }

    get readyState(){
        return this.ws.readyState;
    }

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
        return new WebSocketFilteredClient(this, predicate);
    }

    jsonify() {
        return new WebSocketJsonClient(this);
    }
}

export class WebSocketFilteredClient extends WebSocketClientWrapper {
    constructor(ws, predicate = () => true) {
        super(ws);
        this.predicate = predicate;
    }

    _handleMessage(event, flags) {
        if (this.predicate(event, flags)) {
            super._handleMessage(event, flags);
        }
    }
}

export class WebSocketJsonClient extends WebSocketClientWrapper {
    _handleMessage(event, flags) {
        this.emit('data', JSON.parse(event.data));
        super._handleMessage(event, flags);
    }

    write(json) {
        super.send(JSON.stringify(json));
    }
}
