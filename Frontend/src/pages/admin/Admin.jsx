import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import Title from '../../components/Title'

export default function Admin() {
  const { user } = useContext(AuthContext)

  const links = [
    { to: '/admin/products', label: 'Manage Products' },
    { to: '/admin/add-product', label: 'Add Product' },
    { to: '/admin/orders', label: 'Manage Orders' },
    { to: '/admin/inventory', label: 'Manage Inventory' },
    { to: '/admin/users', label: 'Manage Users' },
  ]

  return (
    <div className='border-t pt-16 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"ADMIN"} text2={"DASHBOARD"} />
      </div>
      <p className='text-gray-600 mb-8'>Welcome back, {user?.name}.</p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className='border border-gray-300 rounded-sm p-6 text-center text-gray-700 hover:bg-slate-50 transition'
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
