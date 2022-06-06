import * as PIXI from "pixi.js";
import { Updater } from './updater';
import { Key } from "../input/keyboard";

export class Game {
    readonly isDevBuild: boolean;
    readonly app: PIXI.Application;
    readonly worldContainer: PIXI.Container;
    readonly updaters: Updater[] = [];
    readonly keyboard: Map<string, Key> = new Map();

    constructor(app: PIXI.Application, isDevBuild: boolean) {
        this.app = app;
        this.isDevBuild = isDevBuild;
        this.worldContainer = app.stage.addChild(new PIXI.Container());
    }

    update(delta: number) {
        for (let updater of this.updaters) {
            updater.fn(delta);
        }
    }

    setupKey(keyName: string) {

    }
}