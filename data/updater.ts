export class Updater {
    fn: (dt: number) => void;

    constructor(fn: (dt: number) => void) {
        this.fn = fn;
    }

    run(dt: number) {
        this.fn(dt);
    }
}