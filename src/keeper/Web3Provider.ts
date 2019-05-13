import Web3 from "web3"
import * as Web3Module from "web3"
import Config from "../models/Config"

export default class Web3Provider {

    /**
     * Returns Web3 instance.
     * @return {Web3}
     */
    public static getWeb3(config: Partial<Config> = {}): Web3 {
        const _Web3: Web3 = (Web3Module as any)
        return new _Web3(
            config.web3Provider
            || _Web3.givenProvider
            || new _Web3.providers.HttpProvider(config.nodeUri),
        )
    }
}
