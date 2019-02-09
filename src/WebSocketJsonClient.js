import WebSocketClientWrapper from './WebSocketClientWrapper';

export default class WebSocketJsonClient extends WebSocketClientWrapper {
    _handleMessage(event, flags) {
        this.emit('data', JSON.parse(event.data));
        super._handleMessage(event, flags);
    }

    write(json) {
        super.send(JSON.stringify(json));
    }
}
