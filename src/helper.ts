export function assert(value: boolean, msg?: string) {
    if (!value) {
        throw new Error(msg)
    }
}

export function toUint256(value: bigint) {
    return value & BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}

export function sqrtX96ToPrice(sqrtPriceX96: bigint) {
    const res = Number(sqrtPriceX96) / (2 ** 96)
    return res * res
}

export function priceToSqrtX96(price: number) {
    const res = BigInt(Math.sqrt(price) * 1e20)
    return res * (2n ** 96n) / BigInt(1e20) 
}