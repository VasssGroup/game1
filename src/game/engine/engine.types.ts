import { Container, Ticker, IRenderer, ICanvas, Texture, Graphics, DisplayObject, TickerCallback, Sprite } from 'pixijs';

export type AssetsList = string[][];

export type TexturesList = Record<string, Texture>;

export type StarsConfig = {
    colors: number[];
    limit: number;
    layers: number;
    layerSpeed: number[];
    layerAlpha: number[];
    background: number;
};

export type StarData = { x: number, y: number, color: number; };

export type StarsTools = {
    config: StarsConfig;
    stage: Container;
    genStar: () => StarData;
    genLayerStars: () => StarData[];
    genStarLayers: () => StarData[][];
    createStar: (props: PropsStar) => Graphics;
    createStarsLayer: (layer: StarsLayer, alpha?: number) => Container;
    createStarsStage: (starsLayers: StarsLayers, arAlpha?: number[]) => void;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
};

export type ShotConfig = {
    speed: number;
    delay: number;
    lastShotTime: number;
};

export type PlayerConfig = {
    stepMoving: number;
    moveX: number;
    moveY: number;
    fire: number;
    altFire: number;
    shot: ShotConfig;
};

export type PlayerTools = {
    config: PlayerConfig;
    shotStage: Container;
    stage: Container;
    interfaceStage: Container;
    keyUp: (event: KeyboardEvent) => void;
    keyDown: (event: KeyboardEvent) => void;
    addEventListeners: () => void;
    createSpaceShip: (orientation: orientations, name?: string, x?: number, y?: number, size?: number) => Sprite;
    toStage: () => void;
    createShot: (textureName: string) => Sprite;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
}

export type EnemyConfig = {
    count: number;
    stepMoving: number;
}

export type EnemyTools = {
    config: EnemyConfig;
    shotStage: Container;
    stage: Container;
    createEnemyShip: (x?: number, y?: number, size?: number) => Sprite;
    respawnEnemys: () => void;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
};

type Configs = {
    stars: StarsConfig;
    player: PlayerConfig;
    enemys: EnemyConfig;
};

export type PropsEngine = {
    width?: number;
    height?: number;
    background?: string;
    hasResize?: boolean;
    resizeTo?: Window | HTMLElement;
    assetsList?: AssetsList;
    cfgs: Configs;
};

export type PropsStar = {
    x?: number;
    y?: number;
    color?: number;
    alpha?: number;
    size?: number;
};

export interface IEngine {
    init: boolean;
    stage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
    textures: TexturesList;
    texturesRady: boolean;
    stars: StarsTools;
    player: PlayerTools;
    initialize: (hasResize?: boolean) => Promise<void>;
    randomInt: (int: number) => number;
    clearCanvas?: (background: number) => void;
};

export type StarsLayer = {
    x: number;
    y: number;
    color: number;
}[];

export type StarsLayers = StarsLayer[];

export enum orientations {
    left,
    right
};

export type Rectangles = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export { Container, Ticker, Texture, Graphics, Sprite };
export type { IRenderer, ICanvas, TickerCallback };