import React, { useContext, useEffect, useState } from 'react'
import { products } from '../assets/assets'
import { Shopcontext } from '../context/Shopcontext'
import Title from './Title'
import Productitem from './Productitem'

export default function Latestcollection() {
   const {products} =useContext(Shopcontext)
   const [Latestproduct,setlatestproduct]=useState([])
   useEffect(()=>{
setlatestproduct(products.slice(0,10));
},[])
   console.log(products)
    return (
    <div className='my-10'>
  <div className='text-center py-8 text-3xl'>
   <Title text1={"Latest"} text2={"Collection"}/>
   <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
   Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas sunt enim quam, veritatis libero itaque nemo minus culpa rerum assumenda similique placeat quae consequatur architecto autem eius expedita dolorum magni?</p>
  </div>
  {/* {Rendering products} */}
  
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
   {
    Latestproduct.map((item,index)=>(
    <Productitem  key={index} id={item._id} image={item.image} name={item.name} price={item.price} />    
    ))
   }
  </div>
    </div>
  )
}
