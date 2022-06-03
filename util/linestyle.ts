import { LineStyle } from 'pixi.js';
import * as PIXI from 'pixi.js';
export function colorToLineStyle(color: number) {
    var lineStyle = new LineStyle();
    lineStyle.color = color;
    lineStyle.width = 1;
    lineStyle.join = PIXI.LINE_JOIN.ROUND
    return lineStyle;
}