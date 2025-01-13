# predicate

We provide an AML via predicate

## Usage

To set up the development environment:

```bash
# install
yarn

# dev
yarn workspace predicate dev

# build
yarn build
```

## API Usage

```sh
# health check
curl http://localhost:3000/v1/health | jq

# predicate
curl http://localhost:3000/predicate/evaluate-policy
```
