const { network } = require("hardhat")
const { developmentNetwork } = require("../utils/helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (developmentNetwork.includes(network.name)) {
        log("local network detected, deploying mock contracts")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [8, 20000000000]
        })
        log("Mocks deployed")
        log("------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
