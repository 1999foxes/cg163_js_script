var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Macro = function (_React$Component) {
    _inherits(Macro, _React$Component);

    function Macro(props) {
        _classCallCheck(this, Macro);

        var _this = _possibleConstructorReturn(this, (Macro.__proto__ || Object.getPrototypeOf(Macro)).call(this, props));

        _this.state = {
            isRecording: false,
            isReplaying: false,
            isLooping: false,
            chosenMacroIndex: 0,
            macroList: [],
            loopTimes: 999
        };
        return _this;
    }

    _createClass(Macro, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadMacroList();
        }
    }, {
        key: 'record',
        value: function record(macro, targetElement, eventType) {
            var time0 = Date.now();
            function recordEvent(e) {
                var copyEvent = {};
                var attrList = ['type', 'screenX', 'screenY', 'clientX', 'clientY', 'ctrlKey', 'shiftKey', 'altKey', 'metaKey', 'button', 'buttons', 'relatedTarget', 'region', 'key', 'code', 'location', 'repeat', 'isComposing', 'charCode', 'keyCode', 'which', 'bubbles'];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = attrList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        attr = _step.value;

                        if (e[attr] !== undefined) {
                            copyEvent[attr] = e[attr];
                        }
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

                macro.actions.push({ event: copyEvent, time: Date.now() - time0 });
            }
            targetElement.addEventListener(eventType, recordEvent);
            document.body.addEventListener('stoprecording', function () {
                targetElement.removeEventListener(eventType, recordEvent);
            });
        }
    }, {
        key: 'replay',
        value: function replay(macro) {
            if (macro.actions.length == 0) {
                return;
            }
            var keyboardEventTypes = ['keydown', 'keyup'];
            var mouseEventTypes = ['mousedown', 'mousemove', 'mouseup'];
            var keyboardEventTarget = document.body;
            var mouseEventTarget = document.getElementsByTagName('video')[0];
            macro.actions.forEach(function (d) {
                if (keyboardEventTypes.includes(d.event.type)) {
                    var copyEvent = new KeyboardEvent(d.event.type, d.event);
                    setTimeout(function () {
                        return keyboardEventTarget.dispatchEvent(copyEvent);
                    }, d.time);
                } else if (mouseEventTypes.includes(d.event.type)) {
                    var _copyEvent = new MouseEvent(d.event.type, d.event);
                    setTimeout(function () {
                        return mouseEventTarget.dispatchEvent(_copyEvent);
                    }, d.time);
                }
            });
        }
    }, {
        key: 'loop',
        value: function loop(macro) {
            var _this2 = this;

            if (macro.actions.length == 0) {
                return;
            }

            var loopOnce = function loopOnce() {
                if (_this2.state.loopTimes > 0) {
                    _this2.setState(function (prevState) {
                        return { loopTimes: prevState.loopTimes - 1 };
                    });
                    _this2.replay(macro);
                    setTimeout(loopOnce, macro.actions[macro.actions.length - 1].time);
                } else {
                    _this2.setState({ isLooping: false });
                }
            };

            loopOnce();
        }
    }, {
        key: 'startRecordingMacro',
        value: function startRecordingMacro() {
            var _this3 = this;

            this.setState({ isRecording: true });
            var macro = { actions: [], name: '未命名宏' + this.state.macroList.length };
            this.setState(function (prevState) {
                prevState.macroList.push(macro);
                return { macroList: prevState.macroList };
            });
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
            this.setState({ chosenMacroIndex: this.state.macroList.length - 1 });
        }
    }, {
        key: 'replayChosenMacro',
        value: function replayChosenMacro() {
            var _this4 = this;

            var chosenMacro = this.state.macroList[this.state.chosenMacroIndex];
            if (chosenMacro == null || chosenMacro.actions.length == 0) {
                return;
            }
            this.setState({ isReplaying: true });
            this.replay(chosenMacro);
            setTimeout(function () {
                return _this4.setState({ isReplaying: false });
            }, chosenMacro.actions[chosenMacro.actions.length - 1].time);
        }
    }, {
        key: 'startLoopingChosenMacro',
        value: function startLoopingChosenMacro() {
            var chosenMacro = this.state.macroList[this.state.chosenMacroIndex];
            if (chosenMacro == null || chosenMacro.actions.length == 0) {
                return;
            }
            this.setState({ isLooping: true });
            this.loop(chosenMacro);
        }
    }, {
        key: 'stopLoopingChosenMacro',
        value: function stopLoopingChosenMacro() {
            this.setState({ isLooping: false, loopTimes: 0 });
        }
    }, {
        key: 'setChosenMacro',
        value: function setChosenMacro(macroIndex) {
            this.setState({ chosenMacroIndex: macroIndex });
        }
    }, {
        key: 'renameChosenMacro',
        value: function renameChosenMacro() {
            this.setState(function (prevState) {
                prevState.macroList[prevState.chosenMacroIndex].name = prompt('输入新的名称');
                return { macroList: prevState.macroList };
            });
        }
    }, {
        key: 'deleteChosenMacro',
        value: function deleteChosenMacro() {
            this.setState(function (prevState) {
                prevState.macroList.splice(prevState.chosenMacroIndex, 1);
                return { macroList: prevState.macroList, chosenMacroIndex: 0 };
            });
        }
    }, {
        key: 'saveMacroList',
        value: function saveMacroList() {
            var ml = JSON.stringify(this.state.macroList);
            window.localStorage.setItem('macroList', ml);
        }
    }, {
        key: 'loadMacroList',
        value: function loadMacroList() {
            var ml = window.localStorage.getItem('macroList');
            if (ml != undefined) {
                this.setState({ macroList: JSON.parse(ml) });
            }
        }
    }, {
        key: 'handleInputChange',
        value: function handleInputChange(event) {
            var target = event.target;
            this.setState(_defineProperty({}, target.name, target.type === 'checkbox' ? target.checked : target.value));
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
                    'label',
                    null,
                    '\u6B21\u6570\uFF1A',
                    React.createElement('input', {
                        name: 'loopTimes',
                        type: 'number',
                        value: this.state.loopTimes,
                        onChange: this.handleInputChange.bind(this),
                        onClick: function onClick() {
                            return _this5.setState({ loopTimes: parseInt(prompt('次数：')) || 0 });
                        } })
                ),
                React.createElement(
                    'button',
                    { onClick: this.renameChosenMacro.bind(this), disabled: this.state.isRecording || this.state.isReplaying || this.state.isLooping },
                    '\u91CD\u547D\u540D'
                ),
                React.createElement(
                    'button',
                    { onClick: this.deleteChosenMacro.bind(this), disabled: this.state.isRecording || this.state.isReplaying || this.state.isLooping },
                    '\u5220\u9664'
                ),
                React.createElement(
                    'button',
                    { onClick: this.saveMacroList.bind(this), disabled: this.state.isRecording || this.state.isReplaying || this.state.isLooping },
                    '\u4FDD\u5B58'
                ),
                React.createElement(
                    'button',
                    { onClick: this.loadMacroList.bind(this), disabled: this.state.isRecording || this.state.isReplaying || this.state.isLooping },
                    '\u8BFB\u53D6'
                ),
                React.createElement(
                    'ul',
                    null,
                    this.state.macroList.map(function (macro, index, array) {
                        return React.createElement(
                            'li',
                            { key: index, onClick: function onClick() {
                                    return _this5.setChosenMacro(index);
                                }, style: { color: _this5.state.chosenMacroIndex == index ? 'red' : 'white' } },
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