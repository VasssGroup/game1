import { Container, Ticker, IRenderer, ICanvas, Texture } from 'pixijs';

export type AssetsList = string[][];

export type TexturesList = Record<string, Texture>;

export type PropsEngine = {
    width?: number;
    height?: number;
    background?: string;
    hasResize?: boolean;
    resizeTo?: Window | HTMLElement;
    assetsList?: AssetsList;
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
    initialize: (hasResize?: boolean) => Promise<void>;
    clearCanvas?: (background: number) => void;
};

export type StarsLayer = {
    x: number;
    y: number;
    color: number;
}[];

export type StarsLayers = StarsLayer[];

export { Container, Ticker, Texture };
export type { IRenderer, ICanvas };