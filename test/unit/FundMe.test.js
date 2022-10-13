const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts } = require('hardhat')

// for whole contract
describe('FundMe', async function () {
  let fundMe, mockV3Aggregator
  beforeEach(async function () {
    // deploy our FundMe contract before each unit test
    // using the Hardhat-deploy

    const { deployer } = await getNamedAccounts()
    // deployments.fixture deploys all the contracts in the deploy folder with the tag specified in it
    await deployments.fixture(['all'])
    fundMe = await ethers.getContract('FundMe', deployer) // our contract
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
  })

  // -------------for individual function/units-----------

  // constructor
  describe('constructor', async function () {
    it('sets the aggregator address correctly', async function () {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  // fund function
  describe('fund', async function () {
    it('Fails if you dont send enough ETH', async function () {
      await expect(fundMe.fund()).to.be.reverted
    })
  })
})
