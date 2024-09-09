import { Graphics, autoDetectRenderer, TickerCallback, Assets, Sprite } from 'pixijs';
import { IEngine, PropsEngine, PropsStar, StarsLayers, StarsLayer, Container, Ticker, IRenderer, ICanvas, AssetsList, TexturesList } from './engine.types'; 
import { orientations, textureNames } from './engines.const';


export class Engine implements IEngine {
    stage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
    init: boolean;
    textures: TexturesList;
    texturesRady: boolean;

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

    createSpaceShip = (orientation: orientations, name: string = textureNames.spaceShip, x: number = 0, y: number = 0, size: number = 60) => {
        if (!this.texturesRady) return;     
        const spriteShip = new Sprite(this.textures[name]);
        spriteShip.x = x;
        spriteShip.y = y;
        spriteShip.width = size;
        spriteShip.height = size;
        spriteShip.angle = orientation === orientations.right ? 90 : -90;

        return spriteShip;
    }

    createShot = (textureName: string = textureNames.shotRed) => {
        if (!this.texturesRady) return;     
        const shot = new Sprite(this.textures[textureName]);
        shot.x = 0;
        shot.y = 0;
        shot.width = 40;
        shot.height = 20;

        return shot;
    }

    createPlayerStage = (spriteShip: Sprite) => {
        const playerStage = new Container();
        playerStage.position.set(0, 0);
        playerStage.width = this.renderer.view.width;
        playerStage.height = this.renderer.view.height;
        playerStage.addChild(spriteShip);

        return playerStage;
    }

    createShotsStage = (shots?: Sprite[]) => {
        const shotsStage = new Container();
        shotsStage.position.set(0, 0);
        shotsStage.width = this.renderer.view.width;
        shotsStage.height = this.renderer.view.height;
        shots?.forEach?.(shot => shotsStage.addChild(shot));
        
        return shotsStage;
    }

    createEnemyStage = (enemyShips?: Sprite[]) => {
        const enemyStage = new Container();
        enemyStage.position.set(0, 0);
        enemyStage.width = this.renderer.view.width;
        enemyStage.height = this.renderer.view.height;
        enemyShips?.forEach?.(enemyShip => enemyStage.addChild(enemyShip));

        return enemyStage;
    }

    addToStage = (item: Container | Graphics) => this.stage.addChild(item);
    addTicker = (ticker: TickerCallback<ICanvas>) => this.ticker.add(ticker);
    loadAssets = async (assets: AssetsList) => {
        await assets.forEach(async ([ name, url ]) => {
            Assets.add(name, url);
            this.textures[name] = await Assets.load(name);
        });
    }

    initialize = async (hasResize?: boolean) => {
        await document.body.appendChild(this.renderer.view as HTMLCanvasElement);
        if (hasResize) {
            document.body.onresize = () => this.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }

    constructor({ width, height, background, hasResize, assetsList }: PropsEngine) {   
        this.init = false;   
        this.texturesRady = false;
        this.textures = {};
        this.stage = new Container();
        this.ticker = Ticker.shared;
        this.renderer = autoDetectRenderer({ width, height, background });
        if (assetsList) {
            this.loadAssets(assetsList).then(() => {
                this.texturesRady = true;
            });
        }
        this.initialize(hasResize).then(() => {
            this.ticker.add(() => this.renderer.render(this.stage));
            this.init = true;
        });  
    }
}