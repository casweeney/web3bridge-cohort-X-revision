import { ethers } from "hardhat";

async function main() {

  const w3xToken = await ethers.deployContract("W3XToken");
  await w3xToken.waitForDeployment();
  console.log(`W3XToken  deployed to ${w3xToken.target}`);

  const saveERC20 = await ethers.deployContract("SaveERC20", [w3xToken.target]);
  await saveERC20.waitForDeployment();
  console.log(`SaveERC20  deployed to ${saveERC20.target}`);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
