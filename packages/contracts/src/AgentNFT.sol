// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract AgentNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 public constant MINT_PRICE = 0.002 ether;
    uint256 public constant MAX_SUPPLY = 10000;

    struct AgentTraits {
        uint8 archetype;
        uint8 strength;
        uint8 agility;
        uint8 resilience;
        uint8 intelligence;
    }

    mapping(uint256 => AgentTraits) public agentTraits;

    constructor() ERC721("AgentRoyale", "AGENT") Ownable(msg.sender) {}

    function mint(uint8 archetype) external payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(archetype <= 2, "Invalid archetype");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);

        bytes32 seed = keccak256(
            abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, tokenId)
        );

        agentTraits[tokenId] = AgentTraits({
            archetype: archetype,
            strength: uint8((uint256(seed) % 10) + 1),
            agility: uint8((uint256(seed >> 8) % 10) + 1),
            resilience: uint8((uint256(seed >> 16) % 10) + 1),
            intelligence: uint8((uint256(seed >> 24) % 10) + 1)
        });
    }

    function getTraits(uint256 tokenId) external view returns (AgentTraits memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return agentTraits[tokenId];
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return "https://agent-royale.xyz/api/metadata/";
    }

    // Required overrides for ERC721Enumerable
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
