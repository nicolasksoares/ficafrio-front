import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'

// Inicializar Sentry antes de renderizar a aplicação
initSentry()

createRoot(document.getElementById('root')!).render(<App />);
