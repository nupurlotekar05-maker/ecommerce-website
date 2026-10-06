import React, { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shopcontext } from '../../context/Shopcontext'
import Title from '../../components/Title'
import { getStockStatus } from '../../utils/inventoryService'

const statusBadgeClass = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out Of Stock': 'bg-red-100 text-red-700',
}

export default function AdminProducts() {
  const { products, inventory, currency, deleteProduct } = useContext(Shopcontext)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [subCategoryFilter, setSubCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const stockFor = (productId) => inventory.find((row) => row.productId === productId)?.stock ?? 0

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products])
  const subCategories = useMemo(() => ['All', ...new Set(products.map((p) => p.subCategory))], [products])

  const visibleProducts = useMemo(() => {
    let result = [...products]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p._id.toLowerCase().includes(q))
    }
    if (categoryFilter !== 'All') result = result.filter((p) => p.category === categoryFilter)
    if (subCategoryFilter !== 'All') result = result.filter((p) => p.subCategory === subCategoryFilter)
    if (statusFilter !== 'All') result = result.filter((p) => getStockStatus(stockFor(p._id)) === statusFilter)

    return result
  }, [products, inventory, search, categoryFilter, subCategoryFilter, statusFilter])

  const handleDelete = (product) => {
    // Simple browser confirm - no extra UI needed, and it blocks until the
    // admin answers, which is exactly what "show confirmation before
    // deleting" calls for here.
    if (window.confirm(`Delete "${product.name}"? This can't be undone.`)) {
      deleteProduct(product._id)
    }
  }

  return (
    <div className='border-t pt-6 pb-16'>
      <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
        <div className='text-2xl'>
          <Title text1={"MANAGE"} text2={"PRODUCTS"} />
        </div>
        <Link to='/admin/add-product' className='bg-black text-white text-sm px-4 py-2 rounded-sm hover:bg-gray-800'>
          + Add Product
        </Link>
      </div>

      {/* ---- Search / filter toolbar ---- */}
      <div className='flex flex-col md:flex-row gap-3 mb-6'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by product name or ID'
          className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-64'
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-40'>
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
          ))}
        </select>
        <select value={subCategoryFilter} onChange={(e) => setSubCategoryFilter(e.target.value)} className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-44'>
          {subCategories.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Subcategories' : c}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='border border-gray-300 rounded-sm px-3 py-2 text-sm w-full md:w-44'>
          <option value='All'>All Statuses</option>
          <option value='In Stock'>In Stock</option>
          <option value='Low Stock'>Low Stock</option>
          <option value='Out Of Stock'>Out Of Stock</option>
        </select>
      </div>

      {/* ---- Product list ---- */}
      <div className='flex flex-col gap-2'>
        {visibleProducts.length === 0 && (
          <p className='text-gray-500 py-8 text-center'>No products match your filters.</p>
        )}

        {visibleProducts.map((item) => {
          const stock = stockFor(item._id)
          const status = getStockStatus(stock)
          return (
            <div key={item._id} className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 rounded-sm p-3'>
              <div className='flex items-center gap-4'>
                <img src={item.image[0]} className='w-14 h-14 object-cover rounded-sm' alt="" />
                <div className='text-sm'>
                  <p className='font-medium text-gray-800'>{item.name}</p>
                  <p className='text-gray-500'>ID: {item._id} · {item.category} / {item.subCategory}</p>
                  <p className='text-gray-500'>{currency}{item.price} · Stock: {stock}</p>
                </div>
              </div>

              <div className='flex items-center gap-3 flex-wrap'>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass[status]}`}>{status}</span>
                <Link to={`/admin/products/edit/${item._id}`} className='text-sm border px-3 py-1.5 rounded-sm hover:bg-slate-50'>
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item)}
                  className='text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-sm hover:bg-red-50'
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
