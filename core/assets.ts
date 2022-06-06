import * as PIXI from 'pixi.js';
import { Sound } from '@pixi/sound';
import { ISize, ISpritesheetData } from 'pixi.js';

type LoaderFunction = (key: string, resource: PIXI.LoaderResource) => void;

let textures: Map<string, PIXI.Texture> = new Map();
let sounds: Map<string, Sound> = new Map();
let spritesheets: Map<string, PIXI.Spritesheet> = new Map();

export class AssetLoader {
    callback: LoaderFunction
    name: string
    private constructor(name: string, callback: LoaderFunction) {
        this.name = name;
        this.callback = callback;
    }

    // You can create your own AssetType if you want, but we provide defaults for textures, sounds, and fonts
    static adHoc(callback: LoaderFunction) {
        return new AssetLoader("AdHoc", callback);
    }
    static Texture = new AssetLoader("Texture", (key, resource) => { textures.set(key, resource.texture); });
    static Sound = new AssetLoader("Sound", (key, resource) => { sounds.set(key, resource.sound); });
    static Spritesheet = new AssetLoader("Spritesheet", (key, resource) => {
        spritesheets.set(key, resource.spritesheet)
    });

    // should use with a .png
    static dynamicSpritesheet(cellSize: ISize, getDataFromTexture: (texture: PIXI.Texture, cellSize: ISize) => ISpritesheetData) {
        return new AssetLoader("DynamicSpritesheet", (key, resource) => {
            let spritesheet = new PIXI.Spritesheet(resource.texture, getDataFromTexture(resource.texture, cellSize));

            let isDone = false
            spritesheet.parse(() => { isDone = true; });


            let i = 0
            while (isDone === false) {
                i++;

                if (i > 100000) {
                    console.log("DynamicSpritesheet took too long")
                    break;
                }
            }

            spritesheets.set(key, spritesheet);
        });
    }
}

let allAssetKeys: string[] = []
let assetTypeMap: Map<string, AssetLoader> = new Map();
const loader = PIXI.Loader.shared;

export function prepareLoad(assetType: AssetLoader, key: string, assetPath: string) {
    allAssetKeys.push(key)
    loader.add(key, `assets/${assetPath}`)
    assetTypeMap.set(key, assetType);
}



loader.onComplete.add((loader: PIXI.Loader, resources: PIXI.utils.Dict<PIXI.LoaderResource>) => { console.log("Load Complete!") })

export function finishLoad(onFinished: () => void) {
    function loadCallback(loader: PIXI.Loader, resources: PIXI.utils.Dict<PIXI.LoaderResource>) {
        for (let key of allAssetKeys) {
            let assetType = assetTypeMap.get(key)
            assetType.callback(key, resources[key])
            console.log(`${assetType.name} loaded as key: ${key}`)
        }

        onFinished();
    }

    loader.load(loadCallback);
}

export class Assets {
    static sound(key: string): Sound {
        return sounds.get(key)
    }

    static texture(key: string): PIXI.Texture {
        return textures.get(key)
    }

    static spritesheet(key: string): PIXI.Spritesheet {
        return spritesheets.get(key)
    }
}