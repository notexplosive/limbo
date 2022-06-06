import * as PIXI from 'pixi.js';
import { Sound } from '@pixi/sound';

type LoaderFunction = (key: string, resource: PIXI.LoaderResource) => boolean;

let textures: Map<string, PIXI.Texture> = new Map();
let sounds: Map<string, Sound> = new Map();
let spritesheets: Map<string, PIXI.Spritesheet> = new Map();

export class AssetType {
    callback: LoaderFunction
    name: string
    private constructor(name: string, callback: LoaderFunction) {
        this.name = name;
        this.callback = callback;
    }

    // You can create your own AssetType if you want, but we provide defaults for textures, sounds, and fonts
    static adHoc(callback: LoaderFunction) {
        return new AssetType("AdHoc", callback);
    }
    static Texture = new AssetType("Texture", (key, resource) => { textures.set(key, resource.texture); return true });
    static Sound = new AssetType("Sound", (key, resource) => { sounds.set(key, resource.sound); return true; });
    static Spritesheet = new AssetType("Spritesheet", (key, resource) => {
        spritesheets.set(key, resource.spritesheet)
        return true;
    });
}

let allAssetKeys: string[] = []
let assetTypeMap: Map<string, AssetType> = new Map();
const loader = PIXI.Loader.shared;

export function prepareLoad(assetType: AssetType, key: string, assetPath: string) {
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