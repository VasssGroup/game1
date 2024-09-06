import * as pixi from 'pixijs';

export class Engine {
    init = false;
    #setInit = (val) => this.init = val;
    #initEngine = ({ background }) => {
        this.cnv = new pixi.Application({ width: window.innerWidth, height: window.innerHeight, background });
        document.body.appendChild(this.cnv.view);
        window.onresize = () => this.cnv.renderer.resize(window.innerWidth, window.innerHeight); 
        this.#setInit(true);
    }

    getCanvas = () => this.cnv;

    #renderSatge = () => {
        //
    }

    #addToStage = (item) => {
        this.cnv.stage.addChild(item);
    }

    constructor(props) {
        this.#initEngine(props);
    }
}