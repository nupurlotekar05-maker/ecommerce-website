import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import Carttotal from '../components/Carttotal'
import { assets } from '../assets/assets'
import { Shopcontext } from '../context/Shopcontext'
import { validateDeliveryForm, isFormValid } from '../utils/validation'
import { toast } from 'react-toastify'

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  phone: '',
}

// Small helper so every input can share the same "red border when invalid" look
const inputClass = (hasError) =>
  `border rounded py-1.5 px-3.5 w-full ${hasError ? 'border-red-500' : 'border-gray-300'}`

export default function PlaceOrder() {
  const [method, setmethod] = useState("cod")
  const { navigate, placeorder } = useContext(Shopcontext)

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})

  const onChangeHandler = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear that one field's error the moment the user edits it again,
    // instead of making them re-submit to see it disappear.
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  // Validates the delivery form first. Only if every field passes does it
  // read the cart (inside placeorder), create the order, clear the cart,
  // and redirect to /orders.
  const handlePlaceOrder = (e) => {
    e.preventDefault()

    const validationErrors = validateDeliveryForm(formData)
    setErrors(validationErrors)

    if (!isFormValid(validationErrors)) {
      toast.error("Please fix the highlighted fields before placing the order")
      return
    }

    const result = placeorder(method, formData)
    if (result.success) {
      setFormData(initialFormData)
      navigate("/orders")
    }
  }

  return (
    <form onSubmit={handlePlaceOrder} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* {left side} */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3 '>
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className='flex gap-3'>
          <div className='w-full'>
            <input name='firstName' value={formData.firstName} onChange={onChangeHandler} className={inputClass(errors.firstName)} type="text" placeholder='First Name' />
            {errors.firstName && <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>}
          </div>
          <div className='w-full'>
            <input name='lastName' value={formData.lastName} onChange={onChangeHandler} className={inputClass(errors.lastName)} type="text" placeholder='Last Name' />
            {errors.lastName && <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <input name='email' value={formData.email} onChange={onChangeHandler} className={inputClass(errors.email)} type="email" placeholder='Email Address' />
          {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
        </div>

        <div>
          <input name='street' value={formData.street} onChange={onChangeHandler} className={inputClass(errors.street)} type="text" placeholder='Street' />
          {errors.street && <p className='text-red-500 text-xs mt-1'>{errors.street}</p>}
        </div>

        <div className='flex gap-3'>
          <div className='w-full'>
            <input name='city' value={formData.city} onChange={onChangeHandler} className={inputClass(errors.city)} type="text" placeholder='City' />
            {errors.city && <p className='text-red-500 text-xs mt-1'>{errors.city}</p>}
          </div>
          <div className='w-full'>
            <input name='state' value={formData.state} onChange={onChangeHandler} className={inputClass(errors.state)} type="text" placeholder='State' />
            {errors.state && <p className='text-red-500 text-xs mt-1'>{errors.state}</p>}
          </div>
        </div>

        <div className='flex gap-3'>
          <div className='w-full'>
            <input name='zipcode' value={formData.zipcode} onChange={onChangeHandler} className={inputClass(errors.zipcode)} type="text" inputMode='numeric' maxLength={6} placeholder='Zipcode' />
            {errors.zipcode && <p className='text-red-500 text-xs mt-1'>{errors.zipcode}</p>}
          </div>
          <div className='w-full'>
            <input name='country' value={formData.country} onChange={onChangeHandler} className={inputClass(errors.country)} type="text" placeholder='Country' />
            {errors.country && <p className='text-red-500 text-xs mt-1'>{errors.country}</p>}
          </div>
        </div>

        <div>
          <input name='phone' value={formData.phone} onChange={onChangeHandler} className={inputClass(errors.phone)} type="text" inputMode='numeric' maxLength={10} placeholder='Phone' />
          {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}
        </div>

      </div>
      {/* {right side} */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <Carttotal />
        </div>

        <div className='mt-12'>
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* {payment method selection} */}
          <div className='flex gap-3 flex-col lg:flex-row'>

            <div onClick={()=>setmethod("stripe")}   className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p  className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : ""} `}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
            </div >
 
            <div onClick={()=>setmethod("razorpay")} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p  className={`min-w-3.5 h-3.5 border rounded-full ${method === "razorpay" ? "bg-green-400" : ""} `}></p>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
            </div >
 
            <div onClick={()=>setmethod("cod")}  className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : ""}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>

          </div>
          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text:sm'>PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>

  )
}
