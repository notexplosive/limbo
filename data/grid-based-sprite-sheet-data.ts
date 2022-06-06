import * as PIXI from 'pixi.js';

export function gridBasedSpriteSheetData(textureSize: PIXI.ISize, cellSize: PIXI.ISize): PIXI.ISpritesheetData {
    let frames: any = {}
    let frameIndex = 0
    for (let y = 0; y < textureSize.height; y += cellSize.height) {
        for (let x = 0; x < textureSize.width; x += cellSize.width) {
            frames[frameIndex.toString()] = {
                frame: { x, y, w: cellSize.width, h: cellSize.height },
                rotated: false,
                trimmed: false,
                spriteSourceSize: { x: 0, y: 0, width: cellSize.width, height: cellSize.height },
                sourceSize: cellSize
            }
            frameIndex++;
        }
    }

    return {
        frames,
        meta: { scale: "1" }
    }
}