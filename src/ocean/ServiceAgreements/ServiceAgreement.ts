import { ServiceAgreementTemplateCondition } from "../../ddo/ServiceAgreementTemplate"
import { DDO } from "../../ddo/DDO"
import { ServiceAccess } from "../../ddo/Service"
import Web3Provider from "../../keeper/Web3Provider"
import ValuePair from "../../models/ValuePair"
import Logger from "../../utils/Logger"
import Account from "../Account"
import { signText, zeroX } from "../../utils"


// TODO: move this class to helpers, it only contains pure functions
export default class ServiceAgreement {

    public static async signServiceAgreement(
        ddo: DDO,
        serviceDefinitionId: string,
        serviceAgreementId: string,
        agreementConditionsIds: string[],
        consumer: Account,
    ): Promise<string> {

        const service = ddo.findServiceById<"Access">(serviceDefinitionId)
        const timelockValues: number[] = ServiceAgreement.getTimeValuesFromService(service, "timelock")
        const timeoutValues: number[] = ServiceAgreement.getTimeValuesFromService(service, "timeout")

        if (!service.templateId) {
            throw new Error("TemplateId not found in DDO.")
        }

        const serviceAgreementHashSignature = await ServiceAgreement.createHashSignature(
            service.templateId,
            serviceAgreementId,
            agreementConditionsIds,
            timelockValues,
            timeoutValues,
            consumer,
        )

        Logger.log("SA hash signature:", serviceAgreementHashSignature)

        return serviceAgreementHashSignature
    }

    public static async createHashSignature(
        templateId: string,
        serviceAgreementId: string,
        valueHashes: string[],
        timelockValues: number[],
        timeoutValues: number[],
        consumer: Account,
    ): Promise<string> {

        const serviceAgreementHash = ServiceAgreement.hashServiceAgreement(
            templateId,
            serviceAgreementId,
            valueHashes,
            timelockValues,
            timeoutValues,
        )

        let serviceAgreementHashSignature = await signText(serviceAgreementHash, consumer.getId(), consumer.getPassword())

        return serviceAgreementHashSignature
    }

    public static hashServiceAgreement(
        serviceAgreementTemplateId: string,
        serviceAgreementId: string,
        valueHashes: string[],
        timelocks: number[],
        timeouts: number[],
    ): string {

        const args = [
            {type: "address", value: zeroX(serviceAgreementTemplateId)},
            {type: "bytes32[]", value: valueHashes.map(zeroX)},
            {type: "uint256[]", value: timelocks},
            {type: "uint256[]", value: timeouts},
            {type: "bytes32", value: zeroX(serviceAgreementId)},
        ]

        return (Web3Provider as any).getWeb3().utils.soliditySha3(...args).toString("hex")
    }

    private static getTimeValuesFromService(service: ServiceAccess, type: "timeout" | "timelock"): number[] {
        const timeoutValues: number[] = service.serviceAgreementTemplate.conditions
            .map((condition: ServiceAgreementTemplateCondition) => condition[type])

        return timeoutValues
    }
}
