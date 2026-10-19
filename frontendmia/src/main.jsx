import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import './css/variable.css'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'

createRoot(document.getElementById('root')).render(
  <RouterProvider router={routes} />
)
