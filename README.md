
## Terrafier

Terra with [Nest](https://github.com/nestjs/nest) for fun and profit.

### How to run
`nest start`

## Abilities
Get Net Worth for addresses via ap3board api.
Post Net Worth to local LaMetric.
Post notification to local LaMetric in case of high TVL.

WOMM.

## Config

Get header request from ap3board, fill in the right values in the yaml.

### .env.yaml

```
http:
  apeboard:
    baseUrl: https://api.apeboard.finance
    headers:
      base: {"accept": "application/json, text/plain, */*", "accept-language": "en-US,en;q=0.9,sv;q=0.8","sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Microsoft Edge\";v=\"92\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"}
      secret: "RGlkIHlvdSByZWFsbHkgdGhpbmsgSSB3b3VsZCBwdXQgbXkgb3duIHBhc3N3b3JkIGluIGJhc2U2ND8gOD09PUQ=="
      passcode: "9377h15c0d3f20m4p38042d23qh34d32"
  lametric:
    baseUrl: "https://192.168.1.100:4343"
    headers:
      base: {"X-Access-Token": "V2h5IGFyZSB5b3UgdHJ5aW5nIHRoaXMgYWdhaW4_IDpE==","Content-Type": "application/json","Cache-Control": "no-cache"}
      auth: "Basic Y29tZSBvbiwgYWdhaW4_"
    paths:  
      widgetPath: "/api/v1/dev/widget/update/com.lametric.4m421n93nc2yp710n707411yun8234k4813/1"
      notificationsPath: "/api/v2/device/notifications"

account:
  addresses: ["terra1dp0taj85ruc299rkdvzp4z5pfg6z6swaed74e6","terra1zxtczmxtw8mk8xncvr8lcq2qmvk4dz88ek6f79"]
  assetPaths: ["wallet/terra", "anchorTerra", "lunastakingTerra", "pylonTerra", "specTerra"]

settings:
  anchor:
    tvlLimitHigh: 0.55
    tvlLimitLow: 0.45
  lametric:
    goalUST: 10000

```

## License

Nest is [MIT licensed](LICENSE).
