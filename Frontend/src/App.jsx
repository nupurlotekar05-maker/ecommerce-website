import React from 'react'
import {Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Product from './pages/Product'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Profile from './pages/Profile'
import Admin from './pages/admin/Admin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminProducts from './pages/admin/AdminProducts'
import AdminAddProduct from './pages/admin/AdminAddProduct'
import AdminEditProduct from './pages/admin/AdminEditProduct'
import AdminOrders from './pages/admin/AdminOrders'
import AdminInventory from './pages/admin/AdminInventory'
import AdminUsers from './pages/admin/AdminUsers'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Searchbar from './components/Searchbar'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"
export default function App() {
  return (
  <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
    <Navbar/>
    <ToastContainer/>
    <Searchbar/>
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Home/>}/>
  <Route path="/collection" element={<Collection/>}/>
  <Route path="/about" element={<About/>}/>
  <Route path="/contact" element={<Contact/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/product/:productId" element={<Product/>}/>

  {/* USER-only protected routes */}
  <Route path="/home" element={<ProtectedRoute allowedRoles={["USER"]}><Home/></ProtectedRoute>}/>
  <Route path="/profile" element={<ProtectedRoute allowedRoles={["USER"]}><Profile/></ProtectedRoute>}/>
  <Route path="/cart" element={<ProtectedRoute allowedRoles={["USER"]}><Cart/></ProtectedRoute>}/>
  <Route path="/orders" element={<ProtectedRoute allowedRoles={["USER"]}><Orders/></ProtectedRoute>}/>
  <Route path="/place-order" element={<ProtectedRoute allowedRoles={["USER"]}><PlaceOrder/></ProtectedRoute>}/>

  {/* ADMIN-only protected routes - all nested under AdminLayout so every
      admin page shares the same sidebar (Dashboard/Products/Orders/Inventory/Customers)
      without any of the pages themselves needing to render it. */}
  <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout/></ProtectedRoute>}>
    <Route index element={<Admin/>}/>
    <Route path="products" element={<AdminProducts/>}/>
    <Route path="add-product" element={<AdminAddProduct/>}/>
    <Route path="products/edit/:productId" element={<AdminEditProduct/>}/>
    <Route path="orders" element={<AdminOrders/>}/>
    <Route path="inventory" element={<AdminInventory/>}/>
    <Route path="users" element={<AdminUsers/>}/>
  </Route>
</Routes>
<Footer/>
  </div>
  )
}
