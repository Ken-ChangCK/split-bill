import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppTest from './AppTest.tsx'

// 檢查 URL 參數是否包含 test=identity
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('test') === 'identity';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTestMode ? <AppTest /> : <App />}
  </StrictMode>,
)
