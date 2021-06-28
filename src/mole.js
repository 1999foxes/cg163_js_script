class FishDetector extends GameScript {
    constructor(props) {
        super(props);
    }

    initState() {
        return;
    }

    show(dst) {
        cv.imshow('canvasOutput', dst);
    }

    update() {
        this.captureVideoMat();

        this.hasRing = false;
        this.hasFishInRing = false;

        let rect = this.getGreenRect();
        if (rect != null) {
            this.hasRing = true;
            if (this.hasFishInRect(rect)) {
                this.hasFishInRing = true;
            }
        }

        this.props.setFishState(this.hasFishInRing);
    }

    drawResult(result) {
        let dst = this.mat.clone();
        let color = new cv.Scalar(255, 0, 255);
        cv.drawContours(dst, result.contours, result.i, color, 1, cv.LINE_8, result.hierarchy, 100);
        this.show(dst);
        dst.delete();
    }

    getGreenRect() {
        let config = {lowH: 60, lowS: 90, lowV: 135, highH: 85, highS: 255, highV: 255};
        let result = this.inRange(config);
        let rect = null;
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

    hasFishInRect(rect) {
        // let fish = this.inRange({lowH: 95, lowS: 77, lowV: 96, highH: 117, highS: 166, highV: 255, rect: rect});
        let fish = this.inRange({lowH: 86, lowS: 77, lowV: 180, highH: 117, highS: 166, highV: 220, rect: rect});

        for (i in fish) {
            if (i && i.delete) {
                i.delete();
            }
        }
        
        return fish.area > 50;
    }

    inRange(config) {
        let bgr = new cv.Mat();
        cv.cvtColor(this.mat, bgr, cv.COLOR_RGBA2BGR, 0);

        let hsv = new cv.Mat();
        cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

        let inr = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [config.lowH, config.lowS, config.lowV, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [config.highH, config.highS, config.highV, 0]);
        cv.inRange(hsv, low, high, inr);

        let can = new cv.Mat();
        cv.Canny(inr, can, 300, 0, 3, false);

        let dil = new cv.Mat();
        let M = cv.Mat.ones(10, 10, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        cv.dilate(can, dil, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        let ero = new cv.Mat();
        cv.erode(dil, ero, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(ero, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        let maxCntIndex = 0, maxArea = 0;
        for (let i = 0; i < contours.size(); ++i) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);
            if (config.rect) {
                const rect = cv.boundingRect(cnt);
                if (!(config.rect.x < rect.x && config.rect.y < rect.y &&
                    config.rect.x + config.rect.width > rect.x + rect.width &&
                    config.rect.y + config.rect.height > rect.y + rect.height)) {
                    continue;
                }
            }

            if (area > maxArea) {
                maxCntIndex = i;
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

        return {contours: contours, i: maxCntIndex, hierarchy: hierarchy, area: maxArea}; // ?
    }

    render() {
        return (
            <div>
                <canvas id="canvasOutput"></canvas>
            </div>
        );
    }
}


class MoleScript extends GameScript {
    constructor(props) {
        super(props);
    }

    initState() {
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
    
    render() {
        return <div>
            <button onClick={() => this.setState(prevState => ({isPaused: !prevState.isPaused}))}>{this.state.isPaused? '开始' : '暂停'}</button>
            <select onChange={e => this.setState({func: e.target.value, isPaused: true})}>
                {this.funcList.map(f => <option value={f}>{f}</option>)}
            </select>
            <labbel>钓鱼上钩时间：</labbel>
            <select onChange={e => this.fishingWaitTime = parseInt(e.target.value)}>
                <option value='3'>3s</option>
                <option value='4'>4s</option>
                <option value='5'>5s</option>
                <option value='6' selected>6s</option>
                <option value='7'>7s</option>
            </select>
            <p>{this.state.info}</p>
            {!this.state.isPaused && this.state.func == '钓鱼鱼' ? <FishDetector setFishState={this.setFishState.bind(this)}></FishDetector> : null}
        </div>
    }
    
    update() {
        this.setState({info: '' + this.gameState + ', ' + (Date.now() - this.lastGameStateChangeTime)});
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
    
    farm_update() {
        const now = Date.now();
        if (now - this.lastGameStateChangeTime > 500) {
            this.pressKey(this.keys.farm);
            this.lastGameStateChangeTime = now;
        }
    }
    
    task_update() {
        const now = Date.now();
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
                    this.keys.talkList.forEach(key => this.pressKey(key));
                    this.gameState = '跑任务';
                    this.lastGameStateChangeTime = now;
                }
                break;
            default:
                this.gameState = '跑任务';
        }
    }
    
    setFishState(hasFishInRing) {
        this.hasFishInRing = hasFishInRing;
    }

    fishing_update() {
        const now = Date.now();
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
}

if (initScript) {
    initScript(<MoleScript></MoleScript>);
}
