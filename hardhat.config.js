const { version } = require('chai')

require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')
require('dotenv').config()

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: '0.8.17',
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
  },
  defaultNetwork: 'hardhat',
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    coinmarketcap: COINMARKET_API_KEY,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
}
