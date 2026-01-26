import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { FinanceProvider } from './context/FinanceContext.tsx'
import { FeedbackProvider } from './context/FeedbackContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FinanceProvider>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </FinanceProvider>
    </AuthProvider>
  </React.StrictMode>,
)
