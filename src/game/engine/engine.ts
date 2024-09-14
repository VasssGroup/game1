import { autoDetectRenderer, Assets } from 'pixijs';
import { 
    IEngine, PropsEngine, PropsStar, StarsLayers, StarsLayer, TickerCallback,
    Container, Ticker, IRenderer, ICanvas, AssetsList, orientations, Sprite,
    TexturesList, StarsTools, PlayerTools, EnemyTools, Graphics, Rectangles 
} from './engine.types'; 
import { textureNames } from './engines.const';


export class Engine implements IEngine {
    stage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
    init: boolean;
    textures: TexturesList;
    texturesRady: boolean;

    stars: StarsTools = {        
        config: {
            colors: [ 0xFFFFFF, 0xFFDDDD, 0xDDDDFF, 0xFFFFDD ],
            limit: 100,
            layers: 3,
            layerSpeed: [ 5, 3, 1 ],
            layerAlpha: [ 1, 0.8, 0.5],
            background: 0x000000
        },
        stage: new Container(),        
        genStar: () => ({
            x: this.randomInt(this.renderer.view.width-1), 
            y: this.randomInt(this.renderer.view.height-1), 
            color: this.stars.config.colors[this.randomInt(this.stars.config.colors.length - 1)]
        }),
        genLayerStars: () => {
            const layer = [];
            for (let i = 0; i < this.stars.config.limit; i++) {
                layer.push(this.stars.genStar());
            }
    
            return layer;
        },
        genStarLayers: (maxLayers = this.stars.config.layers) => {
            const starsLayers = [];
            for (let i = 0; i < maxLayers; i++) {
                starsLayers.push(this.stars.genLayerStars());
            }
    
            return starsLayers;
        },
        createStar: ({ x = 0, y = 0, color = 0x00ff00, alpha = 1, size = 1 }: PropsStar) => {
            const star = new Graphics();
            star.beginFill(color, alpha);
            star.drawRect(x, y, size, size);
            star.endFill();
    
            return star;
        },
        createStarsLayer: (layer: StarsLayer, alpha?: number) => {
            const starsLayer = new Container();
            starsLayer.position.set(0, 0);
            starsLayer.width = this.renderer.view.width;
            starsLayer.height = this.renderer.view.height;
            for (let i = 0; i < layer.length; i++) {
                const star = this.stars.createStar({...layer[i], alpha });
                starsLayer.addChild(star);
            }
    
            return starsLayer;
        },
        createStarsStage: (starsLayers: StarsLayers, arAlpha?: number[]) => {             
            for (let i = 0; i < starsLayers.length; i++) {
                const starsLayer = this.stars.createStarsLayer(starsLayers[i], arAlpha?.[i]);
                this.stars.stage.addChild(starsLayer);
                const starsLayerNext = this.stars.createStarsLayer(starsLayers[i], arAlpha?.[i]);
                starsLayerNext.position.set(this.renderer.view.width - 1, 200);
                this.stars.stage.addChild(starsLayerNext);
            }
        },
        ticker: () => {            
            for (let i = 0; i < this.stars.config.layers * 2; i = i+2) {
                const layer = this.stars.stage.children[i];
                const layerNext = this.stars.stage.children[i+1];
                if ((layer.x + this.renderer.view.width) <= 0) {
                    layer.position.set(this.renderer.view.width, 0);
                }
                if ((layerNext.x + this.renderer.view.width) <= 0) {
                    layerNext.position.set(this.renderer.view.width, 0);
                }
                const speed = this.stars.config.layerSpeed[Math.floor(i / 2)];
                layer.position.set(layer.x - speed, 0);
                layerNext.position.set(layerNext.x - speed, 0);
            }
            //this.addToStage(this.stars.stage);
        },
        go: () => {
            this.stars.createStarsStage(this.stars.genStarLayers(), this.stars.config.layerAlpha);

            this.addToStage(this.stars.stage);
            this.addTicker(this.stars.ticker);        
        }
    };

    player: PlayerTools = {
        config: {
            stepMoving: 5,
            moveX: 0,
            moveY: 0,
            fire: 0,
            altFire: 0,
            shot: {
                speed: 20,
                delay: 300,
                lastShotTime: 0
            }
        },
        shotStage: new Container(),
        stage: new Container(),
        interfaceStage: new Container(),
        keyUp: (e) => {
            //console.log('keyUp [e]:', { e });
            switch (this.getKeyCode(e)) {            
                case 37: this.player.config.moveX = 0; break; //Left
                case 38: this.player.config.moveY = 0; break; //Up
                case 39: this.player.config.moveX = 0; break; //Right
                case 40: this.player.config.moveY = 0; break; //Down
                case 87: this.player.config.fire = 0; break //w
                default: break;
            }
        },
        keyDown: (e) => {
            //console.log('keyDown [e]:', { e });
            switch (this.getKeyCode(e)) {            
                case 37: this.player.config.moveX = 1; break; //Left
                case 38: this.player.config.moveY = 1; break; //Up
                case 39: this.player.config.moveX = 2; break; //Right
                case 40: this.player.config.moveY = 2; break; //Down
                case 87: this.player.config.fire = 1; break //w
                default: break;
            } 
        },
        addEventListeners: () => {
            window.addEventListener('keydown', this.player.keyDown);
            window.addEventListener('keyup', this.player.keyUp);
        },
        createSpaceShip: (orientation, name = textureNames.spaceShip, x = 0, y = 0, size = 60) => {
            const spriteShip = new Sprite(this.textures[name]);
            spriteShip.x = x;
            spriteShip.y = y;
            spriteShip.width = size;
            spriteShip.height = size;
            spriteShip.angle = orientation === orientations.right ? 90 : -90;

            return spriteShip;
        },
        toStage: () => {
            this.player.stage.position.set(0, 0);
            this.player.stage.width = this.renderer.view.width;
            this.player.stage.height = this.renderer.view.height;
            const playerShip = this.player.createSpaceShip(orientations.right, textureNames.spaceShip);
            playerShip.position.set(120, Math.floor(this.renderer.view.height / 2));
            
            this.player.stage.addChild(playerShip); 
            this.player.shotStage.position.set(0, 0); 
            this.player.shotStage.width = this.renderer.view.width;
            this.player.shotStage.height = this.renderer.view.height;  
            this.player.interfaceStage.position.set(0, 0); 
            this.player.interfaceStage.width = this.renderer.view.width;
            this.player.interfaceStage.height = this.renderer.view.height;            
        },
        createShot: (textureName = textureNames.shotRed) => {
            const shot = new Sprite(this.textures[textureName]);
            shot.x = 0;
            shot.y = 0;
            shot.width = 40;
            shot.height = 20;

            return shot;
        },
        ticker: () => {
            const [ playerShip ] =  this.player.stage.children as Sprite[];
            let newX = playerShip.x;
            let newY = playerShip.y;
            switch (this.player.config.moveX) {
                case 1:
                    if (newX > (playerShip.width + this.player.config.stepMoving)) newX = newX - this.player.config.stepMoving;
                    break;
                case 2:
                    if (newX < this.renderer.view.width - this.player.config.stepMoving) newX = newX + this.player.config.stepMoving;
                    break;
                case 0:
                default:
                    break;                                                        
            }
            switch (this.player.config.moveY) {
                case 1:
                    if (newY > this.player.config.stepMoving) newY = newY - this.player.config.stepMoving;
                    break;
                case 2:
                    if (newY < this.renderer.view.height - playerShip.height - this.player.config.stepMoving) newY = newY + this.player.config.stepMoving;
                    break;
                case 0:
                default:
                    break;                                                        
            }
            if (newX !== playerShip.x || newY !== playerShip.y) {
                playerShip.position.set(newX, newY);
            }
            const delShots: Sprite[] = [];
            const delEnemys: Sprite[] = [];
            (this.player.shotStage.children as Sprite[]).forEach((shot) => {
                if (shot.x < window.innerWidth + shot.width) {
                    shot.position.set(shot.x + this.player.config.shot.speed, shot.y);
                    (this.enemys.stage.children as Sprite[])?.forEach?.( enemyShip => {
                        if (this.intersectionR2R(shot, {
                            x: enemyShip.x,
                            y: enemyShip.y - enemyShip.height,
                            width: enemyShip.width,
                            height: enemyShip.height
                        })) {
                            //Поподание во врага
                            //уничтожить врага, на место eshipPos поместить взрыв 1000 мс
                            delEnemys.push(enemyShip);
                            delShots.push(shot);
                        }
                    });
                    /*const shotPos = {
                        top: shot.y,
                        bottom: shot.y + shot.height,
                        left: shot.x,
                        right: shot.x + shot.width
                    };
    
                    const [ enemyShipsState, enemyShotsState ] = this.#getEnemysStage().children;
                    const enemyList = [ ...enemyShipsState.children ];
                    const enemyShotList = [ ...enemyShotsState.children ];
                    enemyList?.forEach?.( enemyShip => {
                        const eshipPos = {
                            top: enemyShip.y,
                            bottom: enemyShip.y + enemyShip.height,
                            left: enemyShip.x,
                            right: enemyShip.x + enemyShip.width,
                            width: enemyShip.width,
                            height: enemyShip.height
                        }
                        if (
                            (
                                (shotPos.top < eshipPos.bottom && shotPos.top > eshipPos.top) || 
                                (shotPos.bottom > eshipPos.top && shotPos.bottom < eshipPos.bottom)
                            ) &&
                            (
                                (shotPos.right > eshipPos.left && shotPos.right < eshipPos.right) ||
                                (shotPos.left < eshipPos.right && shotPos.left > eshipPos.left)
                            )
                        ) {
                            //Поподание во врага
                            //уничтожить врага, на место eshipPos поместить взрыв 1000 мс
                            //       !!!!!!!!!!!!!!!!!
                            // -=◄ добавить тикер для врагов ►=-
                            //        !!!!!!!!!!!!!!
                        }
                    });
                    enemyShotList?.forEach?.( enemyShot => {
                        const eShotPos = {
                            top: enemyShot.y,
                            bottom: enemyShot.y + enemyShot.height,
                            left: enemyShot.x,
                            right: enemyShot.x + enemyShot.width,
                            width: enemyShot.width,
                            height: enemyShot.height
                        }
                        if (
                            (
                                (shotPos.top < eShotPos.bottom && shotPos.top > eShotPos.top) || 
                                (shotPos.bottom > eShotPos.top && shotPos.bottom < eShotPos.bottom)
                            ) &&
                            (
                                (shotPos.right > eShotPos.left && shotPos.right < eShotPos.right) ||
                                (shotPos.left < eShotPos.right && shotPos.left > eShotPos.left)
                            )
                        ) {
                            //Поподание по снаряду врага
                            //уничтожить снаряд врага, а так же свой снаряд
                        }
                    });                
                    //console.log('getEnemysStage [children]:', { enemyShipsState, enemyShotsState });
                    */
    
                } else {
                    delShots.push(shot);
                }
            });
            delShots.forEach(shot => this.player.shotStage.removeChild(shot));
            delEnemys.forEach(enemy => this.enemys.stage.removeChild(enemy));
            const time = (new Date()).getTime();
            if (this.player.config.fire === 1 && this.player.config.shot.delay <= time - this.player.config.shot.lastShotTime) {
                this.player.config.shot.lastShotTime = time;
                const shotRed = this.player.createShot(textureNames.shotRed);
                shotRed.position.set(playerShip.x + 10, playerShip.y + Math.floor(playerShip.height / 2) - Math.floor(shotRed.height / 2));
                this.player.shotStage.addChild(shotRed);            
            }
            this.addToStage(this.player.shotStage);
            this.addToStage(this.player.stage);
        },
        go: () => {
            this.player.addEventListeners();
            this.player.toStage();

            this.addToStage(this.player.shotStage);
            this.addToStage(this.player.stage);
            this.addToStage(this.player.interfaceStage);
            this.addTicker(this.player.ticker);
        }
    };

    enemys: EnemyTools = {
        config: {
            count: 5,
            stepMoving: 5
        },
        stage: new Container(),
        shotStage:new Container(),
        createEnemyShip: (x, y, size) => this.player.createSpaceShip(orientations.left, textureNames.spaceAirCraft, x, y, size),
        respawnEnemys: () => {
            const newEnemyCount = this.enemys.config.count - this.enemys.stage.children.length;
            if (newEnemyCount <= 0) return;            
            for (let i = 0; i < newEnemyCount; i++) {
                const enemyShip = this.enemys.createEnemyShip();
                const newX = this.renderer.view.width - enemyShip.width;
                let newY = this.randomInt(this.renderer.view.height - enemyShip.height);
                while ((this.enemys.stage.children as Sprite[]).find(ship => this.intersectionR2R({
                        x: ship.x,
                        y: ship.y - ship.height,
                        width: ship.width,
                        height: ship.height
                    }, {
                        x: newX,
                        y: newY,
                        width: enemyShip.width,
                        height: enemyShip.height
                    }))) {
                    newY = this.randomInt(this.renderer.view.height);
                }
                enemyShip.position.set(newX, newY + enemyShip.height);
                this.enemys.stage.addChild(enemyShip);
            }
        },
        ticker: () => {
            const PlayerShip = this.player.stage.children[0] as Sprite;
            const PlayerCenterY = PlayerShip.y + Math.floor(PlayerShip.height / 2);
            const delEnemys: Sprite[] = [];
            (this.enemys.stage.children as Sprite[]).forEach((enemy, i) => {
                if (enemy.x <= 0) {
                    delEnemys.push(enemy);
                } else {
                    const shipTop = enemy.y - enemy.height;                                
                    let newY = enemy.y;
                    let newX = enemy.x - this.enemys.config.stepMoving;
                    if (i % 3 === 0) {
                        newY = shipTop > PlayerCenterY 
                        ? enemy.y - this.enemys.config.stepMoving 
                        : enemy.y < PlayerCenterY 
                            ? enemy.y + this.enemys.config.stepMoving 
                            : enemy.y;
                        newX = newX + Math.floor(this.enemys.config.stepMoving / 2);
                    }

                    //let newX = newY === enemy.y ? enemy.x - this.enemys.config.stepMoving : enemy.x;                    

                    enemy.position.set(newX, newY);
                }
            });
            delEnemys.forEach(enemy => this.enemys.stage.removeChild(enemy));
            //
            this.enemys.respawnEnemys();
            //
        },
        go: () => {
            this.enemys.respawnEnemys();

            this.addToStage(this.enemys.shotStage);
            this.addToStage(this.enemys.stage);
            this.addTicker(this.enemys.ticker);
        }
    };

    randomInt = (int: number) => Math.floor(Math.random() * int);
    intersectionR2R = (_r1: Rectangles, _r2: Rectangles) => {
        const r1 = {
            left: _r1.x,
            top: _r1.y,
            right: _r1.x + _r1.width,
            bottom: _r1.y + _r1.height
        };
        const r2 = {
            left: _r2.x,
            top: _r2.y,
            right: _r2.x + _r2.width,
            bottom: _r2.y + _r2.height
        };

        if (
            (
                (r1.top <= r2.bottom && r1.top >= r2.top) || 
                (r1.bottom >= r2.top && r1.bottom <= r2.bottom)
            ) &&
            (
                (r1.right >= r2.left && r1.right <= r2.right) ||
                (r1.left <= r2.right && r1.left >= r2.left)
            )
        ) {
            return true;
        }

        return false;
    }

    getKeyCode = (e: KeyboardEvent) => {
        let key = 0;
        switch (e.key) {
            case "ArrowLeft": key = 37; break;
            case "ArrowUp": key = 38; break;
            case "ArrowRight": key = 39; break;
            case "ArrowDown": key = 40; break;
            case "w":
            case "W": key = 87; break;
            default: break;
        }

        return key;
    }

    clearCanvas(background = 0x000000) {
        const rectClear = new Graphics();
        rectClear.beginFill(background);
        rectClear.drawRect(0, 0, this.renderer.width, this.renderer.height);
        rectClear.endFill();
        
        this.stage.addChild(rectClear);
    }

    createShotsStage = (shots?: Sprite[]) => {
        const shotsStage = new Container();
        shotsStage.position.set(0, 0);
        shotsStage.width = this.renderer.view.width;
        shotsStage.height = this.renderer.view.height;
        shots?.forEach?.(shot => shotsStage.addChild(shot));
        
        return shotsStage;
    }

    createEnemyStage = (enemyShips?: Sprite[]) => {
        const enemyStage = new Container();
        const shipsState = new Container();
        const shotsState = this.createShotsStage();

        shipsState.position.set(0, 0);
        shipsState.width = this.renderer.view.width;
        shipsState.height = this.renderer.view.height;

        shotsState.position.set(0, 0);
        shotsState.width = this.renderer.view.width;
        shotsState.height = this.renderer.view.height;        

        enemyStage.position.set(0, 0);
        enemyStage.width = this.renderer.view.width;
        enemyStage.height = this.renderer.view.height;
         
        enemyShips?.forEach?.(enemyShip => shipsState.addChild(enemyShip));

        enemyStage.addChild(shipsState);
        enemyStage.addChild(shotsState);

        return enemyStage;
    }

    addToStage = (item: Container | Graphics) => this.stage.addChild(item);
    addTicker = (ticker: TickerCallback<ICanvas>) => this.ticker.add(ticker);
    loadAssets = async (assets: AssetsList) => {
        await assets.forEach(async ([ name, url ]) => {
            Assets.add(name, url);
            this.textures[name] = await Assets.load(name);
        });
    }

    initialize = async (hasResize?: boolean) => {
        await document.body.appendChild(this.renderer.view as HTMLCanvasElement);
        if (hasResize) {
            document.body.onresize = () => this.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }

    constructor({ width, height, background, hasResize, assetsList, cfgs }: PropsEngine) { 
        this.stars.config = cfgs.stars;
        this.player.config = cfgs.player;  
        this.enemys.config = cfgs.enemys;  
        this.init = false;   
        this.texturesRady = false;
        this.textures = {};
        this.stage = new Container();
        this.ticker = Ticker.shared;
        this.renderer = autoDetectRenderer({ width, height, background });
        if (assetsList) {
            this.loadAssets(assetsList).then(() => {
                this.texturesRady = true;
            });
        }
        this.initialize(hasResize).then(() => {
            this.ticker.add(() => this.renderer.render(this.stage));
            this.init = true;
        });  
    }
}