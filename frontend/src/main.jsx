import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx'
import { GlobalProvider } from './context/GlobalContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="695958764159-rbdkroesu7t6s5jf5935cd77ausfmadt.apps.googleusercontent.com">
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
