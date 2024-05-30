import { assert } from './helper'
import { mulDivRoundingUp, divRoundingUp, mulDiv } from './fullMath'

export const R96 = BigInt(96) 
export const Q96 = BigInt('0x1000000000000000000000000')

export const Q128 = BigInt('0x100000000000000000000000000000000')

/// @notice Gets the amount0 delta between two prices
/// @dev Calculates liquidity / sqrt(lower) - liquidity / sqrt(upper),
/// i.e. liquidity * (sqrt(upper) - sqrt(lower)) / (sqrt(upper) * sqrt(lower))
/// @param {uint160} sqrtRatioAX96 A sqrt price
/// @param {uint160} sqrtRatioBX96 Another sqrt price
/// @param {uint128} liquidity The amount of usable liquidity
/// @param {bool} roundUp Whether to round the amount up or down
/// @return {uint256} amount0 Amount of token0 required to cover a position of size liquidity between the two passed prices
export function getAmount0Delta(
    sqrtRatioAX96: bigint, 
    sqrtRatioBX96: bigint,
    liquidity: bigint,
    roundUp: boolean
) {
    assert(sqrtRatioAX96 >= 0n && sqrtRatioBX96 >= 0n && liquidity >= 0n);
    if (sqrtRatioAX96 > sqrtRatioBX96) {
        const temp = sqrtRatioAX96
        sqrtRatioAX96 = sqrtRatioBX96
        sqrtRatioBX96 = temp
    }

    const numerator1 = liquidity << BigInt(96);
    const numerator2 = sqrtRatioBX96 - sqrtRatioAX96;

    assert(sqrtRatioAX96 > 0);

    let delta: bigint
    if (roundUp) {
        delta = divRoundingUp(mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96), sqrtRatioAX96)
    } else {
        delta = mulDiv(numerator1, numerator2, sqrtRatioBX96) / sqrtRatioAX96
    }

    return delta
}

/// @notice Helper that gets signed token0 delta
/// @param {uint160} sqrtRatioAX96 A sqrt price
/// @param {uint160} sqrtRatioBX96 Another sqrt price
/// @param {int128} liquidity The change in liquidity for which to compute the amount0 delta
/// @return {int256} Amount of token0 corresponding to the passed liquidityDelta between the two prices
export function getAmount0Delta2(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    liquidity: bigint
) {
    if (liquidity < BigInt(0))
        return -getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, -liquidity, false)
    else
        return getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, true)
}

/// @notice Gets the amount1 delta between two prices
/// @dev Calculates liquidity * (sqrt(upper) - sqrt(lower))
/// @param {uint160} sqrtRatioAX96 A sqrt price
/// @param {uint160} sqrtRatioBX96 Another sqrt price
/// @param {uint128} liquidity The amount of usable liquidity
/// @param roundUp Whether to round the amount up, or down
/// @return {uint256} amount1 Amount of token1 required to cover a position of size liquidity between the two passed prices
export function getAmount1Delta(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    liquidity: bigint,
    roundUp: boolean
) {
    assert(sqrtRatioAX96 >= 0n && sqrtRatioBX96 >= 0n && liquidity >= 0n)
    if (sqrtRatioAX96 > sqrtRatioBX96) {
        const temp = sqrtRatioAX96
        sqrtRatioAX96 = sqrtRatioBX96
        sqrtRatioBX96 = temp
    }

    let delta: bigint
    if (roundUp) {
        delta = mulDivRoundingUp(liquidity, sqrtRatioBX96 - sqrtRatioAX96, Q96)
    } else {
        delta = mulDiv(liquidity, sqrtRatioBX96 - sqrtRatioAX96, Q96)
    }
    return delta
}

/// @notice Helper that gets signed token1 delta
/// @param {uint160} sqrtRatioAX96 A sqrt price
/// @param {uint160} sqrtRatioBX96 Another sqrt price
/// @param {int128} liquidity The change in liquidity for which to compute the amount1 delta
/// @return {int256} amount1 Amount of token1 corresponding to the passed liquidityDelta between the two prices
export function getAmount1Delta2(
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    liquidity: bigint
) {
    if (liquidity < BigInt(0))
        return -getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, -liquidity, false)
    else
        return getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, true)
}

/// @notice Gets the next sqrt price given a delta of token0
/// @dev Always rounds up, because in the exact output case (increasing price) we need to move the price at least
/// far enough to get the desired output amount, and in the exact input case (decreasing price) we need to move the
/// price less in order to not send too much output.
/// The most precise formula for this is liquidity * sqrtPX96 / (liquidity +- amount * sqrtPX96),
/// if this is impossible because of overflow, we calculate liquidity / (liquidity / sqrtPX96 +- amount).
/// @param sqrtPX96 The starting price, i.e. before accounting for the token0 delta
/// @param liquidity The amount of usable liquidity
/// @param amount How much of token0 to add or remove from virtual reserves
/// @param add Whether to add or remove the amount of token0
/// @return {uint160} The price after adding or removing amount, depending on add
export function getNextSqrtPriceFromAmount0RoundingUp(
    sqrtPX96: bigint,
    liquidity: bigint,
    amount: bigint,
    add: boolean
) {
    assert(sqrtPX96 >= 0n && liquidity >= 0n && amount >= 0n)
    // we short circuit amount == 0 because the result is otherwise not guaranteed to equal the input price
    if (amount == BigInt(0)) 
        return sqrtPX96;

    const numerator1 = liquidity << R96;

    let product = amount * sqrtPX96 % BigInt(2 ** 256)
    if (add) {
        if (product / amount == sqrtPX96) {
            const denominator = numerator1 + product;
            if (denominator >= numerator1)
                // always fits in 160 bits
                return mulDivRoundingUp(numerator1, sqrtPX96, denominator);
        }

        let denominator = (numerator1 / sqrtPX96 + amount) % BigInt(2 ** 256)
        return divRoundingUp(numerator1, denominator)
    } else {
        // if the product overflows, we know the denominator underflows
        // in addition, we must check that the denominator does not underflow
        assert(product / amount == sqrtPX96 && numerator1 > product);
        const denominator = numerator1 - product;
        return mulDivRoundingUp(numerator1, sqrtPX96, denominator)
    }
}

/// @notice Gets the next sqrt price given a delta of token1
/// @dev Always rounds down, because in the exact output case (decreasing price) we need to move the price at least
/// far enough to get the desired output amount, and in the exact input case (increasing price) we need to move the
/// price less in order to not send too much output.
/// The formula we compute is within <1 wei of the lossless version: sqrtPX96 +- amount / liquidity
/// @param sqrtPX96 The starting price, i.e., before accounting for the token1 delta
/// @param liquidity The amount of usable liquidity
/// @param amount How much of token1 to add, or remove, from virtual reserves
/// @param add Whether to add, or remove, the amount of token1
/// @return {uint160} The price after adding or removing `amount`
function getNextSqrtPriceFromAmount1RoundingDown(
    sqrtPX96: bigint,
    liquidity: bigint,
    amount: bigint,
    add: boolean
) {
    assert(sqrtPX96 >= 0n && liquidity >= 0n && amount >= 0n)
    // if we're adding (subtracting), rounding down requires rounding the quotient down (up)
    // in both cases, avoid a mulDiv for most inputs
    let quotient: bigint
    if (add) {
        if (amount <= BigInt(2 ** 160) - 1n) {
            quotient = mulDiv(amount, Q96, liquidity)
        } else {
            quotient = amount << 96n / liquidity
        }
        const price = sqrtPX96 + quotient
        assert(price < BigInt(2 ** 160))
        return price
    } else {
        if (amount <= BigInt(2 ** 160) - 1n) {
            quotient = divRoundingUp(amount << 96n, liquidity)
        } else {
            quotient = mulDivRoundingUp(amount, Q96, liquidity)
        }

        assert(sqrtPX96 > quotient);
        // always fits 160 bits
        return sqrtPX96 - quotient;
    }
}

/// @notice Gets the next sqrt price given an input amount of token0 or token1
/// @dev Throws if price or liquidity are 0, or if the next price is out of bounds
/// @param sqrtPX96 The starting price, i.e., before accounting for the input amount
/// @param liquidity The amount of usable liquidity
/// @param amountIn How much of token0, or token1, is being swapped in
/// @param zeroForOne Whether the amount in is token0 or token1
/// @return sqrtQX96 The price after adding the input amount to token0 or token1
export function getNextSqrtPriceFromInput(
    sqrtPX96: bigint,
    liquidity: bigint,
    amountIn: bigint,
    zeroForOne: boolean
) {
    assert(sqrtPX96 > 0n && liquidity > 0n && amountIn >= 0n);

    // round to make sure that we don't pass the target price
    if (zeroForOne) {
        return getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountIn, true)
    } else {
        return getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountIn, true);
    }
}

/// @notice Gets the next sqrt price given an output amount of token0 or token1
/// @dev Throws if price or liquidity are 0 or the next price is out of bounds
/// @param sqrtPX96 The starting price before accounting for the output amount
/// @param liquidity The amount of usable liquidity
/// @param amountOut How much of token0, or token1, is being swapped out
/// @param zeroForOne Whether the amount out is token0 or token1
/// @return sqrtQX96 The price after removing the output amount of token0 or token1
export function getNextSqrtPriceFromOutput(
    sqrtPX96: bigint,
    liquidity: bigint,
    amountOut: bigint,
    zeroForOne: boolean
) {
    assert(amountOut >= 0n && sqrtPX96 > 0n && liquidity > 0n);

    // round to make sure that we pass the target price
    if (zeroForOne)
        return getNextSqrtPriceFromAmount1RoundingDown(sqrtPX96, liquidity, amountOut, false)
    else
        return getNextSqrtPriceFromAmount0RoundingUp(sqrtPX96, liquidity, amountOut, false);
}