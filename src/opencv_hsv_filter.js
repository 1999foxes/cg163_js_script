class CVHsvFilter extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {lowH: 0, lowS: 0, lowV: 0, highH: 256, highS: 256, highV: 256};
        // this.state = {lowH: 26, lowS: 153, lowV: 217, highH: 30, highS: 256, highV: 256};
        // this.state = {lowH: 59, lowS: 108, lowV: 145, highH: 81, highS: 192, highV: 226, displayCnt: false};
        this.state = {lowH: 90, lowS: 77, lowV: 96, highH: 117, highS: 166, highV: 163, displayCnt: false};
        this.src = null;
    }

    srcImgOnload(e) {
        if (this.src) {
            this.src.delete();
        }
        img = cv.imread(e.target);
        this.src = this.resize(img, 500);
        img.delete();
        this.inRange();
    }

    resize(src, width) {
        let dst = new cv.Mat();
        let dsize = new cv.Size(width, src.rows / src.cols * width);
        cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
        return dst;
    }

    show(dst) {
        cv.imshow('canvasOutput', dst);
    }

    inRange() {
        let bgr = new cv.Mat();
        cv.cvtColor(this.src, bgr, cv.COLOR_RGBA2BGR, 0);

        let hsv = new cv.Mat();
        cv.cvtColor(bgr, hsv, cv.COLOR_BGR2HSV, 0);

        let inr = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [this.state.lowH, this.state.lowS, this.state.lowV, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [this.state.highH, this.state.highS, this.state.highV, 0]);
        cv.inRange(hsv, low, high, inr);

        let can = new cv.Mat();
        cv.Canny(inr, can, 300, 0, 3, false);

        let dil = new cv.Mat();
        let M = cv.Mat.ones(10, 10, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        cv.dilate(can, dil, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        let ero = new cv.Mat();
        cv.erode(dil, ero, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        // this.show(ero);

        let dst = cv.Mat.zeros(ero.rows, ero.cols, cv.CV_8UC3);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(ero, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        if (contours.size() == 0) {
            console.log('no contours found');
        } else {
            let maxCntIndex, maxArea = 0;
            for (let i = 0; i < contours.size(); ++i) {
                const cnt = contours.get(i);
                const area = cv.contourArea(cnt);
                if (area > maxArea) {
                    maxCntIndex = i;
                    maxArea = area;
                }
            }

            let color = new cv.Scalar(255, 255, 255);
            cv.drawContours(dst, contours, maxCntIndex, color, 1, cv.LINE_8, hierarchy, 100);
        }

        if (this.state.displayCnt)
            this.show(dst);
        else
            this.show(inr);

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

    handleRangeChange(e) {
        this.setState({[e.target.name]: parseInt(e.target.value)});
        this.inRange();
    }

    render() {
        return (
            <div>
                <div>
                    <div>
                        <img style={{display: 'none'}} id='imageSrc' alt='No Image' src={this.state.srcImg || null} onLoad={this.srcImgOnload.bind(this)}/>
                        <div>
                            <input type='file' id='fileInput' name='file' onChange={e => this.setState({srcImg: URL.createObjectURL(e.target.files[0])})} />
                        </div>
                    </div>
                    <div>
                        <canvas id='canvasOutput'></canvas>
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
                        <button onClick={() => this.setState(prevState => ({displayCnt: !prevState.displayCnt}), this.inRange.bind(this))}>displayCnt:{'' + this.state.displayCnt}</button>
                        <button onClick={() => console.log(this.state)}>log</button>
                    </div>
                </div>
            </div>
        );
    }
}


initScript(<CVHsvFilter></CVHsvFilter>);
