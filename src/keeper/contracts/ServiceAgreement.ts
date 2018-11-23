import {Receipt} from "web3-utils"
import MethodReflection from "../../models/MethodReflection"
import ContractBase from "./ContractBase"

export default class ServiceAgreement extends ContractBase {

    public static async getInstance(): Promise<ServiceAgreement> {
        const serviceAgreement: ServiceAgreement = new ServiceAgreement("ServiceAgreement")
        await serviceAgreement.init()
        return serviceAgreement
    }

    public async setupAgreementTemplate(templateId: string,
                                        methodReflections: MethodReflection[],
                                        dependencyMatrix: number[],
                                        name: any,
                                        fulfillmentIndices: number[],
                                        fulfillmentOperator: number,
                                        ownerAddress: string): Promise<Receipt> {

        return this.send("setupAgreementTemplate", ownerAddress, [
            templateId, methodReflections.map((r) => r.address),
            methodReflections.map((r) => r.signature), dependencyMatrix, name, fulfillmentIndices,
            fulfillmentOperator,
        ])
    }

    public async getTemplateStatus(templateId: string) {

        return this.call("getTemplateStatus", [templateId])
    }

    public async getTemplateOwner(templateId: string) {

        return this.call("getTemplateOwner", [templateId])
    }

    public async getAgreementStatus(serviceDefinitionId: string) {

        return this.call("getAgreementStatus", [serviceDefinitionId])
    }

    public async executeAgreement(serviceAgreementTemplateId: string, serviceAgreementSignatureHash: string,
                                  consumerAddress: string, valueHashes: string[], timeoutValues: number[],
                                  serviceAgreementId: string, did: string, publisherAddress: string):
        Promise<Receipt> {

        return this.send("executeAgreement", publisherAddress, [
            serviceAgreementTemplateId, serviceAgreementSignatureHash, consumerAddress, valueHashes,
            timeoutValues, serviceAgreementId, "0x" + did.replace("did:op:", ""),
        ])
    }
}
