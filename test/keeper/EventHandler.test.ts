import { assert, expect, spy, use } from "chai"
import * as spies from "chai-spies"
import { EventHandler } from "../../src/keeper/EventHandler"
import { Ocean } from "../../src/ocean/Ocean"
import config from "../config"

use(spies)

describe("EventHandler", () => {

    let ocean: Ocean
    let eventHandler: EventHandler

    before(async () => {
        ocean = await Ocean.getInstance(config)
        eventHandler = new EventHandler((<any>ocean).instanceConfig)
    })

    afterEach(() => {
        spy.restore()
    })

    describe("#subscribe()", () => {
        it("should subscribe to an event", async () => {
            const countBefore = eventHandler.count

            const subscription = eventHandler.subscribe(() => {})
            assert.isDefined(subscription)

            const countAfter = eventHandler.count
            assert.equal(countBefore + 1, countAfter, "The event seems not added.")

            try {
                // Not important in this test
                subscription.unsubscribe()
            } catch(e) { }
        })

        it("should unsubscribe using the subscription", async () => {
            const countBefore = eventHandler.count

            const subscription = eventHandler.subscribe(() => {})
            assert.isDefined(subscription)

            subscription.unsubscribe()

            const countAfter = eventHandler.count
            assert.equal(countBefore, countAfter, "The event seems not added.")
        })
    })

    describe("#unsubscribe()", () => {
        it("should unsubscribe from an event", async () => {
            const countBefore = eventHandler.count
            const callback = () => {}

            eventHandler.subscribe(callback)
            eventHandler.unsubscribe(callback)

            const countAfter = eventHandler.count
            assert.equal(countBefore, countAfter, "The event seems not removed.")
        })
    })

    describe("#checkBlock()", () => {
        it("should call the callback on each new block", async () => {
            let blockNumber = 100000000000
            const callbackSpy = spy()

            spy.on((ocean as any).web3.eth, "getBlockNumber", () => blockNumber)

            const subscription = eventHandler.subscribe(callbackSpy)

            await new Promise(_ => setTimeout(_, 300))

            expect(callbackSpy).not.to.has.been.called()
            blockNumber++

            await new Promise(_ => setTimeout(_, 300))

            expect(callbackSpy).to.has.been.called.with(blockNumber)

            try {
                // Not important in this test
                subscription.unsubscribe()
            } catch(e) { }
        })
    })
})