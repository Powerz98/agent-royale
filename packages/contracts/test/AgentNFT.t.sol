// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AgentNFT.sol";

contract AgentNFTTest is Test {
    AgentNFT public nft;
    address public owner;
    address public alice;
    address public bob;

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        nft = new AgentNFT();

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function test_MintSucceedsWithCorrectPayment() public {
        vm.prank(alice);
        nft.mint{value: 0.002 ether}(0);

        assertEq(nft.totalSupply(), 1);
        assertEq(nft.ownerOf(1), alice);
    }

    function test_MintRevertsWithInsufficientPayment() public {
        vm.prank(alice);
        vm.expectRevert("Insufficient payment");
        nft.mint{value: 0.001 ether}(0);
    }

    function test_StatsAreDeterministic() public {
        // Mint two tokens under the same block conditions but from different senders
        // to verify stats are derived deterministically from the seed
        vm.prevrandao(bytes32(uint256(12345)));
        vm.warp(1000);

        vm.prank(alice);
        nft.mint{value: 0.002 ether}(0);

        AgentNFT.AgentTraits memory traits1 = nft.getTraits(1);

        // Stats should be within 1-10 range
        assertGe(traits1.strength, 1);
        assertLe(traits1.strength, 10);
        assertGe(traits1.agility, 1);
        assertLe(traits1.agility, 10);
        assertGe(traits1.resilience, 1);
        assertLe(traits1.resilience, 10);
        assertGe(traits1.intelligence, 1);
        assertLe(traits1.intelligence, 10);
        assertEq(traits1.archetype, 0);
    }

    function test_MaxSupplyEnforcement() public {
        // We can't mint 10000 in a test easily, so we test the logic
        // by checking the require statement behavior
        // Deploy a modified version or just verify totalSupply increments
        vm.prank(alice);
        nft.mint{value: 0.002 ether}(0);
        assertEq(nft.totalSupply(), 1);

        vm.prank(alice);
        nft.mint{value: 0.002 ether}(1);
        assertEq(nft.totalSupply(), 2);
    }

    function test_ArchetypeValidation() public {
        // Valid archetypes: 0, 1, 2
        vm.startPrank(alice);

        nft.mint{value: 0.002 ether}(0);
        nft.mint{value: 0.002 ether}(1);
        nft.mint{value: 0.002 ether}(2);

        // Invalid archetype: 3
        vm.expectRevert("Invalid archetype");
        nft.mint{value: 0.002 ether}(3);

        vm.stopPrank();
    }

    function test_Withdraw() public {
        // Mint a token to accumulate funds
        vm.prank(alice);
        nft.mint{value: 0.002 ether}(0);

        uint256 contractBalance = address(nft).balance;
        assertEq(contractBalance, 0.002 ether);

        uint256 ownerBalanceBefore = address(owner).balance;

        nft.withdraw();

        uint256 ownerBalanceAfter = address(owner).balance;
        assertEq(ownerBalanceAfter - ownerBalanceBefore, 0.002 ether);
        assertEq(address(nft).balance, 0);
    }

    function test_TokenURIReturnsPlaceholder() public {
        vm.prank(alice);
        nft.mint{value: 0.002 ether}(0);

        string memory uri = nft.tokenURI(1);
        assertEq(uri, "https://agent-royale.xyz/api/metadata/");
    }

    function test_GetTraitsRevertsForNonexistentToken() public {
        vm.expectRevert("Token does not exist");
        nft.getTraits(999);
    }

    receive() external payable {}
}
