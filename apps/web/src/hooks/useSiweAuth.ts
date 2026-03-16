"use client";

import { useCallback, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";

/**
 * Hook that manages SIWE authentication with next-auth.
 *
 * - Automatically signs out when the wallet disconnects or changes.
 * - Provides a `login()` function to initiate SIWE sign-in.
 * - Exposes session status and the authenticated address.
 */
export function useSiweAuth() {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const sessionAddress = session?.user?.name ?? null;

  // Sign out if wallet disconnects or address changes
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      signOut({ redirect: false });
    }
    if (
      isConnected &&
      isAuthenticated &&
      sessionAddress &&
      address &&
      sessionAddress.toLowerCase() !== address.toLowerCase()
    ) {
      signOut({ redirect: false });
    }
  }, [isConnected, isAuthenticated, sessionAddress, address]);

  const login = useCallback(async () => {
    if (!address || !chainId) {
      throw new Error("Wallet not connected");
    }

    // Fetch a fresh nonce
    const nonceRes = await fetch("/api/auth/nonce");
    const { nonce } = await nonceRes.json();

    // Build the SIWE message
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in to Agent Royale",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    });

    const messageString = message.prepareMessage();

    // Request wallet signature
    const signature = await signMessageAsync({ message: messageString });

    // Authenticate with next-auth
    const result = await signIn("credentials", {
      message: messageString,
      signature,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("SIWE authentication failed");
    }

    return result;
  }, [address, chainId, signMessageAsync]);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  return {
    login,
    logout,
    isAuthenticated,
    isLoading,
    address: sessionAddress,
  };
}
