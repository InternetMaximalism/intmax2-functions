# query-map

The **Query Map** is a lightweight service that stores and retrieves long query parameters using short identifiers.  
It is useful for sharing, reusing, or simplifying long query strings in URLs.


## Usage

To set up the development environment:

```bash
# install
yarn

# dev
yarn workspace query-map dev

# build
yarn build
```

## API Usage

```sh
# health check
curl http://localhost:3000/v1/health | jq
```
