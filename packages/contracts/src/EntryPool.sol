// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract EntryPool is Ownable {
    uint256 public constant ENTRY_FEE = 0.001 ether;
    uint256 public constant PLATFORM_CUT_BPS = 1000; // 10%

    mapping(uint256 => address[]) public matchEntrants;
    mapping(uint256 => bool) public matchSettled;

    uint256 public accumulatedFees;

    event MatchEntered(uint256 indexed matchId, address indexed entrant);
    event MatchSettled(uint256 indexed matchId, address indexed winner, uint256 payout);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function enterMatch(uint256 matchId) external payable {
        require(msg.value >= ENTRY_FEE, "Insufficient entry fee");
        require(!matchSettled[matchId], "Match already settled");

        matchEntrants[matchId].push(msg.sender);

        emit MatchEntered(matchId, msg.sender);
    }

    function settleMatch(uint256 matchId, address winner) external onlyOwner {
        require(!matchSettled[matchId], "Match already settled");

        address[] memory entrants = matchEntrants[matchId];
        require(entrants.length > 0, "No entrants");

        bool winnerFound = false;
        for (uint256 i = 0; i < entrants.length; i++) {
            if (entrants[i] == winner) {
                winnerFound = true;
                break;
            }
        }
        require(winnerFound, "Winner not in entrants");

        matchSettled[matchId] = true;

        uint256 totalPool = ENTRY_FEE * entrants.length;
        uint256 platformCut = (totalPool * PLATFORM_CUT_BPS) / 10000;
        uint256 payout = totalPool - platformCut;

        accumulatedFees += platformCut;

        (bool success, ) = payable(winner).call{value: payout}("");
        require(success, "Payout failed");

        emit MatchSettled(matchId, winner, payout);
    }

    function getMatchEntrants(uint256 matchId) external view returns (address[] memory) {
        return matchEntrants[matchId];
    }

    function withdrawFees() external onlyOwner {
        uint256 fees = accumulatedFees;
        require(fees > 0, "No fees to withdraw");

        accumulatedFees = 0;

        (bool success, ) = payable(owner()).call{value: fees}("");
        require(success, "Withdraw failed");

        emit FeesWithdrawn(owner(), fees);
    }
}
