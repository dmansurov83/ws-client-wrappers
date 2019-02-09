"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

var _WebSocketFilteredClient = require("./WebSocketFilteredClient");

var _WebSocketFilteredClient2 = _interopRequireDefault(_WebSocketFilteredClient);

var _WebSocketJsonClient = require("./WebSocketJsonClient");

var _WebSocketJsonClient2 = _interopRequireDefault(_WebSocketJsonClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocketClientState = {
    disconnected: 'disconnected',
    connected: 'connected'
};

var WebSocketClientWrapper = function (_EventEmitter) {
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
        key: "whenReady",
        value: function whenReady(cb) {
            if (this.state === WebSocketClientState.connected) cb(this);
            this.whenReadyCallbacks.push(cb);
        }
    }, {
        key: "_handleOpen",
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
        key: "_handleMessage",
        value: function _handleMessage(event, flags) {
            this.onmessage(event, flags);
            this.emit('message', event, flags);
        }
    }, {
        key: "_handleError",
        value: function _handleError(e) {
            this.onerror(e);
            this.emit('error', e);
        }
    }, {
        key: "_handleClose",
        value: function _handleClose(e) {
            this.state = WebSocketClientState.disconnected;
            this.onclose(e);
            this.emit('close', e);
        }
    }, {
        key: "send",
        value: function send(data, option) {
            this.ws.send(data, option);
        }
    }, {
        key: "onopen",
        value: function onopen(e) {}
    }, {
        key: "onmessage",
        value: function onmessage(e) {}
    }, {
        key: "onerror",
        value: function onerror(e) {}
    }, {
        key: "onclose",
        value: function onclose(e) {}
    }, {
        key: "filter",
        value: function filter(predicate) {
            return (0, _WebSocketFilteredClient2.default)(this, predicate);
        }
    }, {
        key: "jsonify",
        value: function jsonify() {
            return (0, _WebSocketJsonClient2.default)(this);
        }
    }]);

    return WebSocketClientWrapper;
}(_events.EventEmitter);

exports.default = WebSocketClientWrapper;