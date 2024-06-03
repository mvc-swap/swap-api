# Router Interface 

## Interface Entrance 

- mainnet: https://api.mvcswap.com/router
- testnet: https://api.mvcswap.com/router/test

## 1. Get swap res.

### Request
- Method: **GET**
- URL: ```/route?tokenIn=space&tokenOut=mtt&amount=20000```

> * tokenIn: the symbol of the token user send to swap pool.
> * tokenOut: the symbol of the token user get after swaping.
> * amount: if amount > 0, means the amount user will send. if amount < 0, means the amount user will get after swaping.

### Response
```
{
  "code": 0,
  "data": {
    "path": "v1",
    "amountIn": "8417",
    "amountOut": "10000"
  }
}
```

> * path: v1 or v2.
> * amountIn: the amount user will send.
> * amountOut: the amount user will get.