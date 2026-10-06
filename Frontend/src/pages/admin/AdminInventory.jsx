import React, { useContext, useMemo, useState } from 'react'
import { Shopcontext } from '../../context/Shopcontext'
import Title from '../../components/Title'
import StatCard from '../../components/admin/StatCard'
import {
  getStockStatus,
  getLowStockProducts,
  getInventoryAnalytics,
  increaseStock,
  decreaseStock,
  markOutOfStock,
} from '../../utils/inventoryService'

const statusBadgeClass = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out Of Stock': 'bg-red-100 text-red-700',
}

export default function AdminInventory() {
  const { inventory, currency, updateStock } = useContext(Shopcontext)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [restockAmount, setRestockAmount] = useState({}) // { [productId]: amount }

  const analytics = useMemo(() => getInventoryAnalytics(inventory), [inventory])
  const lowStockAlerts = useMemo(() => getLowStockProducts(inventory), [inventory])

  const categories = useMemo(
    () => ['All', ...new Set(inventory.map((row) => row.category).filter(Boolean))],
    [inventory]
  )

  const visibleInventory = useMemo(() => {
    let result = [...inventory]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (row) => row.name.toLowerCase().includes(q) || row.productId.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'All') {
      result = result.filter((row) => row.category === categoryFilter)
    }

    if (statusFilter !== 'All') {
      result = result.filter((row) => getStockStatus(row.stock) === statusFilter)
    }

    return result
  }, [inventory, search, categoryFilter, statusFilter])

  const amountFor = (productId) => Number(restockAmount[productId]) || 1
  const setAmountFor = (productId, value) =>
    setRestockAmount((prev) => ({ ...prev, [productId]: value }))

  return (
    <div className='border-t pt-6 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"MANAGE"} text2={"INVENTORY"} />
      </div>

      {/* ---- Analytics cards ---- */}
      <div className='grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6'>
        <StatCard label='Total Products' value={analytics.totalProducts} />
        <StatCard label='In Stock' value={analytics.inStock} tone='green' />
        <StatCard label='Low Stock' value={analytics.lowStock} tone='yellow' />
        <StatCard label='Out Of Stock' value={analytics.outOfStock} tone='red' />
        <StatCard label='Total Units' value={analytics.totalQuantity} />
      </div>

      {/* ---- Low stock alerts ---- */}
      {lowStockAlerts.length > 0 && (
        <div className='border border-yellow-300 bg-yellow-50 rounded-sm p-4 mb-6'>
          <p className='font-medium text-yellow-800 mb-2'>⚠ Low Stock Alerts</p>
          <div className='flex flex-col gap-1 text-sm text-yellow-800'>
            {lowStockAlerts.map((row) => (
              <p key={row.productId}>{row.name} — {row.stock} unit(s) left</p>
            ))}
          </div>
        </div>
      )}

      {/* ---- Search / filter toolbar ---- */}
      <div className='flex flex-col md:flex-row gap-3 mb-6'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by product name or ID'
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-64'
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-44'
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-44'
        >
          <option value='All'>All Statuses</option>
          <option value='In Stock'>In Stock</option>
          <option value='Low Stock'>Low Stock</option>
          <option value='Out Of Stock'>Out Of Stock</option>
        </select>
      </div>

      {/* ---- Inventory table ---- */}
      <div className='flex flex-col gap-3'>
        {visibleInventory.length === 0 && (
          <p className='text-gray-500 py-8 text-center'>No products match your filters.</p>
        )}

        {visibleInventory.map((row) => {
          const status = getStockStatus(row.stock)
          return (
            <div key={row.productId} className='border border-gray-200 rounded-sm p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <img src={row.image} className='w-14 h-14 object-cover rounded-sm' alt="" />
                <div className='text-sm'>
                  <p className='font-medium text-gray-800'>{row.name}</p>
                  <p className='text-gray-500'>ID: {row.productId} · {row.category} / {row.subCategory}</p>
                  <p className='text-gray-500'>Sizes: {row.sizes?.join(', ')}</p>
                  <p className='text-gray-500'>{currency}{row.price}</p>
                </div>
              </div>

              <div className='flex items-center gap-6 flex-wrap'>
                <div className='text-sm'>
                  <p className='text-gray-500'>Current Stock</p>
                  <p className='text-lg font-medium'>{row.stock}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass[status]}`}>
                  {status}
                </span>

                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    min={1}
                    value={restockAmount[row.productId] ?? ''}
                    onChange={(e) => setAmountFor(row.productId, e.target.value)}
                    placeholder='Qty'
                    className='w-16 border border-gray-300 rounded-sm px-2 py-1.5 text-sm'
                  />
                  <button
                    onClick={() =>
                      updateStock(row.productId, row.stock + amountFor(row.productId))
                    }
                    className='text-sm border px-3 py-1.5 rounded-sm hover:bg-slate-50'
                  >
                    + Increase
                  </button>
                  <button
                    onClick={() =>
                      updateStock(row.productId, Math.max(0, row.stock - amountFor(row.productId)))
                    }
                    className='text-sm border px-3 py-1.5 rounded-sm hover:bg-slate-50'
                  >
                    − Decrease
                  </button>
                  {row.stock > 0 ? (
                    <button
                      onClick={() => updateStock(row.productId, 0)}
                      className='text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-sm hover:bg-red-50'
                    >
                      Mark Out Of Stock
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStock(row.productId, amountFor(row.productId))}
                      className='text-sm border border-green-300 text-green-700 px-3 py-1.5 rounded-sm hover:bg-green-50'
                    >
                      Restore Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
