// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EntryPool.sol";

contract EntryPoolTest is Test {
    EntryPool public pool;
    address public owner;
    address public alice;
    address public bob;

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        pool = new EntryPool();

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function test_EnterMatchWithCorrectFee() public {
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        address[] memory entrants = pool.getMatchEntrants(1);
        assertEq(entrants.length, 1);
        assertEq(entrants[0], alice);
    }

    function test_EnterMatchWithInsufficientFeeReverts() public {
        vm.prank(alice);
        vm.expectRevert("Insufficient entry fee");
        pool.enterMatch{value: 0.0005 ether}(1);
    }

    function test_SettleMatchPaysWinnerCorrectly() public {
        // Both alice and bob enter match 1
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        vm.prank(bob);
        pool.enterMatch{value: 0.001 ether}(1);

        uint256 winnerBalanceBefore = alice.balance;

        // Settle match - alice wins
        pool.settleMatch(1, alice);

        uint256 winnerBalanceAfter = alice.balance;
        // Total pool = 0.002 ether, platform cut = 10% = 0.0002 ether, payout = 0.0018 ether
        assertEq(winnerBalanceAfter - winnerBalanceBefore, 0.0018 ether);
    }

    function test_SettleAlreadySettledMatchReverts() public {
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        pool.settleMatch(1, alice);

        vm.expectRevert("Match already settled");
        pool.settleMatch(1, alice);
    }

    function test_PlatformCutIsCorrect() public {
        // Two entrants enter
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        vm.prank(bob);
        pool.enterMatch{value: 0.001 ether}(1);

        // Settle match
        pool.settleMatch(1, alice);

        // Total pool = 0.002 ether, 10% platform cut = 0.0002 ether
        assertEq(pool.accumulatedFees(), 0.0002 ether);
    }

    function test_WithdrawFees() public {
        // Enter and settle a match to accumulate fees
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        vm.prank(bob);
        pool.enterMatch{value: 0.001 ether}(1);

        pool.settleMatch(1, alice);

        uint256 expectedFees = 0.0002 ether;
        assertEq(pool.accumulatedFees(), expectedFees);

        uint256 ownerBalanceBefore = address(owner).balance;

        pool.withdrawFees();

        uint256 ownerBalanceAfter = address(owner).balance;
        assertEq(ownerBalanceAfter - ownerBalanceBefore, expectedFees);
        assertEq(pool.accumulatedFees(), 0);
    }

    function test_WithdrawFeesRevertsWhenNoFees() public {
        vm.expectRevert("No fees to withdraw");
        pool.withdrawFees();
    }

    function test_SettleMatchRevertsIfWinnerNotInEntrants() public {
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        vm.expectRevert("Winner not in entrants");
        pool.settleMatch(1, bob);
    }

    function test_EnterSettledMatchReverts() public {
        vm.prank(alice);
        pool.enterMatch{value: 0.001 ether}(1);

        pool.settleMatch(1, alice);

        vm.prank(bob);
        vm.expectRevert("Match already settled");
        pool.enterMatch{value: 0.001 ether}(1);
    }

    receive() external payable {}
}
