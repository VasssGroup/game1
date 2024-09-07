import { Graphics, autoDetectRenderer, TickerCallback } from 'pixijs';
import { IEngine, PropsEngine, PropsStar, StarsLayers, StarsLayer, Container, Ticker, IRenderer, ICanvas } from './engine.types'; 

export class Engine implements IEngine {
    stage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
    init = false;

    clearCanvas(background = 0x000000) {
        const rectClear = new Graphics();
        rectClear.beginFill(background);
        rectClear.drawRect(0, 0, this.renderer.width, this.renderer.height);
        rectClear.endFill();
        
        this.stage.addChild(rectClear);
    }

    createStar = ({ x = 0, y = 0, color = 0x00ff00, alpha = 1, size = 1 }: PropsStar): Graphics => {
        const star = new Graphics();
        star.beginFill(color, alpha);
        star.drawRect(x, y, size, size);
        star.endFill();

        return star;
    }

    createStarsLayer = (layer: StarsLayer, alpha?: number) => {
        const starsLayer = new Container();
        starsLayer.position.set(0, 0);
        starsLayer.width = this.renderer.view.width;
        starsLayer.height = this.renderer.view.height;
        for (let i = 0; i < layer.length; i++) {
            const star = this.createStar({...layer[i], alpha });
            starsLayer.addChild(star);
        }

        return starsLayer;
    }

    createStarsStage = (starsLayers: StarsLayers, arAlpha?: number[]) => {
        const starsStage = new Container();
        starsStage.position.set(0, 0);
        starsStage.width = this.renderer.view.width;
        starsStage.height = this.renderer.view.height;
        for (let i = 0; i < starsLayers.length; i++) {
            const starsLayer = this.createStarsLayer(starsLayers[i], arAlpha?.[i]);
            starsStage.addChild(starsLayer);
            const starsLayerNext = this.createStarsLayer(starsLayers[i], arAlpha?.[i]);
            starsLayerNext.position.set(this.renderer.view.width - 1, 200);
            starsStage.addChild(starsLayerNext);
        }

        return starsStage;
    }

    addToStage = (item: Container | Graphics) => this.stage.addChild(item);
    addTicker = (ticker: TickerCallback<any>) => this.ticker.add(ticker);

    initialize = async (hasResize?: boolean) => {
        await document.body.appendChild(this.renderer.view as any);
        if (hasResize) {
            document.body.onresize = () => this.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }

    constructor({ width, height, background, hasResize }: PropsEngine) {        
        this.stage = new Container();
        this.ticker = Ticker.shared;
        this.renderer = autoDetectRenderer({ width, height, background });
        this.initialize(hasResize).then(() => {
            this.ticker.add(() => this.renderer.render(this.stage));
            this.init = true;
        });  
    }
}