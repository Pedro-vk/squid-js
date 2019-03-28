import { assert } from "chai"

import { config } from "../config"

import { generateMetadata } from "../utils"

import { Ocean, Account, DDO } from "../../src" // @oceanprotocol/squid

describe("Search Asset", () => {
    let ocean: Ocean

    let publisher: Account

    const testHash = Math.random().toString(36).substr(2)
    const metadataGenerator = (name: string) => generateMetadata(`${name}${testHash}`)

    let test1length
    let test2length
    let test3length

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.accounts.list())[0]
        publisher.setPassword(process.env.ACCOUNT_PASSWORD)
    })

    it("should be able to search the assets", async () => {
        const ddos: DDO[] = await ocean.assets.search(`Test1${testHash}`)

        assert.isArray(ddos, "A search should return an array")

        test1length = ddos.length
        test2length = (await ocean.assets.search(`Test2${testHash}`)).length
        test3length = (await ocean.assets.search(`Test3${testHash}`)).length
    })

    it("should regiester some a asset", async () => {
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test1") as any, publisher), DDO)
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test2") as any, publisher), DDO)
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test2") as any, publisher), DDO)
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test3") as any, publisher), DDO)
    })

    it("should search by text and see the increment of DDOs", async () => {
        assert.equal((await ocean.assets.search(`Test2${testHash}`)).length - test2length, 2, "Something was wrong searching the assets")
        assert.equal((await ocean.assets.search(`Test3${testHash}`)).length - test3length, 1, "Something was wrong searching the assets")
    })

    it("should return a list of DDOs", async () => {
        const ddos: DDO[] = await ocean.assets.search(`Test1${testHash}`)

        assert.equal(ddos.length - test1length, 1, "Something was wrong searching the assets")
        ddos.map((ddo) => assert.instanceOf(ddo, DDO, "The DDO is not an instance of a DDO"))
    })

    it("should be able to do a query to get a list of DDOs", async () => {
        const ddos: DDO[] = await ocean.assets.query({
            page: 0,
            offset: 1,
            query: {
                text: `Test2${testHash}`,
            },
            sort: {
                text: 1,
            },
        })

        assert.equal(ddos.length, 1, "Something was wrong searching the assets")
        ddos.map((ddo) => assert.instanceOf(ddo, DDO, "The DDO is not an instance of a DDO"))
    })
})
