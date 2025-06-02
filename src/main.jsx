import { StrictMode } from '../node_modules/react/index.js'
import { createRoot } from '../node_modules/react-dom/client.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
