var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Macro = function (_React$Component) {
    _inherits(Macro, _React$Component);

    function Macro(props) {
        _classCallCheck(this, Macro);

        var _this = _possibleConstructorReturn(this, (Macro.__proto__ || Object.getPrototypeOf(Macro)).call(this, props));

        _this.state = { isRecording: false, isReplaying: false, isLooping: false, chosenMacro: null };
        _this.macroList = [];
        return _this;
    }

    _createClass(Macro, [{
        key: 'record',
        value: function record(macro, targetElement, eventType) {
            var time0 = Date.now();
            function recordEvent(e) {
                macro.push({ event: e, time: Date.now() - time0 });
            }
            targetElement.addEventListener(eventType, recordEvent);
            document.body.addEventListener('stoprecording', function () {
                targetElement.removeEventListener(eventType, recordEvent);
            });
        }
    }, {
        key: 'replay',
        value: function replay(macro) {
            macro.forEach(function (d) {
                var copyEvent = null;
                if (d.event instanceof KeyboardEvent) {
                    copyEvent = new KeyboardEvent(d.event.type, d.event);
                } else if (d.event instanceof MouseEvent) {
                    copyEvent = new MouseEvent(d.event.type, d.event);
                }
                setTimeout(function () {
                    return d.event.target.dispatchEvent(copyEvent);
                }, d.time);
            });
        }
    }, {
        key: 'loop',
        value: function loop(macro) {
            var _this2 = this;

            this.replay(macro); // initially replay before first interval
            var loopID = setInterval(function () {
                return _this2.replay(macro);
            }, macro[macro.length - 1].time);
            document.body.addEventListener('stoplooping', function stop() {
                clearInterval(loopID);
                document.body.removeEventListener('stoplooping', stop);
            });
        }
    }, {
        key: 'startRecordingMacro',
        value: function startRecordingMacro() {
            var _this3 = this;

            this.setState({ isRecording: true });
            var macro = [];
            macro.name = '未命名宏' + this.macroList.length;
            this.macroList.push(macro);
            var bodyEventTypeList = ['keydown', 'keyup'];
            var videoEventTypeList = ['mousedown', 'mousemove', 'mouseup'];
            bodyEventTypeList.forEach(function (type) {
                return _this3.record(macro, document.body, type);
            });
            videoEventTypeList.forEach(function (type) {
                return _this3.record(macro, document.body.getElementsByTagName('video')[0], type);
            });
        }
    }, {
        key: 'stopRecordingMacro',
        value: function stopRecordingMacro() {
            this.setState({ isRecording: false });
            var e = new Event('stoprecording');
            document.body.dispatchEvent(e);
            if (this.state.chosenMacro == null) {
                this.setState({ chosenMacro: this.macroList[0] });
            }
        }
    }, {
        key: 'replayChosenMacro',
        value: function replayChosenMacro() {
            var _this4 = this;

            this.setState({ isReplaying: true });
            this.replay(this.state.chosenMacro);
            setTimeout(function () {
                return _this4.setState({ isReplaying: false });
            }, this.state.chosenMacro[this.state.chosenMacro.length - 1].time);
        }
    }, {
        key: 'startLoopingChosenMacro',
        value: function startLoopingChosenMacro() {
            this.setState({ isLooping: true });
            this.loop(this.state.chosenMacro);
        }
    }, {
        key: 'stopLoopingChosenMacro',
        value: function stopLoopingChosenMacro() {
            this.setState({ isLooping: false });
            document.body.dispatchEvent(new Event('stoplooping'));
        }
    }, {
        key: 'setChosenMacro',
        value: function setChosenMacro(macro) {
            if (!this.state.isRecording && !this.state.isReplaying && !this.state.isLooping) {
                this.setState({ chosenMacro: macro });
            }
        }
    }, {
        key: 'renameChosenMacro',
        value: function renameChosenMacro() {
            this.setState(function (prevState) {
                prevState.chosenMacro.name = prompt('输入宏操作名');
                return { chosenMacro: prevState.chosenMacro };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { onClick: this.state.isRecording ? this.stopRecordingMacro.bind(this) : this.startRecordingMacro.bind(this),
                        disabled: this.state.isReplaying || this.state.isLooping },
                    this.state.isRecording ? '停止录制' : '录制宏'
                ),
                React.createElement(
                    'button',
                    { onClick: this.replayChosenMacro.bind(this), disabled: this.state.isRecording || this.state.isReplaying || this.state.isLooping },
                    '\u64AD\u653E'
                ),
                React.createElement(
                    'button',
                    { onClick: this.state.isLooping ? this.stopLoopingChosenMacro.bind(this) : this.startLoopingChosenMacro.bind(this), disabled: this.state.isRecording || this.state.isReplaying },
                    this.state.isLooping ? '停止' : '循环'
                ),
                React.createElement(
                    'button',
                    { onClick: this.renameChosenMacro.bind(this), disabled: this.state.isRecording || this.state.isReplaying || this.state.isLooping },
                    '\u91CD\u547D\u540D'
                ),
                React.createElement(
                    'ul',
                    null,
                    this.macroList.map(function (macro, index, array) {
                        return React.createElement(
                            'li',
                            { key: index, onClick: function onClick() {
                                    return _this5.setChosenMacro(macro);
                                }, style: { color: _this5.state.chosenMacro == macro ? 'red' : 'white' } },
                            macro.name
                        );
                    })
                )
            );
        }
    }]);

    return Macro;
}(React.Component);

if (initScript) {
    initScript(React.createElement(Macro, null));
}