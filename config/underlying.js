
let balanceOf = async({read, bn}, contract, spender) => {
  let balance = await read(contract, 'balanceOf', [spender]);
  return bn(balance);
}

let balanceSetter = async (actor, contract, balances) => {
  let {bn, deref, encode, ethereum, read, trx} = actor;
  return Object.entries(balances).reduce(async (acc_, [ref, balance_]) => {
    let acc = await acc_; // force ordering

    let balance = bn(balance_);
    let currentBalance = await balanceOf(actor, contract, ref);

    if (currentBalance.gte(balance)) {
      console.log(`Skipping ${ref} as account holds sufficient balance`);
    } else {
      let amount = balance.sub(currentBalance);

      await trx(contract, 'transfer', [ref, amount]);

      // Let's make sure the balance is, in fact, updated correctly
      let newBalance = await balanceOf(actor, contract, ref);
      if (newBalance.lt(balance)) {
        throw new Error(`Expected balance for ${ref} to be greater than or equal to ${balance.toString()} but was ${newBalance.toString()}`);
      }
    }
  }, Promise.resolve(null));
}

// Note: this probably should _pull_ properties
define('Erc20', {
  match: {
    has_properties: ['address']
  },
  contract: 'Erc20',
  properties: {
    address: 'string',
    name: {
      type: 'string',
      getter: ({read}, contract, props) => read(contract, 'name')
    },
    symbol: {
      type: 'string',
      getter: ({read}, contract, props) => read(contract, 'symbol')
    }
  },
  build: async ({existing}, contract, props) => existing(contract, props.address)
});

// Make a new standard token
define('Erc20', {
  match: {
    default: true
  },
  contract: 'FaucetToken', // TODO: Replace with StandardToken
  properties: {
    name: 'string',
    symbol: 'string',
    total_supply: 'number',
    decimals: 'number',
    balances: {
      deferred: true,
      dictionary: {
        key: 'ref',
        value: 'number'
      },
      setter: balanceSetter
    }
  },
  build: async (actor, contract, {name, symbol, total_supply, decimals, balances}, { definition }) => {
    let {deploy} = actor;
    let deployed = await deploy(contract, [total_supply, name, decimals, symbol]);
    if (balances) {
      console.log(`Setting token balances for ${contract}...`);
      await definition.typeProperties.balances.setter(actor, deployed, balances);
    }
    return deployed;
  }
});

// Main-net https://etherscan.io/token/0x0d8775f648430679a709e98d2b0cb6250d2887ef
define('Erc20', {
  match: {
    properties: {
      type: 'bat'
    }
  },
  contract: 'BAToken',
  properties: {
    type: 'string', // TODO: I'd like to remove `type` as a listed property
    owner: 'address',
    name: { // TODO: We may want to verify these are correct, or hook this into a getter system
      type: 'string',
      default: 'Basic Attention Token',
      setter: async () => null
    },
    symbol: {
      type: 'string',
      default: 'BAT',
      setter: async () => null
    },
    decimals: {
      type: 'string',
      default: { type: 'number', base: '18', exp: 0 },
      setter: async () => null
    },
    balances: {
      deferred: true,
      dictionary: {
        key: 'ref',
        value: 'number'
      },
      setter: balanceSetter
    }
  },
  build: async (actor, contract, {balances}, {definition}) => {
    let {deploy, console, ethereum} = actor;
    let _ethFundDeposit = '0x0000000000000000000000000000000000000000';
    let _batFundDeposit = ethereum.from;
    let _fundingStartBlock = 0;
    let _fundingEndBlock = 0;

    // Note: Etherscan doesn't support verification of Solidity 0.4.10
    let deployed = await deploy(contract, {
      _ethFundDeposit,
      _batFundDeposit,
      _fundingStartBlock,
      _fundingEndBlock
    }, { verify: false });

    if (balances) {
      console.log(`Setting token balances for ${contract}...`);
      await definition.typeProperties.balances.setter(actor, deployed, balances);
    }

    return deployed;
  }
});

define('Erc20', {
  match: {
    properties: {
      type: 'zrx'
    }
  },
  contract: 'ZRXToken',
  properties: {
    type: 'string', // TODO: I'd like to remove `type` as a listed property
    balances: {
      deferred: true,
      dictionary: {
        key: 'ref',
        value: 'number'
      },
      setter: balanceSetter
    },
    name: { // TODO: We may want to verify these are correct, or hook this into a getter system
      type: 'string',
      default: '0x Protocol Token',
      setter: async () => null
    },
    symbol: {
      type: 'string',
      default: 'ZRX',
      setter: async () => null
    },
    decimals: {
      type: 'string',
      default: { type: 'number', base: '18', exp: 0 },
      setter: async () => null
    }
  },
  build: async (actor, contract, {balances}, { definition }) => {
    let {deploy} = actor;
    // TODO: This isn't verifying, but the contract is matching existing, so it's hard to test
    let deployed = await deploy(contract, [], {verify: false});
    if (balances) {
      console.log(`Setting token balances for ${contract}...`);
      await definition.typeProperties.balances.setter(actor, deployed, balances);
    }
    return deployed;
  }
});

define('Erc20', {
  match: {
    properties: {
      type: 'usdt'
    }
  },
  contract: 'TetherToken',
  properties: {
    type: 'string', // TODO: I'd like to remove `type` as a listed property
    name: 'string',
    symbol: 'string',
    total_supply: 'number',
    decimals: 'number',
    balances: {
      deferred: true,
      dictionary: {
        key: 'ref',
        value: 'number'
      },
      setter: balanceSetter
    }
  },
  build: async (actor, contract, {name, symbol, total_supply, decimals, balances}, { definition }) => {
    let {deploy, trx} = actor;
    // TODO: This isn't verifying, but the contract is matching existing, so it's hard to test
    // Note: for some reason, total_supply isn't being respected here
    let deployed = await deploy(contract, [total_supply, name, symbol, decimals], {verify: false});

    // Let's add to our total supply- not sure why this isn't being set right
    await trx(deployed, 'issue', [total_supply]);
    if (balances) {
      console.log(`Setting token balances for ${contract}...`);
      await definition.typeProperties.balances.setter(actor, deployed, balances);
    }
    return deployed;
  }
});