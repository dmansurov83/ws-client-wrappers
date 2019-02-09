import WebSocketClientWrapper from './WebSocketClientWrapper';

export default class WebSocketFilteredClient extends WebSocketClientWrapper {
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
