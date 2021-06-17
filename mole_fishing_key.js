class Script {
    constructor() {
        this.fps = 30;
        this.container = document.createElement('div');
        Object.assign(this.container.style, {position: 'fixed', top: '0', left: '0', zIndex: '999', background: 'black', opacity: '0.5'});
        document.body.appendChild(this.container);
        this.initState();
        this.initGUI();
        this.intervalID = setInterval(this.update.bind(this), 1000/this.fps);
    }
    
    initState() {
        console.error('initState not implemented');
    }
    
    initGUI() {
        console.error('initGUI not implemented');
    }
    
    update() {
        console.error('update not implemented');
    }
    
    pressKey(key) {
        console.log('press ' + key);
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
    
    captureVideo() {
        this.captureVideoCanvas = this.captureVideoCanvas || document.createElement("canvas");
        this.captureVideoCanvas.width = 200;
        this.captureVideoCanvas.height = this.captureVideoCanvas.width * video.videoHeight / video.videoWidth;
        var canvasContext = this.captureVideoCanvas.getContext("2d");
        canvasContext.drawImage(video, 0, 0, this.captureVideoCanvas.width, this.captureVideoCanvas.height);
        var url = this.captureVideoCanvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
        return url;
    }
}

class ScriptMole extends Script {
    constructor() {
        super();
    }
    
    initState() {
        this.isPaused = true;
        this.func = 'fishing';
        this.funcList = ['farm', 'task', 'fishing'];
        this.state = 'noState';
        this.lastStateChangeTime = Date.now();
        this.keys = {
            task: '9',
            talkList: ['r', 't', 'y', 'u', 'i', 'o'],
        };
        
        if (this.yoloSocket) {
            this.yoloSocket.close();
        };
        this.hasActiveButton = false;
        this.hasFishInRing = false;
        this.yoloSocket= new WebSocket(yoloApiAddress);
        this.frameSent = false;
        this.yoloSocket.onmessage = (message) => {
            this.parseYoloResult(message);
        };
        this.key = window.prompt('输入密钥');
    }
    
    resetState() {
        if (this.yoloSocket) {
            this.yoloSocket.close();
        }
        this.yoloSocket = new WebSocket(yoloApiAddress);
        this.frameSent = false;
        this.yoloSocket.onmessage = (message) => {
            this.parseYoloResult(message);
        };
        this.hasActiveButton = false;
        this.hasFishInRing = false;
    }
    
    initGUI() {
        this.pauseButton = document.createElement('button');
        this.pauseButton.innerText = 'continue';
        this.pauseButton.onclick = () => {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.resetState();
            }
        };
        this.container.appendChild(this.pauseButton);
        
        // this.funcSelect = document.createElement('select');
        // this.funcList.forEach((f) => {
        //     const option = document.createElement('option');
        //     option.value = f;
        //     option.innerText = f;
        //     this.funcSelect.appendChild(option);
        // });
        // this.funcSelect.onchange = () => {
        //     this.func = this.funcSelect.value;
        //     this.isPaused = true;
        // };
        // this.container.appendChild(this.funcSelect);
        
        // this.testButton = document.createElement('button');
        // this.testButton.innerText = 'test';
        // this.testButton.onclick = () => {
            // this.sendYolo();
        // };
        // this.container.appendChild(this.testButton);
        
        this.info = document.createElement('p');
        this.container.appendChild(this.info);
    }
    
    update() {
        this.gui_update();
        if (this.isPaused) {
            return;
        }
        switch (this.func) {
            case 'farm':
                this.farm_update();
                break;
            case 'task':
                this.task_update();
                break;
            case 'fishing':
                this.fishing_update();
                break;
        }
    }
    
    gui_update() {
        this.pauseButton.innerText = (this.isPaused? 'continue' : 'pause');
        this.info.innerText = '' + this.state + ', ' + this.hasActiveButton + ', ' + this.hasFishInRing + ', ' + (Date.now() - this.lastStateChangeTime);
    }
    
    farm_update() {
        const now = Date.now();
        if (now - this.lastStateChangeTime > 500) {
            this.pressKey('g');
            this.lastStateChangeTime = now;
        }
    }
    
    task_update() {
        const now = Date.now();
        switch (this.state) {
            case 'task':
                if (now - this.lastStateChangeTime > 1000) {
                    this.pressKey('9');
                    this.state = 'talk';
                    this.lastStateChangeTime = now;
                }
                break;
            case 'talk':
                if (now - this.lastStateChangeTime > 1000) {
                    this.keys.talkList.forEach(key => this.pressKey(key));
                    this.state = 'task';
                    this.lastStateChangeTime = now;
                }
                break;
            default:
                this.state = 'task';
        }
    }
    
    fishing_update() {
        const now = Date.now();
        if (!this.frameSent) {
            this.sendYoloFrame();
        }
        if (now - this.lastStateChangeTime > 10000) {
            this.state = 'fishingResult';
        }
        switch (this.state) {
            case 'fishingResult':
                if (now - this.lastStateChangeTime > 3000) {
                    this.pressKey('8');
                    this.state = 'fishingOver';
                    this.lastStateChangeTime = now;
                }
                break;
            case 'fishingOver':
                if (now - this.lastStateChangeTime > 500) {
                    this.pressKey('g');
                    this.state = 'fishingStart';
                    this.lastStateChangeTime = now;
                }
                break;
            case 'fishingStart':
                if (now - this.lastStateChangeTime > 500 && this.hasActiveButton) {
                    this.pressKey('g');
                    this.state = 'fishingActive';
                    this.lastStateChangeTime = now;
                }
                break;
            case 'fishingActive':
                if (now - this.lastStateChangeTime > 500 && this.hasFishInRing) {
                    this.pressKey('g');
                    this.state = 'fishingResult';
                    this.lastStateChangeTime = now;
                }
                break;
            default:
                this.state = 'fishingResult';
        }
    }
    
    sendYoloFrame() {
        const yoloModelName = 'mole_fishing.pt';
        this.yoloSocket.send(JSON.stringify({key: this.key, model: yoloModelName, frame: this.captureVideo()}));
        this.frameSent = true;
    }
    
    parseYoloResult(message) {
        console.log(message.data);
        const result = JSON.parse(message.data);
        console.log(result);
        this.hasActiveButton = (result[1].length > 0);
        this.hasFishInRing = false;
        if (result[3].length > 0 && result[4].length > 0) {
            const fish = result[3][0];
            const ring = result[4][0];
            const ringCenter = [ring[0] + ring[2] / 2, ring[1] + ring[3] / 2];
            const fishCenter = [fish[0] + fish[2] / 2, fish[1] + fish[3] / 2];
            const ringRadius = (ring[2] + ring[3]) / 8 * 1.414;
            if (Math.sqrt((fishCenter[0] - ringCenter[0]) ** 2 + (fishCenter[1] - ringCenter[1]) ** 2) / ringRadius < 0.6) {
                this.hasFishInRing = true;
            }
        }
        
        this.frameSent = false;
    }
}

var video = document.getElementsByTagName('video')[0];
// yoloApiAddress = 'ws://localhost:8706';
var yoloApiAddress = 'wss://34077828v5.oicp.vip/';
var s = new ScriptMole();
