import { Sound, sound } from '@pixi/sound';
import * as PIXI from 'pixi.js';
import { ISize, ISpritesheetData } from 'pixi.js';

type LoaderFunction = (key: string, resource: PIXI.LoaderResource) => void;

let textures: Map<string, PIXI.Texture> = new Map();
let sounds: Map<string, Sound> = new Map();
let spritesheets: Map<string, PIXI.Spritesheet> = new Map();

export class AssetLoader {
    callback: LoaderFunction
    assetTypeName: string
    validExtensions: string[];

    private constructor(assetTypeName: string, validExtensions: string[], callback: LoaderFunction) {
        this.assetTypeName = assetTypeName;
        this.validExtensions = validExtensions;
        this.callback = callback;
    }

    verifyExtension(path: string) {
        let splitPath = path.split('.')
        let extension = splitPath[splitPath.length - 1]

        if (this.validExtensions.includes(extension, 0)) {
            return true;
        }

        if (this.validExtensions.includes("*")) {
            return true;
        }

        return false;
    }

    private static readonly validTextureExtensions = ["png"];

    // You can create your own AssetType if you want, but we provide defaults for textures, sounds, and fonts
    static adHoc(callback: LoaderFunction) {
        return new AssetLoader("AdHoc", ["*"], callback);
    }
    static Texture = new AssetLoader("Texture", AssetLoader.validTextureExtensions, (key, resource) => { textures.set(key, resource.texture); });
    static Sound = new AssetLoader("Sound", ["ogg", "wav"], (key, resource) => {
        sounds.set(key, resource.sound);
    });
    static Spritesheet = new AssetLoader("Spritesheet", ["json"], (key, resource) => {
        spritesheets.set(key, resource.spritesheet)
    });

    // should use with a .png
    static dynamicSpritesheet(cellSize: ISize, getDataFromTexture: (texture: PIXI.Texture, cellSize: ISize) => ISpritesheetData) {
        return new AssetLoader("DynamicSpritesheet", AssetLoader.validTextureExtensions, (key, resource) => {
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

/**
 * 
 *
 * @export
 * @param {AssetLoader} assetLoader should be an instance of an AssetLoader, such as AssetLoader.Texture or AssetLoader.Sound
 * @param {string} key key that the asset will be indexed by later
 * @param {string} assetPath actual path to the asset, starting in the `assets` folder (eg: "images/foo.png" becomes "assets/images/foo.png")
 */
export function prepareLoad(assetLoader: AssetLoader, key: string, assetPath: string) {
    sound.init()
    allAssetKeys.push(key)
    loader.add(key, `assets/${assetPath}`)
    if (!assetLoader.verifyExtension(assetPath)) {
        console.warn(`Trying to load ${assetPath} as a ${assetLoader.assetTypeName}, supported extensions are ${assetLoader.validExtensions}`)
    }
    assetTypeMap.set(key, assetLoader);
}



loader.onComplete.add((loader: PIXI.Loader, resources: PIXI.utils.Dict<PIXI.LoaderResource>) => { console.log("Load Complete!") })

export function finishLoad(onFinished: () => void) {
    function loadCallback(loader: PIXI.Loader, resources: PIXI.utils.Dict<PIXI.LoaderResource>) {
        for (let key of allAssetKeys) {
            let assetType = assetTypeMap.get(key)
            if (resources[key] === undefined) {
                console.error(`resoruces[${key}] was undefined, something went wrong`)
            }
            assetType.callback(key, resources[key])
            console.log(`${assetType.assetTypeName} loaded as key: ${key}`)
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