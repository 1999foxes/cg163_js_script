var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
        }
    }, {
        key: 'drawResult',
        value: function drawResult(result) {
            var dst = this.mat.clone();
            var color = new cv.Scalar(255, 0, 255);
            cv.drawContours(dst, result.contours, result.i, color, 1, cv.LINE_8, result.hierarchy, 100);
            this.show(dst);
            dst.delete();
        }
    }, {
        key: 'getGreenRect',
        value: function getGreenRect() {
            var config = { lowH: 59, lowS: 108, lowV: 145, highH: 81, highS: 192, highV: 226 };
            var result = this.inRange(config);
            var rect = null;
            if (result.area > 100) {
                rect = cv.boundingRect(result.contours.get(result.i));
            }

            this.drawResult(result);

            for (i in result) {
                if (i && i.delete) {
                    i.delete();
                }
            }

            return rect;
        }
    }, {
        key: 'hasFishInRect',
        value: function hasFishInRect(rect) {
            var fish = this.inRange({ lowH: 90, lowS: 77, lowV: 96, highH: 117, highS: 166, highV: 163, rect: rect });

            for (i in fish) {
                if (i && i.delete) {
                    i.delete();
                }
            }

            return fish.area > 50;
        }
    }, {
        key: 'inRange',
        value: function inRange(config) {
            var bgr = new cv.Mat();
            cv.cvtColor(this.mat, bgr, cv.COLOR_RGBA2BGR, 0);

            var hsv = new cv.Mat();
            cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

            var inr = new cv.Mat();
            var low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [config.lowH, config.lowS, config.lowV, 0]);
            var high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [config.highH, config.highS, config.highV, 0]);
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
            for (var _i = 0; _i < contours.size(); ++_i) {
                var cnt = contours.get(_i);
                var area = cv.contourArea(cnt);
                if (config.rect) {
                    var rect = cv.boundingRect(cnt);
                    if (!(config.rect.x < rect.x && config.rect.y < rect.y && config.rect.x + config.rect.width > rect.x + rect.width && config.rect.y + config.rect.height > rect.y + rect.height)) {
                        continue;
                    }
                }

                if (area > maxArea) {
                    maxCntIndex = _i;
                    maxArea = area;
                }
            }

            bgr.delete();
            hsv.delete();
            low.delete();
            high.delete();
            inr.delete();
            can.delete();
            dil.delete();
            M.delete();
            ero.delete();

            return { contours: contours, i: maxCntIndex, hierarchy: hierarchy, area: maxArea }; // ?
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement('canvas', { id: 'canvasOutput' })
            );
        }
    }]);

    return FishDetector;
}(GameScript);

var MoleScript = function (_GameScript2) {
    _inherits(MoleScript, _GameScript2);

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
                info: ''
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
        key: 'render',
        value: function render() {
            var _this3 = this;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { onClick: function onClick() {
                            return _this3.setState(function (prevState) {
                                return { isPaused: !prevState.isPaused };
                            });
                        } },
                    this.state.isPaused ? '开始' : '暂停'
                ),
                React.createElement(
                    'select',
                    { onChange: function onChange(e) {
                            return _this3.setState({ func: e.target.value, isPaused: true });
                        } },
                    this.funcList.map(function (f) {
                        return React.createElement(
                            'option',
                            { value: f },
                            f
                        );
                    })
                ),
                React.createElement(
                    'labbel',
                    null,
                    '\u9493\u9C7C\u4E0A\u94A9\u65F6\u95F4\uFF1A'
                ),
                React.createElement(
                    'select',
                    { onChange: function onChange(e) {
                            return _this3.fishingWaitTime = parseInt(e.target.value);
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
                    'p',
                    null,
                    this.state.info
                ),
                !this.state.isPaused && this.state.func == '钓鱼鱼' ? React.createElement(FishDetector, { setFishState: this.setFishState.bind(this) }) : null
            );
        }
    }, {
        key: 'update',
        value: function update() {
            this.setState({ info: '' + this.gameState + ', ' + (Date.now() - this.lastGameStateChangeTime) });
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
            var _this4 = this;

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
                            return _this4.pressKey(key);
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