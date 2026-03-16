export const AGENT_NFT_ADDRESS =
  (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000001";

export const ENTRY_POOL_ADDRESS =
  (process.env.NEXT_PUBLIC_ENTRY_POOL_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000002";

export const agentNFTAbi = [
  {
    name: "mint",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "archetype", type: "uint8" }],
    outputs: [],
  },
  {
    name: "getTraits",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "strength", type: "uint8" },
      { name: "agility", type: "uint8" },
      { name: "resilience", type: "uint8" },
      { name: "intelligence", type: "uint8" },
    ],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "MINT_PRICE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const entryPoolAbi = [
  {
    name: "enterMatch",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "matchId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "settleMatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "winner", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "getMatchEntrants",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "matchId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "ENTRY_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
