var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function logHSV(hsv) {
    console.log(hsv);
}

var CVHsvFilter = function (_GameScript) {
    _inherits(CVHsvFilter, _GameScript);

    function CVHsvFilter(props) {
        _classCallCheck(this, CVHsvFilter);

        var _this = _possibleConstructorReturn(this, (CVHsvFilter.__proto__ || Object.getPrototypeOf(CVHsvFilter)).call(this, props));

        _this.src = null;
        _this.DISPLAY_MODE = { SRC: 0, INRANGE: 1, CNT: 2 };
        _this.rectList = [];
        _this.rectListMaxLength = 1;
        _this.isMouseDown = false;
        return _this;
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
            var _this2 = this;

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
                                return _this2.canvasOutput = node;
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
                                React.createElement('input', { type: 'range', name: name, min: '0', max: '256', value: _this2.state[name], onChange: _this2.handleRangeChange.bind(_this2) }),
                                React.createElement(
                                    'label',
                                    null,
                                    name,
                                    ':',
                                    _this2.state[name]
                                )
                            );
                        }),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this2.setState(function (prevState) {
                                        return { isPaused: !prevState.isPaused };
                                    });
                                } },
                            this.state.isPaused ? 'continue' : 'pause'
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this2.rectList = [];
                                } },
                            'clear brush'
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this2.getHSVRangeOfRectList();
                                } },
                            'get hsv range of brush'
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this2.setState(function (prevState) {
                                        return { displayMode: (prevState.displayMode + 1) % 3 };
                                    });
                                } },
                            'displayMode:',
                            '' + this.state.displayMode
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return _this2.props.exporter(_this2.state);
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

initScript(React.createElement(CVHsvFilter, { exporter: logHSV }));