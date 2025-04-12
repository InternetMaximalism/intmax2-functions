# tx-map

The tx-map service provides a simple way to temporarily store and retrieve key-value mappings for transaction-related data using a digest as the key.

## Usage

To set up the development environment:

```bash
# install
yarn

# dev
yarn workspace tx-map dev

# build
yarn build
```

## API Usage

```sh
# health check
curl http://localhost:3000/v1/health | jq

# store a mapping
curl -X POST http://localhost:3000/v1/map \
  -H "Content-Type: application/json" \
  -d '{
    "digest": "sampledigest123",
    "data": "sampledata456",
    "expiresIn": 300
  }'

# retrieve a mapping
curl http://localhost:3000/v1/map/sampledigest123
```
