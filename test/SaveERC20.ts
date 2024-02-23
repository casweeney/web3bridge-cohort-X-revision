import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployERC20TokenAndSavingContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const W3xToken = await ethers.getContractFactory("W3XToken");
    const w3xToken = await W3xToken.deploy();

    const SaveERC20 = await ethers.getContractFactory("SaveERC20");
    const saveERC20 = await SaveERC20.deploy(w3xToken.target);

    return { w3xToken, saveERC20, owner, otherAccount };
  }

  describe("Testing Saving Contract Deployment", function () {

    it("Should set the right ERC20 token address", async function () {
      const { w3xToken, saveERC20 } = await loadFixture(deployERC20TokenAndSavingContractFixture);

      expect(await saveERC20.savingToken()).to.equal(w3xToken.target);
    });

    it("Should set the right owner", async function () {
      const { saveERC20, owner } = await loadFixture(deployERC20TokenAndSavingContractFixture);

      expect(await saveERC20.owner()).to.equal(owner.address);
    });

    // it("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(
    //     deployOneYearLockFixture
    //   );

    //   expect(await ethers.provider.getBalance(lock.target)).to.equal(
    //     lockedAmount
    //   );
    // });

    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });
  });

  describe("Saving", function () {
    describe("Validations", function () {
      it("Should revert if zero value is deposited", async function () {
        const { saveERC20 } = await loadFixture(deployERC20TokenAndSavingContractFixture);

        await expect(saveERC20.deposit(0)).to.be.revertedWithCustomError(saveERC20,
          "ZERO_VALUE_NOT_ALLOWED"
        );
      });

      it("Should revert if deposited amount is greater than user token balance", async function () {
        const { saveERC20 } = await loadFixture(deployERC20TokenAndSavingContractFixture);

        const depositAmount = ethers.parseUnits("10000000", 18);

        // We use lock.connect() to send a transaction from another account
        await expect(saveERC20.deposit(depositAmount)).to.be.revertedWithCustomError(saveERC20,
          "INSUFFICIENT_BALANCE"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on deposit", async function () {
        const { w3xToken, saveERC20, owner } = await loadFixture(deployERC20TokenAndSavingContractFixture);

        const depositAmount = ethers.parseUnits("1000", 18);

        const approveTx = await w3xToken.approve(saveERC20.target, depositAmount);
        await approveTx.wait();

        await expect(saveERC20.deposit(depositAmount))
          .to.emit(saveERC20, "SavingSuccessful")
          .withArgs(owner.address, depositAmount);
      });
    });

    describe("Deposit", function () {
      it("Should deposit successfully", async function () {
        const { w3xToken, saveERC20, owner } = await loadFixture(deployERC20TokenAndSavingContractFixture);

        const depositAmount = ethers.parseUnits("1000", 18);

        const approveTx = await w3xToken.approve(saveERC20.target, depositAmount);
        await approveTx.wait();

        const depositTx = await saveERC20.deposit(depositAmount);
        await depositTx.wait();

        const userBalance = await saveERC20.checkUserBalance(owner.address);

        await expect(userBalance).to.be.equal(depositAmount);
      });
    });

    describe("Withdrawal", function () {
      it("Should withdraw successfully", async function () {
        const { w3xToken, saveERC20, owner } = await loadFixture(deployERC20TokenAndSavingContractFixture);

        const userBalanceBeforeDeposit = await w3xToken.balanceOf(owner.address);

        const depositAmount = ethers.parseUnits("1000", 18);

        const approveTx = await w3xToken.approve(saveERC20.target, depositAmount);
        await approveTx.wait();

        const depositTx = await saveERC20.deposit(depositAmount);
        await depositTx.wait();

        const userBalance = await saveERC20.checkUserBalance(owner.address);

        await expect(userBalance).to.be.equal(depositAmount);

        // Withdrawal testing starts here

        const userTokenBalanceBeforeWithdraw = await w3xToken.balanceOf(owner.address);
        const contractTokenBalanceBeforeWithdraw = await saveERC20.checkContractBalance();

        const withdrawTx = await saveERC20.withdraw(depositAmount);
        await withdrawTx.wait();

        const userTokenBalanceAfterWithdraw = await w3xToken.balanceOf(owner.address);
        const contractBalanceAfterWithdraw = await saveERC20.checkContractBalance();
        

        await expect(userTokenBalanceAfterWithdraw).to.be.equal(userTokenBalanceBeforeWithdraw + depositAmount);
        await expect(contractBalanceAfterWithdraw).to.be.equal(contractTokenBalanceBeforeWithdraw - depositAmount);

      });
    });
  });
});
