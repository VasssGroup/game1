import { autoDetectRenderer, Assets, Text } from 'pixijs';
import { 
    IEngine, PropsEngine, PropsStar, TickerCallback, HelpersTools, ExplosionsTools,
    Container, Ticker, IRenderer, ICanvas, AssetsList, orientations, Sprite, CreateTools,
    TexturesList, StarsTools, PlayerTools, EnemyTools, Graphics, DialogTools 
} from './engine.types'; 
import { textureNames } from './engines.const';


export class Engine implements IEngine {
    renderStage: Container;
    stage: Container;
    dialogStage: Container;
    ticker: Ticker;
    renderer: IRenderer<ICanvas>;
    init: boolean;
    textures: TexturesList;
    texturesRady: boolean;
    pauseGame: boolean;

    helpers: HelpersTools = {
        randomInt: (int) => Math.floor(Math.random() * int),
        intersectionR2R: (_r1, _r2) => {
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
        },
        getKeyCode: (e) => {
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
        },
        wait: (ms = 50) => new Promise(r => setTimeout(r, ms)),
        pause: (pause) => {
            if (pause === undefined) {
                this.pauseGame = !this.pauseGame;
            } else {
                this.pauseGame = !!pause;
            }
        },
        waitPause: async () => {
            while (this.pauseGame) { await this.helpers.wait() }
        },
        cWidth: () => this.renderer.view.width,
        cHeight: () => this.renderer.view.height,
    }
    create: CreateTools = {
        stage: () => new Container(),
        sprite: (texture) => new Sprite(texture),
        graphics: (geometry) => new Graphics(geometry),
        text: (text, style, canvas) => new Text(text, style, canvas)
    };

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
            x: this.helpers.randomInt(this.renderer.view.width-1), 
            y: this.helpers.randomInt(this.renderer.view.height-1), 
            color: this.stars.config.colors[this.helpers.randomInt(this.stars.config.colors.length - 1)]
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
            const star = this.create.graphics();
            star.beginFill(color, alpha);
            star.drawRect(x, y, size, size);
            star.endFill();
    
            return star;
        },
        createStarsLayer: (layer, alpha) => {
            const starsLayer = this.create.stage();
            starsLayer.position.set(0, 0);
            starsLayer.width = this.renderer.view.width;
            starsLayer.height = this.renderer.view.height;
            for (let i = 0; i < layer.length; i++) {
                const star = this.stars.createStar({...layer[i], alpha });
                starsLayer.addChild(star);
            }
    
            return starsLayer;
        },
        createStarsStage: (starsLayers, arAlpha) => {             
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
        },
        go: () => {
            this.stars.createStarsStage(this.stars.genStarLayers(), this.stars.config.layerAlpha);

            this.addToStage(this.stars.stage);
            this.addTicker(this.stars.ticker);        
        }
    };

    dialog: DialogTools = {
        stage: new Container(),
        show: (params) => {
            //
        },
        hide: () => {
            //
        },
        go: () => {
            this.addToStage(this.dialog.stage);
        }
    };

    player: PlayerTools = {
        config: {
            stepMoving: 5,
            lives: 1,
            fullHealth: 100,
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
        interfaceHeight: 50,
        points: 0,
        reserveLives: 0,
        health: 0,
        wh: () => ({ width: this.helpers.cWidth(), height: this.helpers.cHeight() - this.player.interfaceHeight }),
        gameOver: async () => {
            this.helpers.pause(true);
            const { width, height } = this.player.wh();
            this.stage.removeChild(this.enemies.stage);
            this.stage.removeChild(this.enemies.shotStage);
            this.enemies.stage = this.create.stage();
            this.enemies.shotStage = this.create.stage();
            this.enemies.stage.width = width;
            this.enemies.stage.height = height;
            this.enemies.shotStage.width = width;
            this.enemies.shotStage.height = height;
            this.stage.addChild(this.enemies.shotStage);
            this.stage.addChild(this.enemies.stage);
            alert('Game Over!');
            this.player.reloadLives();
        },
        reloadLives: (lives = this.player.config.lives) => {
            this.player.reserveLives = lives;
            this.player.startLive();
            this.helpers.pause(false);
        },
        startLive: ()=> {
            if (this.player.reserveLives <= 0) {
                return this.player.gameOver(); //Game Over !!!!!
            }
            this.player.reserveLives = this.player.reserveLives - 1;
            this.player.health = this.player.config.fullHealth;
            //freezy time
        },
        damage: (damage) => {
            this.player.health = this.player.health - damage;
            if (this.player.health <= 0) {
                this.player.startLive();
            }
        },
        upPoints: points => this.player.points = this.player.points + points,
        downPoints: points => this.player.points = this.player.points - points,
        keyUp: (e) => {
            //console.log('keyUp [e]:', { e });
            switch (this.helpers.getKeyCode(e)) {            
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
            switch (this.helpers.getKeyCode(e)) {            
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
            const spriteShip = this.create.sprite(this.textures[name]);
            spriteShip.x = x;
            spriteShip.y = y;
            spriteShip.width = size;
            spriteShip.height = size;
            spriteShip.angle = orientation === orientations.right ? 90 : -90;

            return spriteShip;
        },
        toStage: () => {
            const { width, height } = this.player.wh();
            this.player.stage.position.set(0, this.player.interfaceHeight);
            this.player.stage.width = width;
            this.player.stage.height = height;
            const playerShip = this.player.createSpaceShip(orientations.right, textureNames.spaceShip);
            playerShip.position.set(120, Math.floor(height / 2));
            
            this.player.stage.addChild(playerShip); 
            this.player.shotStage.position.set(0, this.player.interfaceHeight); 
            this.player.shotStage.width = width;
            this.player.shotStage.height = height;  
            this.player.interfaceStage.position.set(0, 0); 
            this.player.interfaceStage.width = width;
            this.player.interfaceStage.height = this.player.interfaceHeight;            
        },
        createShot: (textureName = textureNames.shotRed) => {
            const shot = this.create.sprite(this.textures[textureName]);
            shot.x = 0;
            shot.y = 0;
            shot.width = 40;
            shot.height = 20;

            return shot;
        },
        printInterface: () => {
            const pointsText = `Points: ${this.player.points}`;
            const healthText = `health: ${this.player.health}`;
            const livesText = `L: ${this.player.reserveLives}`;
            if (this.player.interfaceStage.children.length) {
                const [ points, health, lives] = this.player.interfaceStage.children as Text[];
                points.text = pointsText;
                health.text = healthText;
                lives.text = livesText;

            } else {
                const points = this.create.text(pointsText, { fontSize: 24, fill: 0xFFFF00 });
                points.position.set(320, 15);

                const health = this.create.text(healthText, { fontSize: 36, fill: 0xFFFF00 });
                health.position.set(100, 10);

                const lives = this.create.text(livesText, { fontSize: 24, fill: 0xFFFF00 });
                lives.position.set(10, 15);

                this.player.interfaceStage.addChild(points);
                this.player.interfaceStage.addChild(health);
                this.player.interfaceStage.addChild(lives);
            }
        },
        ticker: () => {
            if (this.pauseGame) return;
            const { width, height } = this.player.wh();
            const [ playerShip ] =  this.player.stage.children as Sprite[];
            let newX = playerShip.x;
            let newY = playerShip.y;
            switch (this.player.config.moveX) {
                case 1:
                    if (newX > (playerShip.width + this.player.config.stepMoving)) newX = newX - this.player.config.stepMoving;
                    break;
                case 2:
                    if (newX < width - this.player.config.stepMoving) newX = newX + this.player.config.stepMoving;
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
                    if (newY < height - playerShip.height - this.player.config.stepMoving) newY = newY + this.player.config.stepMoving;
                    break;
                case 0:
                default:
                    break;                                                        
            }
            if (newX !== playerShip.x || newY !== playerShip.y) {
                playerShip.position.set(newX, newY);
            }
            const delShots: Sprite[] = [];
            const delEnemies: Sprite[] = [];
            (this.player.shotStage.children as Sprite[]).forEach((shot) => {
                if (shot.x < window.innerWidth + shot.width) {
                    shot.position.set(shot.x + this.player.config.shot.speed, shot.y);
                    (this.enemies.stage.children as Sprite[])?.forEach?.( enemyShip => {
                        if (this.helpers.intersectionR2R(shot, {
                            x: enemyShip.x,
                            y: enemyShip.y - enemyShip.height,
                            width: enemyShip.width,
                            height: enemyShip.height
                        })) {
                            //Поподание во врага
                            //уничтожить врага, на место eshipPos поместить взрыв 1000 мс
                            delEnemies.push(enemyShip);
                            delShots.push(shot);
                            this.player.upPoints(this.enemies.config.costPoint);
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
            delEnemies.forEach(enemy => this.enemies.stage.removeChild(enemy));
            const time = (new Date()).getTime();
            if (this.player.config.fire === 1 && this.player.config.shot.delay <= time - this.player.config.shot.lastShotTime) {
                this.player.config.shot.lastShotTime = time;
                const shotRed = this.player.createShot(textureNames.shotRed);
                shotRed.position.set(playerShip.x + 10, playerShip.y + Math.floor(playerShip.height / 2) - Math.floor(shotRed.height / 2));
                this.player.shotStage.addChild(shotRed);            
            }
            //
            this.player.printInterface();
        },
        go: () => {
            this.player.addEventListeners();
            this.player.toStage();

            this.addToStage(this.player.shotStage);
            this.addToStage(this.player.stage);
            this.addToStage(this.player.interfaceStage);
            this.addTicker(this.player.ticker);
            this.player.startLive();
            this.player.printInterface();
        }
    };

    enemies: EnemyTools = {
        config: {
            count: 5,
            costPoint: 2,
            costPointShot: 1,
            costDamageShot: 1,
            stepMoving: 5,
            shotDelay: 300
        },
        stage: new Container(),
        shotStage: new Container(),
        fireTimers: [],
        createEnemyShip: (x = this.player.wh().width, y = 0, size = 60, orientation = orientations.left, name = textureNames.spaceAirCraft) => {
            const spriteShip = this.create.sprite(this.textures[name]);
            spriteShip.x = x;
            spriteShip.y = y;
            spriteShip.width = size;
            spriteShip.height = size;
            spriteShip.angle = orientation === orientations.right ? 90 : -90;

            return spriteShip;
        },
        createEnemyShot: () => this.player.createShot(textureNames.shotOrange),
        respawnEnemies: () => {
            const { width, height } = this.player.wh();
            const newEnemyCount = this.enemies.config.count - this.enemies.stage.children.length;
            if (newEnemyCount <= 0) return;            
            for (let i = 0; i < newEnemyCount; i++) {
                const enemyShip = this.enemies.createEnemyShip();
                const newX = width - enemyShip.width;
                let newY = this.helpers.randomInt(height - enemyShip.height);
                while ((this.enemies.stage.children as Sprite[]).find(ship => this.helpers.intersectionR2R({
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
                    newY = this.helpers.randomInt(height - enemyShip.height);
                }
                enemyShip.position.set(newX, newY + enemyShip.height);
                this.enemies.stage.addChild(enemyShip);
            }
        },
        toStage: () => {
            const { width, height } = this.player.wh();
            this.enemies.shotStage.position.set(0, this.player.interfaceHeight);
            this.enemies.shotStage.width = width;
            this.enemies.shotStage.height = height;            
            this.enemies.stage.position.set(0, this.player.interfaceHeight);
            this.enemies.stage.width = width;
            this.enemies.stage.height = height; 
        },
        ticker: () => {
            if (this.pauseGame) return;            
            const PlayerShip = this.player.stage.children[0] as Sprite;
            const PlayerCenterY = PlayerShip.y + Math.floor(PlayerShip.height / 2);
            const delEnemies: Sprite[] = [];
            const delEnemyShots: Sprite[] = [];
            (this.enemies.stage.children as Sprite[]).forEach((enemy, i) => {
                if (enemy.x <= 0) {
                    delEnemies.push(enemy);
                } else {
                    const shipTop = enemy.y - enemy.height;
                    const shipCenterY = enemy.y - Math.floor(enemy.height / 2);    
                    const hasFireLine = shipTop <= PlayerCenterY && enemy.y >= PlayerCenterY;
                    const nowTime = new Date().getTime();
                    let fireTimerIndex = this.enemies.fireTimers.findIndex(({index}) => index === i); 
                    if (fireTimerIndex < 0) {
                        this.enemies.fireTimers.push({
                            index: i,
                            timer: 0
                        });
                        fireTimerIndex = this.enemies.fireTimers.length - 1;
                    }
                    if (hasFireLine && this.enemies.config.shotDelay <= nowTime - this.enemies.fireTimers[fireTimerIndex].timer) {
                        // Стрелять перед ходом
                        const shot = this.enemies.createEnemyShot(); 
                        shot.position.set(enemy.x + shot.width, shipCenterY - Math.floor(shot.height / 2));
                        this.enemies.shotStage.addChild(shot);
                        this.enemies.fireTimers[fireTimerIndex].timer = nowTime;
                    }                  
                    let newY = enemy.y;
                    let newX = enemy.x - this.enemies.config.stepMoving;
                    if (i % 3 === 0) {
                        newY = shipTop > PlayerCenterY 
                        ? enemy.y - this.enemies.config.stepMoving 
                        : enemy.y < PlayerCenterY 
                            ? enemy.y + this.enemies.config.stepMoving 
                            : enemy.y;
                        newX = newX + Math.floor(this.enemies.config.stepMoving / 2);
                    }

                    //let newX = newY === enemy.y ? enemy.x - this.enemies.config.stepMoving : enemy.x;                    

                    enemy.position.set(newX, newY);
                }
            });
            delEnemies.forEach(enemy => this.enemies.stage.removeChild(enemy));
            //
            (this.enemies.shotStage.children as Sprite[]).forEach(shot => {
                const crashShot = (this.player.shotStage.children as Sprite[]).find(shotPlayer => this.helpers.intersectionR2R(shot, shotPlayer));
                if (this.helpers.intersectionR2R({
                    x: PlayerShip.x - PlayerShip.width,
                    y: PlayerShip.y,
                    width: PlayerShip.width,
                    height: PlayerShip.height
                }, shot)) {
                    // попадание в игрока
                    // уменьшать здоровье
                    this.player.damage(this.enemies.config.costDamageShot);
                    this.player.downPoints(this.enemies.config.costPointShot);
                    delEnemyShots.push(shot);
                } else if (crashShot) {
                    this.player.shotStage.removeChild(crashShot);
                    this.player.upPoints(this.enemies.config.costPointShot);
                    delEnemyShots.push(shot);
                } else if (shot.x + shot.width > 0) {                    
                    shot.position.set(shot.x - this.player.config.shot.speed, shot.y);                    
                } else {
                    delEnemyShots.push(shot);
                }
            });
            delEnemyShots.forEach(shot => this.enemies.shotStage.removeChild(shot));
            //
            this.enemies.respawnEnemies();
            //
        },
        go: () => {
            this.enemies.toStage();           
            this.enemies.respawnEnemies();

            this.addToStage(this.enemies.shotStage);
            this.addToStage(this.enemies.stage);
            this.addTicker(this.enemies.ticker);
        }
    };

    explosions: ExplosionsTools = {
        stage: new Container(),
        createExplosion: () => {
            //создать взрыв
        },
        ticker: () => {
            // перебирать элементы и анимировать
        },
        go: () => {
            this.addToStage(this.explosions.stage);
            this.addTicker(this.explosions.ticker);
        }
    };

    clearCanvas(background = 0x000000) {
        const rectClear = new Graphics();
        rectClear.beginFill(background);
        rectClear.drawRect(0, 0, this.renderer.width, this.renderer.height);
        rectClear.endFill();
        
        this.stage.addChild(rectClear);
    }

    addToStage = (item: Container | Graphics) => this.stage.addChild(item);
    addTicker = (ticker: TickerCallback<ICanvas>) => this.ticker.add(ticker);

    loadAssets = async (assets?: AssetsList) => {
        if (!assets) return;
        await assets.forEach(async ([ name, url ]) => {
            Assets.add(name, url);
            this.textures[name] = await Assets.load(name);
        });
        this.texturesRady = true;
    }

    initialize = async (hasResize?: boolean) => {
        await document.body.appendChild(this.renderer.view as HTMLCanvasElement);
        if (hasResize) {
            document.body.onresize = () => this.renderer.resize(window.innerWidth, window.innerHeight);
        }
        this.renderStage.addChild(this.stage);
        this.renderStage.addChild(this.dialogStage);
        this.ticker.add(() => this.renderer.render(this.renderStage));
        this.init = true;
    }

    constructor({ width, height, background, hasResize, assetsList, cfgs }: PropsEngine) { 
        this.stars.config = cfgs.stars;
        this.player.config = cfgs.player;  
        this.player.reserveLives = this.player.config.lives;
        this.enemies.config = cfgs.enemies;          
        this.enemies.stage = this.create.stage();
        this.enemies.shotStage = this.create.stage();
        this.init = false;   
        this.texturesRady = false;
        this.pauseGame = false;
        this.textures = {};
        this.renderStage = this.create.stage();
        this.stage = this.create.stage();
        this.dialogStage = this.create.stage();
        this.ticker = Ticker.shared;
        this.renderer = autoDetectRenderer({ width, height, background });
        this.loadAssets(assetsList);
        this.initialize(hasResize);  
    }
}