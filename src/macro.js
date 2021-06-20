class Macro extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isRecording: false, isReplaying: false, isLooping: false, chosenMacro: null};
        this.macroList = [];
    }
    
    record(macro, targetElement, eventType) {
        const time0 = Date.now();
        function recordEvent(e) {
            macro.push({event: e, time: Date.now()-time0});
        }
        targetElement.addEventListener(eventType, recordEvent);
        document.body.addEventListener('stoprecording', () => {
                targetElement.removeEventListener(eventType, recordEvent);
        });
    }
    
    replay(macro) {
        macro.forEach(d => {
            let copyEvent = null;
            if (d.event instanceof KeyboardEvent) {
                copyEvent = new KeyboardEvent(d.event.type, d.event);
            } else if (d.event instanceof MouseEvent) {
                copyEvent = new MouseEvent(d.event.type, d.event);
            }
            setTimeout(
                () => d.event.target.dispatchEvent(copyEvent), 
                d.time
            );
        });
    }
    
    loop(macro) {
        this.replay(macro);     // initially replay before first interval
        const loopID = setInterval(() => this.replay(macro), macro[macro.length-1].time);
        document.body.addEventListener('stoplooping', function stop() {
            clearInterval(loopID);
            document.body.removeEventListener('stoplooping', stop);
        });
    }
    
    startRecordingMacro() {
        this.setState({isRecording: true});
        const macro = [];
        macro.name = '未命名宏' + this.macroList.length;
        this.macroList.push(macro);
        const bodyEventTypeList = ['keydown', 'keyup'];
        const videoEventTypeList = ['mousedown', 'mousemove', 'mouseup'];
        bodyEventTypeList.forEach(type => this.record(macro, document.body, type));
        videoEventTypeList.forEach(type => this.record(macro, document.body.getElementsByTagName('video')[0], type));
    }

    stopRecordingMacro() {
        this.setState({isRecording: false});
        const e = new Event('stoprecording');
        document.body.dispatchEvent(e);
        if (this.state.chosenMacro == null) {
            this.setState({chosenMacro: this.macroList[0]});
        }
    }

    replayChosenMacro() {
        this.setState({isReplaying: true});
        this.replay(this.state.chosenMacro);
        setTimeout(() => this.setState({isReplaying: false}), this.state.chosenMacro[this.state.chosenMacro.length-1].time);
    }

    startLoopingChosenMacro() {
        this.setState({isLooping: true});
        this.loop(this.state.chosenMacro);
    }

    stopLoopingChosenMacro() {
        this.setState({isLooping: false});
        document.body.dispatchEvent(new Event('stoplooping'));
    }

    setChosenMacro(macro) {
        if (!this.state.isRecording && !this.state.isReplaying && !this.state.isLooping) {
            this.setState({chosenMacro: macro});
        }
    }

    renameChosenMacro() {
        this.setState(prevState => {
            prevState.chosenMacro.name = prompt('输入宏操作名');
            return {chosenMacro: prevState.chosenMacro};
        });
    }

    render() {
        return <div>
                <button onClick={this.state.isRecording? this.stopRecordingMacro.bind(this) : this.startRecordingMacro.bind(this)} 
                    disabled={this.state.isReplaying || this.state.isLooping}>
                        {this.state.isRecording? '停止录制' : '录制宏'}
                </button>
                <button onClick={this.replayChosenMacro.bind(this)} disabled={this.state.isRecording || this.state.isReplaying || this.state.isLooping}>
                    播放
                </button>
                <button onClick={this.state.isLooping? this.stopLoopingChosenMacro.bind(this) : this.startLoopingChosenMacro.bind(this)} disabled={this.state.isRecording || this.state.isReplaying}>
                    {this.state.isLooping? '停止' : '循环'}
                </button>
                <button onClick={this.renameChosenMacro.bind(this)} disabled={this.state.isRecording || this.state.isReplaying || this.state.isLooping}>重命名</button>
                <ul>
                {
                    this.macroList.map((macro, index, array) => {
                        return <li key={index} onClick={() => this.setChosenMacro(macro)} style={{color: this.state.chosenMacro == macro? 'red' : 'white'}} >
                                {macro.name}
                            </li>;
                    })
                }
                </ul>
            </div>;
    }
}

if (initScript) {
    initScript(<Macro></Macro>);
}
