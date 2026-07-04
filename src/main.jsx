import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShelbyClientProvider } from '@shelby-protocol/react'
import { ShelbyClient } from '@shelby-protocol/sdk/browser'
import WalletProvider from './context/WalletContext'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient()
const shelbyClient = new ShelbyClient({
  network: "shelbynet",
  apiKey: import.meta.env.VITE_SHELBY_API_KEY,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ShelbyClientProvider client={shelbyClient}>
          <WalletProvider>
            <App />
          </WalletProvider>
        </ShelbyClientProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)