import { FillStyle, Rectangle, Graphics, ILineStyleOptions } from 'pixi.js';
import * as PIXI from "pixi.js";
import { Vector2 } from "../data/vector2";


export class PrimitiveRenderer {
    container: PIXI.Container;
    constructor(app: PIXI.Container) {
        this.container = app;
    }

    line(pointA: Vector2, pointB: Vector2, style: ILineStyleOptions) {
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(style);
        graphics.moveTo(pointA.x, pointA.y);
        graphics.lineTo(pointB.x, pointB.y);

        this.container.addChild(graphics);
        return graphics;
    }

    rectangle(filled: boolean, rectangle: Rectangle, style: ILineStyleOptions) {
        let graphics = new PIXI.Graphics();

        if (filled) {
            graphics.beginFill(style.color);
        } else {
            graphics.lineStyle(style);
        }

        graphics.drawRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.container.addChild(graphics);
        return graphics;
    }

    circle(filled: boolean, center: Vector2, radius: number, style: ILineStyleOptions) {
        let graphics = new PIXI.Graphics();

        if (filled) {
            graphics.beginFill(style.color)
        } else {
            graphics.lineStyle(style);
        }

        graphics.drawCircle(center.x, center.y, radius);
        this.container.addChild(graphics);
        return graphics;
    }
}

// this should be as simple as graphics.lineStyle(style) but alas...
function applyLineStyle(graphics: PIXI.Graphics, style: ILineStyleOptions) {
    graphics.lineStyle({
        color: style.color,
        alpha: style.alpha,
        width: style.width,
        alignment: style.alignment,
        native: style.native,
        cap: style.cap,
        join: style.join,
        miterLimit: style.miterLimit,
        matrix: style.matrix
    });
}