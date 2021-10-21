class Macro extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRecording: false, 
            isReplaying: false, 
            isLooping: false, 
            chosenMacroIndex: 0, 
            macroList: [],
            loopTimes: 999
        };
    }

    componentDidMount() {
        this.loadMacroList();
    }
    
    record(macro, targetElement, eventType) {
        const time0 = Date.now();
        function recordEvent(e) {
            const copyEvent = {};
            const attrList = [
                'type',
                'screenX',
                'screenY',
                'clientX',
                'clientY',
                'ctrlKey',
                'shiftKey',
                'altKey',
                'metaKey',
                'button',
                'buttons',
                'relatedTarget',
                'region',
                'key',
                'code',
                'location',
                'repeat',
                'isComposing',
                'charCode',
                'keyCode',
                'which',
                'bubbles'
            ];
            for (attr of attrList) {
                if (e[attr] !== undefined) {
                    copyEvent[attr] = e[attr];
                }
            }
            macro.actions.push({event: copyEvent, time: Date.now()-time0});
        }
        targetElement.addEventListener(eventType, recordEvent);
        document.body.addEventListener('stoprecording', () => {
                targetElement.removeEventListener(eventType, recordEvent);
        });
    }
    
    replay(macro) {
        if (macro.actions.length == 0) {
            return;
        }
        const keyboardEventTypes = ['keydown', 'keyup'];
        const mouseEventTypes = ['mousedown', 'mousemove', 'mouseup'];
        const keyboardEventTarget = document.body;
        const mouseEventTarget = document.getElementsByTagName('video')[0];
        macro.actions.forEach(d => {
            if (keyboardEventTypes.includes(d.event.type)) {
                const copyEvent = new KeyboardEvent(d.event.type, d.event);
                setTimeout(
                    () => keyboardEventTarget.dispatchEvent(copyEvent), 
                    d.time
                );
            } else if (mouseEventTypes.includes(d.event.type)) {
                const copyEvent = new MouseEvent(d.event.type, d.event);
                setTimeout(
                    () => mouseEventTarget.dispatchEvent(copyEvent), 
                    d.time
                );
            }
        });
    }
    
    loop(macro) {
        if (macro.actions.length == 0) {
            return;
        }

        const loopOnce = () => {
            if (this.state.loopTimes > 0) {
                this.setState(prevState => ({loopTimes: prevState.loopTimes-1}));
                this.replay(macro)
                setTimeout(loopOnce, macro.actions[macro.actions.length-1].time);
            } else {
                this.setState({isLooping: false});
            }
        };

        loopOnce();
    }
    
    startRecordingMacro() {
        this.setState({isRecording: true});
        const macro = {actions: [], name: '未命名宏' + this.state.macroList.length};
        this.setState(prevState => {
            prevState.macroList.push(macro);
            return {macroList: prevState.macroList};
        });
        const bodyEventTypeList = ['keydown', 'keyup'];
        const videoEventTypeList = ['mousedown', 'mousemove', 'mouseup'];
        bodyEventTypeList.forEach(type => this.record(macro, document.body, type));
        videoEventTypeList.forEach(type => this.record(macro, document.body.getElementsByTagName('video')[0], type));
    }

    stopRecordingMacro() {
        this.setState({isRecording: false});
        const e = new Event('stoprecording');
        document.body.dispatchEvent(e);
        this.setState({chosenMacroIndex: this.state.macroList.length - 1});
    }

    replayChosenMacro() {
        const chosenMacro = this.state.macroList[this.state.chosenMacroIndex];
        if (chosenMacro == null || chosenMacro.actions.length == 0) {
            return;
        }
        this.setState({isReplaying: true});
        this.replay(chosenMacro);
        setTimeout(() => this.setState({isReplaying: false}), chosenMacro.actions[chosenMacro.actions.length-1].time);
    }

    startLoopingChosenMacro() {
        const chosenMacro = this.state.macroList[this.state.chosenMacroIndex];
        if (chosenMacro == null || chosenMacro.actions.length == 0) {
            return;
        }
        this.setState({isLooping: true});
        this.loop(chosenMacro);
    }

    stopLoopingChosenMacro() {
        this.setState({isLooping: false, loopTimes: 0});
    }

    setChosenMacro(macroIndex) {
        this.setState({chosenMacroIndex: macroIndex});
    }

    renameChosenMacro() {
        this.setState(prevState => {
            prevState.macroList[prevState.chosenMacroIndex].name = prompt('输入新的名称');
            return {macroList: prevState.macroList};
        });
    }

    deleteChosenMacro() {
        this.setState(prevState => {
            prevState.macroList.splice(prevState.chosenMacroIndex, 1);
            return {macroList: prevState.macroList, chosenMacroIndex: 0};
        });
    }

    saveMacroList() {
        const ml = JSON.stringify(this.state.macroList);
        window.localStorage.setItem('macroList', ml);
    }

    loadMacroList() {
        const ml = window.localStorage.getItem('macroList');
        if (ml != undefined) {
            this.setState({macroList: JSON.parse(ml)});
        }
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({
          [target.name]: target.type === 'checkbox' ? target.checked : target.value
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
                <label>
                    次数：
                    <input 
                        name='loopTimes' 
                        type='number'
                        value={this.state.loopTimes}
                        onChange={this.handleInputChange.bind(this)} 
                        onClick={() => this.setState({loopTimes: parseInt(prompt('次数：')) || 0})}/>
                </label>
                <button onClick={this.renameChosenMacro.bind(this)} disabled={this.state.isRecording || this.state.isReplaying || this.state.isLooping}>重命名</button>
                <button onClick={this.deleteChosenMacro.bind(this)} disabled={this.state.isRecording || this.state.isReplaying || this.state.isLooping}>删除</button>
                <button onClick={this.saveMacroList.bind(this)} disabled={this.state.isRecording || this.state.isReplaying || this.state.isLooping}>保存</button>
                <button onClick={this.loadMacroList.bind(this)} disabled={this.state.isRecording || this.state.isReplaying || this.state.isLooping}>读取</button>
                <ul>
                {
                    this.state.macroList.map((macro, index, array) => {
                        return <li key={index} onClick={() => this.setChosenMacro(index)} style={{color: this.state.chosenMacroIndex == index? 'red' : 'white'}} >
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
