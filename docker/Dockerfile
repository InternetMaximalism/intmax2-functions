FROM node:22.14.0-bookworm-slim AS builder

RUN corepack enable && \
    corepack prepare yarn@4.9.1 --activate && \
    yarn set version 4.9.1

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/*/package.json ./packages/
COPY . .

RUN yarn install --immutable
RUN yarn build

FROM node:22.14.0-bookworm-slim

RUN corepack enable && \
    corepack prepare yarn@4.9.1 --activate && \
    yarn set version 4.9.1

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/packages ./packages

RUN yarn install --immutable

EXPOSE 3000
ENTRYPOINT ["yarn"]