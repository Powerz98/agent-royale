import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          const siwe = new SiweMessage(credentials.message);
          const result = await siwe.verify({
            signature: credentials.signature,
            nonce: siwe.nonce,
          });

          if (!result.success) {
            return null;
          }

          return {
            id: siwe.address,
            name: siwe.address,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.name = token.sub;
      }
      return session;
    },
  },
};

/**
 * Get the authenticated wallet address from the session.
 */
export async function getWalletAddress(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.name ?? null;
}

/**
 * Require authentication. Returns the wallet address or a 401 response.
 */
export async function requireAuth(): Promise<string | NextResponse> {
  const address = await getWalletAddress();
  if (!address) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in with your wallet." },
      { status: 401 }
    );
  }
  return address;
}
