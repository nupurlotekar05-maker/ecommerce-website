import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/add-product', label: 'Add Product' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Customers' },
]

export default function AdminSidebar() {
  return (
    <aside className='w-full sm:w-52 sm:min-h-[70vh] sm:border-r border-gray-200 sm:pr-4 mb-6 sm:mb-0'>
      <nav className='flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible'>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `whitespace-nowrap px-4 py-2 text-sm rounded-sm transition ${
                isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
