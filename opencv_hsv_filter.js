var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CVHsvFilter = function (_React$Component) {
    _inherits(CVHsvFilter, _React$Component);

    function CVHsvFilter(props) {
        _classCallCheck(this, CVHsvFilter);

        // this.state = {lowH: 0, lowS: 0, lowV: 0, highH: 256, highS: 256, highV: 256};
        // this.state = {lowH: 26, lowS: 153, lowV: 217, highH: 30, highS: 256, highV: 256};
        // this.state = {lowH: 59, lowS: 108, lowV: 145, highH: 81, highS: 192, highV: 226, displayCnt: false};
        var _this = _possibleConstructorReturn(this, (CVHsvFilter.__proto__ || Object.getPrototypeOf(CVHsvFilter)).call(this, props));

        _this.state = { lowH: 90, lowS: 77, lowV: 96, highH: 117, highS: 166, highV: 163, displayCnt: false };
        _this.src = null;
        return _this;
    }

    _createClass(CVHsvFilter, [{
        key: 'srcImgOnload',
        value: function srcImgOnload(e) {
            if (this.src) {
                this.src.delete();
            }
            img = cv.imread(e.target);
            this.src = this.resize(img, 500);
            img.delete();
            this.inRange();
        }
    }, {
        key: 'resize',
        value: function resize(src, width) {
            var dst = new cv.Mat();
            var dsize = new cv.Size(width, src.rows / src.cols * width);
            cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
            return dst;
        }
    }, {
        key: 'show',
        value: function show(dst) {
            cv.imshow('canvasOutput', dst);
        }
    }, {
        key: 'inRange',
        value: function inRange() {
            var bgr = new cv.Mat();
            cv.cvtColor(this.src, bgr, cv.COLOR_RGBA2BGR, 0);

            var hsv = new cv.Mat();
            cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

            var inr = new cv.Mat();
            var low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [this.state.lowH, this.state.lowS, this.state.lowV, 0]);
            var high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [this.state.highH, this.state.highS, this.state.highV, 0]);
            cv.inRange(hsv, low, high, inr);

            var can = new cv.Mat();
            cv.Canny(inr, can, 300, 0, 3, false);

            var dil = new cv.Mat();
            var M = cv.Mat.ones(10, 10, cv.CV_8U);
            var anchor = new cv.Point(-1, -1);
            cv.dilate(can, dil, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            var ero = new cv.Mat();
            cv.erode(dil, ero, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            // this.show(ero);

            var dst = cv.Mat.zeros(ero.rows, ero.cols, cv.CV_8UC3);
            var contours = new cv.MatVector();
            var hierarchy = new cv.Mat();
            cv.findContours(ero, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

            if (contours.size() == 0) {
                console.log('no contours found');
            } else {
                var maxCntIndex = void 0,
                    maxArea = 0;
                for (var i = 0; i < contours.size(); ++i) {
                    var cnt = contours.get(i);
                    var area = cv.contourArea(cnt);
                    if (area > maxArea) {
                        maxCntIndex = i;
                        maxArea = area;
                    }
                }

                var color = new cv.Scalar(255, 255, 255);
                cv.drawContours(dst, contours, maxCntIndex, color, 1, cv.LINE_8, hierarchy, 100);
            }

            if (this.state.displayCnt) this.show(dst);else this.show(inr);

            bgr.delete();
            hsv.delete();
            low.delete();
            high.delete();
            inr.delete();
            can.delete();
            dil.delete();
            M.delete();
            ero.delete();
            dst.delete();
            hierarchy.delete();
        }
    }, {
        key: 'handleRangeChange',
        value: function handleRangeChange(e) {
            this.setState(_defineProperty({}, e.target.name, parseInt(e.target.value)));
            this.inRange();
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
                        React.createElement('img', { style: { display: 'none' }, id: 'imageSrc', alt: 'No Image', src: this.state.srcImg || null, onLoad: this.srcImgOnload.bind(this) }),
                        React.createElement(
                            'div',
                            null,
                            React.createElement('input', { type: 'file', id: 'fileInput', name: 'file', onChange: function onChange(e) {
                                    return _this2.setState({ srcImg: URL.createObjectURL(e.target.files[0]) });
                                } })
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('canvas', { id: 'canvasOutput' })
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
                                        return { displayCnt: !prevState.displayCnt };
                                    }, _this2.inRange.bind(_this2));
                                } },
                            'displayCnt:',
                            '' + this.state.displayCnt
                        ),
                        React.createElement(
                            'button',
                            { onClick: function onClick() {
                                    return console.log(_this2.state);
                                } },
                            'log'
                        )
                    )
                )
            );
        }
    }]);

    return CVHsvFilter;
}(React.Component);

initScript(React.createElement(CVHsvFilter, null));