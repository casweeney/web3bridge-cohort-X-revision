// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./interface/IW3XToken.sol";

error ADDRESS_ZERO_DETECTED();
error ZERO_VALUE_NOT_ALLOWED();
error INSUFFICIENT_BALANCE();
error TRANSFER_FROM_FAILED();
error TRANSFER_FAILED();
error ONLY_OWNER_REQUIRED();

string constant ADDRESS_ZERO = "ADDRESS ZERO DETECTED";

contract SaveERC20 {
    address public savingToken;
    address public owner;

    mapping(address => uint256) savings;

    event SavingSuccessful(address sender, uint256 amount);
    event WithdrawSuccessful(address receiver, uint256 amount);

    constructor(address _savingToken) {
        savingToken = _savingToken;
        owner = msg.sender;
    }

    function deposit(uint256 _amount) external {
        if(msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        if(_amount <= 0) {
            revert ZERO_VALUE_NOT_ALLOWED();
        }

        if(IW3XToken(savingToken).balanceOf(msg.sender) < _amount) {
            revert INSUFFICIENT_BALANCE();
        }

        IW3XToken(savingToken).transferFrom(msg.sender, address(this), _amount);

        savings[msg.sender] += _amount;

        emit SavingSuccessful(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        if(msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        if(_amount <= 0) {
            revert ZERO_VALUE_NOT_ALLOWED();
        }

        uint256 _userSaving = savings[msg.sender];

        if(_userSaving < _amount) {
            revert INSUFFICIENT_BALANCE();
        }

        savings[msg.sender] -= _amount;

        IW3XToken(savingToken).transfer(msg.sender, _amount);

        emit WithdrawSuccessful(msg.sender, _amount);
    }

    function checkUserBalance(address _user) external view returns (uint256) {
        return savings[_user];
    }

    function checkContractBalance() external view returns(uint256) {
        return IW3XToken(savingToken).balanceOf(address(this));
    }

    function ownerWithdraw(uint256 _amount) external  {
        onlyOwner();
        
        IW3XToken(savingToken).transfer(msg.sender, _amount);
    }

    function onlyOwner() private view {
        if(msg.sender != owner) {
            revert ONLY_OWNER_REQUIRED();
        }
    }
}