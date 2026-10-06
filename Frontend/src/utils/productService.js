// utils/productService.js
//
// Same philosophy as orderUtils.js / inventoryService.js: plain JS functions,
// no React/DOM dependency. Today they read/write localStorage; tomorrow they
// can be rewritten to call Spring Boot endpoints (GET/POST/PUT/DELETE
// /api/products) without touching Shopcontext or any admin page.
//
// Until now the product catalogue was a hardcoded array imported straight
// from assets.js. That's fine for read-only browsing, but Add/Edit/Delete
// need it to be real, persisted state - so this file seeds localStorage from
// that same static array the first time the app runs, then becomes the
// single source of truth from then on. assets.js itself is untouched.

import { products as seedProducts } from '../assets/assets'

const PRODUCTS_STORAGE_KEY = 'ecom_products'

export const CATEGORY_OPTIONS = ['Men', 'Women', 'Kids']
export const SUBCATEGORY_OPTIONS = ['Topwear', 'Bottomwear', 'Winterwear', 'Footwear', 'Accessories']
export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/**
 * Load the product catalogue from localStorage, seeding it from the
 * bundled `assets.js` catalogue the very first time the app runs.
 */
export const getProducts = () => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    saveProducts(seedProducts)
    return seedProducts
  } catch (error) {
    console.error('Failed to load products from localStorage:', error)
    return seedProducts
  }
}

/** Persist the full product catalogue. Called any time `products` state changes. */
export const saveProducts = (products) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    console.error('Failed to save products to localStorage:', error)
  }
}

/** Simple, human-readable, sequential product id (PROD001, PROD002, ...). */
export const generateProductId = (existingProducts = []) => {
  const nextNumber = existingProducts.length + 1
  return `PROD${String(nextNumber).padStart(3, '0')}`
}

/**
 * Build a new product object from an Add Product form submission.
 * Pure function - Shopcontext is responsible for calling setProducts(...)
 * with [...products, newProduct] and for creating the matching inventory row.
 */
export const buildNewProduct = (existingProducts, formData) => ({
  _id: generateProductId(existingProducts),
  name: formData.name,
  description: formData.description,
  price: formData.price,
  image: formData.image,
  category: formData.category,
  subCategory: formData.subCategory,
  sizes: formData.sizes,
  bestseller: !!formData.bestseller,
  date: Date.now(),
})

/** Return a new products array with a single product's fields updated. */
export const updateProduct = (products, productId, updates) =>
  products.map((product) =>
    product._id === productId
      ? {
          ...product,
          name: updates.name ?? product.name,
          description: updates.description ?? product.description,
          price: updates.price ?? product.price,
          image: updates.image ?? product.image,
          category: updates.category ?? product.category,
          subCategory: updates.subCategory ?? product.subCategory,
          sizes: updates.sizes ?? product.sizes,
          bestseller: updates.bestseller ?? product.bestseller,
        }
      : product
  )

/** Return a new products array with one product removed. */
export const deleteProduct = (products, productId) =>
  products.filter((product) => product._id !== productId)
