

import { createConfig, configureChains, sepolia } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useConnect } from 'wagmi'

const WALLETCONNECT_PROJECT_ID = 'df8fc6da0f38368bfb4e1bbf9909432c'

const { chains, publicClient } = configureChains(
  [sepolia], 
  [publicProvider()]
)

export const config = createConfig({
  autoConnect: false,
  publicClient,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
      },
    }),
  ],
})


