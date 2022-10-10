const { network } = require('hardhat')
const { networkConfig, developmentChains } = require('../helper-hardhat-config')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainID = network.config.chainId

  //   const ethUsdPriceFeedAddress = networkConfig[chainID]['ethUsdPriceFeed']
  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator')
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainID]['ethUsdPriceFeed']
  }

  // if the contract doesn't exist we deploy a minimal version of it as a mock
  // for our local testing

  // when going for localhost or hardhat network we want to use a mock

  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put price feed address
    log: true
  })

  log('-------------------------------------------------------------')
}

module.exports.tags = ['all', 'fundMe']
