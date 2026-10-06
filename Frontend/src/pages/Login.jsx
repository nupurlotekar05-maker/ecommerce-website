import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

// Simple inline eye / eye-off icons so we don't need an extra icon dependency
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.4 20.4 0 0 1-3.22 4.44" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default function Login() {
  const [currentstate, setcurrentstate] = useState("Sign Up")
  const { login, register } = useContext(AuthContext)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const onsubmithandler = async (e) => {
    e.preventDefault()
    if (currentstate === "Login") {
      login({ email, password })
    } else {
      // Role is no longer chosen by the user - it is determined
      // automatically inside AuthContext based on the email used.
      register({ name, email, password })
    }
  }

  return (
    <form onSubmit={onsubmithandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                   <p className='prata-regular text-3xl'>{currentstate}</p>
                   <hr  className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
       {currentstate ==="Login" ? "" : <input value={name} onChange={(e)=>setName(e.target.value)} className='w-full px-3 py-2 border border-gray-800' type="text"  placeholder='Name' required/>} 
                <input value={email} onChange={(e)=>setEmail(e.target.value)} className='w-full px-3 py-2 border border-gray-800' type="email"  placeholder='Email' required />
        <div className='relative w-full'>
          <input
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className='w-full px-3 py-2 pr-10 border border-gray-800'
            type={showPassword ? "text" : "password"}
            placeholder='Password'
            required
          />
          <button
            type='button'
            onClick={()=>setShowPassword((prev)=>!prev)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800'
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
     <div className='w-full flex justify-between text-sm mt-[-8px]'>
      <p className='cursor-pointer'>Forgot Your Password</p>
      {
        currentstate === "Login"
        ? <p onClick={()=>setcurrentstate("Sign Up")} className='cursor-pointer'>Create Account</p>
        : <p onClick={()=>setcurrentstate("Login")} className='cursor-pointer'>Login Here</p>
      }
     </div>
      <button className='bg-black text-white font-light px-8 py-2 mt- '>{currentstate === "Login" ? "Sign In" : "Sign Up"}</button>

    </form>
  )
}
