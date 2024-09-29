import { Container, Ticker, IRenderer, ICanvas, Texture, Graphics, GraphicsGeometry, TickerCallback, Sprite, ITextStyle, TextStyle, Text } from 'pixijs';

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
    interfaceHeight: number;
    points: number;
    reserveLives: number;
    health: number;
    wh: () => { width: number, height: number }
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
};

type DialogParams = {};

export type DialogTools = {
    stage: Container;
    show: (params: DialogParams) => void;
    hide: () => void;
    go: () => void;
};

export type EnemyConfig = {
    count: number;
    costPoint: number;
    costPointShot: number;
    costDamageShot: number;
    stepMoving: number;
    shotDelay: number;
};

type FireTimer = {
    index: number;
    timer: number;
};

export type EnemyTools = {
    config: EnemyConfig;
    fireTimers: FireTimer[];
    shotStage: Container;
    stage: Container;
    createEnemyShip: (x?: number, y?: number, size?: number, orientation?: orientations, name?: string) => Sprite;
    createEnemyShot: () => Sprite;
    respawnEnemies: () => void;
    toStage: () => void;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
};

export type CreateTools = {
    stage: () => Container;
    sprite: (texture?: Texture) => Sprite;
    graphics: (geometry?: GraphicsGeometry) => Graphics;
    text: (text?: string | number, style?: Partial<ITextStyle> | TextStyle, canvas?: ICanvas) => Text;
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

export type HelpersTools = {
    randomInt: (int: number) => number;
    intersectionR2R: (_r1: Rectangles, _r2: Rectangles) => boolean;
    getKeyCode: (e: KeyboardEvent) => number;
    wait: (ms?: number) => Promise<unknown>;
    pause: (pause?: boolean) => void;
    waitPause: () => Promise<void>;
    cWidth: () => number;
    cHeight: () => number;
};

export type ExplosionsTools = {
    stage: Container;
    createExplosion: () => void;
    ticker: TickerCallback<ICanvas>;
    go: () => void;
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
    pauseGame: boolean;
    helpers: HelpersTools;
    create: CreateTools;
    stars: StarsTools;
    dialog: DialogTools;
    player: PlayerTools;
    enemies: EnemyTools;
    explosions: ExplosionsTools;
    loadAssets: (assets?: AssetsList) => Promise<void>;
    initialize: (hasResize?: boolean) => Promise<void>;
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