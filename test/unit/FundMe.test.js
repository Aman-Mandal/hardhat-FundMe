const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts } = require('hardhat')

// for whole contract
describe('FundMe', async function () {
  let fundMe,
    mockV3Aggregator,
    deployer,
    sendValue = ethers.utils.parseEther('1')

  beforeEach(async function () {
    // deploy our FundMe contract before each unit test
    // using the Hardhat-deploy

    deployer = (await getNamedAccounts()).deployer
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

    it('updated the amountFunded mapping data-structure', async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.addressToAmountFunded(deployer)
      assert.equal(response.toString(), sendValue.toString())
    })

    it('Adds funder to the array of funders', async function () {
      await fundMe.fund({ value: sendValue })
      const funder = await fundMe.funders(0)
      assert.equal(funder, deployer)
    })
  })

  describe('withdraw', async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue })
    })

    it('withdraw ETH from a single funder', async function () {
      // Arrange
      const startingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address // 1Eth + previous balance starting balance
      )
      const startingBalanceDeployer = await fundMe.provider.getBalance(deployer) // 0 balance deployer

      // Act
      const transactionResponse = await fundMe.withdraw() // withdrew from contract, now deployer balance = ~1eth
      const transactionReceipt = await transactionResponse.wait(1)

      const { effectiveGasPrice, gasUsed } = transactionReceipt
      const gasCost = effectiveGasPrice.mul(gasUsed)

      const endingBalanceFundMe = await fundMe.provider.getBalance(
        // 0 balance of contract
        fundMe.address
      )
      const endingBalanceDeployer = await fundMe.provider.getBalance(deployer) // deployer balance(~1eth)
      // Assert

      assert.equal(endingBalanceFundMe, 0)
      assert.equal(
        startingBalanceFundMe.add(startingBalanceDeployer).toString(),
        endingBalanceDeployer.add(gasCost).toString()
      )
    })

    it('allow us to withdraw from multiple funders', async function () {
      const accounts = await ethers.getSigners()

      // Arrange
      for (let i = 1; i < 7; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        await fundMeConnectedContract.fund({ value: sendValue })
      }
      const startingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingBalanceDeployer = await fundMe.provider.getBalance(deployer)

      // Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { effectiveGasPrice, gasUsed } = transactionReceipt
      const gasCost = effectiveGasPrice.mul(gasUsed)

      const endingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingBalanceDeployer = await fundMe.provider.getBalance(deployer)

      // Assert
      assert.equal(endingBalanceFundMe, 0)
      assert.equal(
        startingBalanceFundMe.add(startingBalanceDeployer).toString(),
        endingBalanceDeployer.add(gasCost).toString()
      )

      // Make sure that the funders are reset properly
      await expect(fundMe.funders(0)).to.be.reverted

      for (i = 1; i < 7; i++) {
        assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
      }
    })
  })
})
