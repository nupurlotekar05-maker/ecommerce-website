import React, { useContext } from 'react'
import { Shopcontext } from '../context/Shopcontext'
import { Link } from 'react-router-dom'

const badgeByStatus = {
  'In Stock': { dot: '🟢', className: 'bg-green-100 text-green-700' },
  'Low Stock': { dot: '🟡', className: 'bg-yellow-100 text-yellow-700' },
  'Out Of Stock': { dot: '🔴', className: 'bg-red-100 text-red-700' },
}

export default function Productitem({id,image,name,price}) {
    const {currency,getProductStockStatus}=useContext(Shopcontext)
    const { status } = getProductStockStatus(id)
    const badge = badgeByStatus[status]
  return (
    <Link className='text-grey-700 cursor pointer' to={`/product/${id}`}>
    <div className='overflow-hidden relative'>
<img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
<span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
  {badge.dot} {status}
</span>
    </div>
    <p className='pt-3 pb-1 text-sm'>{name}</p>
    <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
    
  )
}
