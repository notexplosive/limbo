import { Point } from 'pixi.js';
import { Tween, TweenableNumber, EaseFunctions, Tweenable, SequenceTween, TweenablePoint, CallbackTween, WaitUntilTween, MultiplexTween, WaitSecondsTween } from '../data/tween';

describe("tweens", () => {
    test("lerps accurately from 0 to 100", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let tween = new Tween<number>(tweenable, 100, 1, EaseFunctions.linear);

        tween.updateAndGetOverflow(0.25)

        expect(tween.currentTime).toBe(0.25)
        expect(tweenable.get()).toBe(25)
    });

    test("lerps accurately from 50 to 100", () => {
        let tweenable = TweenableNumber.FromConstant(50);
        let tween = new Tween<number>(tweenable, 100, 1, EaseFunctions.linear);

        tween.updateAndGetOverflow(0.5)

        expect(tween.currentTime).toBe(0.5)
        expect(tweenable.get()).toBe(75)
    });

    test("tween that takes longer than a second", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let tween = new Tween<number>(tweenable, 100, 100, EaseFunctions.linear);

        tween.updateAndGetOverflow(20)

        expect(tweenable.get()).toBe(20)
    });

    test("tween that takes multiple updates", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let tween = new Tween<number>(tweenable, 100, 100, EaseFunctions.linear);

        tween.updateAndGetOverflow(20)
        tween.updateAndGetOverflow(10)

        expect(tween.currentTime).toBe(30)
        expect(tweenable.get()).toBe(30)
    });

    test("tweenable copies its starting value", () => {
        let sourcePoint = new Point(0, 0)
        let tweenable = new TweenablePoint(() => sourcePoint, v => sourcePoint = v);
        let tween = new Tween<Point>(tweenable, new Point(100, 100), 100, EaseFunctions.linear);

        tween.updateAndGetOverflow(20)
        sourcePoint.x = -10

        expect(tween.startingValue).toMatchObject(new Point(0, 0))
    });

    test("zero-time delay tween is done instantly", () => {
        let tween = new WaitSecondsTween(0)

        tween.updateAndGetOverflow(0.5)

        expect(tween.isDone()).toBe(true)
    });

    test("tweens do not call setter when updated after finish", () => {
        let source = { x: 0 }
        let tweenable = new TweenableNumber(() => source.x, v => source.x = v);
        let tween = new Tween<number>(tweenable, 50, 1, EaseFunctions.linear);

        tween.updateAndGetOverflow(1)
        source.x = 60
        let overflowAfterFinish = tween.updateAndGetOverflow(1)

        expect(overflowAfterFinish).toBe(1)
        expect(source.x).toBe(60)
    });
});

describe("multiplex", () => {
    test("multiplex tween increments both child tweens", () => {
        let tweenable1 = TweenableNumber.FromConstant(0);
        let tweenable2 = TweenableNumber.FromConstant(0);
        let tween1 = new Tween<number>(tweenable1, 100, 1, EaseFunctions.linear);
        let tween2 = new Tween<number>(tweenable2, 200, 1, EaseFunctions.linear);
        let tween = new MultiplexTween()
            .addChannel(tween1)
            .addChannel(tween2)

        tween.updateAndGetOverflow(0.5)

        expect(tweenable1.get()).toBe(50)
        expect(tweenable2.get()).toBe(100)
    });

    test("multiplex tween continues when one tween is done", () => {
        let tweenable1 = TweenableNumber.FromConstant(0);
        let tweenable2 = TweenableNumber.FromConstant(0);
        let tween1 = new Tween<number>(tweenable1, 100, 0.25, EaseFunctions.linear);
        let tween2 = new Tween<number>(tweenable2, 100, 1, EaseFunctions.linear);
        let tween = new MultiplexTween()
            .addChannel(tween1)
            .addChannel(tween2)

        tween.updateAndGetOverflow(0.5)

        expect(tweenable1.get()).toBe(100)
        expect(tweenable2.get()).toBe(50)
    });

    test("multiplex tween repoorts correct overflow", () => {
        let tweenable1 = TweenableNumber.FromConstant(0);
        let tweenable2 = TweenableNumber.FromConstant(0);
        let tween1 = new Tween<number>(tweenable1, 100, 0.25, EaseFunctions.linear);
        let tween2 = new Tween<number>(tweenable2, 200, 1, EaseFunctions.linear);
        let tween = new MultiplexTween()
            .addChannel(tween1)
            .addChannel(tween2)

        let overflow = tween.updateAndGetOverflow(1.2)

        expect(overflow).toBeCloseTo(0.2)
    });

    test("multiplex tween only fires callback once when stalled", () => {
        let hit = 0
        let tweenable1 = TweenableNumber.FromConstant(0);
        let tweenable2 = TweenableNumber.FromConstant(0);
        let tween1 = new CallbackTween(() => { hit++ })
        let tween2 = new Tween<number>(tweenable2, 200, 1, EaseFunctions.linear);
        let tween = new MultiplexTween()
            .addChannel(tween1)
            .addChannel(tween2)

        tween.updateAndGetOverflow(0.2)
        tween.updateAndGetOverflow(0.2)
        tween.updateAndGetOverflow(0.2)
        tween.updateAndGetOverflow(0.2)

        expect(hit).toBe(1)
    });

    test("multiplex tween reports correct duration", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let tween = new MultiplexTween()
            .addChannel(new Tween(tweenable, 0, 5, EaseFunctions.linear))
            .addChannel(new Tween(tweenable, 0, 1, EaseFunctions.linear))
            .addChannel(new Tween(tweenable, 0, 3, EaseFunctions.linear))

        expect(tween.getDuration()).toBe(5)
    });
})

describe("tween chains", () => {
    test("work with just one item", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        chain.add(new Tween<number>(tweenable, 100, 1, EaseFunctions.linear))

        chain.updateAndGetOverflow(0.25)

        expect(tweenable.get()).toBe(25)
    });

    test("transition to next item", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        chain.add(new Tween<number>(tweenable, 100, 0.5, EaseFunctions.linear))
        chain.add(new Tween<number>(tweenable, 120, 1, EaseFunctions.linear))

        chain.updateAndGetOverflow(0.75)

        expect(tweenable.get()).toBe(105)
    });

    test("helper functions for number tweens", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        chain.add(new Tween(tweenable, 100, 1, EaseFunctions.linear))

        chain.update(0.25)

        expect(tweenable.get()).toBe(25)
    });

    test("helper functions for point tweens", () => {
        let tweenable = TweenablePoint.FromConstant(new Point(0, 0));
        let chain = new SequenceTween()
        chain.add(new Tween(tweenable, new Point(100, 100), 1, EaseFunctions.linear))

        chain.update(0.25)

        expect(tweenable.get()).toMatchObject(new Point(25, 25))
    });

    test("callback tweens work", () => {
        let tweenable = TweenablePoint.FromConstant(new Point(0, 0));
        let chain = new SequenceTween()
        let hit = 0
        chain.add(new Tween(tweenable, new Point(100, 100), 0.5, EaseFunctions.linear))
        chain.add(new CallbackTween(() => { hit++ }))
        chain.add(new CallbackTween(() => { hit++ }))
        chain.add(new CallbackTween(() => { hit++ }))

        chain.update(0.6)

        expect(hit).toBe(3)
    });

    test("wait-until should not continue when blocked", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        let blocked = true
        chain.add(new Tween(tweenable, 100, 0.5, EaseFunctions.linear))
        chain.add(new WaitUntilTween(() => !blocked))
        chain.add(new Tween(tweenable, 0, 0.05, EaseFunctions.linear))

        chain.update(0.6)

        expect(tweenable.getter()).toBe(100)
    });

    test("wait-until should continue when not blocked", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        let blocked = true
        chain.add(new Tween(tweenable, 100, 0.5, EaseFunctions.linear))
        chain.add(new WaitUntilTween(() => !blocked))
        chain.add(new Tween(tweenable, 0, 0.05, EaseFunctions.linear))

        chain.update(0.3)
        blocked = false
        chain.update(0.3)

        expect(tweenable.getter()).toBe(0)
    });

    test("adding to a chain after its finished continues the chain", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        chain.add(new Tween(tweenable, 100, 1, EaseFunctions.linear))

        chain.update(1.2)
        chain.update(1)
        chain.add(new Tween(tweenable, 120, 1, EaseFunctions.linear))
        chain.update(0.5)

        expect(tweenable.getter()).toBe(110)
    })

    test("reset should not set the value", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        chain.add(new Tween(tweenable, 100, 1, EaseFunctions.linear))
        chain.add(new Tween(tweenable, 120, 1, EaseFunctions.linear))

        chain.update(1.5)
        chain.reset()

        expect(tweenable.getter()).toBe(110)
    })

    test("reset and re-update should not teleport back to original start", () => {
        let tweenable = TweenableNumber.FromConstant(0);
        let chain = new SequenceTween()
        chain.add(new Tween(tweenable, 100, 1, EaseFunctions.linear))
        chain.add(new Tween(tweenable, 120, 1, EaseFunctions.linear))

        chain.update(1.5)
        chain.reset()
        chain.update(0)

        expect(tweenable.getter()).toBe(110)
    })
});

describe("jump to tween time", () => {
    test("jump within single tween", () => {
        let tweenable = TweenableNumber.FromConstant(0);

        let tween = new Tween(tweenable, 100, 1, EaseFunctions.linear)

        tween.jumpTo(0.3)
        expect(tweenable.get()).toBe(30)

        tween.jumpTo(0)
        expect(tweenable.get()).toBe(0)

        tween.jumpTo(0.6)
        expect(tweenable.get()).toBe(60)
    })

    test("jump within single tween in a tween chain", () => {
        let tweenable = TweenableNumber.FromConstant(0);

        let tween = new SequenceTween()
            // You need to supply a callbackTween that sets the initial position for jumpTo to work correctly
            .add(new CallbackTween(() => { tweenable.set(0) }))
            .add(new Tween(tweenable, 100, 1, EaseFunctions.linear))

        tween.jumpTo(0.3)
        expect(tweenable.get()).toBeCloseTo(30)

        tween.jumpTo(0)
        expect(tweenable.get()).toBeCloseTo(0)

        tween.jumpTo(0.6)
        expect(tweenable.get()).toBeCloseTo(60)
    })

    test("jump across a tween chain", () => {
        let tweenable_a = TweenableNumber.FromConstant(0);
        let tweenable_b = TweenableNumber.FromConstant(0);
        let tweenable_c = TweenableNumber.FromConstant(0);

        let tween = new SequenceTween()
            .add(new Tween(tweenable_a, 100, 1, EaseFunctions.linear))
            .add(new Tween(tweenable_b, 200, 1, EaseFunctions.linear))
            .add(new Tween(tweenable_c, 400, 1, EaseFunctions.linear))

        tween.jumpTo(0.5)
        tween.jumpTo(1.1)
        expect(tweenable_a.get()).toBe(100)
        expect(tweenable_b.get()).toBeCloseTo(20)
    })

    test("random access tween", () => {
        let radius = 1
        let duration = 1
        // start on the right
        let tweenableX = TweenableNumber.FromConstant(radius)
        let tweenableY = TweenableNumber.FromConstant(0)

        // tween that represents a circular pattern, starts at the same spot where it ends

        let tween = new SequenceTween()
            .add(new CallbackTween(() => {
                // setup starting values so the loop works
                tweenableX.set(radius)
                tweenableY.set(0)
            }))

            // right -> bottom
            .add(new MultiplexTween()
                .addChannel(new Tween(tweenableX, 0, duration, EaseFunctions.sineSlowFast))
                .addChannel(new Tween(tweenableY, radius, duration, EaseFunctions.sineFastSlow)))

            // bottom -> left
            .add(new MultiplexTween()
                .addChannel(new Tween(tweenableX, -radius, duration, EaseFunctions.sineFastSlow))
                .addChannel(new Tween(tweenableY, 0, duration, EaseFunctions.sineSlowFast)))

            // left -> top
            .add(new MultiplexTween()
                .addChannel(new Tween(tweenableX, 0, duration, EaseFunctions.sineSlowFast))
                .addChannel(new Tween(tweenableY, -radius, duration, EaseFunctions.sineFastSlow)))

            // top -> right
            .add(new MultiplexTween()
                .addChannel(new Tween(tweenableX, radius, duration, EaseFunctions.sineFastSlow))
                .addChannel(new Tween(tweenableY, 0, duration, EaseFunctions.sineSlowFast)))

        // linear access
        tween.jumpTo(1)
        expect(tweenableX.get()).toBeCloseTo(0)
        expect(tweenableY.get()).toBeCloseTo(radius)

        tween.jumpTo(2)
        expect(tweenableX.get()).toBeCloseTo(-radius)
        expect(tweenableY.get()).toBeCloseTo(0)

        tween.jumpTo(3)
        expect(tweenableX.get()).toBeCloseTo(0)
        expect(tweenableY.get()).toBeCloseTo(-radius)

        tween.jumpTo(4)
        expect(tweenableX.get()).toBeCloseTo(radius)
        expect(tweenableY.get()).toBeCloseTo(0)

        // random access //

        // baseline of a circle to compare to
        function realCircle(time: number) {
            let radians = Math.PI * 2 / 4 * time

            return { x: Math.cos(radians), y: Math.sin(radians) }
        }

        // although normally I don't like randomness in test cases, I did say "random" access, didn't I?
        for (let i = 0; i < 100; i++) {
            let targetVal = Math.random() * 4

            tween.jumpTo(targetVal)
            expect(tweenableX.get()).toBeCloseTo(realCircle(targetVal).x)
            expect(tweenableY.get()).toBeCloseTo(realCircle(targetVal).y)
        }
    })
});