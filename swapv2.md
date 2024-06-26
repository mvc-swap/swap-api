# Swap Interface 

## Interface Entrance 

- mainnet: https://api.mvcswap.com/swapv2
- testnet: https://api.mvcswap.com/swapv2/test

## Simple Swap Procedure

- 1. Call ```/swapinfo``` to get swap information.
- 2. When users need to oparate swap, they need to call ```/reqswapargs```.
- 3. when gets the response from step 2，count the amount of token1(mvc) and token2 using interface in [swapAlgo.js](https://github.com/mvc-swap/swap-api/blob/master/swapAlgo.js), and create the transactions which transfer mvc to ```mvcToAddress``` and token to ```tokenToAddress```.
- 4. After generates transactions，call swap inteface ```/addliq```, ```/removeliq```, ```/token1totoken2```, ```/token2totoken1```.

## Interface Introduction

## 1. Get all listed token pairs

### Request
- Method: **GET**
- URL: ```/allpairs```

### Response
```
{
  "code": 0,
  "data": {
    "space-mtt": {
      "token1": {
        "symbol": "space",
        "tokenID": "",
        "genesisHash": "",
        "codeHash": "",
        "decimal": 8,
        "genesisTxid": ""
      },
      "token2": {
        "symbol": "mtt",
        "tokenID": "16c3d9248b245e52bc5763e0eed7a287af89f0f7",
        "genesisHash": "26b2a9aac0c8a3594ce61e3592ca3ca61f34b7c3",
        "codeHash": "a2421f1e90c6048c36745edd44fad682e8644693",
        "decimal": 4,
        "genesisTxid": "b076dc5caf262871c12b8be64b1a841786c0d262069661a08a1f844a1ac72a4c00000000",
        "type": "meta"
      },
      "swapCodeHash": "815510c65f9c9b6d6e0bd48e4b245a08cc31b18e",
      "swapID": "4d41fb76cfcace16b93171915c7a4577b1305b85",
      "extra": "",
      "swapGenesisTxid": "660b7364c6cc4911855d77e8298ad41ed454200e622b1b1a46b333f043bbc46e00000000",
      "minTick": -1000000,
      "maxTick": 1000000,
      "tickSpacing": 100,
      "poolAmount": "0",
      "reward": {
        "rewardAmountPerSecond": "0",
        "rewardStartTime": 0,
        "rewardEndTime": 0,
        "token": {
          "symbol": "mtt",
          "tokenID": "16c3d9248b245e52bc5763e0eed7a287af89f0f7",
          "genesisHash": "26b2a9aac0c8a3594ce61e3592ca3ca61f34b7c3",
          "codeHash": "a2421f1e90c6048c36745edd44fad682e8644693",
          "decimal": 4,
          "genesisTxid": "b076dc5caf262871c12b8be64b1a841786c0d262069661a08a1f844a1ac72a4c00000000"
        }
      }
    }
  }
}
```

When code is 0, it means success. Otherwise it means failed and there will be a msg which describes the specific information.

data format:
> * token1: token1 info.
> * token2: token2 info.
> * lptoken: lpToken info.
> * swapCodeHash: swap script code hash.
> * swapID: a unique ID for swap contract.
> * minTick: The minimum tick of this pool.
> * maxTick: The maximum tick of this pool.
> * tickSpacing: The tick space of this pool.
> * poolAmount: a pool amount used for sorting token pairs.
> * rewardAmountPerSecond: pool reward per second for liquidity providers.
> * rewardStartTime: the time stamp of reward beginning.
> * rewardEndTime: the timestamp of reward end.
> * reward.token: the rewad token info.

**Note: The request header of this interface must include {Accept-Encoding: gzip}**

## 2. Get Swap Info

### Request
- Method: **GET**
- URL: ```/swapinfo?symbol=space-ssp```

> * symbol: swap pool symbol which got from ```/allpairs```.

### Response
```
{
    code: 0,
    message: "",
    data: {
        "swapToken1Amount": "245119",
        "swapToken2Amount": "258212",
        "swapFeeRate": 2000,
        "projFeeRate": 1000,
        "minProjFee": "100",
        "totalLpFee24h": "0",
        "totalVolume24h": "0",
        "liquidity": "970000",
        "sqrtPriceX96": "79764573610568202112207564634",
        "tick": "134",
    }
}
```

data format:

> * swapToken1Amount: token1 amount in swap pool, whose type is string.
> * swapToken2Amount: token1 amount in swap pool, whose type is string.
> * swapFeeRate: swap fee rate.
> * projFeeRate: proj fee rate.
> * minProjFee: the minimum fee which proj will get.
> * totalLpFee24h: the swap fee the LP collected in the latest 24 hours.
> * totalVolume24h: the swap volumn in the latest 24 hours.
> * liquidity: the liquidity of current slot.
> * sqrtPriceX96: the current sqrt price of current slot.
> * tick: the tick of current slot.

## 3. Requst swap arguments

Before doing swap operation, you need request swap args.

### Request

- Method: **POST**

- URL: ```/reqswapargs```

- Body:
```
{
    symbol: "mvc-ssp",
    address: "msREe5jsynP65899v1KJCydf6Sc9pJPb8S",
    op: 1,
    amountIn: "32434",
    source: 'mvcswap.io'
}
```

> * symbol: swap symbol.
> * address: the user's address used for accepting mvc and tokens.
> * op: swap operation: 1 add liquidity, 2 remove liquidity, 3 swap token1 to token2. 4 swap token2 to token1. 102 remove liquidity.
> * source: mark the identity of the caller to make it easier to find errors.
> * amountIn: optional. If op is 3 or 4, amountIn means the amount user want to swap which is used to evaluate miner fee.

### Response
```
{
    code: 0,
    msg: "",
    data: {
        requestIndex: "1", 
        tokenToAddress: "msREe5jsynP65899v1KJCydf6Sc9pJPb8S", 
        mvcToAddress: "mzJR1zKcZCZvMJj87rVqmFFxmaVEe62BBW", 
        txFee: 10000, 
        swapToken1Amount: "100000", 
        swapToken2Amount: "1000000", 
        swapFeeRate: 25,
        projFeeRate: 5,
        op: 1
    },
}
```

**Note: requestIndex can't be used repeatedly. Need call ```/reqswapargs``` before every swap operation.**

data format:

> * requestIndex: request id to idendify this request.
> * tokenToAddress: tokenAddress for swap to accept token transfer.
> * mvcToAddress: mvcAddress for swap to accept mvc transfer.
> * txFee: miner fee of this swap opeartion.
> * swapToken1Amount: token1 amount in swap pool, whose type is string.
> * swapToken2Amount: token1 amount in swap pool, whose type is string.
> * swapFeeRate: swap fee rate.
> * projFeeRate: proj fee rate.
> * op: swap operation.

## 4. Add Liquidity

### Request
- Methos: **POST**
- URL: ```/addliq```
- Body: 
```
{
    data: compressedData
}
```

compressData format:
```
data = {
    symbol: "ssp-mvc",
    requestIndex: "1",
    amountCheck2RawTx: "",
    token2RawTx: "",
    token2OutputIndex: 0,
    mvcRawTx: "",
    mvcOutputIndex: 0,
    amountCheck1RawTx: "",
    token1RawTx: "",
    token1OutputIndex: 0,
    liquidityAmount: "100000",
    tickLower: "-700",
    tickUpper: "800",
}
compressData = gzip(JSON.stringify(data))
```

> * symbol: swap symbol.
> * requestIndex: returned in ```/reqswapargs```.
> * amountCheck2RawTx: the unlockFromContract tx used in token2 transfering.
> * token2RawTx: The raw transaction for transfering token2 to tokenAddress.
> * token2OutputIndex: the outputIndex of transation for token2 transfering.
> * mvcRawTx: The raw transaction for transfering mvc to mvcAddress.
> * mvcOutputIndex: The outputIndex of transaction for mvc transfering.
> * amountCheck1RawTx: the unlockFromContract tx used in token1 transfering. It is needed when token1 is not mvc.
> * token1RawTx: The raw transaction for transfering token1 to tokenAddress. It is needed when token1 is not mvc.
> * token1OutputIndex: the outputIndex of transation for token1 transfering. It is needed when token1 is not mvc.
> * liquidityAmount: The liquidity amount user want to add to pool.
> * tickLower: The lower tick of liquidity added. It must be the multiple of tickSpacing and >= minTick.
> * tickUpper: The upper tick of liquidity added. It must be the multiple of tickSpacing and <= maxTick.

**Note: If the token1 is space, you need transfer sum of token1AddAmount and txFee. And the minimum token1AddAmount is 1000 satoshis.**

**Note2: Do not broadcast rawTx，just send to mvcswap api. And the data need to be compressed to compressedData with request header {'Content-Type': 'application/json'}. There is a reference code in typescript:**
```
import { gzip } from 'node-gzip';
const request = require('superagent')
const reqData = {
    symbol,
    requestIndex: Number(data.requestIndex),
    token1AddAmount,
    amountCheck2RawTx,
    token2RawTx,
    token2OutputIndex,
    mvcRawTx,
    mvcOutputIndex: 0,
}
const compressData = await gzip(JSON.stringify(reqData))
reqRes = await request.post(
    `${url}/addliq`
).send(compressData).set('Content-Type', 'application/json')
```
**Note3: When you generate the raw transactions, you need to avoid double spending. A feasible way is first create a mvc transaction，and use change mvc utxo of this transaction as input utxos to send to sensible-sdk which could avoid to double spending. The transaction construction code can be referenced at [buildMvcAndTokenTx](https://github.com/mvc-swap/web-wallet/blob/5f71587542226cce47909bad32048079d85cee5c/src/App.js#L645).**


A feasible way to construct:
> * 1 The wallet gets mvc utxos with sum amount greater than txFee + 50000 satoshis (token transfer usually cost about 20000 satoshis).
> * 2 Create mvc raw transtion.
> * 3 Use change mvc utxo of step 2 to pass to sensible-sdk to create token transfer transation.
> * 4 If step 3 fails for insufficient mvc amount, back to sept 1 to get more mvc amount utxo like txFee + 50000 * 2, and continue util success.

### Response
```
{
    "code": 0,
    "msg": "",
    "data": {
        txid: '1649c55319187fc7047f0bb372e89b5d2e2c716ce7e387470e3c0460d19065a6',
        liquidityAmount: '7144'
    }
}
```

data format:

> * txid: the swap transaction id.
> * liquidityAmount: the liquidity amount user added.

## 5. Remove Liquidity

### Request
- Methos: **POST**
- URL: ```/removeliq```
- Body: 
```
{
    symbol: "mvc-ssp",
    requestIndex: "1",
    mvcRawTx: "",
    mvcOutputIndex: 0,
    amountCheckRawTx: "",
    liquidityAmount
}
```
> * symbol: swap symbol.
> * requestIndex: returned in ```/reqswapargs```.
> * mvcRawTx: The raw transaction for transfering mvc to mvcAddress.
> * mvcOutputIndex: The outputIndex of transaction for mvc transfering.
> * amountCheckRawTx: the unlockFromContract tx used in token transfering.
> * liquidityAmount: The liquidity amount user want to remove.

**Note: the mvc transfer amount should be txFee**

**Note2: Donot broadcast rawTx, compress data and set header like addliq**

### Response
```
{
    "code": 0,
    "msg": "",
    "data": {
        txid: '88e64bcf3517c864bb4c224b52084d3b3261a57814dceb19f2b8af07934f9cf8',
        token1Amount: '13997',
        token2Amount: '715070265'
    }
}
```

Data format:

> * txid: the swap transaction id.
> * token1Amount: the token1 amount user got.
> * token2Amount: the token2 amount user got.

## 6. Swap token1 to token2

### Request
- Method: **POST**
- URL: ```/token1totoken2```
- Body: 
```
{
    symbol: "mvc-ssp",
    requestIndex: "1"
    mvcRawTx,
    mvcOutputIndex: 0,
    amountCheck1RawTx: "",
    token1RawTx: "",
    token1OutputIndex: 0,
}
```

> * symbol: swap symbol.
> * requestIndex: returned in ```/reqswapargs```.
> * mvcRawTx: The raw transaction for transfering mvc to mvcAddress.
> * mvcOutputIndex: The outputIndex of transaction for mvc transfering.
> * amountCheck1RawTx: the unlockFromContract tx used in token1 transfering. It is needed when token1 is not mvc.
> * token1RawTx: The raw transaction for transfering token1 to tokenAddress. It is needed when token1 is not mvc.
> * token1OutputIndex: the outputIndex of transation for token1 transfering. It is needed when token1 is not mvc.

**Note: when token1 is mvc, the mvc transfer amount should be the sum of txFee and mvc amount you want to swap**

**Note2: Do not broadcast rawTx, compress data and set header like addliq**

### Response
```
{
    "code": 0,
    "msg": "",
    "data": {
        txid: '88e64bcf3517c864bb4c224b52084d3b3261a57814dceb19f2b8af07934f9cf8',
        token2Amount: '715070265'
    }
}
```

> * txid: the swap transaction id.
> * token2Amount: the token2 amount user got.

## 7. Swap token2 to token1

### Request
- Method: **POST**
- URL: ```/token2totoken1```
- Body:
```
{
    symbol: "mvc-ssp",
    requestIndex: "1"
    token2RawTx,
    token2OutputIndex,
    mvcRawTx,
    mvcOutputIndex: 0,
    amountCheckRawTx,
}
```

> * symbol: swap symbol.
> * requestIndex: returned in ```/reqswapargs```.
> * token2RawTx: The raw transaction for transfering token2 to tokenAddress.
> * token2OutputIndex: the outputIndex of transation for token2 transfering.
> * mvcRawTx: The raw transaction for transfering mvc to mvcAddress.
> * mvcOutputIndex: The outputIndex of transaction for mvc transfering.
> * amountCheckRawTx: the unlockFromContract tx used in token transfering.

**Note: the mvc transfer amount should be txFee**

**Note2: Do not broadcast rawTx, compress data and set header like addliq**

### Response
```
{
    "code": 0,
    "msg": "",
    "data": {
        txid: '88e64bcf3517c864bb4c224b52084d3b3261a57814dceb19f2b8af07934f9cf8',
        token1Amount: '715070265'
    }
}
```

> * txid: the swap transaction id.
> * token2Amount: the token2 amount user got.


## 8. Get user positions.

### Request
- Method: **GET**
- URL: ```/positions?address=mzJR1zKcZCZvMJj87rVqmFFxmaVEe62BBW```

> * address: the address of the user.

### Response
```
{
  "code": 0,
  "data": {
    "space-mtt": {
      "positions": [
        {
          "tickLower": -6000,
          "tickUpper": 6000,
          "liquidity": "970000",
          "token1Amount": "244873",
          "token2Amount": "257963",
          "token1Fee": "240",
          "token2Fee": "241",
          "rewardAmount": "0"
        }
      ],
      "code": 0,
      "currentPrice": "1.0135867589031229",
      "feeRate": "0.003",
      "currentTick": "134",
      "extra": "",
      "msg": ""
    }
  }
}
```

> * tickLower: the lower tick of this position.
> * tickUpper: the upper tick of this position.
> * token1Amount: the token1 amount of this position.
> * token2Amount: the token2 amount of this position.
> * token1Fee: the token1 fee of this position.
> * token2Fee: the token2 fee of this position.
> * rewardAmount: the reward token amount.
> * currentPrice: the current price of this pool.
> * feeRate: the spread factor of this pool.
> * currentTick: the current tick of this pool.


## 9. Get user positions.

### Request
- Method: **GET**
- URL: ```/liquidity?symbol=space-mtt```

> * address: the address of the user.

### Response
```
{
  "data": [
    {
      "tickLower": -6000,
      "tickUpper": 6000,
      "liquidity": "970000"
    }
  ],
  "code": 0,
  "msg": ""
}
```

> * tickLower: the lower tick of this position.
> * tickUpper: the upper tick of this position.
> * liquidity: the current tick of this position.

## 10. Get swap res.

### Request
- Method: **GET**
- URL: ```/swapres?symbol=space-mtt&amount=20000&zeroForOne=1&exactInput=1```

> * symbol: swap pool symbol which got from ```/allpairs```.
> * amount: the amount you want to swap.
> * zeroForOne: 1: swap token1 to token2. 0: swap token2 to token1.
> * exactInput: 1: amount is the input amount. 0: amunt is the output amount.

### Response
```
{
  "code": 0,
  "amountIn": "20000",
  "amountOut": "19298",
  "msg": ""
}
```

> * amountIn: the amount user input.
> * amountOut: the amount user got.