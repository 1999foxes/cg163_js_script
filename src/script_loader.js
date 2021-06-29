const dependencyList = ['https://unpkg.com/react@17/umd/react.production.min.js', 
    'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
    'https://docs.opencv.org/3.4.0/opencv.js'
];

loadDependency(dependencyList, start);

function loadDependency(dependencyList, callback, i=0) {
    const s = document.createElement('script');
    s.src = dependencyList[i];
    document.head.appendChild(s);
    if (i+1 < dependencyList.length) {
        s.onload = () => loadDependency(dependencyList, callback, i+1);
    } else {
        s.onload = callback;
    }
}

function start() {

    const reactRoot = document.createElement('div');
    reactRoot.id = 'reactRoot';
    Object.assign(reactRoot.style, {position: 'fixed', top: '0', left: '0', opacity: '0.5', zIndex: '999'});
    document.body.append(reactRoot);

    class GameScript extends React.Component {
        constructor(props) {
            super(props);
            this.fps = 30;
            this.state = {};
            this.initState();
            this.intervalID = setInterval(this.update.bind(this), Math.round(1000/this.fps));
            this.video = document.getElementsByTagName('video')[0];
            this.captureVideoCanvas = document.createElement("canvas");
            this.captureVideoCanvas.width = 500;
            this.captureVideoCanvas.height = this.captureVideoCanvas.width * this.video.videoHeight / this.video.videoWidth;
            this.mat = new cv.Mat(this.captureVideoCanvas.height, this.captureVideoCanvas.width, cv.CV_8UC4);
        }
        
        componentWillUnmount() {
            clearInterval(this.intervalID);
        }
        
        initState() {
            console.error('initState not implemented');
        }
        
        update() {
            console.error('update not implemented');
        }
    
        render() {
            console.error('render not implemented');
        }
        
        pressKey(key) {
            const eventKeydown = new KeyboardEvent("keydown", {
                bubbles : true,
                cancelable : true,
                key : key,
                shiftKey : false
            });
    
            const eventKeyup = new KeyboardEvent("keyup", {
                bubbles : true,
                cancelable : true,
                key : key,
                shiftKey : false
            });
            
            setTimeout(() => document.body.dispatchEvent(eventKeydown), 0);
            setTimeout(() => document.body.dispatchEvent(eventKeyup), 5);
        }
        
        captureVideo(width=200) {
            let canvasContext = this.captureVideoCanvas.getContext("2d");
            canvasContext.drawImage(this.video, 0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
            return this.captureVideoCanvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
        }

        captureVideoMat(width=500) {
            let canvasContext = this.captureVideoCanvas.getContext("2d");
            canvasContext.drawImage(this.video, 0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
            let imageData = canvasContext.getImageData(0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
            this.mat.data.set(imageData.data);
        }
    }

    class JsFileInput extends React.Component {
        constructor(props) {
            super(props);
        }

        runJsFromFile(e) {
            for (const file of e.target.files) {
                const s = document.createElement('script');
                s.src = URL.createObjectURL(file);
                document.body.appendChild(s);
            }

            e.target.value = '';
        }

        render() {
            return <div>
                    <label>选择要注入的脚本文件：</label>
                    <input type='file' onChange={this.runJsFromFile.bind(this)}></input>
                </div>;
        }
    }

    class ScriptContainer extends React.Component {
        constructor(props) {
            super(props);
            this.state = {visibility: true, scriptElements: []};
            window.initScript = this.initScript.bind(this);
        }

        handleInputChange() {
            const target = event.target;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            const name = target.name;
        
            this.setState({
              [name]: value
            });
        }

        initScript(scriptElement) {
            this.setState(prev_state => ({scriptElements: [...prev_state.scriptElements, scriptElement]}));
        }

        render() {
            return <div>
                    <input type='checkbox' name='visibility' checked={this.state.visibility} onChange={this.handleInputChange.bind(this)}></input>
                    <label>显示脚本面板</label>
                    <button onClick={() => this.setState({scriptElements: []})}>清空脚本</button>
                    <JsFileInput></JsFileInput>
                    <div id='scriptContainer' style={{display: this.state.visibility? 'block' : 'none'}}>
                        {this.state.scriptElements}
                    </div>
                </div>
        }
    }

    window.GameScript = GameScript;
    ReactDOM.render(<ScriptContainer></ScriptContainer>, reactRoot);

};
