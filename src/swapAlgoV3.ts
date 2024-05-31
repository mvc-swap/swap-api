import * as SqrtPriceMath from './sqrtPriceMath';
import * as TickMath from './tickMath';
import * as LiquidityMath from './liquidityMath';

export function mint(tick: number, sqrtPriceX96: bigint, liquidity: bigint, tickLower: number, tickUpper: number, liquidityDelta: bigint) {
    let amount0 = 0n;
    let amount1 = 0n;
    if (tick < tickLower) {
        // current tick is below the passed range; liquidity can only become in range by crossing from left to
        // right, when we'll need _more_ token0 (it's becoming more valuable) so user must provide it
        amount0 = SqrtPriceMath.getAmount0Delta2(
            TickMath.getSqrtRatioAtTick(tickLower),
            TickMath.getSqrtRatioAtTick(tickUpper),
            liquidityDelta
        );
    } else if (tick < tickUpper) {
        // current tick is inside the passed range

        amount0 = SqrtPriceMath.getAmount0Delta2(
            sqrtPriceX96,
            TickMath.getSqrtRatioAtTick(tickUpper),
            liquidityDelta
        );
        amount1 = SqrtPriceMath.getAmount1Delta2(
            TickMath.getSqrtRatioAtTick(tickLower),
            sqrtPriceX96,
            liquidityDelta
        );

        liquidity = LiquidityMath.addDelta(liquidity, liquidityDelta);
    } else {
        // current tick is above the passed range; liquidity can only become in range by crossing from right to
        // left, when we'll need _more_ token1 (it's becoming more valuable) so user must provide it
        amount1 = SqrtPriceMath.getAmount1Delta2(
            TickMath.getSqrtRatioAtTick(tickLower),
            TickMath.getSqrtRatioAtTick(tickUpper),
            liquidityDelta
        );
    }
    return {amount0, amount1}
}