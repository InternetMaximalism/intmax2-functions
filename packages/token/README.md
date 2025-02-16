# token

The token service is an API-based tool designed to provide tokens.

## Usage

To set up the development environment:

```bash
# install
yarn

# set up the environment
cp ../../.env.example .env

# dev
yarn workspace token dev

# build
yarn build
```

## API Usage

```sh
# health check
curl http://localhost:3000/v1/health | jq

# token prices
curl "http://localhost:3000/v1/token-prices/list" | jq
curl "http://localhost:3000/v1/token-prices/list?contractAddresses=0x92d6c1e31e14520e676a687f0a93788b716beff5&contractAddresses=0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050&perPage=2" | jq

# token mappings
curl "http://localhost:3000/v1/token-mappings/list" | jq
curl "http://localhost:3000/v1/token-mappings/list?tokenIndexes=1&tokenIndexes=2&perPage=2" | jq
```
