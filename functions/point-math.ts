import { IPointData, Point } from "pixi.js";

export function addPoints(left: IPointData, right: IPointData) {
    return new Point(left.x + right.x, left.y + right.y)
}

export function subtractPoints(left: IPointData, right: IPointData) {
    return new Point(left.x - right.x, left.y - right.y)
}

export function negatePoint(point: IPointData) {
    return new Point(-point.x, -point.y)
}

export function multiplyPoint(point: IPointData, scalar: number) {
    return new Point(point.x * scalar, point.y * scalar)
}