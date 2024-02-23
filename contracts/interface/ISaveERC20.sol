// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ISaveERC20 {
    function deposit(uint256 _amount) external;

    function checkUserBalance(address _user) external view returns (uint256);

    function checkContractBalance() external view returns(uint256);
}