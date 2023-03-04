# Swap Interface 

## Interface Entrance 

- mainnet: https://api.mvcswap.com/swap
- testnet: https://api.mvcswap.com/swap/test

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
    "code":0,
    "msg": "",
    "data":{
        "mvc-ssp": {
            "token1": {
                "symbol":"mvc",
                "tokenID":"",
                "genesisHash":"",
                "codeHash":"",
                "decimal": 8,
            },
            "token2": {
                "symbol":"sspt",
                "tokenID":"2b5c37d535cc7f822022b2bc8ce502c480563de08ec7e7130777cab55337be2100000000",
                "genesisHash":"5de90b9c12d2975a79b67a5f7a2b037f1aad16b0",
                "codeHash":"c9c23794ad9a1899e96482780065c74cf78c3060",
                "decimal": 8,
            },
            "lptoken":{
                "symbol":"mvc-sspt",
                "tokenID":"3aacf8a31dfe2f96a4d5d5e12073db6650a9213c04441ec8bebb49d67b367cf800000000",
                "genesisHash":"02d3ca4f58e216a96a71d43f5af897694ad5fe26",
                "codeHash":"4d4e59d05d38948e12d8015cac9055ba3e41a5bd",
                "decimal":8,
            },
            "swapCodeHash":"3af062db29f1e04faeb5e35531fad75410473e40",
            "swapID":"f09b244a3c5cc74a49d5695a32c33af4ef572d9d",
            "poolAmount":"10000",
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
> * poolAmount: a pool amount used for sorting token pairs.

**Note: The request header of this interface must include {Accept-Encoding: gzip}**

## 2. Get Swap Info

### Request
- Method: **GET**
- URL: ```/swapinfo?symbol=mvc-ssp```

> * symbol: swap pool symbol which got from ```/allpairs```.

### Response
```
{
    code: 0,
    message: "",
    data: {
        swapToken1Amount: "100000",
        swapToken2Amount: "100000",
        swapLpAmount: "100000",
        swapFeeRate: 25,
        projFeeRate: 5,
        minProjFee: "500"
    }
}
```

data format:

> * swapToken1Amount: token1 amount in swap pool, whose type is string.
> * swapToken2Amount: token1 amount in swap pool, whose type is string.
> * swapLpAmount: lp token amount in swap pool, whose type is string.
> * swapFeeRate: swap fee rate.
> * projFeeRate: proj fee rate.
> * minProjFee: the minimum fee which proj will get.

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
    source: 'mvcswap.io'
}
```

> * symbol: swap symbol.
> * address: the user's address used for accepting mvc and tokens.
> * op: swap operation: 1 add liquidity, 2 remove liquidity, 3 swap token1 to token2. 4 swap token2 to token1.
> * source: mark the identity of the caller to make it easier to find errors.

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
        swapLpAmount: "1000000",
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
> * swapLpAmount: lp token amount in swap pool, whose type is string.
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
    token1AddAmount: "100000",
    amountCheck2RawTx: "",
    token2RawTx: "",
    token2OutputIndex: 0,
    mvcRawTx: "",
    mvcOutputIndex: 0,
    amountCheck1RawTx: "",
    token1RawTx: "",
    token1OutputIndex: 0,
}
compressData = gzip(JSON.stringify(data))
```

> * symbol: swap symbol.
> * requestIndex: returned in ```/reqswapargs```.
> * token1AddAmount: The token1 amount you want to add to pool.
> * amountCheck2RawTx: the unlockFromContract tx used in token2 transfering.
> * token2RawTx: The raw transaction for transfering token2 to tokenAddress.
> * token2OutputIndex: the outputIndex of transation for token2 transfering.
> * mvcRawTx: The raw transaction for transfering mvc to mvcAddress.
> * mvcOutputIndex: The outputIndex of transaction for mvc transfering.
> * amountCheck1RawTx: the unlockFromContract tx used in token1 transfering. It is needed when token1 is not mvc.
> * token1RawTx: The raw transaction for transfering token1 to tokenAddress. It is needed when token1 is not mvc.
> * token1OutputIndex: the outputIndex of transation for token1 transfering. It is needed when token1 is not mvc.

**Note: If the token1 is mvc, you need transfer sum of token1AddAmount and txFee. And the minimum token1AddAmount is 1000 satoshis.**

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
        lpAddAmount: '7144'
    }
}
```

data format:

> * txid: the swap transaction id.
> * lpAddAmount: the lp token amount user got.

## 5. Remove Liquidity

### Request
- Methos: **POST**
- URL: ```/removeliq```
- Body: 
```
{
    symbol: "mvc-ssp",
    requestIndex: "1",
    lpTokenRawTx,
    lpTokenOutputIndex,
    mvcRawTx,
    mvcOutputIndex: 0,
    amountCheckRawTx,
}
```
> * symbol: swap symbol.
> * requestIndex: returned in ```/reqswapargs```.
> * lpTokenRawRawTx: The raw transaction for transfering lp token to tokenAddress.
> * lpTokenOutputIndex: the outputIndex of transation for lp Token transfering.
> * mvcRawTx: The raw transaction for transfering mvc to mvcAddress.
> * mvcOutputIndex: The outputIndex of transaction for mvc transfering.
> * amountCheckRawTx: the unlockFromContract tx used in token transfering.

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