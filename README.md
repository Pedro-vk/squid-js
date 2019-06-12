[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# squid-js

> 🦑 JavaScript client library for Ocean Protocol
> [oceanprotocol.com](https://oceanprotocol.com)

[![npm](https://img.shields.io/npm/v/@oceanprotocol/squid.svg)](https://www.npmjs.com/package/@oceanprotocol/squid)
[![Travis (.com)](https://img.shields.io/travis/com/oceanprotocol/squid-js.svg)](https://travis-ci.com/oceanprotocol/squid-js)
[![GitHub contributors](https://img.shields.io/github/contributors/oceanprotocol/squid-js.svg)](https://github.com/oceanprotocol/squid-js/graphs/contributors)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8508313231b44b0997ec84898cd6f9db)](https://app.codacy.com/app/ocean-protocol/squid-js?utm_source=github.com&utm_medium=referral&utm_content=oceanprotocol/squid-js&utm_campaign=Badge_Grade_Settings)
[![js oceanprotocol](https://img.shields.io/badge/js-oceanprotocol-7b1173.svg)](https://github.com/oceanprotocol/eslint-config-oceanprotocol) 
[![Greenkeeper badge](https://badges.greenkeeper.io/oceanprotocol/squid-js.svg)](https://greenkeeper.io/)

---

**🐲🦑 THERE BE DRAGONS AND SQUIDS. This is in alpha state and you can expect running into problems. If you run into them, please open up [a new issue](https://github.com/oceanprotocol/squid-js/issues). 🦑🐲**

---

- [Get started](#get-started)
  - [Examples](#examples)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
- [Production build](#production-build)
- [Releases](#releases)
- [License](#license)

---

## Get started

Start by adding the package to your dependencies:

```bash
npm i @oceanprotocol/squid --save
```

The package exposes `Ocean` and `Logger` which you can import in your code like this:

```js
// ES6
import { Ocean, Logger } from '@oceanprotocol/squid'

// ES2015
const { Ocean, Logger } = require('@oceanprotocol/squid')
```

You can then connect to a running [Keeper](https://github.com/oceanprotocol/keeper-contracts) & [Aquarius](https://github.com/oceanprotocol/aquarius) instance, e.g.:

```js
const ocean: Ocean = await Ocean.getInstance({
    // the node of the blockchain to connect to, could also be infura
    nodeUri: "http://localhost:8545",
    // the uri of aquarius
    aquariusUri: "http://localhost:5000",
    // the uri of brizo
    brizoUri: "http://localhost:8030",
    // address that brizo uses
    brizoAddress: "0x00bd138abd70e2f00903268f3db08f2d25677c9e"
    // the uri to the parity node you want to use for encryption and decryption
    parityUri: "http://localhost:9545",
    // the uri of the secret store that holds the keys
    secretStoreUri: "http://localhost:12001"
})
```

### Examples

You can see how `squid-js` is used on:

* [Integration test](/src/integration/ocean/)
* [Tuna](https://github.com/oceanprotocol/tuna/tree/develop/node)

## Documentation

**[Docs: squid-js API Reference →](https://docs.oceanprotocol.com/references/squid-js/)**

Alternatively, you can generate the raw TypeDoc documentation locally by running:

```bash
# will output to ./doc folder
npm run doc
```

## Development

To start development you need to:

```bash
npm i
npm start
```

## Testing

### Unit Tests

For unit tests, running [`ganache-cli`](https://github.com/trufflesuite/ganache-cli) is required before starting the tests:

```bash
npm i -g ganache-cli
ganache-cli
```

To start unit tests, run:

```bash
npm test
```

or to watch for changes:

```bash
npm run test:watch
```

to create code coverage information:

```bash
npm run test:cover
```

### Integration Tests

Besides a running `ganache-cli` instance, a locally running Ocean network is required. To do so before running the tests, use [Barge](https://github.com/oceanprotocol/barge):

```bash
git clone https://github.com/oceanprotocol/barge
cd barge

./start_ocean.sh --latest --no-pleuston --local-spree-node
```

In another terminal window, run this script and export the seed phrase:

```bash
# copies the contract artifacts once the local Ocean network is up and running
./scripts/wait_for_migration_and_extract_keeper_artifacts.sh

# export Spree accounts seed phrase
export SEED_WORDS="taxi music thumb unique chat sand crew more leg another off lamp"
```

Once everything is up, run the integration tests:

```bash
npm run integration
```

to generate code coverage information during test, run:

```bash
npm run integration:cover
```

## Production build

```bash
npm run build
```

## Releases

For a new **patch release**, execute on the machine where you're logged into your npm account:

```bash
./bumpversion path
```

git tag with the latest version and `git push`

## License

```text
Copyright 2019 Ocean Protocol Foundation Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.