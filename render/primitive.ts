import { Rectangle, ILineStyleOptions } from 'pixi.js';
import * as PIXI from "pixi.js";


export class OmniPrimitive {
    container: PIXI.Container;
    constructor(containerToAttach: PIXI.Container) {
        this.container = containerToAttach;
    }

    line(pointA: PIXI.IPointData, pointB: PIXI.IPointData, style: ILineStyleOptions) {
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(style);
        graphics.moveTo(pointA.x, pointA.y);
        graphics.lineTo(pointB.x, pointB.y);

        this.container.addChild(graphics);
        return graphics;
    }

    private createShape(filled: boolean, style: ILineStyleOptions, drawCallback: (graphics: PIXI.Graphics) => void) {
        let graphics = new PIXI.Graphics();

        if (filled) {
            graphics.beginFill(style.color);
        } else {
            graphics.lineStyle(style);
        }

        graphics.alpha = style.alpha

        drawCallback(graphics);

        this.container.addChild(graphics);
        return graphics;
    }

    rectangle(filled: boolean, rectangle: Rectangle, style: ILineStyleOptions): PIXI.Graphics {
        return this.createShape(filled, style, (graphics) => {
            graphics.drawRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        });
    }

    circle(filled: boolean, center: PIXI.IPointData, radius: number, style: ILineStyleOptions): PIXI.Graphics {
        return this.createShape(filled, style, (graphics) => {
            graphics.drawCircle(center.x, center.y, radius);
        });
    }
}