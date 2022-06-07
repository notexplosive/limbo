type UpdateFunction = (dt: number) => void;

export class Updater {
    private fns: UpdateFunction[] = [];

    constructor(fn?: UpdateFunction) {
        if (fn !== undefined) {
            this.fns.push(fn);
        }
    }

    execute(dt: number) {
        for (let fn of this.fns) {
            fn(dt);
        }
    }

    remove(fn: UpdateFunction) {
        let index = this.fns.indexOf(fn);
        if (index !== -1) {
            this.fns.slice(index, 1);
        }
    }

    add(fn: UpdateFunction) {
        this.fns.push(fn);
    }
}