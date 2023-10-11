import { PropType } from "vue";
import type { ConnectInfoItem } from "../interface";

export const definePropType = <T>(val: any): PropType<T> => val;

export const uniqueTargetSource = (array : ConnectInfoItem[]) => {
    const uniqueArray = array.filter((item: ConnectInfoItem, index: number) => {
        return index === array.findIndex((obj: ConnectInfoItem) => {
            return JSON.stringify(obj) === JSON.stringify(item)
        })
    })
    return uniqueArray
}