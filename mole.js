var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FishDetector = function (_GameScript) {
    _inherits(FishDetector, _GameScript);

    function FishDetector(props) {
        _classCallCheck(this, FishDetector);

        return _possibleConstructorReturn(this, (FishDetector.__proto__ || Object.getPrototypeOf(FishDetector)).call(this, props));
    }

    _createClass(FishDetector, [{
        key: 'initState',
        value: function initState() {
            this.state = { info: '' };
            return;
        }
    }, {
        key: 'show',
        value: function show(dst) {
            cv.imshow('canvasOutput', dst);
        }
    }, {
        key: 'update',
        value: function update() {
            this.captureVideoMat();

            this.hasRing = false;
            this.hasFishInRing = false;

            var rect = this.getGreenRect();
            if (rect != null) {
                this.hasRing = true;
                if (this.hasFishInRect(rect)) {
                    this.hasFishInRing = true;
                }
            }

            this.props.setFishState(this.hasFishInRing);
            this.setState({ info: 'hasRing=' + this.hasRing + ',hasFishInRing=' + this.hasFishInRing });
        }
    }, {
        key: 'getGreenRect',
        value: function getGreenRect() {
            var result = this.inRange(this.props.ringHsvRange, this.mat);
            if (result.area < 100) {
                return null;
            } else {
                return result.rect;
            }
        }
    }, {
        key: 'hasFishInRect',
        value: function hasFishInRect(rect) {
            var ring = this.mat.roi(rect);
            var fish = this.inRange(Object.assign({}, this.props.fishHsvRange), ring);
            ring.delete();
            return fish.area > 50;
        }
    }, {
        key: 'inRange',
        value: function inRange(hsvRange, src) {
            var bgr = new cv.Mat();
            cv.cvtColor(src, bgr, cv.COLOR_RGBA2BGR, 0);

            var hsv = new cv.Mat();
            cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

            var inr = new cv.Mat();
            var low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hsvRange.lowH, hsvRange.lowS, hsvRange.lowV, 0]);
            var high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hsvRange.highH, hsvRange.highS, hsvRange.highV, 0]);
            cv.inRange(hsv, low, high, inr);

            var can = new cv.Mat();
            cv.Canny(inr, can, 300, 0, 3, false);

            var dil = new cv.Mat();
            var M = cv.Mat.ones(10, 10, cv.CV_8U);
            var anchor = new cv.Point(-1, -1);
            cv.dilate(can, dil, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            var ero = new cv.Mat();
            cv.erode(dil, ero, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            var contours = new cv.MatVector();
            var hierarchy = new cv.Mat();
            cv.findContours(ero, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

            var maxCntIndex = 0,
                maxArea = 0;
            for (var i = 0; i < contours.size(); ++i) {
                var cnt = contours.get(i);
                var area = cv.contourArea(cnt);

                if (area > maxArea) {
                    maxCntIndex = i;
                    maxArea = area;
                }
            }

            var rect = cv.boundingRect(contours.get(maxCntIndex));

            bgr.delete();
            hsv.delete();
            low.delete();
            high.delete();
            inr.delete();
            can.delete();
            dil.delete();
            M.delete();
            ero.delete();
            contours.delete();
            hierarchy.delete();

            return { area: maxArea, rect: rect };
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement('canvas', { id: 'canvasOutput' }),
                React.createElement(
                    'p',
                    null,
                    this.state.info
                )
            );
        }
    }]);

    return FishDetector;
}(GameScript);

var CVHsvFilter = function (_GameScript2) {
    _inherits(CVHsvFilter, _GameScript2);

    function CVHsvFilter(props) {
        _classCallCheck(this, CVHsvFilter);

        var _this2 = _possibleConstructorReturn(this, (CVHsvFilter.__proto__ || Object.getPrototypeOf(CVHsvFilter)).call(this, props));

        _this2.src = null;
        _this2.DISPLAY_MODE = { SRC: 0, INRANGE: 1, CNT: 2 };
        _this2.rectList = [];
        _this2.rectListMaxLength = 1;
        _this2.isMouseDown = false;
        return _this2;
    }

    _createClass(CVHsvFilter, [{
        key: 'initState',
        value: function initState() {
            this.state = { lowH: 0, lowS: 0, lowV: 0, highH: 256, highS: 256, highV: 256, displayMode: 0 };
        }
    }, {
        key: 'update',
        value: function update() {
            if (!this.state.isPaused) {
                this.captureVideoMat();
            }

            var src = this.mat.clone();
            var dst1 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            var dst2 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            this.inHSVRange(src, dst1);
            var area = this.getArea(dst1, dst2);

            if (this.state.displayMode == this.DISPLAY_MODE.SRC) {
                this.show(src);
            } else if (this.state.displayMode == this.DISPLAY_MODE.INRANGE) {
                this.show(dst1);
            } else if (this.state.displayMode == this.DISPLAY_MODE.CNT) {
                this.show(dst2);
            }

            src.delete();
            dst1.delete();
            dst2.delete();

            var ctx = this.canvasOutput.getContext('2d');
            this.rectList.forEach(function (r) {
                return ctx.rect.apply(ctx, _toConsumableArray(Object.values(r)));
            });
            ctx.strokeStyle = 'green';
            ctx.stroke();

            this.setState({ info: '' + area });
        }
    }, {
        key: 'show',
        value: function show(dst) {
            cv.imshow('canvasOutput', dst);
        }
    }, {
        key: 'inHSVRange',
        value: function inHSVRange(src, dst) {
            var HSVRange = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.state;

            var bgr = new cv.Mat();
            cv.cvtColor(src, bgr, cv.COLOR_RGBA2BGR, 0);

            var hsv = new cv.Mat();
            cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

            var low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [HSVRange.lowH, HSVRange.lowS, HSVRange.lowV, 0]);
            var high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [HSVRange.highH, HSVRange.highS, HSVRange.highV, 0]);
            cv.inRange(hsv, low, high, dst);

            bgr.delete();
            hsv.delete();
            low.delete();
            high.delete();
        }
    }, {
        key: 'getArea',
        value: function getArea(src, dst) {
            var can = new cv.Mat();
            cv.Canny(src, can, 300, 0, 3, false);

            var dil = new cv.Mat();
            var M = cv.Mat.ones(10, 10, cv.CV_8U);
            var anchor = new cv.Point(-1, -1);
            cv.dilate(can, dil, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            var ero = new cv.Mat();
            cv.erode(dil, ero, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            var contours = new cv.MatVector();
            var hierarchy = new cv.Mat();
            cv.findContours(ero, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

            var maxCntIndex = -1,
                maxArea = 0;
            for (var i = 0; i < contours.size(); ++i) {
                var cnt = contours.get(i);
                var area = cv.contourArea(cnt);
                if (area > maxArea) {
                    maxCntIndex = i;
                    maxArea = area;
                }
            }

            if (maxCntIndex != -1) {
                var color = new cv.Scalar(255, 255, 255);
                cv.drawContours(dst, contours, maxCntIndex, color, 1, cv.LINE_8, hierarchy, 100);
            }

            can.delete();
            dil.delete();
            M.delete();
            ero.delete();
            contours.delete();
            hierarchy.delete();

            return maxArea;
        }
    }, {
        key: 'getHSVRangeOfRectList',
        value: function getHSVRangeOfRectList() {
            var hsvRange = { lowH: -1, lowS: -1, lowV: -1, highH: 256, highS: 256, highV: 256 };
            var threshold = 1;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(hsvRange)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var arg = _step.value;

                    threshold *= 0.7;
                    var areaAll = this.rectList.reduce(function (sum, rect) {
                        return sum + rect.width * rect.height;
                    }, 0);
                    var area = areaAll;
                    var nextHsvRange = Object.assign({}, hsvRange);
                    while (area / areaAll > threshold) {
                        Object.assign(hsvRange, nextHsvRange);
                        area = 0;
                        nextHsvRange[arg] += arg.includes('low') ? 1 : -1;
                        if (nextHsvRange[arg] < 0 || nextHsvRange[arg] > 255) {
                            break;
                        }
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = this.rectList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var rect = _step2.value;

                                var src = this.mat.roi(rect);
                                var dst1 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
                                this.inHSVRange(src, dst1, nextHsvRange);
                                dst1.data8S.forEach(function (i) {
                                    return area += i === -1;
                                });
                                src.delete();
                                dst1.delete();
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
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

            this.setState(hsvRange);
        }
    }, {
        key: 'handleRangeChange',
        value: function handleRangeChange(e) {
            this.setState(_defineProperty({}, e.target.name, parseInt(e.target.value)));
        }
    }, {
        key: 'handleCanvasMouseDown',
        value: function handleCanvasMouseDown(e) {
            if (this.rectList.length >= this.rectListMaxLength) {
                this.rectList.pop();
            }

            var canvasRect = this.canvasOutput.getBoundingClientRect();
            this.rectList.push(new cv.Rect(e.clientX - canvasRect.x, e.clientY - canvasRect.y, 1, 1));
            this.isMouseDown = true;
        }
    }, {
        key: 'handleCanvasMouseMove',
        value: function handleCanvasMouseMove(e) {
            if (!this.isMouseDown) {
                return;
            }
            var canvasRect = this.canvasOutput.getBoundingClientRect();
            var rect = this.rectList[this.rectList.length - 1];
            Object.assign(rect, { width: e.clientX - canvasRect.x - rect.x, height: e.clientY - canvasRect.y - rect.y });
        }
    }, {
        key: 'handleCanvasMouseUp',
        value: function handleCanvasMouseUp(e) {
            this.isMouseDown = false;
            console.log(this.rectList);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        null,
                        React.createElement('canvas', { id: 'canvasOutput',
                            onMouseDown: this.handleCanvasMouseDown.bind(this),
                            onMouseMove: this.handleCanvasMouseMove.bind(this),
                            onMouseUp: this.handleCanvasMouseUp.bind(this),
                            ref: function ref(node) {
                                return _this3.canvasOutput = node;
                            }
                        })
                    ),
                    React.createElement(
                        'div',
                        null,
                        ['lowH', 'lowS', 'lowV', 'highH', 'highS', 'highV'].map(function (name) {
                            return React.createElement(
                                'div',
                                { key: name },
                                React.createElement('input', { type: 'range', name: name, min: '0', max: '256', value: _this3.state[name], onChange: _this3.handleRangeChange.bind(_this3) }),
                                React.createElement(
                                    'label',
                                    null,
                                    name,
                                    ':',
                                    _this3.state[name]
                                )
                            );
                        }),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this3.setState(function (prevState) {
                                        return { isPaused: !prevState.isPaused };
                                    });
                                } },
                            this.state.isPaused ? 'continue' : 'pause'
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this3.rectList = [];
                                } },
                            'clear brush'
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this3.getHSVRangeOfRectList();
                                } },
                            'get hsv range of brush'
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this3.setState(function (prevState) {
                                        return { displayMode: (prevState.displayMode + 1) % 3 };
                                    });
                                } },
                            'displayMode:',
                            '' + this.state.displayMode
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this3.props.exporter(_this3.state);
                                } },
                            'export'
                        ),
                        React.createElement(
                            'p',
                            null,
                            this.state.info
                        )
                    )
                )
            );
        }
    }]);

    return CVHsvFilter;
}(GameScript);

var MoleScript = function (_GameScript3) {
    _inherits(MoleScript, _GameScript3);

    function MoleScript(props) {
        _classCallCheck(this, MoleScript);

        return _possibleConstructorReturn(this, (MoleScript.__proto__ || Object.getPrototypeOf(MoleScript)).call(this, props));
    }

    _createClass(MoleScript, [{
        key: 'initState',
        value: function initState() {
            this.state = {
                isPaused: true,
                func: '锄大地',
                info: '',
                ringHsvRange: { lowH: 60, lowS: 90, lowV: 135, highH: 85, highS: 255, highV: 255 },
                isSettingRingColor: false,
                fishHsvRange: { lowH: 86, lowS: 77, lowV: 180, highH: 117, highS: 166, highV: 220 },
                isSettingFishColor: false
            };
            this.funcList = ['锄大地', '跑任务', '钓鱼鱼'];
            this.keys = {
                task: '9',
                talkList: ['r', 't', 'y', 'u', 'i', 'o'],
                fish: 'g',
                fishSkip: '8',
                farm: 'g'
            };
            this.gameState = 'noState';
            this.lastGameStateChangeTime = Date.now();

            this.hasFishInRing = false;
            this.fishingWaitTime = 6;
        }
    }, {
        key: 'setRingHsvRange',
        value: function setRingHsvRange(hsvRange) {
            this.setState({ ringHsvRange: hsvRange, isSettingRingColor: false });
        }
    }, {
        key: 'setFishHsvRange',
        value: function setFishHsvRange(hsvRange) {
            this.setState({ fishHsvRange: hsvRange, isSettingFishColor: false });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return React.createElement(
                'div',
                null,
                this.state.isSettingRingColor ? React.createElement(CVHsvFilter, { exporter: this.setRingHsvRange.bind(this) }) : null,
                this.state.isSettingFishColor ? React.createElement(CVHsvFilter, { exporter: this.setFishHsvRange.bind(this) }) : null,
                React.createElement(
                    'button',
                    { onClick: function onClick() {
                            return _this5.setState(function (prevState) {
                                return { isPaused: !prevState.isPaused };
                            });
                        } },
                    this.state.isPaused ? '开始' : '暂停'
                ),
                React.createElement(
                    'select',
                    { onChange: function onChange(e) {
                            return _this5.setState({ func: e.target.value, isPaused: true });
                        } },
                    this.funcList.map(function (f) {
                        return React.createElement(
                            'option',
                            { value: f },
                            f
                        );
                    })
                ),
                this.state.func == '钓鱼鱼' ? React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'label',
                        null,
                        '\u9493\u9C7C\u4E0A\u94A9\u65F6\u95F4\uFF1A'
                    ),
                    React.createElement(
                        'select',
                        { onChange: function onChange(e) {
                                return _this5.fishingWaitTime = parseInt(e.target.value);
                            } },
                        React.createElement(
                            'option',
                            { value: '3' },
                            '3s'
                        ),
                        React.createElement(
                            'option',
                            { value: '4' },
                            '4s'
                        ),
                        React.createElement(
                            'option',
                            { value: '5' },
                            '5s'
                        ),
                        React.createElement(
                            'option',
                            { value: '6', selected: true },
                            '6s'
                        ),
                        React.createElement(
                            'option',
                            { value: '7' },
                            '7s'
                        )
                    ),
                    React.createElement(
                        'button',
                        { onClick: function onClick() {
                                return _this5.setState({ isSettingRingColor: true });
                            } },
                        '\u9009\u53D6\u7EFF\u5708\u989C\u8272'
                    ),
                    React.createElement(
                        'button',
                        { onClick: function onClick() {
                                return _this5.setState({ isSettingFishColor: true });
                            } },
                        '\u9009\u53D6\u9C7C\u9C7C\u989C\u8272'
                    )
                ) : null,
                React.createElement(
                    'p',
                    null,
                    this.state.info
                ),

                // !this.state.isPaused && this.state.func == '钓鱼鱼' ?
                this.state.func == '钓鱼鱼' ? React.createElement(FishDetector, { setFishState: this.setFishState.bind(this), ringHsvRange: this.state.ringHsvRange, fishHsvRange: this.state.fishHsvRange }) : null
            );
        }
    }, {
        key: 'update',
        value: function update() {
            this.setState({ info: '' + this.state.func + this.gameState + ', ' + (Date.now() - this.lastGameStateChangeTime) });
            if (this.state.isPaused) {
                return;
            }
            switch (this.state.func) {
                case '锄大地':
                    this.farm_update();
                    break;
                case '跑任务':
                    this.task_update();
                    break;
                case '钓鱼鱼':
                    this.fishing_update();
                    break;
            }
        }
    }, {
        key: 'farm_update',
        value: function farm_update() {
            var now = Date.now();
            if (now - this.lastGameStateChangeTime > 500) {
                this.pressKey(this.keys.farm);
                this.lastGameStateChangeTime = now;
            }
        }
    }, {
        key: 'task_update',
        value: function task_update() {
            var _this6 = this;

            var now = Date.now();
            switch (this.gameState) {
                case '跑任务':
                    if (now - this.lastGameStateChangeTime > 1000) {
                        this.pressKey(this.keys.task);
                        this.gameState = 'talk';
                        this.lastGameStateChangeTime = now;
                    }
                    break;
                case 'talk':
                    if (now - this.lastGameStateChangeTime > 1000) {
                        this.keys.talkList.forEach(function (key) {
                            return _this6.pressKey(key);
                        });
                        this.gameState = '跑任务';
                        this.lastGameStateChangeTime = now;
                    }
                    break;
                default:
                    this.gameState = '跑任务';
            }
        }
    }, {
        key: 'setFishState',
        value: function setFishState(hasFishInRing) {
            this.hasFishInRing = hasFishInRing;
        }
    }, {
        key: 'fishing_update',
        value: function fishing_update() {
            var now = Date.now();
            if (now - this.lastGameStateChangeTime > this.fishingWaitTime * 1000 + 500) {
                this.gameState = 'fishingResult';
                this.lastGameStateChangeTime = now;
                return;
            }
            switch (this.gameState) {
                case 'fishingResult':
                    if (now - this.lastGameStateChangeTime > 2000) {
                        this.pressKey(this.keys.fishSkip);
                        this.gameState = 'fishingOver';
                        this.lastGameStateChangeTime = now;
                    }
                    break;
                case 'fishingOver':
                    if (now - this.lastGameStateChangeTime > 1000) {
                        this.pressKey(this.keys.fish);
                        this.gameState = 'fishingStart';
                        this.lastGameStateChangeTime = now;
                    }
                    break;
                case 'fishingStart':
                    if (now - this.lastGameStateChangeTime > this.fishingWaitTime * 1000) {
                        this.pressKey(this.keys.fish);
                        this.gameState = 'fishingActive';
                        this.lastGameStateChangeTime = now;
                    }
                    break;
                case 'fishingActive':
                    if (now - this.lastGameStateChangeTime > 500 && this.hasFishInRing) {
                        this.pressKey(this.keys.fish);
                        this.gameState = 'fishingResult';
                        this.lastGameStateChangeTime = now;
                    }
                    break;
                default:
                    this.gameState = 'fishingResult';
            }
        }
    }]);

    return MoleScript;
}(GameScript);

if (initScript) {
    initScript(React.createElement(MoleScript, null));
}