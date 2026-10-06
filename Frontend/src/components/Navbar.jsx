import React, { useContext, useState } from 'react'
import { assets } from "../assets/assets"
import { Link, NavLink } from 'react-router-dom'
import { Shopcontext } from '../context/Shopcontext';
import { AuthContext } from '../context/AuthContext';
export default function () {
  const [visible, setvisible] = useState(false);
  const {setshowsearch,getcartitem}=useContext(Shopcontext)
  const {user,logout}=useContext(AuthContext)
  return (

    <div className='flex items-center justify-between py-5 font-medium' >
      <Link to="/"><img src={assets.logo} className="w-36" alt="" /></Link>
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700  hidden' />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-6'>
        <img onClick={()=>setshowsearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />
        <div className='group relative '>
           <Link to={user ? (user.role === "ADMIN" ? "/admin" : "/profile") : "/login"}>
             <img className='w-5 cursor-pointer' src={assets.profile_icon} alt="" />
           </Link>
          <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
            <div className='flex flex-col gap-2 w-44 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
              {user ? (
                <>
                  <p className='text-gray-800 font-medium truncate'>{user.name}</p>
                  <span className={`w-fit text-[10px] px-2 py-0.5 rounded-full text-white ${user.role === "ADMIN" ? "bg-red-500" : "bg-green-600"}`}>
                    {user.role}
                  </span>
                  {user.role === "ADMIN" ? (
                    <Link to="/admin" className='cursor-pointer hover:text-black'>Admin Panel</Link>
                  ) : (
                    <>
                      <Link to="/profile" className='cursor-pointer hover:text-black'>My Profile</Link>
                      <Link to="/orders" className='cursor-pointer hover:text-black'>Orders</Link>
                    </>
                  )}
                  <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
                </>
              ) : (
                <Link to="/login" className='cursor-pointer hover:text-black'>Login</Link>
              )}
            </div>
          </div>
        </div>
      
      <Link to="/cart" className='relative'>
        <img src={assets.cart_icon} className='w-5 cursor-pointer ' alt="" />
        <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4  bg-black text-white aspect-square rounded-full text-[8px]'>{getcartitem()}</p>
      </Link>
     <img onClick={() => setvisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
</div>
      {/* {sidebar for small screens} */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full': 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setvisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img className='h-4 rotat-180' src={assets.dropdown_icon} alt="" />
            <p>Back</p>
          </div>
          <NavLink onClick={()=>setvisible(false)} className="py-2 pl-6 border" to="/">Home</NavLink>
          <NavLink onClick={()=>setvisible(false)} className="py-2 pl-6 border" to="/collection">Collection</NavLink>
          <NavLink onClick={()=>setvisible(false)} className="py-2 pl-6 border" to="/about">About</NavLink>
          <NavLink onClick={()=>setvisible(false)} className="py-2 pl-6 border" to="/contact">Contact</NavLink>
        </div>
      </div>
    </div>

  )
}
