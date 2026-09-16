import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import Providers from '@/contexts/Providers'
import { initTheme } from "./themeStorage";


initTheme();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Providers>
                <App />
            </Providers>
        </BrowserRouter>
    </StrictMode>
)
