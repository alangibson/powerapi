
# TODO

- GET /logo.png 404 5.634 ms
- POST /enabled?lic=none 404 2.224 ms
- Integration Test: GET /atlassian-connect.json 200 2.790 ms

# Development

## Unit Tests

```bash
npm test
```

## Local Integration

Make sure that credentials.json is up to date
https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/

```bash
npm run build
npm start
```

# Notes

Request to editor SPA is:

```
GET /editor?
    dialog=1&
    simpleDialog=1&
    xdm_e=https://powerplantuml.atlassian.net&
    xdm_c=channel-powerapi__powerapi-dynamic-macro&
    cp=/wiki&
    lic=none&
    cv=1000.0.0-ee5f5ee17f46&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YjBkODZmYTZjMjdiODRkMDBjZTlhMWEiLCJxc2giOiIyMmQxN2Y0NWQxNDdkZmI4MDUwNTkzYzY3NDZjMGU3Y2M3NjNlODdmNTFiOWQxNWE2YTg5ODljNTc2ODU2YTc3IiwiaXNzIjoiYTI4ZDc3ZDctNTE4YS0zOWMwLWFlN2UtMzQyNDdjMWE1MGMyIiwiY29udGV4dCI6e30sImV4cCI6MTY1Mjg3MTM0NSwiaWF0IjoxNjUyODcxMTY1fQ.oxmHCFKlJCKpkiaZKarMxwvw9B-g1oqlPw-cqwxEcz8
```

Request to installation endpoint is:

```
POST /installed
{
  key: 'powerapi',
  clientKey: 'a28d77d7-518a-39c0-ae7e-34247c1a50c2',
  publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCIWM6/F03fnzrVG2RCToMwzP2RB9vgiqkV90RkJ3U0EnWBvJKZxMFu1mRXUWM84/EbdwPMIwiZoo4dCeJzMH9Xc+pyWD3lVCloXTjPrxkXGRnbPE/N1pdD2Jzajp8KeyL5pK6MLH8/8Pf3RZQpmoy8Zliicce2IJjqnJ1QQsjjlwIDAQAB',
  sharedSecret: 'ATCOMyD-6itMDfMENcXXIHlUQPa0Jiu0F74mC9NLoRf2l5FwvkgfZM8YIz4egzWAI2KXPa873JneoY53q0v24NlZEg172DEA06',
  serverVersion: '6452',
  pluginsVersion: '1000.0.0.ee5f5ee17f46',
  baseUrl: 'https://powerplantuml.atlassian.net/wiki',
  productType: 'confluence',
  description: 'Atlassian Confluence at https://confluence-prod-eu-12.prod.atl-paas.net/wiki',
  eventType: 'installed'
}
```