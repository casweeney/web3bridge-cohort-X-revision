import { ethers } from "hardhat";

async function main() {

  const W3XTokenAddress = "0x5cf44F9E9dEffDbF1C54fD516F525A0348B56445";
  const SavingContractAddress = "0x4d219E15bc25866B73221859064cd7E1DA6382A8";

  const SavingsContract = await ethers.getContractAt("ISaveERC20", SavingContractAddress);
    const StakingToken = await ethers.getContractAt("IW3XToken", W3XTokenAddress);

    const depositAmount = ethers.parseUnits("1000", 18);

    const approveTx = await StakingToken.approve(SavingContractAddress, depositAmount);
    await approveTx.wait();

    const saveTx = await SavingsContract.deposit(depositAmount);
    await saveTx.wait();

    const amountUserSavedInContract = await SavingsContract.checkUserBalance("0x617cd3DB0CbF26F323D5b72975c5311343e09115");

    console.log("User contract balance: ",amountUserSavedInContract);

    const amountInSavingContract = await SavingsContract.checkContractBalance();

    console.log("Amount saved in contract: ", amountInSavingContract);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
