import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import DIDRegistry from "../../src/keeper/contracts/DIDRegistry"
import Web3Provider from "../../src/keeper/Web3Provider"
import ValueType from "../../src/models/ValueType"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import Logger from "../../src/utils/Logger"
import config from "../config"

let ocean: Ocean
let didRegistry: DIDRegistry

describe("DIDRegistry", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        didRegistry = await DIDRegistry.getInstance()
    })

    describe("#registerAttribute()", () => {

        it("should register an attribute in a new did", async () => {
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const did = IdGenerator.generateId()
            const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")
            const data = "my nice provider, is nice"
            const receipt = await didRegistry.registerAttribute(did, ValueType.DID, providerKey,
                data, ownerAccount.getId())
            assert(receipt.status)
            assert(receipt.events.DIDAttributeRegistered)
        })

        it("should register another attribute in the same did", async () => {
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const did = IdGenerator.generateId()
            {
                // register the first attribute
                const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")
                const data = "my nice provider, is nice"
                await didRegistry.registerAttribute(did, ValueType.DID, providerKey,
                    data, ownerAccount.getId())
            }
            {
                // register the second attribute with the same did
                const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider2")
                const data = "asdsad"
                const receipt = await didRegistry.registerAttribute(did, ValueType.DID, providerKey,
                    data, ownerAccount.getId())
                assert(receipt.status)
                assert(receipt.events.DIDAttributeRegistered)
            }
        })

    })

    describe("#getOwner()", () => {

        it("should get the owner of a did properly", async () => {
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const did = IdGenerator.generateId()
            const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")
            const data = "my nice provider, is nice"
            await didRegistry.registerAttribute(did, ValueType.DID, providerKey,
                data, ownerAccount.getId())

            const owner = await didRegistry.getOwner(did)

            assert(owner === ownerAccount.getId(), `Got ${owner} but expected ${ownerAccount.getId()}`)
        })

        it("should get 0x00.. for a not registered did", async () => {
            const owner = await didRegistry.getOwner("1234")
            assert(owner === "0x0000000000000000000000000000000000000000")
        })

    })

    describe("#getUpdateAt()", () => {

        it("should the block number of the last update of the did attribute", async () => {
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const did = IdGenerator.generateId()
            const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")
            const data = "my nice provider, is nice"
            await didRegistry.registerAttribute(did, ValueType.DID, providerKey,
                data, ownerAccount.getId())

            const updatedAt: number = await didRegistry.getUpdateAt(did)

            assert(updatedAt > 0)
            Logger.log(typeof updatedAt)
        })

    })

})
