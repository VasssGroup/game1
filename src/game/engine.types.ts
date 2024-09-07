import { Container, Ticker, IRenderer, ICanvas } from 'pixijs';

export type PropsEngine = {
    width?: number;
    height?: number;
    background?: string;
    resizeTo?: Window | HTMLElement;
};

export type PropsStar = {
    x?: number;
    y?: number;
    color?: number;
    alpha?: number;
    size?: number;
}

export interface IEngine {
    init: boolean;
    stage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
}

export type StarsLayer = {
    x: number;
    y: number;
    color: number;
}[];

export type StarsLayers = StarsLayer[];