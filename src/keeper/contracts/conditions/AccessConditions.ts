import {Receipt} from "web3-utils"
import ContractBase from "../ContractBase"

export default class AccessConditions extends ContractBase {

    public static async getInstance(): Promise<AccessConditions> {
        const accessConditions: AccessConditions = new AccessConditions("AccessConditions")
        await accessConditions.init()
        return accessConditions
    }

    public async grantAccess(serviceAgreementId: any, assetId: any, documentKeyId: any, publisherAddress: string)
        : Promise<Receipt> {
        return this.send("grantAccess", publisherAddress, [
            serviceAgreementId, "0x" + assetId, "0x" + documentKeyId,
        ])
    }
}
