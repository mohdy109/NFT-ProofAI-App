import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WagmiConfig } from 'wagmi';
import { config } from './lib/wallet.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </StrictMode>,
)
