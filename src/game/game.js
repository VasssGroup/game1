import { Engine, orientations, textureNames } from './engine';

export class Game {
    #starColors = [ 0xFFFFFF, 0xFFDDDD, 0xDDDDFF, 0xFFFFDD ];
    #starLimit = 200;
    #starLayers = 5;
    #layerSpeed = [ 5, 4, 3, 2, 1 ];
    #layerAlpha = [ 1, 0.8, 0.6, 0.5, 0.4 ];
    #background = '#000';
    #playerStepMoving = 5;
    #playerMoveX = 0;
    #playerMoveY = 0;
    #playerFire = 0;
    #playerAltFire = 0;
    #assetsList = [
        [ textureNames.spaceShip, './textures/spacecraft.svg'],
        [ textureNames.spaceAirCraft, './textures/spaceaircraft.svg'],
        [ textureNames.shotRed, './textures/blasterRed.png'],
        [ textureNames.shotOrange, './textures/blasterOrange.png'],
        [ textureNames.shotYellow, './textures/blasterYellow.png']
    ];
    #shotSpeed = 20;
    #dellayFireTime = 300;
    fireTime = (new Date).getTime();
    #enemys = {
        count: 5        
    };
    

    #randomInt = (int) => Math.floor(Math.random() * int);

    #setEnemysStage = (enemysStage) => this.#enemys['enemysStage'] = enemysStage;
    #getEnemysStage = () => this.#enemys.enemysStage;

    #genStar = () => ({
        x: this.#randomInt(window.innerWidth-1),
        y: this.#randomInt(window.innerHeight-1),
        color: this.#starColors[this.#randomInt(this.#starColors.length)]
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
            case 87: this.#playerFire = 1; break //w
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
            case 87: this.#playerFire = 0; break //w
            default: break;
        } 
        //console.log('keyUp ::', { event });
    }

    #addEventListeners = () => {
        window.addEventListener('keydown', this.#keyDown);
        window.addEventListener('keyup', this.#keyUp);
    }

    #tickerPlayer = (playerStage, shotsStage) => () => {
        const [ playerShip ] =  playerStage.children;
        //console.log('playerStage:', { playerStage, playerShip });

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

        const delShots = [];

        shotsStage.children.forEach((shot) => {
            if (shot.x < window.innerWidth + shot.width) {
                shot.position.set(shot.x + this.#shotSpeed, shot.y);
            } else {
                delShots.push(shot);
            }
        });
        delShots.forEach(shot => shotsStage.removeChild(shot));

        const time = (new Date()).getTime();
        if (this.#playerFire === 1 && this.#dellayFireTime <= time - this.fireTime) {
            this.fireTime = time;
            const shotRed = this.e.createShot(textureNames.shotRed);
            shotRed.position.set(playerShip.x + 10, playerShip.y + Math.floor(playerShip.height / 2) - Math.floor(shotRed.height / 2));
            shotsStage.addChild(shotRed);            
        }
        this.e.addToStage(playerStage);
        this.e.addToStage(shotsStage);
    }

    goStars() {
        const starsLayers = this.#createStarLayers();
        const starsStage = this.e.createStarsStage(starsLayers, this.#layerAlpha);
        this.e.addToStage(starsStage);

        this.e.addTicker(this.#tickerStars(starsStage));        
    }

    goPlayer = () => {
        this.#addEventListeners();        
        const playerShip = this.e.createSpaceShip(orientations.right, textureNames.spaceShip);
        playerShip.position.set(120, Math.floor(window.innerHeight / 2));
        const playerStage = this.e.createPlayerStage(playerShip);
        const shotsStage = this.e.createShotsStage();

        this.e.addToStage(playerStage);
        this.e.addToStage(shotsStage);

        this.e.addTicker(this.#tickerPlayer(playerStage, shotsStage));
    }

    goEnemys = () => {
        const enemyShips = [];
        for (let i = 0; i < this.#enemys.count; i++) {
            const enemyShip = this.e.createSpaceShip(orientations.left, textureNames.spaceAirCraft);
            let newRandomY = this.#randomInt(Math.floor(window.innerHeight/enemyShip.height)) * enemyShip.height;
            while ( enemyShips.find((ship) => ship.y === newRandomY) ) {
                newRandomY = this.#randomInt(Math.floor(window.innerHeight/enemyShip.height)) * enemyShip.height;
            }
            enemyShip.position.set(window.innerWidth - enemyShip.width, newRandomY);
            enemyShips.push(enemyShip);
        }

        this.#setEnemysStage(this.e.createEnemyStage(enemyShips));
        this.e.addToStage(this.#getEnemysStage());

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
        this.goPlayer();
        console.log('Player complite...');
        //
        this.goEnemys();
        console.log('Enemys complite...');
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