import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import Order from "../ocean/Order"
import ContractBase from "./ContractBase"

export default class OceanMarket extends ContractBase {

    public static async getInstance(): Promise<OceanMarket> {
        const market: OceanMarket = new OceanMarket("OceanMarket")
        await market.init()
        return market
    }

    // call functions (costs no gas)
    public async isAssetActive(assetId: string): Promise<boolean> {
        return this.call("checkAsset", ["0x" + assetId])
    }

    public async verifyOrderPayment(orderId: string): Promise<boolean> {
        return this.call("verifyPaymentReceived", [orderId])
    }

    public async getAssetPrice(assetId: string): Promise<number> {
        return this.call("getAssetPrice", ["0x" + assetId])
            .then((price: string) => new BigNumber(price).toNumber())
    }

    public async requestTokens(amount: number, receiverAddress: string): Promise<Receipt> {
        return this.sendTransaction("requestTokens", receiverAddress, [amount])
    }

    public async generateId(input: string): Promise<string> {
        return this.call("generateId", [input])
    }

    public async register(assetId: string, price: number, publisherAddress: string): Promise<Receipt> {
        return this.sendTransaction("register", publisherAddress, ["0x" + assetId, price])
    }

    public async payOrder(order: Order, publisherAddress: string,
                          price: number, consumerAddress: string,
                          timeout: number): Promise<Receipt> {
        return this.sendTransaction("sendPayment", consumerAddress, [
            order.getId(), publisherAddress, price, timeout,
        ])
    }
}
