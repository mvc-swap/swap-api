# customServer Interface

## Interface URLs

- Mainnet: https://api.mvcswap.com/swap
- Testnet: https://api.mvcswap.com/swap/test

## Interface Description

## 1. Request to Create Swap Parameters

Before creating a swap, first request the latest data.

### Request

- Method: **POST**

- URL: ```/reqcreateswap```

- Body:
```
{
    address: "msREe5jsynP65899v1KJCydf6Sc9pJPb8S",
}
```

> * address: The address used by the operator to receive tokens and MVC.
> * source: A marker to identify the caller, helpful for error tracking.

### Response
```
{
    code: 0,
    msg: "",
    data: {
      requestIndex: 1,
      mvcToAddress: 'mpuHJBBbxknPXGNtVYLDJ1PNBEDXihUqCm',
      txFee: 50000,
      op: 1,
      requiredAmount: '1000000000'
    }
}
```
When `code` is 0, it indicates that the data is returned normally. When `code` is 1, it indicates there is an error, which is specified in the `msg`. **Note that a new `requestIndex` must be requested for each operation; `requestIndex` cannot be reused.**

Data format is as follows:

> * requestIndex: Request number.
> * mvcToAddress: Address where the mining fees and MVC should be transferred.
> * txFee: Mining fee required for this operation.
> * op: Swap operation type.
> * requiredAmount: Required space amount (in satoshi) for creation.

## 2. Create Swap Pair

### Request
- Method: **POST**
- URL: ```/createswap```
- Body: 
```
{
    data: compressedData
}
```

`compressedData` is in the following format:
```
data = {
    requestIndex: "1",
    mvcRawTx: "",
    mvcOutputIndex: 0,
    token1ID: "",
    token2ID: "",
    feeTier: 30,
}
compressData = gzip(JSON.stringify(data))
```

> * requestIndex: The number obtained from the previous `reqswapargs`.
> * mvcRawTx: MVC transfer raw transaction.
> * mvcOutputIndex: Output index of the MVC transfer transaction.
> * token1ID: Sensible ID of the token1 with which you want to create a trading pair
> * token2ID: Sensible ID of the token2 with which you want to create a trading pair.
> * feeTier: Transaction fee tier, options are 30, 60, 100, corresponding to 0.3%, 0.6%, 1% respectively.

**Note: For details on the transaction compression and construction method, refer to the `swap_interface`'s `addliq` interface**

### Response
```
{
    "code": 0,
    "msg": "",
    "data": {
        swapTxId: '1649c55319187fc7047f0bb372e89b5d2e2c716ce7e387470e3c0460d19065a6',
    }
}
```
When `code` is 0, it indicates that the data is returned normally, `swapTxId` indicates the created swap transaction ID. When `code` is 1, it indicates there is an error, which is specified in the `msg`.