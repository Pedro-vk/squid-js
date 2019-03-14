import { Condition } from "./Condition.abstract"
import { zeroX } from "../../../utils"

export class LockRewardCondition extends Condition {

    public static async getInstance(): Promise<LockRewardCondition> {
        return Condition.getInstance("LockRewardCondition", LockRewardCondition)
    }

    public hashValues(rewardAddress: string, amount: number) {
        return super.hashValues(zeroX(rewardAddress), amount)
    }

    public fulfill(agreementId: string, rewardAddress: string, amount: number, from?: string) {
        return super.fulfill(agreementId, [zeroX(rewardAddress), amount], from)
    }
}
