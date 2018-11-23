import DDO from "../ddo/DDO"
import MetaData from "../ddo/MetaData"
import MetaDataBase from "../ddo/MetaDataBase"
import Service from "../ddo/Service"
import {Account, Logger, Ocean, ServiceAgreement} from "../squid"

(async () => {
    const ocean: Ocean = await Ocean.getInstance({
        nodeUri: "http://localhost:8545",
        aquariusUri: "http://localhost:5000",
        brizoUri: "http://localhost:8030",
        parityUri: "http://localhost:9545",
        secretStoreUri: "http://localhost:12001",
        threshold: 0,
        password: "unittest",
        address: "0xed243adfb84a6626eba46178ccb567481c6e655d",
    })

    const publisher: Account = (await ocean.getAccounts())[0]
    const consumer: Account = (await ocean.getAccounts())[1]

    const metaData = new MetaData({
        base: {
            name: "Office Humidity",
            type: "dataset",
            description: "Weather information of UK including temperature and humidity",
            size: "3.1gb",
            dateCreated: "2012-02-01T10:55:11+00:00",
            author: "Met Office",
            license: "CC-BY",
            copyrightHolder: "Met Office",
            encoding: "UTF-8",
            compression: "zip",
            contentType: "text/csv",
            // tslint:disable-next-line
            workExample: "stationId,latitude,longitude,datetime,temperature,humidity423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
            contentUrls: [
                "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
                "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
            ],
            links: [
                {sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"},
                {sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"},
                {fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/"},
            ],
            inLanguage: "en",
            tags: "weather, uk, 2011, temperature, humidity",
            price: 10,
        } as MetaDataBase,
    } as MetaData)

    const ddo: DDO = await ocean.registerAsset(metaData, publisher)
    Logger.log("did", ddo.id)
    const assetId = ddo.id.replace("did:op:", "")

    const accessService = ddo.findServiceByType("Access")

    const serviceAgreementSignatureResult: any = await ocean.signServiceAgreement(ddo.id,
        accessService.serviceDefinitionId, consumer)
    Logger.log("ServiceAgreement Id:", serviceAgreementSignatureResult.serviceAgreementId)
    Logger.log("ServiceAgreement Signature:", serviceAgreementSignatureResult.serviceAgreementSignature)

    const service: Service = ddo.findServiceByType("Access")

    const serviceAgreement: ServiceAgreement = await ocean.executeServiceAgreement(
        ddo.id,
        service.serviceDefinitionId,
        serviceAgreementSignatureResult.serviceAgreementId,
        serviceAgreementSignatureResult.serviceAgreementSignature,
        consumer,
        publisher)
    Logger.log("ServiceAgreement Id:", serviceAgreement.getId())

    await consumer.requestTokens(metaData.base.price)

    const paid = await serviceAgreement.payAsset(assetId, metaData.base.price, consumer)
    Logger.log(`Asset paid: ${paid}`)

    const accessGranted = await serviceAgreement.grantAccess(assetId, assetId, publisher)
    Logger.log(`Asset access granted: ${accessGranted}`)
})()
