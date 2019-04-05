import { assert } from "chai"
import { Aquarius } from "../../src/aquarius/Aquarius"
import { SearchQuery } from "../../src/aquarius/Aquarius"
import { DDO } from "../../src/ddo/DDO"
import DID from "../../src/ocean/DID"
import WebServiceConnectorProvider from "../../src/utils/WebServiceConnectorProvider"
import config from "../config"
import WebServiceConnectorMock from "../mocks/WebServiceConnector.mock"

describe("Aquarius", () => {

    const aquarius: Aquarius = new Aquarius({config} as any)
    // tslint:disable-next-line
    const getResults = (results: DDO[], page = 0, total_pages = 1, total_results = 1) =>
        ({results, page, total_pages, total_results})

    describe("#queryMetadata()", () => {

        const query = {
            offset: 100,
            page: 0,
            query: {
                value: 1,
            },
            sort: {
                value: 1,
            },
            text: "Office",
        } as SearchQuery

        it("should query metadata", async () => {
            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(getResults([new DDO()])))

            const result = await aquarius.queryMetadata(query)
            assert.typeOf(result.results, "array")
            assert.lengthOf(result.results, 1)
            assert.equal(result.page, 0)
            assert.equal(result.totalPages, 1)
            assert.equal(result.totalResults, 1)
        })

        it("should query metadata and return real ddo", async () => {

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(getResults([new DDO()])))

            const result = await aquarius.queryMetadata(query)
            assert.typeOf(result.results, "array")
            assert.lengthOf(result.results, 1)
            assert.isDefined(result.results[0].findServiceById)
        })
    })

    describe("#queryMetadataByText()", () => {

        const query = {
            offset: 100,
            page: 0,
            query: {
                value: 1,
            },
            sort: {
                value: 1,
            },
            text: "Office",
        } as SearchQuery

        it("should query metadata by text", async () => {

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(getResults([new DDO()])))

            const result = await aquarius.queryMetadataByText(query)
            assert.typeOf(result.results, "array")
            assert.lengthOf(result.results, 1)
            assert.equal(result.page, 0)
            assert.equal(result.totalPages, 1)
            assert.equal(result.totalResults, 1)
        })

        it("should query metadata and return real ddo", async () => {

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(getResults([new DDO()])))

            const result = await aquarius.queryMetadataByText(query)
            assert.typeOf(result.results, "array")
            assert.lengthOf(result.results, 1)
            assert.isDefined(result.results[0].findServiceById)
        })

    })

    describe("#storeDDO()", () => {

        it("should store a ddo", async () => {

            const did: DID = DID.generate()
            const ddo: DDO = new DDO({
                id: did.getId(),
            })

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))

            const result: DDO = await aquarius.storeDDO(ddo)
            assert(result)
            assert(result.id === ddo.id)
        })
    })

    describe("#retrieveDDO()", () => {

        it("should store a ddo", async () => {

            const did: DID = DID.generate()
            const ddo: DDO = new DDO({
                id: did.getId(),
            })

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))

            const storageResult: DDO = await aquarius.storeDDO(ddo)
            assert(storageResult)

            assert(storageResult.id === did.getId())

            const restrieveResult: DDO = await aquarius.retrieveDDO(did)
            assert(restrieveResult)

            assert(restrieveResult.id === did.getId())
            assert(restrieveResult.id === storageResult.id)
        })
    })
})
