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

abstract class ShapePrimitive extends Container {
    private _style: ILineStyleOptions;
    private _filled: boolean;
    private readonly graphics: Graphics;

    constructor(filled: boolean, style: ILineStyleOptions) {
        super()

        this.graphics = new Graphics()
        this.addChild(this.graphics)

        this._style = style
        this._filled = filled
    }

    protected refresh() {
        this.graphics.clear();

        if (this.filled) {
            this.graphics.beginFill(this.style.color);
        } else {
            this.graphics.lineStyle(this.style);
        }

        this.alpha = this.style.alpha || 1
        this.style.width = (this.style.width === undefined) ? 1 : this.style.width

        this.drawShape(this.graphics)
    }

    protected abstract drawShape(graphics: Graphics): void;

    public get filled(): boolean {
        return this._filled;
    }

    public set filled(value: boolean) {
        this._filled = value;
        this.refresh()
    }

    public get style(): ILineStyleOptions {
        return this._style;
    }

    public set style(value: ILineStyleOptions) {
        this._style = value;
        this.refresh()
    }
}

export class CirclePrimitive extends ShapePrimitive {
    private _radius: number;

    constructor(filled: boolean, radius: number, style: ILineStyleOptions) {
        super(filled, style)
        this._radius = radius

        this.refresh()
    }

    protected drawShape(graphics: Graphics) {
        graphics.drawCircle(this.x, this.y, this.radius)
    }

    public get radius(): number {
        return this._radius;
    }

    public set radius(value: number) {
        this._radius = value;
        this.refresh()
    }
}