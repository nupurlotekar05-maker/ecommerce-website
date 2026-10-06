import React, { useContext, useMemo, useState } from 'react'
import { Shopcontext } from '../../context/Shopcontext'
import Title from '../../components/Title'
import StatCard from '../../components/admin/StatCard'
import { ORDER_STATUSES, calculateOrderTotal, getOrderAnalytics } from '../../utils/orderUtils'

const statusDotColor = {
  'Order Placed': 'bg-blue-500',
  Packing: 'bg-yellow-500',
  Shipped: 'bg-purple-500',
  'Out For Delivery': 'bg-orange-500',
  Delivered: 'bg-green-500',
  Cancelled: 'bg-red-500',
}

export default function AdminOrders() {
  const { orders, currency, delivery_fees, updateOrderStatus } = useContext(Shopcontext)

  const [searchOrderId, setSearchOrderId] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Analytics are recomputed only when `orders` actually changes, not on
  // every keystroke of the search boxes below.
  const analytics = useMemo(() => getOrderAnalytics(orders, delivery_fees), [orders, delivery_fees])

  const customerName = (order) =>
    order.customerName ||
    (order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : '') ||
    'Unknown customer'

  const visibleOrders = useMemo(() => {
    let result = [...orders]

    if (searchOrderId.trim()) {
      const q = searchOrderId.trim().toLowerCase()
      result = result.filter((order) => order.id.toLowerCase().includes(q))
    }

    if (searchCustomer.trim()) {
      const q = searchCustomer.trim().toLowerCase()
      result = result.filter((order) => customerName(order).toLowerCase().includes(q))
    }

    if (statusFilter !== 'All') {
      result = result.filter((order) => order.status === statusFilter)
    }

    result.sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    )

    return result
  }, [orders, searchOrderId, searchCustomer, statusFilter, sortOrder])

  return (
    <div className='border-t pt-6 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"MANAGE"} text2={"ORDERS"} />
      </div>

      {/* ---- Analytics cards ---- */}
      <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8'>
        <StatCard label='Total Orders' value={analytics.totalOrders} />
        <StatCard label='Pending' value={analytics.pending} tone='blue' />
        <StatCard label='Packing' value={analytics.packing} tone='yellow' />
        <StatCard label='Shipped' value={analytics.shipped} tone='blue' />
        <StatCard label='Delivered' value={analytics.delivered} tone='green' />
        <StatCard label='Cancelled' value={analytics.cancelled} tone='red' />
        <StatCard label='Revenue' value={`${currency}${analytics.totalRevenue}`} tone='green' />
      </div>

      {/* ---- Search / filter / sort toolbar ---- */}
      <div className='flex flex-col md:flex-row gap-3 mb-6'>
        <input
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          placeholder='Search by Order ID'
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-52'
        />
        <input
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          placeholder='Search by Customer Name'
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-56'
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-48'
        >
          <option value='All'>All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-44'
        >
          <option value='newest'>Sort: Latest First</option>
          <option value='oldest'>Sort: Oldest First</option>
        </select>
      </div>

      {/* ---- Orders list ---- */}
      {visibleOrders.length === 0 && (
        <p className='text-gray-500 py-8 text-center'>No orders match your filters.</p>
      )}

      <div className='flex flex-col gap-4'>
        {visibleOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id
          const orderTotal = calculateOrderTotal(order, delivery_fees)

          return (
            <div key={order.id} className='border border-gray-200 rounded-sm'>
              {/* Summary row */}
              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4'>
                <div className='flex items-start gap-4'>
                  <img
                    className='w-14 h-14 object-cover rounded-sm'
                    src={order.items[0]?.image}
                    alt=""
                  />
                  <div className='text-sm'>
                    <p className='font-medium text-gray-800'>{order.id}</p>
                    <p className='text-gray-500'>{customerName(order)}</p>
                    <p className='text-gray-400'>{new Date(order.date).toLocaleString()}</p>
                    <p className='text-gray-500'>{order.items.length} item(s) · {currency}{orderTotal}</p>
                  </div>
                </div>

                <div className='flex items-center gap-4 flex-wrap'>
                  <div className='flex items-center gap-2'>
                    <span className={`w-2 h-2 rounded-full ${statusDotColor[order.status] || 'bg-gray-400'}`} />
                    <span className='text-sm'>{order.status}</span>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className='border border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className='text-sm border px-3 py-1.5 rounded-sm hover:bg-slate-50'
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className='border-t border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700 bg-slate-50'>
                  {/* Product details */}
                  <div>
                    <p className='font-medium text-gray-800 mb-2'>Products</p>
                    <div className='flex flex-col gap-3'>
                      {order.items.map((item, idx) => (
                        <div key={idx} className='flex items-center gap-3'>
                          <img src={item.image} className='w-10 h-10 object-cover rounded-sm' alt="" />
                          <div>
                            <p>{item.name}</p>
                            <p className='text-gray-500'>ID: {item.productId} · Size: {item.size} · Qty: {item.quantity} · {currency}{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer details */}
                  <div>
                    <p className='font-medium text-gray-800 mb-2'>Customer</p>
                    {order.address ? (
                      <div className='flex flex-col gap-1'>
                        <p>{order.address.firstName} {order.address.lastName}</p>
                        <p>{order.address.email}</p>
                        <p>{order.address.phone}</p>
                        <p>{order.address.street}</p>
                        <p>{order.address.city}, {order.address.state}</p>
                        <p>{order.address.country} - {order.address.zipcode}</p>
                      </div>
                    ) : (
                      <p className='text-gray-400'>No delivery details on file.</p>
                    )}
                  </div>

                  {/* Order details */}
                  <div>
                    <p className='font-medium text-gray-800 mb-2'>Order</p>
                    <div className='flex flex-col gap-1'>
                      <p>Order ID: {order.id}</p>
                      <p>User ID: {order.userId || 'N/A'}</p>
                      <p>Customer: {customerName(order)}</p>
                      <p>Date: {new Date(order.date).toLocaleString()}</p>
                      <p>Total: {currency}{orderTotal}</p>
                      <p>Payment Method: {order.paymentMethod?.toUpperCase()}</p>
                      <p>Payment Status: {order.paymentStatus}</p>
                      <p>Order Status: {order.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
