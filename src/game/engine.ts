import { Application, ICanvas, Container } from 'pixijs';

type PropsEngine = {
    width?: number;
    height?: number;
    background?: string;
    resizeTo?: Window | HTMLElement;
};

interface IEngine {
    init: boolean;
}

export class Engine implements IEngine {
    cnv: Application<ICanvas>;
    init = false;

    #setInit = (val: boolean) => this.init = val;
    #addToStage = (item: any) => {
        this.cnv.stage.addChild(item);
    }
    
    


    constructor({ width, height, background, resizeTo }: PropsEngine) {        
        this.cnv = new Application({ width, height, background, resizeTo });
        document.body.appendChild(this.cnv.view as any);
        this.#setInit(true);
    }
}