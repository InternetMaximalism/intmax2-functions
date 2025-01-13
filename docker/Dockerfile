FROM node:22.12.0 AS builder
RUN corepack enable
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/*/package.json ./packages/
COPY . .

RUN yarn install --immutable
RUN yarn build

FROM node:22.12.0
RUN corepack enable
WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/packages ./packages

RUN yarn install

EXPOSE 3000
ENTRYPOINT ["yarn"]
