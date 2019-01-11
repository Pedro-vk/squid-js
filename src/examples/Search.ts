import DDO from "../ddo/DDO"
import {Logger, Ocean} from "../squid"
import config from "./config"

(async () => {
    const ocean: Ocean = await Ocean.getInstance(config)

    const result: DDO[] = await ocean.searchAssetsByText("Office Humidity")
    const names: string[] = result.map((ddo: DDO): string => {
        const service = ddo.findServiceByType("Metadata")
        if (service && service.metadata) {
            return service.metadata.base.name
        }
    })

    Logger.log(names.length, names)

    process.exit(0)
})()
