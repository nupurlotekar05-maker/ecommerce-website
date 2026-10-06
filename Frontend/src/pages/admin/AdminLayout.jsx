import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'

// This is the only structural addition to the Admin area: previously there
// was no persistent navigation between admin pages. Wrapping the existing
// admin routes in this layout (via a nested <Route> in App.jsx) adds the
// sidebar around them without changing what Admin.jsx / AdminProducts.jsx /
// AdminOrders.jsx themselves render.
export default function AdminLayout() {
  return (
    <div className='flex flex-col sm:flex-row gap-6 pt-6'>
      <AdminSidebar />
      <div className='flex-1 min-w-0'>
        <Outlet />
      </div>
    </div>
  )
}
