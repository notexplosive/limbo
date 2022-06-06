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