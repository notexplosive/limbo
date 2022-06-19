import { Rectangle, ILineStyleOptions, Container, Graphics, IPointData } from 'pixi.js';


export class OmniPrimitive {
    container: Container;
    constructor(containerToAttach: Container) {
        this.container = containerToAttach;
    }

    line(pointA: IPointData, pointB: IPointData, style: ILineStyleOptions) {
        let graphics = new Graphics();

        graphics.lineStyle(style);
        graphics.moveTo(pointA.x, pointA.y);
        graphics.lineTo(pointB.x, pointB.y);

        this.container.addChild(graphics);
        return graphics;
    }

    private createShapeAndAddChild(filled: boolean, style: ILineStyleOptions, drawCallback: (graphics: Graphics) => void) {
        let graphics = createShape(new Graphics(), filled, style, drawCallback)
        this.container.addChild(graphics);
        return graphics;
    }

    rectangle(filled: boolean, rectangle: Rectangle, style: ILineStyleOptions): Graphics {
        return this.createShapeAndAddChild(filled, style, (graphics) => {
            graphics.drawRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        });
    }

    circle(filled: boolean, center: IPointData, radius: number, style: ILineStyleOptions): Graphics {
        return this.createShapeAndAddChild(filled, style, (graphics) => {
            graphics.drawCircle(center.x, center.y, radius);
        });
    }
}

function createShape(graphics: Graphics, filled: boolean, style: ILineStyleOptions, drawCallback: (graphics: Graphics) => void) {

    if (filled) {
        graphics.beginFill(style.color);
    } else {
        graphics.lineStyle(style);
    }

    graphics.alpha = style.alpha

    drawCallback(graphics);

    return graphics;
}

export class CirclePrimitive extends Graphics {
    radius: number = 0;

    constructor(filled: boolean, radius: number, style: ILineStyleOptions) {
        super()
        this.radius = radius;

        let capturedThis = this
        createShape(this, filled, style, () => {
            capturedThis.drawCircle(capturedThis.x, capturedThis.y, capturedThis.radius);
        })
    }
}