var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dependencyList = ['https://unpkg.com/react@17/umd/react.production.min.js', 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js', 'https://docs.opencv.org/3.4.0/opencv.js'];

loadDependency(dependencyList, start);

function loadDependency(dependencyList, callback) {
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var s = document.createElement('script');
    s.src = dependencyList[i];
    document.head.appendChild(s);
    if (i + 1 < dependencyList.length) {
        s.onload = function () {
            return loadDependency(dependencyList, callback, i + 1);
        };
    } else {
        s.onload = callback;
    }
}

function start() {

    var reactRoot = document.createElement('div');
    reactRoot.id = 'reactRoot';
    Object.assign(reactRoot.style, { position: 'fixed', top: '0', left: '0', opacity: '0.5', zIndex: '999' });
    document.body.append(reactRoot);

    var GameScript = function (_React$Component) {
        _inherits(GameScript, _React$Component);

        function GameScript(props) {
            _classCallCheck(this, GameScript);

            var _this = _possibleConstructorReturn(this, (GameScript.__proto__ || Object.getPrototypeOf(GameScript)).call(this, props));

            _this.fps = 30;
            _this.state = {};
            _this.initState();
            _this.intervalID = setInterval(_this.update.bind(_this), Math.round(1000 / _this.fps));
            _this.video = document.getElementsByTagName('video')[0];
            _this.captureVideoCanvas = document.createElement("canvas");
            _this.captureVideoCanvas.width = 500;
            _this.captureVideoCanvas.height = _this.captureVideoCanvas.width * _this.video.videoHeight / _this.video.videoWidth;
            _this.mat = new cv.Mat(_this.captureVideoCanvas.height, _this.captureVideoCanvas.width, cv.CV_8UC4);
            return _this;
        }

        _createClass(GameScript, [{
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                clearInterval(this.intervalID);
            }
        }, {
            key: 'initState',
            value: function initState() {
                console.error('initState not implemented');
            }
        }, {
            key: 'update',
            value: function update() {
                console.error('update not implemented');
            }
        }, {
            key: 'render',
            value: function render() {
                console.error('render not implemented');
            }
        }, {
            key: 'keydown',
            value: function keydown(key) {
                var eventKeydown = new KeyboardEvent("keydown", {
                    bubbles: true,
                    cancelable: true,
                    key: key,
                    shiftKey: false
                });
                document.body.dispatchEvent(eventKeydown);
            }
        }, {
            key: 'keyup',
            value: function keyup(key) {
                var eventKeyup = new KeyboardEvent("keyup", {
                    bubbles: true,
                    cancelable: true,
                    key: key,
                    shiftKey: false
                });

                document.body.dispatchEvent(eventKeyup);
            }
        }, {
            key: 'pressKey',
            value: function pressKey(key) {
                var _this2 = this;

                setTimeout(function () {
                    return _this2.keydown(key);
                }, 0);
                setTimeout(function () {
                    return _this2.keyup(key);
                }, 5);
            }
        }, {
            key: 'convertPixelCoordinates2ClientXY',
            value: function convertPixelCoordinates2ClientXY(x, y) {
                var videoRect = this.video.getBoundingClientRect();
                return [x / this.captureVideoCanvas.width * videoRect.width + videoRect.left, y / this.captureVideoCanvas.height * videoRect.height + videoRect.top];
            }
        }, {
            key: 'convertClientXY2PixelCoordinates',
            value: function convertClientXY2PixelCoordinates(x, y) {
                var videoRect = this.video.getBoundingClientRect();
                x -= videoRect.left;
                y -= videoRect.top;
                return [x * this.captureVideoCanvas.width / videoRect.width, y * this.captureVideoCanvas.height / videoRect.height];
            }
        }, {
            key: 'mousedown',
            value: function mousedown(x, y) {
                var event = new MouseEvent("mousedown", {
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });

                this.video.dispatchEvent(event);
            }
        }, {
            key: 'mouseup',
            value: function mouseup(x, y) {
                var event = new MouseEvent("mouseup", {
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });

                this.video.dispatchEvent(event);
            }
        }, {
            key: 'touch',
            value: function touch(x, y) {
                var _this3 = this;

                setTimeout(function () {
                    return _this3.touchStart(x, y);
                }, 0);
                setTimeout(function () {
                    return _this3.touchStop(x, y);
                }, 5);
            }
        }, {
            key: 'captureVideo',
            value: function captureVideo() {
                var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;

                var canvasContext = this.captureVideoCanvas.getContext("2d");
                canvasContext.drawImage(this.video, 0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
                return this.captureVideoCanvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
            }
        }, {
            key: 'captureVideoMat',
            value: function captureVideoMat() {
                var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

                var canvasContext = this.captureVideoCanvas.getContext("2d");
                canvasContext.drawImage(this.video, 0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
                var imageData = canvasContext.getImageData(0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
                this.mat.data.set(imageData.data);
            }
        }]);

        return GameScript;
    }(React.Component);

    var JsFileInput = function (_React$Component2) {
        _inherits(JsFileInput, _React$Component2);

        function JsFileInput(props) {
            _classCallCheck(this, JsFileInput);

            return _possibleConstructorReturn(this, (JsFileInput.__proto__ || Object.getPrototypeOf(JsFileInput)).call(this, props));
        }

        _createClass(JsFileInput, [{
            key: 'runJsFromFile',
            value: function runJsFromFile(e) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = e.target.files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var file = _step.value;

                        var s = document.createElement('script');
                        s.src = URL.createObjectURL(file);
                        document.body.appendChild(s);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                e.target.value = '';
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'label',
                        null,
                        '\u9009\u62E9\u8981\u6CE8\u5165\u7684\u811A\u672C\u6587\u4EF6\uFF1A'
                    ),
                    React.createElement('input', { type: 'file', onChange: this.runJsFromFile.bind(this) })
                );
            }
        }]);

        return JsFileInput;
    }(React.Component);

    var ScriptContainer = function (_React$Component3) {
        _inherits(ScriptContainer, _React$Component3);

        function ScriptContainer(props) {
            _classCallCheck(this, ScriptContainer);

            var _this5 = _possibleConstructorReturn(this, (ScriptContainer.__proto__ || Object.getPrototypeOf(ScriptContainer)).call(this, props));

            _this5.state = { visibility: true, scriptElements: [] };
            window.initScript = _this5.initScript.bind(_this5);
            return _this5;
        }

        _createClass(ScriptContainer, [{
            key: 'handleInputChange',
            value: function handleInputChange() {
                var target = event.target;
                var value = target.type === 'checkbox' ? target.checked : target.value;
                var name = target.name;

                this.setState(_defineProperty({}, name, value));
            }
        }, {
            key: 'initScript',
            value: function initScript(scriptElement) {
                this.setState(function (prev_state) {
                    return { scriptElements: [].concat(_toConsumableArray(prev_state.scriptElements), [scriptElement]) };
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this6 = this;

                return React.createElement(
                    'div',
                    null,
                    React.createElement('input', { type: 'checkbox', name: 'visibility', checked: this.state.visibility, onChange: this.handleInputChange.bind(this) }),
                    React.createElement(
                        'label',
                        null,
                        '\u663E\u793A\u811A\u672C\u9762\u677F'
                    ),
                    React.createElement(
                        'button',
                        { onClick: function onClick() {
                                return _this6.setState({ scriptElements: [] });
                            } },
                        '\u6E05\u7A7A\u811A\u672C'
                    ),
                    React.createElement(JsFileInput, null),
                    React.createElement(
                        'div',
                        { id: 'scriptContainer', style: { display: this.state.visibility ? 'block' : 'none' } },
                        this.state.scriptElements
                    )
                );
            }
        }]);

        return ScriptContainer;
    }(React.Component);

    window.GameScript = GameScript;
    ReactDOM.render(React.createElement(ScriptContainer, null), reactRoot);
};