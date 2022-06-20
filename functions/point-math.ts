import { Point } from "pixi.js";

export function addPoints(left: Point, right: Point) {
    return new Point(left.x + right.x, left.y + right.y)
}

export function subtractPoints(left: Point, right: Point) {
    return new Point(left.x - right.x, left.y - right.y)
}

export function negatePoint(point: Point) {
    return new Point(-point.x, -point.y)
}