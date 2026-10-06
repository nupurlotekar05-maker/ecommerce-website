import React, { useContext, useEffect, useState } from 'react'
import { Shopcontext } from '../context/Shopcontext'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import Carttotal from '../components/Carttotal'

export default function Cart() {
    const {products,currency,cartitems,updatequantity,removefromcart,navigate,getProductStockStatus} =useContext(Shopcontext)
  const [cartdata,setcartdata] =useState([])
   
  useEffect(()=>{
      const tempdata=[]
      for(const items in cartitems){
        for(const item in cartitems[items]){
          if(cartitems[items][item]>0){
             tempdata.push({
              _id:items,
              size:item,
              quantity:cartitems[items][item]
             })
          }
        }
      }
        setcartdata(tempdata)
  },[cartitems])

  return (
    <div className='border-t pt-14'>
   <div className='text-2xl mb-3'>
        <Title text1={"YOUR"} text2={"CART"}/>  
   </div>
     <div>
       {
        cartdata.map((item,index)=>{
          const productdata=products.find((product)=>product._id === item._id)
          const { stock, status } = getProductStockStatus(item._id)
           return(
            <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
               <div className='flex items-start gap-6'>
                 <img className='w-16 sm:w-20' src={productdata.image[0]} alt="" />
                <div >
                  <p className='text-xs sm:text-lg font-medium '>{productdata.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                   <p >{currency}{productdata.price}</p>
                   <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                  </div>
                  {status === 'Out Of Stock' && (
                    <p className='text-xs text-red-500 mt-1'>This product just went out of stock - remove it to check out.</p>
                  )}
                  {status === 'Low Stock' && (
                    <p className='text-xs text-yellow-600 mt-1'>Only {stock} left in stock.</p>
                  )}
                </div>
               </div>
               <input onChange={(e)=>e.target.value === "" || e.target.value === "0" ? null : updatequantity(item._id,item.size,Number(e.target.value))} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min={1} max={stock} defaultValue={item.quantity} />
              <img onClick={()=>removefromcart(item._id,item.size)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
            </div>
           )
        })
       }
     </div>

     <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
         <Carttotal/>
        <div className='w-full text-end'>
          <button onClick={()=>navigate("/place-order")} className='cursor-pointer bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
        </div>
        </div>
     </div>
    </div>
  )
}
