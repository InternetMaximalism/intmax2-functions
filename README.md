# intmax2-functions

This document provides instructions for setting up, running, building with Docker, and deploying the `intmax2-functions` project.

## Installing Dependencies

First, install the project dependencies, build the project, and set up the environment.

```bash
# install
yarn

# build:shared
yarn build:shared

# build
yarn build

# setup
cp .env.example .env
```

## Running the Project

To start the development mode for each workspace, use the following commands:

**API**

```bash
yarn workspace <package-name> dev

# ex.
yarn workspace indexer dev
```

**JOB**

```bash
yarn workspace <package-name> dev

# ex.
yarn workspace deposit-analyzer dev
```

## Local Emulator

```sh
gcloud emulators firestore start
export FIRESTORE_EMULATOR_HOST="HOST:PORT"
```