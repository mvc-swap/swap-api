
import { assert } from "./helper"
/// @dev The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
export const MIN_TICK = -887272;
/// @dev The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
export const MAX_TICK = -MIN_TICK;

/// @dev The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
export const MIN_SQRT_RATIO = BigInt(4295128739);
/// @dev The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
export const MAX_SQRT_RATIO = BigInt('1461446703485210103287273052203988822378723970342');

/// @notice Calculates sqrt(1.0001^tick) * 2^96
/// @dev Throws if |tick| > max tick
/// @param tick The input tick for the above formula
/// @return sqrtPriceX96 A Fixed point Q64.96 number representing the sqrt of the ratio of the two assets (token1/token0)
/// at the given tick
export function getSqrtRatioAtTick(tick: number) {
    const absTick = tick < 0 ? -tick : tick;
    assert(absTick <= MAX_TICK, 'T')

    let ratio = (absTick & 0x1) != 0 ? BigInt('0xfffcb933bd6fad37aa2d162d1a594001') : BigInt('0x100000000000000000000000000000000'); // 1 / sqrt(1.0001)
    if ((absTick & 0x2) != 0) 
        ratio = (ratio * BigInt('0xfff97272373d413259a46990580e213a')) >> BigInt(128); // 1 / 1.0001
    if ((absTick & 0x4) != 0) 
        ratio = (ratio * BigInt('0xfff2e50f5f656932ef12357cf3c7fdcc')) >> BigInt(128); // 1/1.0001^2
    if ((absTick & 0x8) != 0) 
        ratio = (ratio * BigInt('0xffe5caca7e10e4e61c3624eaa0941cd0')) >> BigInt(128)
    if ((absTick & 0x10) != 0) 
        ratio = (ratio * BigInt('0xffcb9843d60f6159c9db58835c926644')) >> BigInt(128)
    if ((absTick & 0x20) != 0) 
        ratio = (ratio * BigInt('0xff973b41fa98c081472e6896dfb254c0')) >> BigInt(128)
    if ((absTick & 0x40) != 0) 
        ratio = (ratio * BigInt('0xff2ea16466c96a3843ec78b326b52861')) >> BigInt(128)
    if ((absTick & 0x80) != 0) 
        ratio = (ratio * BigInt('0xfe5dee046a99a2a811c461f1969c3053')) >> BigInt(128)
    if ((absTick & 0x100) != 0) 
        ratio = (ratio * BigInt('0xfcbe86c7900a88aedcffc83b479aa3a4')) >> BigInt(128)
    if ((absTick & 0x200) != 0) 
        ratio = (ratio * BigInt('0xf987a7253ac413176f2b074cf7815e54')) >> BigInt(128)
    if ((absTick & 0x400) != 0) 
        ratio = (ratio * BigInt('0xf3392b0822b70005940c7a398e4b70f3')) >> BigInt(128)
    if ((absTick & 0x800) != 0) 
        ratio = (ratio * BigInt('0xe7159475a2c29b7443b29c7fa6e889d9')) >> BigInt(128)
    if ((absTick & 0x1000) != 0) 
        ratio = (ratio * BigInt('0xd097f3bdfd2022b8845ad8f792aa5825')) >> BigInt(128)
    if ((absTick & 0x2000) != 0) 
        ratio = (ratio * BigInt('0xa9f746462d870fdf8a65dc1f90e061e5')) >> BigInt(128)
    if ((absTick & 0x4000) != 0) 
        ratio = (ratio * BigInt('0x70d869a156d2a1b890bb3df62baf32f7')) >> BigInt(128)
    if ((absTick & 0x8000) != 0) 
        ratio = (ratio * BigInt('0x31be135f97d08fd981231505542fcfa6')) >> BigInt(128)
    if ((absTick & 0x10000) != 0) 
        ratio = (ratio * BigInt('0x9aa508b5b7a84e1c677de54f3e99bc9')) >> BigInt(128)
    if ((absTick & 0x20000) != 0) 
        ratio = (ratio * BigInt('0x5d6af8dedb81196699c329225ee604')) >> BigInt(128)
    if ((absTick & 0x40000) != 0) 
        ratio = (ratio * BigInt('0x2216e584f5fa1ea926041bedfe98')) >> BigInt(128)
    if ((absTick & 0x80000) != 0) 
        ratio = (ratio * BigInt('0x48a170391f7dc42444e8fa2')) >> BigInt(128)

    if (tick > 0) {
        //ratio = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') / ratio;
        ratio = (BigInt(2 ** 256) - 1n) / ratio
    }

    // this divides by 1<<32 rounding up to go from a Q128.128 to a Q128.96.
    // we then downcast because we know the result always fits within 160 bits due to our tick input constraint
    // we round up in the division so getTickAtSqrtRatio of the output price is always consistent
    const sqrtPriceX96 = (ratio >> BigInt(32)) + (ratio % BigInt((2 ** 32)) == BigInt(0) ? BigInt(0) : BigInt(1))
    return sqrtPriceX96
}

/**
 * Return index of most significant non-zero bit in given non-zero 256-bit
 * unsigned integer value.
 *
 * @param x value to get index of most significant non-zero bit in
 * @return index of most significant non-zero bit in given number
 */
export function mostSignificantBit(x: bigint) {
    assert(x > 0);

    let r = 0
    if (x >= BigInt('0x100000000000000000000000000000000')) {
        x >>= BigInt(128);
        r += 128;
    }
    if (x >= 0x10000000000000000) {
        x >>= BigInt(64);
        r += 64;
    }
    if (x >= 0x100000000) {
        x >>= BigInt(32);
        r += 32;
    }
    if (x >= 0x10000) {
        x >>= BigInt(16);
        r += 16;
    }
    if (x >= 0x100) {
        x >>= BigInt(8); r += 8;
    }
    if (x >= 0x10) {
        x >>= BigInt(4);
        r += 4;
    }
    if (x >= 0x4) {
        x >>= BigInt(2);
        r += 2;
    }
    if (x >= 0x2)
        r += 1; // No need to shift x anymore
    return r
}

/**
 * 2^127.
 */
const TWO127 = BigInt('0x80000000000000000000000000000000');

/**
 * 2^128 - 1.
 */
const TWO128_1 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

/**
 * ln(2) * 2^128.
 */
const LN2 = BigInt('0xb17217f7d1cf79abc9e3b39803f2f6af');

/**
 * Calculate log_2 (x / 2^128) * 2^128.
 *
 * @param x parameter value
 * @return log_2 (x / 2^128) * 2^128
 */
export function log_2(x: bigint) {
    assert(x > 0);

    const msb = mostSignificantBit(x);

    if (msb > 128)
        x >>= BigInt(msb - 128);
    else if (msb < 128)
        x <<= BigInt(128 - msb);

    x &= TWO128_1;

    let result = BigInt(msb - 128) << BigInt(128); // Integer part of log_2

    let bit = TWO127;
    for (let i = 0; i < 128 && x > 0; i++) {
        x = (x << BigInt(1)) + ((x * x + TWO127) >> BigInt(128));
        if (x > TWO128_1) {
            result |= bit;
            x = (x >> BigInt(1)) - TWO127;
        }
        bit >>= BigInt(1);
        console.log('log_2:', i, x, bit, result)
    }

    return result;
}

function log_step(r: bigint, log_2: bigint, bit: number) {
    r = r * r >> BigInt(127)
    const f = r >> BigInt(128)
    log_2 = log_2 | (f << BigInt(bit))
    r = r >> f

    //console.log(bit, r, log_2, f)
    return {r, log_2}
}

/// @notice Calculates the greatest tick value such that getRatioAtTick(tick) <= ratio
/// @dev Throws in case sqrtPriceX96 < MIN_SQRT_RATIO, as MIN_SQRT_RATIO is the lowest value getRatioAtTick may
/// ever return.
/// @param sqrtPriceX96 The sqrt ratio for which to compute the tick as a Q64.96
/// @return tick The greatest tick for which the ratio is less than or equal to the input ratio
export function getTickAtSqrtRatio(sqrtPriceX96: bigint) {
    assert(sqrtPriceX96 >= MIN_SQRT_RATIO && sqrtPriceX96 < MAX_SQRT_RATIO, 'R')

    // change uint96 to uint128, to raise precision
    const ratio = sqrtPriceX96 * BigInt((2 ** 32))

    //const tick = Math.log(Number(ratio)) / Math.log(1.0001)
    const msb = mostSignificantBit(ratio)
    let r = ratio

    if (msb >= 128) {
        r = ratio >> BigInt(msb - 127)
    } else {
        r = ratio << BigInt(127 - msb)
    }

    let log_2 = BigInt(msb - 128) << BigInt(64)

    for (let i = 63; i >= 50; i--) {
        const res = log_step(r, log_2, i)
        r = res.r
        log_2 = res.log_2
    }

    const log_sqrt10001 = log_2 * 255738958999603826347141n

    const tickLow = Number((log_sqrt10001 - BigInt('3402992956809132418596140100660247210')) >> BigInt(128)); // 0.010000497 x 2^128 = 3402992956809132418596140100660247210
    const tickHi = Number((log_sqrt10001 + BigInt('291339464771989622907027621153398088495')) >> BigInt(128)); // 0.856 x 2^128 = 291339464771989622907027621153398088495

    const tick = (tickLow == tickHi) ? tickLow : (getSqrtRatioAtTick(tickHi) <= sqrtPriceX96 ? tickHi : tickLow)
    return tick
}