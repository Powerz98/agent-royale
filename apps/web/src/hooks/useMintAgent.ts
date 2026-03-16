"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { AGENT_NFT_ADDRESS, agentNFTAbi } from "@/lib/contracts";

const MINT_PRICE = parseEther("0.002");

export function useMintAgent() {
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const mint = (archetype: number) => {
    writeContract({
      address: AGENT_NFT_ADDRESS as `0x${string}`,
      abi: agentNFTAbi,
      functionName: "mint",
      args: [archetype],
      value: MINT_PRICE,
    });
  };

  return {
    mint,
    isPending,
    isSuccess,
    isConfirming,
    isConfirmed,
    hash,
    error,
  };
}
