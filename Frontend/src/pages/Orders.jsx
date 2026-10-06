import React, { useContext } from 'react'
import { Shopcontext } from '../context/Shopcontext'
import Title from '../components/Title'

export default function Orders() {
  const { myOrders, currency } = useContext(Shopcontext)

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      <div>
        {
          myOrders.length === 0 && (
            <p className='py-6 text-gray-500'>You haven't placed any orders yet.</p>
          )
        }
        {
          // Each order can contain multiple products, so we flatten
          // order -> items while keeping a stable, unique key per line.
          myOrders.map((order) => (
            order.items.map((item, index) => (
              <div key={`${order.id}-${item.productId}-${item.size}-${index}`} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:item-center md:justify-between gap-4 '>
                <div className='flex items-start text:sm gap-6 '>
                  <img className='w-16 sm:w-20' src={item.image} alt="" />
                  <div >
                    <p className='sm:text-base font-medium'> {item.name}</p>
                    <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                      <p className='text-lg'>{currency}{item.price}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>
                    <p className='mt-2'>Date: <span className='text-gray-400'>{new Date(order.date).toLocaleDateString()}</span></p>
                    <p className='mt-1'>Payment: <span className='text-gray-400'>{order.paymentStatus}</span></p>
                  </div>
                </div>
                <div className='md:w-1/2 flex justify-between'>
                  <div className='flex items-center gap-2'>
                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                    <p className='text:sm md:text-base'>{order.status}</p>
                  </div>
                  <button className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                </div>
              </div>
            ))
          ))
        }
      </div>
    </div>
  )
}
