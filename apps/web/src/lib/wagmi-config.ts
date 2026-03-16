import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Only include WalletConnect connector when a real project ID is set
const connectors = projectId
  ? (() => {
      const { walletConnect } = require("wagmi/connectors");
      return [injected(), walletConnect({ projectId })];
    })()
  : [injected()];

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
});
