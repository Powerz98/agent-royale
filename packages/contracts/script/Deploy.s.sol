// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "lib/forge-std/src/Script.sol";
import "../src/AgentNFT.sol";
import "../src/EntryPool.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        AgentNFT agentNFT = new AgentNFT();
        EntryPool entryPool = new EntryPool();

        vm.stopBroadcast();

        console.log("AgentNFT deployed to:", address(agentNFT));
        console.log("EntryPool deployed to:", address(entryPool));
    }
}
