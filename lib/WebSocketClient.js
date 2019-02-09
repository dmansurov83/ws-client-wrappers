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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocketClient = function (_EventEmitter) {
    _inherits(WebSocketClient, _EventEmitter);

    function WebSocketClient() {
        var _this2 = this;

        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$autoReconnectInt = _ref.autoReconnectInterval,
            autoReconnectInterval = _ref$autoReconnectInt === undefined ? 1000 : _ref$autoReconnectInt,
            auth = _ref.auth;

        _classCallCheck(this, WebSocketClient);

        var _this = _possibleConstructorReturn(this, (WebSocketClient.__proto__ || Object.getPrototypeOf(WebSocketClient)).call(this));

        _this._handleOpen = function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                console.log('WebSocketClient: connected.');

                                if (!_this.auth) {
                                    _context.next = 5;
                                    break;
                                }

                                console.log('WebSocketClient: authorizing...');
                                _context.next = 5;
                                return _this.auth(_this.instance);

                            case 5:
                                console.log('WebSocketClient: authorized');
                                _this.onopen(e);
                                _this.emit('open', e);

                            case 8:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, _this2);
            }));

            return function (_x2) {
                return _ref2.apply(this, arguments);
            };
        }();

        _this._handleMessage = function (data, flags) {
            _this.number++;
            _this.onmessage(data, flags, _this.number);
            _this.emit('message', data, flags);
        };

        _this._handleClose = function (e) {
            switch (e.code) {
                case 1000:
                    // CLOSE_NORMAL
                    break;
                default:
                    // Abnormal closure
                    _this.reconnect(e);
                    break;
            }
            _this.onclose(e);
            _this.emit('close', e);
        };

        _this._handleError = function (e) {
            switch (e.code) {
                case 'ECONNREFUSED':
                    _this.reconnect(e);
                    break;
                default:
                    _this.onerror(e);
                    _this.emit('error', e);
                    break;
            }
        };

        _this.autoReconnectInterval = autoReconnectInterval;
        _this.auth = auth;
        return _this;
    }

    _createClass(WebSocketClient, [{
        key: "open",
        value: function open(url) {
            this.url = url;
            this.instance = new WebSocket(this.url);
            this._addEventListeners();
        }
    }, {
        key: "_addEventListeners",
        value: function _addEventListeners() {
            this.instance.addEventListener('open', this._handleOpen);
            this.instance.addEventListener('close', this._handleClose);
            this.instance.addEventListener('message', this._handleMessage);
            this.instance.addEventListener('error', this._handleError);
        }
    }, {
        key: "_removeListeners",
        value: function _removeListeners() {
            if (!this.instance) {
                return;
            }
            this.instance.removeEventListener('open', this._handleOpen);
            this.instance.removeEventListener('close', this._handleClose);
            this.instance.removeEventListener('message', this._handleMessage);
            this.instance.removeEventListener('error', this._handleError);
        }
    }, {
        key: "send",
        value: function send(data, option) {
            try {
                this.instance.send(data, option);
            } catch (e) {
                console.error(e);
                this.instance.emit('error', e);
            }
        }
    }, {
        key: "reconnect",
        value: function reconnect(e) {
            console.log("WebSocketClient: retry in " + this.autoReconnectInterval + "ms", e);
            this._removeListeners();
            var self = this;
            setTimeout(function () {
                console.log('WebSocketClient: reconnecting...');
                self.open(self.url);
            }, this.autoReconnectInterval);
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
            return new _WebSocketFilteredClient2.default(this, predicate);
        }
    }, {
        key: "jsonify",
        value: function jsonify() {
            return new _WebSocketJsonClient2.default(this);
        }
    }]);

    return WebSocketClient;
}(_events.EventEmitter);

exports.default = WebSocketClient;