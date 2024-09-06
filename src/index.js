//import * as pixi from 'pixijs';
import { Game } from './game/game';

/*async function init() {
    const app = new pixi.Application({ width: window.innerWidth, height: window.innerHeight });
    //await app.init?.({ background: '#000', resizeTo: window });
    document.body.appendChild(app.view);
    window.onresize = () => {
        //app.renderer.view.style.width = window.innerWidth;
        //app.renderer.view.style.height = window.innerHeight;
        app.renderer.resize(window.innerWidth, window.innerHeight)
    }
}

init();*/

const game = new Game();

game.start();