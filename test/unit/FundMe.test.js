const { assert, expect } = require("chai")
const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { developmentNetwork } = require("../../utils/helper-hardhat-config")

!developmentNetwork.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe
          let deployer
          let mockAggregator

          beforeEach(async () => {
              // deploy contracts using hardhat-deploy
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockAggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("should set the price feed address", async function() {
                  const priceFeedAddress = await fundMe.getPriceFeed()
                  assert.equal(priceFeedAddress, mockAggregator.address)
              })
          })

          describe("fund", async () => {
              it("Fails if you dont send enough ETH", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "send at least 50$ worth of ETH"
                  )
              })

              it("Updated amount funded data structure", async function() {
                  await fundMe.fund({ value: ethers.utils.parseEther("1") })
                  const amountFunded = await fundMe.getAddressToAmount(deployer)
                  assert.equal(
                      amountFunded.toString(),
                      ethers.utils.parseEther("1").toString()
                  )
              })

              it("Add funder to array of s_funders", async function() {
                  await fundMe.fund({ value: ethers.utils.parseEther("1") })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: ethers.utils.parseEther("1") })
              })

              it("Only owner can withdraw", async function() {
                  const initialContractBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )
                  const txResponse = await fundMe.withdraw({ from: deployer })
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      initialDeployerBalance
                          .add(initialContractBalance)
                          .toString()
                  )
              })

              it("Allows us to withdraw with multiple s_funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 10; i++) {
                      const fundMeConnctedContract = fundMe.connect(accounts[i])
                      await fundMeConnctedContract.fund({
                          value: ethers.utils.parseEther("1")
                      })
                  }
                  const initialContractBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  const txResponse = await fundMe.withdraw({ from: deployer })
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      initialDeployerBalance
                          .add(initialContractBalance)
                          .toString()
                  )
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (i = 0; i < 10; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmount(accounts[i].address),
                          0
                      )
                  }
              })

              it("Only allows owner to withdraw", async function() {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })

              it("cheaperWithdraw test", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 10; i++) {
                      const fundMeConnctedContract = fundMe.connect(accounts[i])
                      await fundMeConnctedContract.fund({
                          value: ethers.utils.parseEther("1")
                      })
                  }
                  const initialContractBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  const txResponse = await fundMe.cheaperWithdraw({
                      from: deployer
                  })
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      initialDeployerBalance
                          .add(initialContractBalance)
                          .toString()
                  )
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (i = 0; i < 10; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmount(accounts[i].address),
                          0
                      )
                  }
              })
          })
      })
