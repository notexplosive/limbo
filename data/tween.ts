import { IPointData, Point } from "pixi.js";

export type IsDoneFunction = () => boolean
export type EaseFunction = (x: number) => number
type LerpFunction<T> = (start: T, end: T, percent: number) => T;

export class EaseFunctions {
    public static linear(x: number) {
        return x;
    }

    // the following are from https://easings.net/

    public static quadSlowFast(x: number): number {
        return x * x
    }

    public static quadFastSlow(x: number): number {
        return 1 - EaseFunctions.quadSlowFast(1 - x);
    }

    public static quadSlowFastSlow(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }
}

export interface ITween {
    updateAndGetOverflow(dt: number): number
    isDone(): boolean
    reset(): void
}

abstract class ConditionTween implements ITween {
    abstract condition(dt: number): boolean

    updateAndGetOverflow(dt: number): number {
        if (this.condition(dt)) {
            return dt // since the condition is met, we pass all the remaining time to the next tween
        } else {
            return 0
        }
    }

    isDone(): boolean {
        return this.condition(0)
    }

    reset(): void {
        // nothing to do
    }
}

export class DynamicTween implements ITween {
    generatedTween: ITween;
    createFunction: () => ITween;

    constructor(createFunction: () => ITween) {
        this.createFunction = createFunction;
        this.generatedTween = null
    }

    updateAndGetOverflow(dt: number): number {
        if (this.generatedTween === null) {
            this.generatedTween = this.createFunction()
        }

        return this.generatedTween.updateAndGetOverflow(dt)
    }

    isDone(): boolean {
        if (this.generatedTween === null) {
            return false
        } else {
            return this.generatedTween.isDone()
        }
    }

    reset(): void {
        this.generatedTween = null
    }

}

abstract class InstantBehaviorTween implements ITween {
    private hasExecutedBehavior: boolean;

    updateAndGetOverflow(dt: number): number {
        if (!this.hasExecutedBehavior) {
            this.behavior()
            this.hasExecutedBehavior = true;
        }
        return dt; // instant tweens overflow all of their time because they take none
    }

    isDone(): boolean {
        return true;
    }

    abstract behavior(): void

    reset(): void {
        this.hasExecutedBehavior = false
    }
}

export class CallbackTween extends InstantBehaviorTween {
    callback: () => void;

    constructor(callback: () => void) {
        super();
        this.callback = callback;
    }

    behavior(): void {
        this.callback()
    }
}

export class WaitUntilTween extends ConditionTween {
    callback: () => boolean;

    constructor(callback: () => boolean) {
        super();
        this.callback = callback;
    }

    condition(): boolean {
        return this.callback()
    }
}

export class MultiplexTween implements ITween {
    private readonly contents: ITween[] = []

    updateAndGetOverflow(dt: number): number {
        let totalOverflow = 0
        for (let tween of this.contents) {
            let overflow = tween.updateAndGetOverflow(dt)
            if (totalOverflow === 0) {
                totalOverflow = overflow
            } else {
                totalOverflow = Math.min(totalOverflow, overflow)
            }
        }

        return totalOverflow
    }

    isDone(): boolean {
        for (let tween of this.contents) {
            if (!tween.isDone()) {
                return false
            }
        }
        return true
    }

    addChannel(tween: ITween) {
        this.contents.push(tween)
        return this
    }

    reset(): void {
        for (let tween of this.contents) {
            tween.reset()
        }
    }
}

export class Tween<T> implements ITween {
    duration: number;
    currentTime: number;
    tweenable: Tweenable<T>;
    startingValue: T;
    targetValue: T;
    easeFuncion: EaseFunction;

    constructor(tweenable: Tweenable<T>, targetValue: T, duration: number, easeFuncion: EaseFunction) {
        this.currentTime = 0
        this.startingValue = tweenable.get()
        this.tweenable = tweenable
        this.duration = duration
        this.targetValue = targetValue
        this.easeFuncion = easeFuncion
    }

    percent() {
        if (this.duration == 0) {
            return 1
        }

        return this.currentTime / this.duration
    }

    updateAndGetOverflow(dt: number) {
        if (this.currentTime == 0) {
            // this is our first update, acquire the "new" starting value (if it changed)
            this.startingValue = this.tweenable.get()
        }

        if (this.isDone()) {
            return dt
        }

        let overflow = 0
        this.currentTime += dt

        if (this.currentTime > this.duration) {
            overflow = this.currentTime - this.duration
            this.currentTime = this.duration
        }

        this.apply()
        return overflow
    }

    private apply() {
        this.tweenable.set(this.tweenable.lerpFunction(this.startingValue, this.targetValue, this.easeFuncion(this.percent())))
    }

    isDone() {
        return this.percent() >= 1
    }

    reset() {
        this.currentTime = 0
        this.apply()
    }

    skip() {
        this.currentTime = this.duration
        this.apply()
    }
}

export class TweenChain implements ITween {
    private readonly chain: ITween[] = []
    private currentChainIndex = 0

    isDone(): boolean {
        return this.currentChainIndex >= this.chain.length
    }

    reset() {
        this.currentChainIndex = 0
        for (let tween of this.chain) {
            tween.reset()
        }
    }

    clear() {
        this.currentChainIndex = 0
        this.chain.splice(0, this.chain.length)
    }

    updateAndGetOverflow(dt: number): number {
        if (this.isDone()) {
            return 0
        }
        const currentItem = this.currentChainItem()
        let overflow = currentItem.updateAndGetOverflow(dt)

        if (currentItem.isDone()) {
            this.currentChainIndex++
            this.updateAndGetOverflow(overflow)
        }

        return 0
    }

    update(dt: number) {
        // update and throw away overflow result (client code doesn't care)
        this.updateAndGetOverflow(dt)
    }

    add(tween: ITween) {
        this.chain.push(tween)
        return this
    }

    addNumberTween(tweenable: TweenableNumber, targetValue: number, duration: number, easeFunction: EaseFunction): TweenChain {
        return this.add(new Tween<number>(tweenable, targetValue, duration, easeFunction))

    }

    addPointTween(tweenable: TweenablePoint, targetValue: Point, duration: number, easeFunction: EaseFunction): TweenChain {
        return this.add(new Tween<Point>(tweenable, targetValue, duration, easeFunction))
    }

    isEmpty(): boolean {
        return this.chain.length == 0
    }

    private currentChainItem() {
        if (this.chain.length > this.currentChainIndex) {
            return this.chain[this.currentChainIndex]
        }
        return null
    }
}

export class Tweenable<T> {
    readonly lerpFunction: LerpFunction<T>;
    getter: () => T;
    setter: (value: T) => void;

    constructor(getter: () => T, setter: (value: T) => void, lerpFunction: LerpFunction<T>) {
        this.getter = getter;
        this.setter = setter;
        this.lerpFunction = lerpFunction
    }

    set(newValue: T) {
        this.setter(newValue)
    }

    get(): T {
        return this.getter()
    }
}

function numberLerp(start: number, end: number, percent: number) {
    return start + (end - start) * percent
}

type IClonable = { clone: () => IClonable }

export class TweenableNumber extends Tweenable<number>{
    constructor(getter: () => number, setter: (value: number) => void) {
        super(getter, setter, numberLerp)
    }

    static FromConstant(n: number) {
        let data = { n }
        return new TweenableNumber(() => data.n, v => data.n = v)
    }
}

// WaitSeconds is just a NumberTween that throws away its stored value
export class WaitSecondsTween extends Tween<number> {
    private static dummy = TweenableNumber.FromConstant(0);
    constructor(duration: number) {
        super(WaitSecondsTween.dummy, 0, duration, EaseFunctions.linear)
    }
}

// Tweenable of an object with a `.clone()` function
export abstract class TweenableClonable<T> extends Tweenable<T>{
    constructor(getter: () => T, setter: (value: T) => void, lerpFunction: LerpFunction<T>) {

        const newGetter = () => {
            const dangerousCast = getter() as unknown as IClonable
            // @ts-ignore - i don't know how to get the language to cooperate
            return dangerousCast.clone()
        }

        // @ts-ignore - i don't know how to get the language to cooperate
        super(newGetter as () => T, setter, lerpFunction)
    }
}

function pointLerp(start: IPointData, end: IPointData, percent: number) { return new Point(numberLerp(start.x, end.x, percent), numberLerp(start.y, end.y, percent)) }

export class TweenablePoint extends TweenableClonable<Point> {
    constructor(getter: () => Point, setter: (value: Point) => void) {
        super(getter, setter, pointLerp)
    }

    static FromConstant(point: Point) {
        return new TweenablePoint(() => point, v => point = v)
    }
}