import DDOCondition from "../../ddo/Condition"
import Dependency from "../../ddo/Dependency"
import Event from "../../ddo/Event"
import EventHandlers from "../../ddo/EventHandlers"
import MetaData from "../../ddo/MetaData"
import Parameter from "../../ddo/Parameter"
import ContractReflector from "../../keeper/ContractReflector"
import Keeper from "../../keeper/Keeper"
import Web3Provider from "../../keeper/Web3Provider"
import MethodReflection from "../../models/MethodReflection"
import ValuePair from "../../models/ValuePair"
import Logger from "../../utils/Logger"
import Account from "../Account"
import OceanBase from "../OceanBase"
import Condition from "./Condition"
import Method from "./Method"
import TemplateBase from "./Templates/TemplateBase"

export default class ServiceAgreementTemplate extends OceanBase {

    private static generateConditionsKey(serviceAgreementTemplateId: string,
                                         methodReflection: MethodReflection): string {
        const values = [
            {type: "bytes32", value: serviceAgreementTemplateId} as ValuePair,
            {type: "address", value: methodReflection.address} as ValuePair,
            {type: "bytes4", value: methodReflection.signature} as ValuePair,
        ]
        return Web3Provider.getWeb3().utils.soliditySha3(...values).toString("hex")
    }

    public constructor(private template: TemplateBase) {
        super(template.id)
    }

    public async register(templateOwnerAddress: string)
        : Promise<boolean> {

        const dependencyMatrix: number[] =
            await Promise.all(this.template.Methods.map(async (method: Method) => {
                return this.compressDependencies(method.dependencies, method.dependencyTimeoutFlags)
            }))

        const fulfillmentIndices: number[] = this.template.Methods
            .map((method: Method, i: number) => method.isTerminalCondition ? i : null)
            .filter((index: number) => index !== null)

        const {serviceAgreement} = await Keeper.getInstance()

        const owner = await this.getOwner()

        if (owner.getId() === templateOwnerAddress) {
            // tslint:disable-next-line
            Logger.error(`Template with id "${this.template.id}" is already registered to your account "${templateOwnerAddress}".`)
            return false
        }

        if (!owner.getId().startsWith("0x0")) {
            Logger.error(`Template with id "${this.template.id}" already registered by someone else.`)
            return false
        }

        const receipt = await serviceAgreement
            .setupAgreementTemplate(
                this.template.id,
                await this.getMethodReflections(),
                dependencyMatrix,
                Web3Provider.getWeb3().utils.fromAscii(this.template.templateName),
                fulfillmentIndices,
                this.template.fulfillmentOperator,
                templateOwnerAddress)

        const {serviceTemplateId, provider} = receipt.events.SetupAgreementTemplate.returnValues

        if (serviceTemplateId !== this.template.id) {
            // tslint:disable-next-line
            throw new Error(`TemplateId missmatch on ${this.template.templateName}! Should be "${this.template.id}" but is ${serviceTemplateId}`)
        }

        if (provider !== templateOwnerAddress) {
            // tslint:disable-next-line
            throw new Error(`Template owner missmatch on ${this.template.templateName}! Should be "${templateOwnerAddress}" but is ${provider}`)
        }

        if (!receipt.status) {
            Logger.error(`Registering template failed, status was "false".`)
        }

        return receipt.status
    }

    /**
     * gets the status of a service agreement template
     */
    public async getStatus(): Promise<boolean> {
        const {serviceAgreement} = await Keeper.getInstance()
        return serviceAgreement.getTemplateStatus(this.getId())
    }

    public async getOwner(): Promise<Account> {
        const {serviceAgreement} = await Keeper.getInstance()

        return new Account(await serviceAgreement.getTemplateOwner(this.id))
    }

    public async getConditions(metadata: MetaData, assetId: string): Promise<DDOCondition[]> {
        const conditions = await this.blendConditions()
        return conditions.map((condition: Condition, index: number): DDOCondition => {
            const events: Event[] = [
                {
                    name: "PaymentReleased",
                    actorType: [
                        "consumer",
                    ],
                    handlers: {
                        moduleName: "serviceAgreement",
                        functionName: "fulfillAgreement",
                        version: "0.1",
                    } as EventHandlers,
                } as Event,
            ]

            const mapParameterValueToName = (name) => {

                switch (name) {
                    case "price":
                        return metadata.base.price
                    case "assetId":
                        return "0x" + assetId
                    case "documentKeyId":
                        return "0x" + assetId
                }

                return null
            }

            const parameters: Parameter[] = condition.parameters.map((parameter: Parameter) => {
                return {
                    name: parameter.name,
                    type: parameter.type,
                    value: mapParameterValueToName(parameter.name),
                } as Parameter
            })

            // Logger.log(`${condition.methodReflection.contractName}.${condition.methodReflection.methodName}`,
            //    JSON.stringify(parameters, null, 2))

            const dependencies: Dependency[] = condition.dependencies.map((dep, i) => {
                return {
                    name: dep,
                    timeout: condition.dependencyTimeoutFlags[i],
                } as Dependency
            })

            return {
                name: condition.methodReflection.methodName,
                dependencies,
                timeout: condition.timeout,
                isTerminalCondition: condition.isTerminalCondition,
                conditionKey: condition.condtionKey,
                contractName: condition.methodReflection.contractName,
                functionName: condition.methodReflection.methodName,
                index,
                parameters,
                events,
            } as DDOCondition
        })
    }

    private async blendConditions(): Promise<Condition[]> {
        const methodReflections = await this.getMethodReflections()

        const conditions: Condition[] = methodReflections.map((methodReflection, i) => {
            const method: Method = this.template.Methods[i]
            return {
                methodReflection,
                timeout: method.timeout,
                parameters: method.parameters,
                dependencies: method.dependencies,
                dependencyTimeoutFlags: method.dependencyTimeoutFlags,
                isTerminalCondition: method.isTerminalCondition,
                condtionKey: ServiceAgreementTemplate
                    .generateConditionsKey(this.getId(), methodReflection),
            } as Condition
        })

        return conditions
    }

    private compressDependencies(dependencies: string[], dependencyTimeoutFlags: number[]): number {

        if (dependencies.length !== dependencyTimeoutFlags.length) {
            throw new Error("Deps and timeouts need the same length")
        }

        const mappedDependencies: number[] = []
        const mappedDependencyTimeoutFlags: number[] = []

        this.template.Methods.forEach((m, i) => {
            const di = dependencies.findIndex((d) => d === m.name)
            mappedDependencies.push(di > -1 ? 1 : 0)
            mappedDependencyTimeoutFlags.push((di > -1 && dependencyTimeoutFlags[di]) ? 1 : 0)
        })

        if (mappedDependencies.length !== mappedDependencyTimeoutFlags.length) {
            throw new Error("Deps and timeouts need the same length")
        }

        // Logger.log(dependencies, mappedDependencies, dependencyTimeoutFlags, mappedDependencyTimeoutFlags)

        let compressedDependencyValue: number = 0
        const numBits: number = 2  // 1st for dependency, 2nd for timeout flag
        mappedDependencies.forEach((d: number, i: number) => {
            const t: number = mappedDependencyTimeoutFlags[i]
            const offset: number = i * numBits
            // tslint:disable-next-line
            compressedDependencyValue |= d * 2 ** (offset + 0) // the dependency bit
            // tslint:disable-next-line
            compressedDependencyValue |= t * 2 ** (offset + 1) // the timeout bit
        })

        return compressedDependencyValue
    }

    private async getMethodReflections(): Promise<MethodReflection[]> {
        const methodReflections: MethodReflection[] = []
        for (const method of this.template.Methods) {
            methodReflections.push(
                await ContractReflector.reflectContractMethod(method.contractName, method.methodName),
            )
        }
        return methodReflections
    }
}
