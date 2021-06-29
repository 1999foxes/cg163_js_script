function logHSV(hsv) {
    console.log(hsv);
}

class CVHsvFilter extends GameScript {
    constructor(props) {
        super(props);
        this.src = null;
        this.DISPLAY_MODE = {SRC: 0, INRANGE: 1, CNT: 2};
        this.rectList = [];
        this.rectListMaxLength = 1;
        this.isMouseDown = false;
    }

    initState() {
        this.state = {lowH: 0, lowS: 0, lowV: 0, highH: 256, highS: 256, highV: 256, displayMode: 0};
    }

    update() {
        if (!this.state.isPaused) {
            this.captureVideoMat();
        }

        let src = this.mat.clone();
        let dst1 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        let dst2 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        this.inHSVRange(src, dst1);
        let area = this.getArea(dst1, dst2);

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

        const ctx = this.canvasOutput.getContext('2d');
        this.rectList.forEach(r => ctx.rect(...Object.values(r)));
        ctx.strokeStyle = 'green';
        ctx.stroke();

        this.setState({info: '' + area})
    }

    show(dst) {
        cv.imshow('canvasOutput', dst);
    }

    inHSVRange(src, dst, HSVRange=this.state) {
        let bgr = new cv.Mat();
        cv.cvtColor(src, bgr, cv.COLOR_RGBA2BGR, 0);

        let hsv = new cv.Mat();
        cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [HSVRange.lowH, HSVRange.lowS, HSVRange.lowV, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [HSVRange.highH, HSVRange.highS, HSVRange.highV, 0]);
        cv.inRange(hsv, low, high, dst);

        bgr.delete();
        hsv.delete();
        low.delete();
        high.delete();
    }

    getArea(src, dst) {
        let can = new cv.Mat();
        cv.Canny(src, can, 300, 0, 3, false);

        let dil = new cv.Mat();
        let M = cv.Mat.ones(10, 10, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        cv.dilate(can, dil, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        let ero = new cv.Mat();
        cv.erode(dil, ero, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(ero, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        let maxCntIndex = -1, maxArea = 0;
        for (let i = 0; i < contours.size(); ++i) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);
            if (area > maxArea) {
                maxCntIndex = i;
                maxArea = area;
            }
        }

        if (maxCntIndex != -1) {
            let color = new cv.Scalar(255, 255, 255);
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

    getHSVRangeOfRectList() {
        const hsvRange = {lowH: -1, lowS: -1, lowV: -1, highH: 256, highS: 256, highV: 256};
        let threshold = 1;

        for (const arg of Object.keys(hsvRange)) {
            threshold *= 0.7;
            const areaAll = this.rectList.reduce((sum, rect) => sum + rect.width * rect.height, 0);
            let area = areaAll;
            let nextHsvRange = {...hsvRange};
            while(area / areaAll > threshold) {
                Object.assign(hsvRange, nextHsvRange);
                area = 0;
                nextHsvRange[arg] += (arg.includes('low')? 1: -1);
                if (nextHsvRange[arg] < 0 || nextHsvRange[arg] > 255) {
                    break;
                }
                for (const rect of this.rectList) {
                    let src = this.mat.roi(rect);
                    let dst1 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
                    this.inHSVRange(src, dst1, nextHsvRange);
                    dst1.data8S.forEach(i => area += (i === -1));
                    src.delete();
                    dst1.delete();
                }
            }
        }

        this.setState(hsvRange);
    }

    handleRangeChange(e) {
        this.setState({[e.target.name]: parseInt(e.target.value)});
    }

    handleCanvasMouseDown(e) {
        if (this.rectList.length >= this.rectListMaxLength) {
            this.rectList.pop();
        }

        const canvasRect = this.canvasOutput.getBoundingClientRect();
        this.rectList.push(new cv.Rect(e.clientX - canvasRect.x, e.clientY - canvasRect.y, 1, 1));
        this.isMouseDown = true;
    }

    handleCanvasMouseMove(e) {
        if (!this.isMouseDown) {
            return;
        }
        const canvasRect = this.canvasOutput.getBoundingClientRect();
        const rect = this.rectList[this.rectList.length - 1];
        Object.assign(rect, {width: e.clientX - canvasRect.x - rect.x, height: e.clientY - canvasRect.y - rect.y});
    }

    handleCanvasMouseUp(e) {
        this.isMouseDown = false;
        console.log(this.rectList);
    }

    render() {
        return (
            <div>
                <div>
                    <div>
                        <canvas id='canvasOutput' 
                            onMouseDown={this.handleCanvasMouseDown.bind(this)} 
                            onMouseMove={this.handleCanvasMouseMove.bind(this)} 
                            onMouseUp={this.handleCanvasMouseUp.bind(this)} 
                            ref={node => this.canvasOutput = node}
                        >
                        </canvas>
                    </div>
                    <div>
                        {['lowH', 'lowS', 'lowV', 'highH', 'highS', 'highV'].map(name => {
                            return (
                                <div key={name}>
                                    <input type='range' name={name} min='0' max='256' value={this.state[name]} onChange={this.handleRangeChange.bind(this)}></input>
                                    <label>{name}:{this.state[name]}</label>
                                </div>
                            );
                        })}
                        <button onClick={() => this.setState(prevState => ({isPaused: !prevState.isPaused}))}>{this.state.isPaused? 'continue': 'pause'}</button>
                        <button onClick={() => this.rectList = []}>clear brush</button>
                        <button onClick={() => this.getHSVRangeOfRectList()}>get hsv range of brush</button>
                        <button onClick={() => this.setState(prevState => ({displayMode: (prevState.displayMode + 1) % 3}))}>displayMode:{'' + this.state.displayMode}</button>
                        <button onClick={() => this.props.exporter(this.state)}>export</button>
                        <p>{this.state.info}</p>
                    </div>
                </div>
            </div>
        );
    }
}


initScript(<CVHsvFilter exporter={logHSV}></CVHsvFilter>);
