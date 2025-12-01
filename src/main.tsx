import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppTest from './AppTest.tsx'

// 檢查 URL 參數是否包含 test 參數（任何值都會進入測試模式）
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.has('test');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTestMode ? <AppTest /> : <App />}
  </StrictMode>,
)
