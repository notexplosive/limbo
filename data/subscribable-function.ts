export class SubscribableFunction {
    private callbacks: Function[] = []

    fire() {
        for (let callback of this.callbacks) {
            callback()
        }
    }

    addCallback(callback: () => void) {
        this.callbacks.push(callback)
    }
}