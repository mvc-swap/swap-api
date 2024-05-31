import { assert } from './helper'

export function addDelta(x: bigint, y: bigint) {
    assert(x >= 0);
    if (y < 0) 
        assert(x >= -y, 'LS')
    else
        assert(x + y <= 2 ** 128 - 1, 'LA') 
    return x + y
} 