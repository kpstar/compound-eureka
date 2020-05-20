
## Compound Eureka

This example sets up what is necessary for a Compound test-net deployment. This code will probably be moved outside of this repo before anything is published publicly.

## Get Started

You may want to directly link `eureka` during development:

```bash
cd ~ # or your code directory
git clone git@github.com:compound-finance/eureka.git
cd eureka
yarn install
yarn link
cd ~/compound-eureka # back to this directory
yarn link @compound-finance/eureka
```

This will make it significantly easier to pull updates during alpha development.

## Local Deployment

To apply the Compound test-net for development, start ganache locally and then run:

```bash
yarn eureka apply -c compound.js compound.eureka testnet.eureka
```

This will create a local test-net for you. Take a look at `compound.eureka` and `testnet.eureka` for the configuration. `compound.js` contains information about how the contracts are structured. You will also notice the `.builds` directory contains the builds from Compound.

## Test-net Deployment

To apply the Compound test-net say for Ropsten, run:

```bash
yarn eureka apply -n ropsten -c compound.js compound.eureka testnet.eureka ropsten.eureka
```

For `ropsten.eureka`, we override Dai's underlying with a token from the test-net itself.

## Debugging

There's lots of bugs in Eureka still. The focus, as yet, is to make sure the ideas are sound before pushing the code to a higher-quality state. Be prepared to need patches.

### Development-State.json

Delete this file as much as you want if you have problems. It'll wipe out the state from Eureka's perspective so Eureka will start fresh the next time it runs.

### Web3 Provider

To specify a web3 provider, you'll need to connect this in `compound.js`. There's not been much thought as yet what's the right way to specify the provider, so this was a quick and easy solution. Right now you can set the env var `pk` or it will try and use the first unlocked account.

### Syntax Highlighting

Set your syntax highlighting for `eureka` files to Java. It looks pretty normal. Though uh, hopefully your IDE doesn't start parsing them!

### Parsing

For issues with `.eureka` files, parsing can be helpful. The following command can show you the parsed output of your given Compound Eureka files:

```bash
yarn eureka parse compound.eureka testnet.eureka ropsten.eureka
```

## Notes

## Fetch Compound Build

We can fetch different versions of Compound from Docker builds by running:

```bash
./fetch_build.sh 8bc065b
```

See a list of tagged releases here: https://hub.docker.com/repository/docker/compoundfinance/compound-protocol-alpha/tags. In the future, we should see more releases here that are tagged `v2.7` instead of being tagged simply by the commit hash.

## Fetch Atari Token

Currently, we're using a random token to pretend to be foreign-imported Dai, you can pull the build by running:

```bash
npx saddle import -n ropsten --outdir=.build --outname=contracts-atari.json 0x1f5d94172e6363f7b4a334f86f86911de4d0b8c5
```

## Governance

Started work on `gov.eureka`, but note: if we deploy Governance, then most "update" features simply aren't going to work, since it'll depend on running as the admin. It'll be fun, but hard, to come up with a solution where we could make Eureka handle updates through Governance.
