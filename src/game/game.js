import * as pixi from 'pixijs';

export class Game {
    #colors = [ 0xFFFFFF, 0xFFDDDD, 0xDDFFDD, 0xFFFFDD ];
    #starLimit = 100;
    #starLayers = 3;
    #background = '#000';
    init = false;

    #setInit = (init) => this.init = init;
    #initCanvas = async () => {
        this.cnv = new pixi.Application({ width: window.innerWidth, height: window.innerHeight, background: this.#background });
        document.body.appendChild(this.cnv.view);
        window.onresize = () => this.cnv.renderer.resize(window.innerWidth, window.innerHeight); 
        this.#setInit(true);       
    }

    #randomInt = (int) => Math.floor(Math.random() * int);

    #genStar = () => {
        const star = {
            x: this.#randomInt(window.innerWidth-1),
            y: this.#randomInt(window.innerHeight-1),
            color: this.#colors[this.#randomInt(this.#colors.length)]
        };

        return star;
    }

    #genLayerStars = () => {
        const layer = [];
        for (let i = 0; i < this.#starLimit; i++) {
            layer.push(this.#genStar());
        }

        return layer;
    }

    #createStarLayers = (maxLayers = this.#starLayers) => {
        const stars = [];
        for (let i = 0; i < maxLayers; i++) {
            stars.push(this.#genLayerStars());
        }

        return stars;
    }

    #drawStar = (star) => {
        if (!this.init) return;

        const graphics = new pixi.Graphics();
        graphics.beginFill(star.color);
        graphics.drawRect(star.x, star.y, 1, 1);

        this.cnv.stage.addChild(graphics);
    }
    #clearStage = () => {
        this.cnv.stage.destroy(true);
        this.cnv.stage = null;
    }

    #viewStars = (layer) => {
        for (let i = 0; i < layer.length; i++) {
            // this.cnv
            // добавить пиксель
            this.#drawStar(layer[i]);
        }
    }

    #viewLayers = (starLayers) => {
        this.#clearStage();
        for (let i = 0; i < starLayers.length; i++) {
            this.#viewStars(starLayers[i]);

        }
    }

    goStars() {
        const starLayers = this.#createStarLayers();        
        this.#viewLayers(starLayers);

    }

    start() {
        if (this.init) {
            console.log('START GAME !!');
            this.goStars();
        } else {
            console.log('GAME NOT INITIALISATION');
        }
    }

    constructor(props) {
        this.#initCanvas();
    }
}