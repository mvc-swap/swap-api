import { assert } from './helper'

export function mulDiv(a: bigint, b: bigint, denominator: bigint) {
    assert(a >= 0n && b >= 0n && denominator >= 0n);

    const mid = a * b

    assert(denominator > 0)

    const res = a * b / denominator

    assert(res < BigInt(2 ** 256));

    return res
}

/*export function mulDiv(a: bigint, b: bigint, denominator: bigint) {
    assert(a >= 0n && b >= 0n && denominator >= 0n);

    const mid = a * b

    assert(denominator > 0)

    let prod0 = mid % BigInt(2 ** 256)
    let prod1 = mid / BigInt(2 ** 256)

    if (prod1 == BigInt(0)) {
        return prod0 / denominator
    }

    assert(denominator > prod1)

    let reminder = (a * b) % denominator
    // Subtract 256 bit number from 512 bit number
    if (reminder > prod0) {
        prod1 -= BigInt(1)
        prod0 = BigInt(2 ** 256) - reminder + prod0
    } else {
        prod0 = prod0 - reminder
    }

    // TODO: minus?
    let twos = (BigInt(2 ** 256) - denominator) & denominator
    denominator = denominator / twos

    prod0 = prod0 / twos

    //prod0 = prod0 e prod1 * ((BigInt(2 ** 256) - twos) / twos + BigInt(1))

    twos = (((BigInt(2 ** 256) - twos) / twos) + BigInt(1)) % BigInt(2 ** 256)

    prod0 = (prod0 + (prod1 * twos) % BigInt(2 ** 256)) % BigInt(2 ** 256)

    //console.log("prod0: ", prod0)

    let inv = (BigInt(3) * denominator % BigInt(2 ** 256)) ^ BigInt(2)
    //console.log('inv:', inv)

    for (let i = 0; i < 6; i++) {
        inv *= BigInt(2) - (denominator * inv % BigInt(2 ** 256))
        inv = inv % BigInt(2 ** 256)
        if (inv < BigInt(0))
            inv = BigInt(2 ** 256) + inv
        //console.log(i, inv)
    }

    const result = (prod0 * inv) % BigInt(2 ** 256)
    return result
}*/

export function mulDivRoundingUp(a: bigint, b: bigint, c: bigint) {
    assert(a >= 0n && b >= 0n && c >= 0n);

    let tmp = a * b
    let res = tmp / c
    if (tmp % c > BigInt(0)) { 
        res = res + BigInt(1)
    }
    assert(res < BigInt(2 ** 256), 'mulDivRoundingUp: overflow');
    return res
}

export function divRoundingUp(a: bigint, b: bigint) {
    assert(a >= 0n && b >= 0n);
    let res = a / b
    if (a % b > BigInt(0)) {
        res = res + BigInt(1)
    }
    assert(res < BigInt(2 ** 256), 'divRoundingUp: overflow');
    return res
}