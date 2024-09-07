import * as pixi from 'pixijs';
import { IEngine, PropsEngine, PropsStar, StarsLayers, StarsLayer } from './engine.types'; 

export class Engine implements IEngine {
    //cnv: pixi.Application<pixi.ICanvas>;
    stage: pixi.Container;
    ticker: pixi.Ticker;
    renderer: pixi.IRenderer<pixi.ICanvas>;
    init = false;

    clearCanvas(background = 0x000000) {
        const rectClear = new pixi.Graphics();
        rectClear.beginFill(background);
        rectClear.drawRect(0, 0, this.renderer.width, this.renderer.height);
        rectClear.endFill();
        
        this.stage.addChild(rectClear);
    }

    createStar = ({ x = 0, y = 0, color = 0xffffff, alpha = 1, size = 1 }: PropsStar): pixi.Graphics => {
        const star = new pixi.Graphics();
        star.beginFill(color, alpha);
        star.drawRect(x, y, size, size);
        star.endFill();

        return star;
    }

    createStarsLayer = (layer: StarsLayer) => {
        const starsLayer = new pixi.Container();
        starsLayer.position.set(0, 0);
        starsLayer.width = this.renderer.view.width;
        starsLayer.height = this.renderer.view.height;
        for (let i = 0; i < layer.length; i++) {
            const star = this.createStar(layer[i]);
            starsLayer.addChild(star);
        }

        return starsLayer;
    }

    createStarsStage = (starsLayers: StarsLayers) => {
        const starsStage = new pixi.Container();
        starsStage.position.set(0, 0);
        starsStage.width = this.renderer.view.width;
        starsStage.height = this.renderer.view.height;
        for (let i = 0; i < starsLayers.length; i++) {
            const starsLayer = this.createStarsLayer(starsLayers[i]);
            starsStage.addChild(starsLayer);
            const starsLayerNext = this.createStarsLayer(starsLayers[i]);
            starsLayerNext.position.set(this.renderer.view.width - 1, 200);
            starsStage.addChild(starsLayerNext);
        }

        return starsStage;
    }

    addToStage = (item: pixi.Container | pixi.Graphics) => this.stage.addChild(item);
    addTicker = (ticker: pixi.TickerCallback<any>) => this.ticker.add(ticker);


    constructor({ width, height, background, resizeTo }: PropsEngine) {        
        /*this.cnv = new pixi.Application({ width, height, background, resizeTo });
        document.body.appendChild(this.cnv.view as any);*/

        this.stage = new pixi.Container();
        this.ticker = pixi.Ticker.shared;
        this.renderer = pixi.autoDetectRenderer({ width, height, background });
        document.body.appendChild(this.renderer.view as any);        
        this.ticker.add(() => {
            //console.log('Render Stage ♦');
            this.renderer.render(this.stage);
        });

        this.init = true;
    }
}