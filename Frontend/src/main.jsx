import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom" 
import Shopcontextprovider from './context/Shopcontext.jsx'
import AuthProvider from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
 <AuthProvider>
 <Shopcontextprovider>
 <App/>
 </Shopcontextprovider>
 </AuthProvider>
 </BrowserRouter>,
)
