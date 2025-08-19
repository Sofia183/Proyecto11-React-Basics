import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* habilita el enrutado con historial de navegador */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
