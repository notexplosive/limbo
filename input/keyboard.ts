export class Key {
    readonly value: string;
    press: () => void;
    release: () => void;
    isDown: boolean;
    isUp: boolean;
    unsubscribe: () => void;

    constructor(value: string) {
        this.value = value;
        this.isDown = false;
        this.isUp = true;
        this.press = undefined;
        this.release = undefined;

        const downHandler = (event: KeyboardEvent) => {
            if (event.key === this.value) {
                if (this.isUp && this.press) {
                    this.press();
                }
                this.isDown = true;
                this.isUp = false;
                event.preventDefault();
            }
        };

        const upHandler = (event: KeyboardEvent) => {
            if (event.key === this.value) {
                if (this.isDown && this.release) {
                    this.release();
                }
                this.isDown = false;
                this.isUp = true;
                event.preventDefault();
            }
        };

        window.addEventListener("keydown", downHandler, false);
        window.addEventListener("keyup", upHandler, false);

        this.unsubscribe = () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }
}

export class Keyboard {
    private keys: Map<string, Key> = new Map<string, Key>()
    private keyNicknames: string[] = []
    private wasPressedTable: Map<string, number> = new Map<string, number>()

    register(key: Key, keyNickname: string) {
        this.keyNicknames.push(keyNickname)
        this.keys.set(keyNickname, key)
    }

    update() {
        for (let keyNickname of this.keyNicknames) {
            if (this.keys.get(keyNickname).isDown) {
                if (this.wasPressedTable.get(keyNickname) == undefined) {
                    this.wasPressedTable.set(keyNickname, 0)
                }
                else if (this.wasPressedTable.get(keyNickname) >= 0) {
                    this.wasPressedTable.set(keyNickname, this.wasPressedTable.get(keyNickname)+1)
                }
            } else {
                this.wasPressedTable.set(keyNickname, undefined)
            }
        }
    }

    wasPressed(keyNickname: string) {
        return this.wasPressedTable.get(keyNickname) == 0
    }
}