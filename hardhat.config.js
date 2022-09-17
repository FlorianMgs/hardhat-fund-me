require("@nomiclabs/hardhat-waffle")
require("@nomicfoundation/hardhat-toolbox")
require("hardhat-gas-reporter")
require("hardhat-change-network")
require("solidity-coverage")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            accounts: [process.env.PRIVATE_KEY],
            url: process.env.GOERLI_RPC,
            chainId: 5,
            blockConfirmations: 6
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 1337
        }
    },
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }]
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
}
