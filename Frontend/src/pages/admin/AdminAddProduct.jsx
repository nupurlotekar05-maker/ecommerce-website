import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shopcontext } from '../../context/Shopcontext'
import Title from '../../components/Title'
import ProductForm from '../../components/admin/ProductForm'

export default function AdminAddProduct() {
  const { addProduct } = useContext(Shopcontext)
  const navigate = useNavigate()

  const handleSubmit = (formData) => {
    addProduct(formData)
    navigate('/admin/products')
  }

  return (
    <div className='border-t pt-6 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"ADD"} text2={"PRODUCT"} />
      </div>
      <ProductForm onSubmit={handleSubmit} submitLabel="Add Product" />
    </div>
  )
}
