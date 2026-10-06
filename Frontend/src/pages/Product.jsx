import React, { useContext, useEffect, useState } from 'react'
import { Shopcontext } from '../context/Shopcontext'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Relatedproduct from '../components/Relatedproduct'

export default function Product() {
  const { products, currency,addtocart,getProductStockStatus } = useContext(Shopcontext)
  const { productId } = useParams()
  const [productdata, setproductsdata] = useState(false)
  const [image, setimage] = useState("")
  const [sizes, setsizes] = useState("")

  const fetchproductdata = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setproductsdata(item)
        setimage(item.image[0])
        
        return null;
      }
    })
  }

  useEffect(() => {
    fetchproductdata()
  }, [productId, products])

  const { stock, status } = productdata ? getProductStockStatus(productdata._id) : { stock: 0, status: 'Out Of Stock' }
  const statusBadgeClass = {
    'In Stock': 'bg-green-100 text-green-700',
    'Low Stock': 'bg-yellow-100 text-yellow-700',
    'Out Of Stock': 'bg-red-100 text-red-700',
  }[status]

  return productdata ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* {productdata} */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row '>
        {/* {products image} */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productdata.image.map((item, index) => (
                <img onClick={() => setimage(item)} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' src={item} key={index} alt="" />
              ))
            }
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>
        {/* {Product info} */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productdata.name}</h1>
          <div className='flex item-center gap-1 mt-2'>
            <img className='w-3 5' src={assets.star_icon} alt="" />
            <img className='w-3 5' src={assets.star_icon} alt="" />
            <img className='w-3 5' src={assets.star_icon} alt="" />
            <img className='w-3 5' src={assets.star_icon} alt="" />
            <img className='w-3 5' src={assets.star_dull_icon} alt="" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productdata.price}</p>

          {/* Live stock quantity + status, sourced from the same inventory
              state the Admin Inventory page edits - so this always reflects
              the latest stock without a page refresh. */}
          <div className='flex items-center gap-3 mt-3'>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusBadgeClass}`}>{status}</span>
            <span className='text-sm text-gray-500'>Stock: {stock}</span>
          </div>
          {status === 'Low Stock' && (
            <p className='mt-2 text-sm text-yellow-600'>Only few items left</p>
          )}

          <p className='mt-5 text-gray-500 md:w-4/5'>{productdata.description}</p>
          <div className='flex flex-col gap-4 my-8 '>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {
                productdata.sizes.map((item, index) => (
                  <button onClick={() => setsizes(item)} className={`border py-2 px-4 bg-gray-100 ${item === sizes ? "border-orange-500" : ""} `} key={index} >{item}</button>
                ))
              }

            </div>

          </div>
          {status === 'Out Of Stock' ? (
            <button disabled className='bg-gray-300 text-gray-600 px-8 py-3 text-sm cursor-not-allowed'>Out Of Stock</button>
          ) : (
            <button onClick={()=>addtocart(productdata._id,sizes)}  className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>Add To Cart</button>
          )}
         <hr  className='mt-8 sm:w-4/5'/>
              <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original Product.</p>
              <p>Cash On Delivery is available on this product.</p>
              <p>Easy return and Exchange policy in 7 days.</p>
              </div>

        </div>

      </div>
      {/* {description and review section} */}
       <div className='mt-20'>
        <div className='flex '>
          <b className='border px-5 py-3 text-sm'>Description</b>
           <p className='border px-5 py-3 text-sm'>Reviews(122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
         <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer. </p>
        <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
       </div>
       
       {/* {Related products} */}
        <Relatedproduct category={productdata.category} subCategory={productdata.subCategory}/>

    </div>
  ) : <div className='opacity-0'></div>
}
