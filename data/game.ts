import * as PIXI from "pixi.js";
import { Updater } from './updater';
import { Key } from "../input/keyboard";
import { Viewport } from "pixi-viewport";

export class Game {
    readonly isDevBuild: boolean;
    readonly app: PIXI.Application;
    readonly rootContainer: PIXI.Container;
    readonly updaters: Updater[] = [];
    readonly keyboard: Map<string, Key> = new Map();
    readonly world: Viewport;

    constructor(app: PIXI.Application, screenSize: PIXI.ISize, isDevBuild: boolean) {
        this.app = app;
        this.isDevBuild = isDevBuild;
        this.rootContainer = app.stage.addChild(new PIXI.Container());
        this.world = new Viewport({ screenWidth: 800, screenHeight: 600 });
        this.world.sortableChildren = true
    }

    update(delta: number) {
        for (let updater of this.updaters) {
            updater.fn(delta);
        }
    }

    setupKey(keyName: string) {

    }
}