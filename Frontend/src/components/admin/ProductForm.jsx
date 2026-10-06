import React, { useState } from 'react'
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, SIZE_OPTIONS } from '../../utils/productService'

// Reads a File the browser gave us into a base64 data URL so it can be
// stored (and previewed) without a real upload endpoint. When this connects
// to Spring Boot later, this is the one function that changes - it would
// instead POST the file to an /api/upload endpoint and use the returned URL.
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const inputClass = (hasError) =>
  `border rounded-sm py-2 px-3 w-full text-sm ${hasError ? 'border-red-500' : 'border-gray-300'}`

const emptyForm = {
  name: '',
  description: '',
  category: '',
  subCategory: '',
  price: '',
  stock: '',
  sizes: [],
  image: [],
  bestseller: false,
}

/**
 * Used by both AdminAddProduct and AdminEditProduct. Pass `initialData` to
 * pre-fill it for editing; omit it (or pass nothing) to start blank.
 * Calls `onSubmit(values)` with clean, validated data - the caller decides
 * whether that means addProduct() or updateProduct().
 */
export default function ProductForm({ initialData, onSubmit, submitLabel = 'Save' }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialData })
  const [errors, setErrors] = useState({})

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const toggleSize = (size) => {
    setField('sizes', form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size])
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const dataUrls = await Promise.all(files.map(fileToDataUrl))
    setField('image', [...form.image, ...dataUrls])
    e.target.value = '' // lets the admin pick the same file again later if they remove it
  }

  const removeImage = (index) => {
    setField('image', form.image.filter((_, i) => i !== index))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Product name is required'
    if (!form.description.trim()) next.description = 'Description is required'
    if (!form.category) next.category = 'Category is required'
    if (!form.subCategory) next.subCategory = 'Subcategory is required'
    if (form.price === '' || Number(form.price) <= 0) next.price = 'Price is required and must be greater than 0'
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'Stock quantity is required and cannot be negative'
    if (form.image.length === 0) next.image = 'At least one product image is required'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return // do not save on validation failure

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subCategory: form.subCategory,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: form.sizes,
      image: form.image,
      bestseller: form.bestseller,
    })
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5 max-w-xl'>
      <div>
        <p className='text-sm mb-2 text-gray-700'>Product Images</p>
        <div className='flex flex-wrap gap-3 mb-2'>
          {form.image.map((src, i) => (
            <div key={i} className='relative'>
              <img src={src} className='w-20 h-20 object-cover rounded-sm border border-gray-300' alt="" />
              <button
                type='button'
                onClick={() => removeImage(i)}
                className='absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs leading-5'
                aria-label='Remove image'
              >
                ×
              </button>
            </div>
          ))}
          <label
            className={`w-20 h-20 border border-dashed rounded-sm flex items-center justify-center text-2xl text-gray-400 cursor-pointer hover:bg-slate-50 ${
              errors.image ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            +
            <input type='file' accept='image/*' multiple onChange={handleImageChange} className='hidden' />
          </label>
        </div>
        {errors.image && <p className='text-red-500 text-xs'>{errors.image}</p>}
      </div>

      <div>
        <p className='text-sm mb-1 text-gray-700'>Product Name</p>
        <input
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          className={inputClass(errors.name)}
          type='text'
          placeholder='e.g. Men Round Neck T-Shirt'
        />
        {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
      </div>

      <div>
        <p className='text-sm mb-1 text-gray-700'>Product Description</p>
        <textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          className={inputClass(errors.description)}
          rows={4}
          placeholder='Write a short product description'
        />
        {errors.description && <p className='text-red-500 text-xs mt-1'>{errors.description}</p>}
      </div>

      <div className='flex gap-4 flex-wrap'>
        <div className='flex-1 min-w-[140px]'>
          <p className='text-sm mb-1 text-gray-700'>Category</p>
          <select value={form.category} onChange={(e) => setField('category', e.target.value)} className={inputClass(errors.category)}>
            <option value=''>Select category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className='text-red-500 text-xs mt-1'>{errors.category}</p>}
        </div>
        <div className='flex-1 min-w-[140px]'>
          <p className='text-sm mb-1 text-gray-700'>Subcategory</p>
          <select value={form.subCategory} onChange={(e) => setField('subCategory', e.target.value)} className={inputClass(errors.subCategory)}>
            <option value=''>Select subcategory</option>
            {SUBCATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.subCategory && <p className='text-red-500 text-xs mt-1'>{errors.subCategory}</p>}
        </div>
      </div>

      <div className='flex gap-4 flex-wrap'>
        <div className='flex-1 min-w-[140px]'>
          <p className='text-sm mb-1 text-gray-700'>Price</p>
          <input
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            className={inputClass(errors.price)}
            type='number'
            min={0}
            placeholder='0'
          />
          {errors.price && <p className='text-red-500 text-xs mt-1'>{errors.price}</p>}
        </div>
        <div className='flex-1 min-w-[140px]'>
          <p className='text-sm mb-1 text-gray-700'>Stock Quantity</p>
          <input
            value={form.stock}
            onChange={(e) => setField('stock', e.target.value)}
            className={inputClass(errors.stock)}
            type='number'
            min={0}
            placeholder='0'
          />
          {errors.stock && <p className='text-red-500 text-xs mt-1'>{errors.stock}</p>}
        </div>
      </div>

      <div>
        <p className='text-sm mb-2 text-gray-700'>Available Sizes</p>
        <div className='flex gap-2 flex-wrap'>
          {SIZE_OPTIONS.map((size) => (
            <button
              type='button'
              key={size}
              onClick={() => toggleSize(size)}
              className={`border py-1.5 px-4 text-sm rounded-sm ${
                form.sizes.includes(size) ? 'bg-black text-white border-black' : 'bg-gray-100 border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer w-fit'>
        <input type='checkbox' checked={form.bestseller} onChange={(e) => setField('bestseller', e.target.checked)} />
        Add to bestseller
      </label>

      <button type='submit' className='bg-black text-white px-8 py-2.5 text-sm w-fit mt-1'>
        {submitLabel}
      </button>
    </form>
  )
}
