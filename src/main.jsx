import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerFonts } from './utils/fonts.js'

// React 렌더 전에 FontFace 객체를 document.fonts에 등록해둔다.
// 이렇게 해야 ensureFontLoaded / document.fonts.load()가 폰트를 찾을 수 있다.
registerFonts()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
