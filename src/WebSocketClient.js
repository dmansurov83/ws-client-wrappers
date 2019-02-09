import {EventEmitter} from 'events';
import {WebSocketFilteredClient, WebSocketJsonClient} from './WebSocketClientWrapper';

export default class WebSocketClient extends EventEmitter {
    constructor({autoReconnectInterval = 1000, auth} = {}) {
        super();
        this.autoReconnectInterval = autoReconnectInterval;
        this.auth = auth;
    }

    open(url) {
        this.url = url;
        this.instance = new WebSocket(this.url);
        this._addEventListeners();
    }

    _handleOpen = async (e) => {
        console.log('WebSocketClient: connected.');
        if (this.auth) {
            console.log('WebSocketClient: authorizing...');
            await this.auth(this.instance);
        }
        console.log('WebSocketClient: authorized');
        this.onopen(e);
        this.emit('open', e);
    };

    _handleMessage = (data, flags) => {
        this.number++;
        this.onmessage(data, flags, this.number);
        this.emit('message', data, flags);
    };

    _handleClose = (e) => {
        switch (e.code) {
        case 1000: // CLOSE_NORMAL
            break;
        default: // Abnormal closure
            this.reconnect(e);
            break;
        }
        this.onclose(e);
        this.emit('close', e);
    };

    _handleError = (e) => {
        switch (e.code) {
        case 'ECONNREFUSED':
            this.reconnect(e);
            break;
        default:
            this.onerror(e);
            this.emit('error', e);
            break;
        }
    };

    _addEventListeners() {
        this.instance.addEventListener('open', this._handleOpen);
        this.instance.addEventListener('close', this._handleClose);
        this.instance.addEventListener('message', this._handleMessage);
        this.instance.addEventListener('error', this._handleError);
    }

    _removeListeners() {
        if (!this.instance) {
            return;
        }
        this.instance.removeEventListener('open', this._handleOpen);
        this.instance.removeEventListener('close', this._handleClose);
        this.instance.removeEventListener('message', this._handleMessage);
        this.instance.removeEventListener('error', this._handleError);
    }

    send(data, option) {
        try {
            this.instance.send(data, option);
        } catch (e) {
            console.error(e);
            this.instance.emit('error', e);
        }
    }

    reconnect(e) {
        console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
        this._removeListeners();
        const self = this;
        setTimeout(() => {
            console.log('WebSocketClient: reconnecting...');
            self.open(self.url);
        }, this.autoReconnectInterval);
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
