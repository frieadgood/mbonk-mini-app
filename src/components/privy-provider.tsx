'use client';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { Cluster } from '@solana/web3.js';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''}
      config={{
        appearance: {
          theme: 'dark'
        },
        loginMethods: ['telegram'],
        embeddedWallets: {
          createOnLogin: 'off'
        },
        solanaClusters: [
          {
            name: process.env.NEXT_PUBLIC_SOLANA_CLUSTER as Cluster,
            rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? ''
          }
        ]

      }}
    >
      {children}
    </PrivyProviderBase>
  );
}