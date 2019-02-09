'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WebSocketJsonClient = exports.WebSocketFilteredClient = exports.WebSocketClientWrapper = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocketClientState = {
    disconnected: 'disconnected',
    connected: 'connected'
};

var WebSocketClientWrapper = exports.WebSocketClientWrapper = function (_EventEmitter) {
    _inherits(WebSocketClientWrapper, _EventEmitter);

    function WebSocketClientWrapper(ws) {
        _classCallCheck(this, WebSocketClientWrapper);

        var _this = _possibleConstructorReturn(this, (WebSocketClientWrapper.__proto__ || Object.getPrototypeOf(WebSocketClientWrapper)).call(this));

        _this.state = WebSocketClientState.disconnected;
        _this.whenReadyCallbacks = [];

        _this.ws = ws;
        ws.on('open', function (e) {
            return _this._handleOpen(e);
        });
        ws.on('message', function (event, flags) {
            return _this._handleMessage(event, flags);
        });
        ws.on('error', function (e) {
            return _this._handleOpen(e);
        });
        ws.on('close', function (e) {
            return _this._handleClose(e);
        });
        return _this;
    }

    _createClass(WebSocketClientWrapper, [{
        key: 'whenReady',
        value: function whenReady(cb) {
            if (this.state === WebSocketClientState.connected) cb(this);
            this.whenReadyCallbacks.push(cb);
        }
    }, {
        key: '_handleOpen',
        value: function _handleOpen(e) {
            var _this2 = this;

            this.state = WebSocketClientState.connected;
            this.onopen(e);
            this.emit('open', e);

            this.whenReadyCallbacks.forEach(function (cb) {
                return cb(_this2);
            });
            this.whenReadyCallbacks = [];
        }
    }, {
        key: '_handleMessage',
        value: function _handleMessage(event, flags) {
            this.onmessage(event, flags);
            this.emit('message', event, flags);
        }
    }, {
        key: '_handleError',
        value: function _handleError(e) {
            this.onerror(e);
            this.emit('error', e);
        }
    }, {
        key: '_handleClose',
        value: function _handleClose(e) {
            this.state = WebSocketClientState.disconnected;
            this.onclose(e);
            this.emit('close', e);
        }
    }, {
        key: 'send',
        value: function send(data, option) {
            this.ws.send(data, option);
        }
    }, {
        key: 'onopen',
        value: function onopen(e) {}
    }, {
        key: 'onmessage',
        value: function onmessage(e) {}
    }, {
        key: 'onerror',
        value: function onerror(e) {}
    }, {
        key: 'onclose',
        value: function onclose(e) {}
    }, {
        key: 'filter',
        value: function filter(predicate) {
            return new WebSocketFilteredClient(this, predicate);
        }
    }, {
        key: 'jsonify',
        value: function jsonify() {
            return new WebSocketJsonClient(this);
        }
    }]);

    return WebSocketClientWrapper;
}(_events.EventEmitter);

var WebSocketFilteredClient = exports.WebSocketFilteredClient = function (_WebSocketClientWrapp) {
    _inherits(WebSocketFilteredClient, _WebSocketClientWrapp);

    function WebSocketFilteredClient(ws) {
        var predicate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
            return true;
        };

        _classCallCheck(this, WebSocketFilteredClient);

        var _this3 = _possibleConstructorReturn(this, (WebSocketFilteredClient.__proto__ || Object.getPrototypeOf(WebSocketFilteredClient)).call(this, ws));

        _this3.predicate = predicate;
        return _this3;
    }

    _createClass(WebSocketFilteredClient, [{
        key: '_handleMessage',
        value: function _handleMessage(event, flags) {
            if (this.predicate(event, flags)) {
                _get(WebSocketFilteredClient.prototype.__proto__ || Object.getPrototypeOf(WebSocketFilteredClient.prototype), '_handleMessage', this).call(this, event, flags);
            }
        }
    }]);

    return WebSocketFilteredClient;
}(WebSocketClientWrapper);

var WebSocketJsonClient = exports.WebSocketJsonClient = function (_WebSocketClientWrapp2) {
    _inherits(WebSocketJsonClient, _WebSocketClientWrapp2);

    function WebSocketJsonClient() {
        _classCallCheck(this, WebSocketJsonClient);

        return _possibleConstructorReturn(this, (WebSocketJsonClient.__proto__ || Object.getPrototypeOf(WebSocketJsonClient)).apply(this, arguments));
    }

    _createClass(WebSocketJsonClient, [{
        key: '_handleMessage',
        value: function _handleMessage(event, flags) {
            this.emit('data', JSON.parse(event.data));
            _get(WebSocketJsonClient.prototype.__proto__ || Object.getPrototypeOf(WebSocketJsonClient.prototype), '_handleMessage', this).call(this, event, flags);
        }
    }, {
        key: 'write',
        value: function write(json) {
            _get(WebSocketJsonClient.prototype.__proto__ || Object.getPrototypeOf(WebSocketJsonClient.prototype), 'send', this).call(this, JSON.stringify(json));
        }
    }]);

    return WebSocketJsonClient;
}(WebSocketClientWrapper);