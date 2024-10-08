import { Engine, textureNames } from './engine';

export class Game {
    #configs = {
        stars: {
            colors: [ 0xFFFFFF, 0xFFDDDD, 0xDDDDFF, 0xFFFFDD ],
            limit: 200,
            layers: 5,
            layerSpeed: [ 5, 4, 3, 2, 1 ],
            layerAlpha: [ 1, 0.8, 0.6, 0.5, 0.4 ],
            background: 0x000000
        },
        player: {
            stepMoving: 5,
            lives: 1,
            fullHealth: 100,            
            moveX: 0,
            moveY: 0,
            fire: 0,
            altFire: 0,            
            shot: {
                speed: 20,
                delay: 100,
                lastShotTime: 0
            }
        },
        enemies: {
            count: 3,
            costPoint: 5,
            costPointShot: 1,
            costDamageShot: 5,
            stepMoving: 3,
            shotDelay: 1200        
        }
    }
    #background =  0x000000;
    #assetsList = [
        [ textureNames.spaceShip, './textures/spacecraft.svg'],
        [ textureNames.spaceAirCraft, './textures/spaceaircraft.svg'],
        [ textureNames.shotRed, './textures/blasterRed.png'],
        [ textureNames.shotOrange, './textures/blasterOrange.png'],
        [ textureNames.shotYellow, './textures/blasterYellow.png']
    ];

    #waitEngineInit = async () => {
        while (!this.e.init) {
            await this.e.helpers.wait();
            //console.log('Engine NOT INITIALISATION !!');
        }
    }

    #waitTexturesReady = async () => {
        while (!this.e.texturesRady) {
            await this.e.helpers.wait();
            //console.log('Textures NOT READY !!');
        }
    }

    start = async () => {
        await this.#waitEngineInit();
        console.log('Engine INITIALISATION...');
        //
        this.e.stars.go();
        console.log('Stars complite...');
        //
        await this.#waitTexturesReady();
        this.e.player.go();
        console.log('Player complite...');
        //
        this.e.enemies.go();
        console.log('Enemies complite...');
        //
        this.e.explosions.go();
        console.log('Explosions complite...');
        //
        this.e.dialog.go();
        console.log('Explosions complite...');        
    }

    constructor(props) {
        this.e = new Engine({
            width: window.innerWidth,
            height: window.innerHeight,
            background: props?.background || this.#background,
            hasResize: true,
            assetsList: props?.assetsList || this.#assetsList,
            cfgs: props?.configs || this.#configs
        });
    }
}