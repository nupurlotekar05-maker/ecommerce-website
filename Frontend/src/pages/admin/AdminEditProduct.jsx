import React, { useContext } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Shopcontext } from '../../context/Shopcontext'
import Title from '../../components/Title'
import ProductForm from '../../components/admin/ProductForm'

export default function AdminEditProduct() {
  const { products, inventory, updateProduct } = useContext(Shopcontext)
  const { productId } = useParams()
  const navigate = useNavigate()

  const product = products.find((p) => p._id === productId)
  const stockRow = inventory.find((row) => row.productId === productId)

  if (!product) {
    return (
      <div className='border-t pt-16 pb-16'>
        <p className='text-gray-500'>Product not found. It may have already been deleted.</p>
        <Link to='/admin/products' className='text-sm underline mt-2 inline-block'>Back to Products</Link>
      </div>
    )
  }

  const initialData = {
    name: product.name,
    description: product.description,
    category: product.category,
    subCategory: product.subCategory,
    price: product.price,
    sizes: product.sizes,
    image: product.image,
    bestseller: product.bestseller,
    stock: stockRow ? stockRow.stock : 0,
  }

  const handleSubmit = (formData) => {
    updateProduct(productId, formData)
    navigate('/admin/products')
  }

  return (
    <div className='border-t pt-6 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"EDIT"} text2={"PRODUCT"} />
      </div>
      <ProductForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  )
}
