const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentNetwork } = require("../../utils/helper-hardhat-config")
const { assert, expect } = require("chai")

developmentNetwork.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw({
                  from: deployer,
                  gasPrice: ethers.utils.parseUnits("1", "gwei"),
                  gasLimit: 30000
              })
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
