import { ILineStyleOptions, Container, Graphics, Point } from 'pixi.js';
import { negatePoint } from '../functions/point-math';

abstract class ShapePrimitive extends Container {
    private _style: ILineStyleOptions;
    private _filled: boolean;
    protected readonly graphics: Graphics;

    constructor(filled: boolean, style: ILineStyleOptions) {
        super()

        this.graphics = new Graphics()
        this.addChild(this.graphics)

        style.color = style.color === undefined ? 0xffffff : style.color
        style.width = style.width === undefined ? 1 : style.width
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

export class LinePrimitive extends ShapePrimitive {
    private _start: Point;
    private _end: Point;

    constructor(start: Point, end: Point, style: ILineStyleOptions) {
        super(false, style)

        this._start = start
        this._end = end

        this.refresh()
    }

    protected drawShape(graphics: Graphics): void {
        graphics.moveTo(this.start.x, this.start.y)
        graphics.lineTo(this.end.x, this.end.y)
    }

    public get start(): Point {
        return this._start;
    }

    public set start(value: Point) {
        this._start = value;
        this.refresh()
    }

    public get end(): Point {
        return this._end;
    }

    public set end(value: Point) {
        this._end = value;
        this.refresh()
    }
}

export class RectanglePrimitive extends ShapePrimitive {
    private _rectWidth: number;
    private _rectHeight: number;
    constructor(filled: boolean, rectWidth: number, rectHeight: number, style: ILineStyleOptions) {
        super(filled, style);
        this.rectWidth = rectWidth
        this.rectHeight = rectHeight
    }

    protected drawShape(graphics: Graphics): void {
        graphics.drawRect(this.x, this.y, this.rectWidth, this.rectHeight)
    }

    public get rectWidth(): number {
        return this._rectWidth;
    }

    public set rectWidth(value: number) {
        this._rectWidth = value;
        this.refresh()
    }

    public get rectHeight(): number {
        return this._rectHeight;
    }

    public set rectHeight(value: number) {
        this._rectHeight = value;
        this.refresh()
    }

    public get offset(): Point {
        return negatePoint(this.graphics.position);
    }

    public set offset(value: Point) {
        this.graphics.position = negatePoint(value)
        this.refresh()
    }
}