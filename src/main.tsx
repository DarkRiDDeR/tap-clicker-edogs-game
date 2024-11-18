import React, { }  from 'react';
import ReactDOM from 'react-dom/client'
//import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
//import { type Adapter } from '@solana/wallet-adapter-base';
import App from './App.tsx'
import './index.css'
import { CoinbaseWalletAdapter, LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter/*, UnsafeBurnerWalletAdapter*/ } from '@solana/wallet-adapter-wallets';

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
//const network = WalletAdapterNetwork.Mainnet;
// You can also provide a custom RPC endpoint.
const endpoint = "https://solana-mainnet.api.syndica.io/api-key/2x3ywi9sxxGain7Fy45GR6mkGEhkLRhgftArUpaFmNwNp7VXyfdZRHZMU6GVxsctDwh11om8fvVgio24wKWcsDMV98S1r3RcNt7"
//const endpoint = useMemo(() => clusterApiUrl(network), [network]);
const wallets =[
  new CoinbaseWalletAdapter,
  new LedgerWalletAdapter,
  new PhantomWalletAdapter,
  new SolflareWalletAdapter,
  new TrustWalletAdapter,
  //new UnsafeBurnerWalletAdapter
]

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <App />
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
)
