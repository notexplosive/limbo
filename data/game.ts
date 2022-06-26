import * as PIXI from "pixi.js";
import { Updater } from './updater';
import { Key } from "../input/keyboard";
import { Viewport } from "pixi-viewport";
import { SubscribableFunction } from "./subscribable-function";
import { IPointData, Point } from 'pixi.js';

export class Game {
    readonly isDevBuild: boolean;
    readonly app: PIXI.Application;
    readonly rootContainer: PIXI.Container;
    readonly keyboard: Map<string, Key> = new Map();
    readonly world: Viewport;
    readonly background: Viewport;
    readonly onClick: SubscribableFunction = new SubscribableFunction();

    constructor(app: PIXI.Application, screenSize: PIXI.ISize, isDevBuild: boolean) {
        this.app = app;
        this.isDevBuild = isDevBuild;
        this.rootContainer = app.stage.addChild(new PIXI.Container());
        this.background = new Viewport({ screenWidth: screenSize.width, screenHeight: screenSize.height });
        this.background.sortableChildren = true
        this.world = new Viewport({ screenWidth: screenSize.width, screenHeight: screenSize.height });
        this.world.sortableChildren = true

        this.rootContainer.addChild(this.background)
        this.rootContainer.addChild(this.world)

        let buttonState = { isEngaged: false, isHovered: false }

        function onButtonDown() {
            buttonState.isEngaged = true
        }

        let me = this
        function onButtonUp() {
            if (buttonState.isEngaged) {
                me.onClick.fire()
            }

            buttonState.isEngaged = false
        }

        function onButtonHover() {
            buttonState.isHovered = true
        }

        function onButtonUnhover() {
            buttonState.isHovered = false
        }

        function onButtonUpOutside() {
            buttonState.isEngaged = false
        }

        this.app.stage.on("pointerdown", onButtonDown)
        this.app.stage.on("pointerup", onButtonUp)
        this.app.stage.on("pointerover", onButtonHover)
        this.app.stage.on("pointerout", onButtonUnhover)
        this.app.stage.on("pointerupoutside", onButtonUpOutside)
    }

    setupKey(keyName: string) {

    }

    requestInteractive() {
        this.app.stage.interactive = true
    }

    requestButtonModeTrue() {
        this.app.stage.buttonMode = true
    }

    globalMousePosition(): Point {
        return this.app.renderer.plugins.interaction.mouse.global as Point
    }

    hitTest(point: Point) {
        return this.app.renderer.plugins.interaction.hitTest(point)
    }
}