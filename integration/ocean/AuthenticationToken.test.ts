import { assert } from "chai"

import { config } from "../config"

import { Ocean, Account } from "../../src" // @oceanprotocol/squid

describe("Authentication Token", () => {
    let ocean: Ocean

    let account1: Account
    let account2: Account

    before(async () => {
        try {
            localStorage.clear()
        } catch { }

        ocean = await Ocean.getInstance(config)

        // Accounts
        const accounts = await ocean.accounts.list()
        account1 = accounts[0]
        account2 = accounts[1]
    })

    it("should generate a token", async () => {
        const token = await ocean.auth.get(account1)

        assert.match(token, /^0x[a-f0-9]{130}-[0-9]{0,14}/i)
    })

    it("should return the account that signed the token", async () => {
        const token = await ocean.auth.get(account1)

        const address = await ocean.auth.check(token)

        assert.equal(address, account1.getId())
    })

    it("should store the token for a user", async () => {
        await ocean.auth.store(account1)
    })

    it("should restore the token for a user", async () => {
        const token = await ocean.auth.restore(account1)

        assert.match(token, /^0x[a-f0-9]{130}-[0-9]{0,14}/i)
    })

    it("should return undefined when is not stored", async () => {
        const token = await ocean.auth.restore(account2)

        assert.isUndefined(token)
    })

    it("should know if the is stored", async () => {
        let acc1Stored
        let acc2Stored
        acc1Stored = await ocean.auth.isStored(account1)
        acc2Stored = await ocean.auth.isStored(account2)

        assert.isTrue(acc1Stored)
        assert.isFalse(acc2Stored)

        await ocean.auth.store(account2)

        acc2Stored = await ocean.auth.isStored(account2)
        assert.isTrue(acc2Stored)
    })
})
