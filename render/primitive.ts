import { Rectangle } from "pixi.js";
import * as PIXI from "pixi.js";

export class PrimitiveRenderer {
    container: PIXI.Container;
    constructor(app: PIXI.Container) {
        this.container = app;
    }

    fillRectangle(rectangle: Rectangle, color: number) {
        // Create a Graphics object, set a fill color, draw a rectangle
        let graphics = new PIXI.Graphics();

        graphics.beginFill(color);
        graphics.drawRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

        // Add it to the stage to render
        this.container.addChild(graphics);
    }
}
