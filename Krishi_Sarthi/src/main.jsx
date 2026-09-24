import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./i18n.js"
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>
)

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('KIRAN service worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('KIRAN service worker registration failed:', error);
      });
  }
});
