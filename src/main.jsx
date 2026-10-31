import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProviders } from './context/AppProviders.jsx'
import ToastContainer from './components/common/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
        <ToastContainer />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
