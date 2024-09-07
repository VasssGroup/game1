//import { Container } from 'pixijs';
import { Engine } from './engine';

export class Game {
    #colors = [ 0xFFFFFF, 0xFFDDDD, 0xDDFFDD, 0xFFFFDD ];
    #starLimit = 100;
    #starLayers = 3;
    #layerSpeed = [ 2, 1, 0.5 ];
    #background = '#000';

    #randomInt = (int) => Math.floor(Math.random() * int);

    #genStar = () => {
        return  {
            x: this.#randomInt(window.innerWidth-1),
            y: this.#randomInt(window.innerHeight-1),
            color: this.#colors[this.#randomInt(this.#colors.length)]
        };       
        /*const star = {
            x: this.#randomInt(window.innerWidth-1),
            y: this.#randomInt(window.innerHeight-1),
            color: this.#colors[this.#randomInt(this.#colors.length)]
        };

        const gStar = this.e.createStar(star.x, star.y, star.color);
        const gStar2 = this.e.createStar(star.x, star.y, star.color);
        const gStar = new Graphics();
        gStar.beginFill(star.color);
        gStar.drawRect(star.x, star.y, 1, 1);
        
        const gStar2 = new Graphics();
        gStar2.beginFill(star.color);
        gStar2.drawRect(star.x + window.innerWidth, star.y, 1, 1);

        return { star, gStar, gStar2 };*/
    }

    #genLayerStars = () => {
        const layer = [];
        for (let i = 0; i < this.#starLimit; i++) {
            layer.push(this.#genStar());

        }

        return layer;
    }

    #createStarLayers = (maxLayers = this.#starLayers) => {
        const starsLayers = [];
        for (let i = 0; i < maxLayers; i++) {
            starsLayers.push(this.#genLayerStars());
        }

        return starsLayers;
    }

    goStars() {
        const starsLayers = this.#createStarLayers();
        const starsStage = this.e.createStarsStage(starsLayers);
        this.e.addToStage(starsStage);
        //console.log('starsStage ::', { starsStage, children: starsStage.children, engine: this.e });

        this.e.addTicker(() => { 
            for (let i = 0; i < this.#starLayers * 2; i = i+2) {
                const layer = starsStage.children[i];
                const layerNext = starsStage.children[i+1];
                if ((layer.x + window.innerWidth) <= 0) {
                    layer.position.set(window.innerWidth, 0);
                }
                if ((layerNext.x + window.innerWidth) <= 0) {
                    layerNext.position.set(window.innerWidth, 0);
                }
                const speed = this.#layerSpeed[Math.floor(i / 2)];
                layer.position.set(layer.x - speed, 0);
                layerNext.position.set(layerNext.x - speed, 0);
            }
        });        
    }

    start() {
        if (this.e.init) {
            console.log('START GAME !!');
            this.goStars();
        } else {
            console.log('GAME NOT INITIALISATION');
        }
    }

    constructor(props) {
        this.e = new Engine({
            width: window.innerWidth,
            height: window.innerHeight,
            background: this.#background,
            resizeTo: window
        });
    }
}