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
    lives: number;
    fullHealth: number;
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
    points: number;
    reserveLives: number;
    health: number;
    gameOver: () => void;
    reloadLives: (Lives?: number) => void;
    startLive: () => void;
    damage: (damage: number) => void;
    upPoints: (points: number) => void;
    downPoints: (points: number) => void;
    keyUp: (event: KeyboardEvent) => void;
    keyDown: (event: KeyboardEvent) => void;
    addEventListeners: () => void;
    createSpaceShip: (orientation: orientations, name?: string, x?: number, y?: number, size?: number) => Sprite;
    toStage: () => void;
    createShot: (textureName: string) => Sprite;
    printInterface: () => void;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
}

export type EnemyConfig = {
    count: number;
    costPoint: number;
    costPointShot: number;
    costDamageShot: number;
    stepMoving: number;
    shotDelay: number;
}

type FireTimer = {
    index: number;
    timer: number;
}

export type EnemyTools = {
    config: EnemyConfig;
    fireTimers: FireTimer[];
    shotStage: Container;
    stage: Container;
    createEnemyShip: (x?: number, y?: number, size?: number) => Sprite;
    createEnemyShot: () => Sprite;
    respawnEnemies: () => void;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
};

type Configs = {
    stars: StarsConfig;
    player: PlayerConfig;
    enemies: EnemyConfig;
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
    renderStage: Container;
    stage: Container;
    dialogStage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
    textures: TexturesList;
    texturesRady: boolean;
    gameOver: boolean;
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