// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 ethPrice = uint256(price) * 1e10;
        return (ethPrice * ethAmount) / 1e18;
    }
}
