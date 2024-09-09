import { Engine } from './engine';
import { orientations } from './engines.const';

export class Game {
    #colors = [ 0xFFFFFF, 0xFFDDDD, 0xDDFFDD, 0xFFFFDD ];
    #starLimit = 100;
    #starLayers = 5;
    #layerSpeed = [ 5, 4, 3, 2, 1 ];
    #layerAlpha = [ 1, 0.8, 0.6, 0.5, 0.4 ];
    #background = '#000';
    #playerStepMoving = 5;
    #playerMoveX = 0;
    #playerMoveY = 0;
    #assetsList = [
        ['spaceShip', './spacecraft.svg']        
    ]

    #randomInt = (int) => Math.floor(Math.random() * int);

    #genStar = () => ({
        x: this.#randomInt(window.innerWidth-1),
        y: this.#randomInt(window.innerHeight-1),
        color: this.#colors[this.#randomInt(this.#colors.length)]
    })

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

    #tickerStars = (starsStage) => () => {
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
    }

    #keyDown = (event) => {     
        switch (event?.keyCode) {            
            case 37: this.#playerMoveX = 1; break; //Left
            case 38: this.#playerMoveY = 1; break; //Up
            case 39: this.#playerMoveX = 2; break; //Right
            case 40: this.#playerMoveY = 2; break; //Down
            default: break;
        }  
        //console.log('keyDown ::', { event });
    }

    #keyUp = (event) => {
        switch (event?.keyCode) {            
            case 37: this.#playerMoveX = 0; break; //Left
            case 38: this.#playerMoveY = 0; break; //Up
            case 39: this.#playerMoveX = 0; break; //Right
            case 40: this.#playerMoveY = 0; break; //Down
            default: break;
        } 
        //console.log('keyUp ::', { event });
    }

    #addEventListeners = () => {
        window.addEventListener('keydown', this.#keyDown);
        window.addEventListener('keyup', this.#keyUp);
    }

    #tickerPlayer = (playerShip) => () => {
        let newX = playerShip.x;
        let newY = playerShip.y;
        switch (this.#playerMoveX) {
            case 1:
                if (newX > (playerShip.width + this.#playerStepMoving)) newX = newX - this.#playerStepMoving;
                break;
            case 2:
                if (newX < window.innerWidth - this.#playerStepMoving) newX = newX + this.#playerStepMoving;
                break;
            case 0:
            default:
                break;                                                        
        }
        switch (this.#playerMoveY) {
            case 1:
                if (newY > this.#playerStepMoving) newY = newY - this.#playerStepMoving;
                break;
            case 2:
                if (newY < window.innerHeight - playerShip.height - this.#playerStepMoving) newY = newY + this.#playerStepMoving;
                break;
            case 0:
            default:
                break;                                                        
        }            
        if (newX !== playerShip.x || newY !== playerShip.y) {
            playerShip.position.set(newX, newY);
        }
    }

    goStars() {
        const starsLayers = this.#createStarLayers();
        const starsStage = this.e.createStarsStage(starsLayers, this.#layerAlpha);
        this.e.addToStage(starsStage);
        //console.log('starsStage ::', { starsStage, children: starsStage.children, engine: this.e });

        this.e.addTicker(this.#tickerStars(starsStage));        
    }

    goPlayer = async () => {
        this.#addEventListeners();        
        let playerShip = await this.e.createSpaceShip(orientations.right);
        playerShip.position.set(120, Math.floor(window.innerHeight / 2));
        this.e.addToStage(playerShip);

        this.e.addTicker(this.#tickerPlayer(playerShip));
    }

    #waitEngineInit = async () => {
        while (!this.e.init) {
            await (new Promise(resolve => setTimeout(resolve, 50)));
            //console.log('Engine NOT INITIALISATION !!');
        }
    }

    #waitTexturesReady = async () => {
        while (!this.e.texturesRady) {
            await (new Promise(resolve => setTimeout(resolve, 50)));
            console.log('Textures NOT READY !!');
        }
    }

    start = async () => {
        await this.#waitEngineInit();
        console.log('Engine INITIALISATION...');
        //
        this.goStars();
        console.log('Stars complite...');
        //
        await this.#waitTexturesReady();        
        await this.goPlayer();
        console.log('Player complite...');
        //
    }

    constructor(props) {
        this.e = new Engine({
            width: window.innerWidth,
            height: window.innerHeight,
            background: this.#background,
            hasResize: true,
            assetsList: this.#assetsList
        });
    }
}