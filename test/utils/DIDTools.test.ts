import * as assert from "assert"
import * as didTools from "../../src/utils/DIDTools"

import * as Web3 from "web3"

describe("DIDTools Tests", () => {

    describe("did generate", () => {

        it("should generate a valid DID", async () => {

            const testId = Web3.utils.randomHex(32) + "abcdefghijklmnopqrstuvwxyz"
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId

            const did = didTools.didGenerate(testId)
            assert(did)
            assert(did.match(/did:op:[a-h0-9]+/))
            assert(did === validDID)

        })

        it("should parse a valid DID", async () => {
            const testId = Web3.utils.randomHex(32) + "abcdefghijklmnopqrstuvwxyz"
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            const result = didTools.didParse(validDID + "/testpath#fragment")
            assert(result)
            assert(result.method === testMethod)
            assert(result.id === testId)
            assert(result.path === "/testpath")
            assert(result.fragment === "#fragment")
        })

        it("should parse a valid Ocean DID", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            const result = didTools.didParse(validDID + "/testpath#fragment")
            assert(result)
            assert(result.method === testMethod)
            assert(result.id === testId)
            assert(result.path === "/testpath")
            assert(result.fragment === "#fragment")
            assert(result.idHex === testId)

        })

        it("should validate an Ocean DID", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            assert(didTools.isDIDValid(validDID))
            assert(!didTools.isDIDValid(validDID + "abcdef"))
        })

        it("should convert an Ocean Id to an Ocean DID", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            assert(didTools.idToDID(testId) === validDID)
            assert(didTools.idToDID("0x" + testId) === validDID)
            assert(didTools.idToDID("0x00") === "0")
            assert(didTools.idToDID("00") === "0")
        })

        it("should convert an Ocean DID to an Ocean id", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            assert(didTools.didToId(validDID) === testId)
        })

        it("should convert an Ocean DID to an array of bytes", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const byteId = Web3.utils.hexToBytes("0x" + testId)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            const bufferTest = Buffer.from(didTools.didToIdBytes(validDID))
            const bufferValid = Buffer.from(byteId)
            assert(Buffer.compare(bufferTest, bufferValid) === 0 )
        })

    })

})