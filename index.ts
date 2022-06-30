import { Game } from "./data/game";
import { preload } from "../preload"
import { main, update } from "../main"
import { finishLoad } from './core/assets';
import { Application } from "pixi.js";

// Setup DOM
document.body.style.margin = "0";
document.body.tabIndex = 1;
document.body.style.background = "rgb(0, 0, 50)";

// Setup App
let app = new Application({
  width: 1600,
  height: 900,
  backgroundColor: 0x111111,
});

var isDevBuild = false;
if (process.env.NODE_ENV !== "production") {
  console.log("💻🤖 DEVELOPMENT BUILD DETECTED 🤖💻");
  isDevBuild = true
}

document.body.appendChild(app.view);

export const game = new Game(app, { width: app.screen.width, height: app.screen.height }, isDevBuild);

preload()



function coreUpdateLoop(dt: number) {
  game.app.stage.interactive = false
  game.app.stage.buttonMode = false

  update(dt)
}

function onFinishLoad() {
  main()

  app.ticker.add(() => {
    let dt = app.ticker.elapsedMS / 1000
    coreUpdateLoop(dt)
  });
}

finishLoad(onFinishLoad)