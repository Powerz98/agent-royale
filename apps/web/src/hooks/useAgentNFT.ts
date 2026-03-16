"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { AGENT_NFT_ADDRESS, agentNFTAbi } from "@/lib/contracts";

export function useAgentNFT() {
  const { address } = useAccount();

  const { data: totalSupply } = useReadContract({
    address: AGENT_NFT_ADDRESS as `0x${string}`,
    abi: agentNFTAbi,
    functionName: "totalSupply",
  });

  const { data: balance } = useReadContract({
    address: AGENT_NFT_ADDRESS as `0x${string}`,
    abi: agentNFTAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { writeContract: mint, isPending } = useWriteContract();

  return {
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    balance: balance ? Number(balance) : 0,
    mint,
    isPending,
  };
}
