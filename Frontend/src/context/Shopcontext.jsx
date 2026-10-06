import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import { loadOrdersFromStorage, saveOrdersToStorage, createOrderFromCart, updateOrderStatus as updateOrderStatusUtil, getOrdersForUser } from '../utils/orderUtils'
import { getInventory, saveInventory, reduceStockForOrderItems, restoreStockForOrderItems, updateStock as updateStockUtil, getLowStockProducts as getLowStockProductsUtil, getStockForProduct, getStockStatus } from '../utils/inventoryService'
import { getProducts, saveProducts, buildNewProduct, updateProduct as updateProductUtil, deleteProduct as deleteProductUtil } from '../utils/productService'


export const Shopcontext=createContext()
const  Shopcontextprovider =(props)=> {
  const currency="₹"
  const delivery_fees=10
  const [search,setsearch]=useState("")
  const [showsearch,setshowsearch]=useState(false)
const[cartitems,setcartitems]=useState({})
// The product catalogue used to be a hardcoded import from assets.js. It's
// now real state, seeded from that same static list the first time the app
// runs (see productService.js), so Admin Add/Edit/Delete can persist changes.
const[products,setProducts]=useState(()=>getProducts())
// Load any previously placed orders once, on first mount, so they survive a refresh.
const[orders,setorders]=useState(()=>loadOrdersFromStorage())
// Inventory is derived from the product catalogue the first time the app
// runs, then persisted on its own (see inventoryService.js for the seeding
// and merge logic). Kept in Shopcontext so both the storefront (stock
// decreases on checkout) and the Admin Inventory page (manual adjustments)
// read/write the same state.
const[inventory,setinventory]=useState(()=>getInventory(products))
const navigate=useNavigate()
// Shopcontextprovider is always rendered inside AuthProvider (see main.jsx),
// so this is safe. Used to stamp new orders with userId/customerName and to
// scope the customer-facing Orders page to only that user's own orders.
const { user } = useContext(AuthContext)

// Whenever `products` changes (admin adds/edits/deletes), mirror it to localStorage.
useEffect(()=>{
  saveProducts(products)
},[products])

// Whenever `orders` changes (a new order is placed, or its status changes), mirror it to localStorage.
useEffect(()=>{
  saveOrdersToStorage(orders)
},[orders])

// Whenever `inventory` changes (checkout, or an admin stock edit), mirror it to localStorage.
useEffect(()=>{
  saveInventory(inventory)
},[inventory])
 
const addtocart = async (itemid,size)=> {
    if(!size){
         toast.error("Select Product Size")
    return;
    }

    // Cart validation: check inventory before adding anything to the cart.
    const availableStock = getStockForProduct(inventory,itemid)
    if(availableStock <= 0){
      toast.error("This product is currently out of stock.")
      return;
    }

  let cartdata=structuredClone(cartitems)
   const currentQtyInCart = cartdata[itemid]?.[size] || 0
   if(currentQtyInCart + 1 > availableStock){
     toast.error(`Only ${availableStock} item(s) available.`)
     return;
   }

   if(cartdata[itemid]){
   if(cartdata[itemid][size]){
     cartdata[itemid][size] += 1 //m -2
   }else{
     cartdata[itemid][size]=1 // l 1
   }
   }else{
      cartdata[itemid]={} //new cart item 
      cartdata[itemid][size]=1
   }
   setcartitems(cartdata)
}

const updatequantity =async (itemid,size,quantity)=>{
      // Cart validation also applies when the customer edits the quantity
      // directly in the cart, not just when they click "Add To Cart".
      const availableStock = getStockForProduct(inventory,itemid)
      if(availableStock <= 0){
        toast.error("This product is currently out of stock.")
        return;
      }
      if(quantity > availableStock){
        toast.error(`Only ${availableStock} item(s) available.`)
        quantity = availableStock
      }
      const cartdata =structuredClone(cartitems)
      cartdata[itemid][size]= quantity
      setcartitems(cartdata)
}

// Removes a single size-line of a product from the cart entirely
// (rather than just setting its quantity to 0).
const removefromcart = (itemid,size)=>{
      const cartdata =structuredClone(cartitems)
      if(cartdata[itemid]){
        delete cartdata[itemid][size]
        if(Object.keys(cartdata[itemid]).length === 0){
          delete cartdata[itemid]
        }
      }
      setcartitems(cartdata)
}

  const getcartitem=()=>{
    let totalcount=0
    for(const items in cartitems){   //items iterate
      for(const item in cartitems[items]){  //size iterate
      try{
            if(cartitems[items][item]>0){
              totalcount+=cartitems[items][item]
            }
      }catch(error){

      }
      }
    }
    return totalcount
  }    

  const getcartamount=  () => {
    let totalamount=0
    for(const items in cartitems){
      let iteminfo =products.find((product)=>product._id === items)
      for(const item in cartitems[items]){
        try{
            totalamount += iteminfo.price * cartitems[items][item]
        }catch(error){

        }
      }
    }
    return totalamount
  }

  // ---- placeOrder() ----
  // 1. Reads the current cart, 2. converts it into order items, 3-6. builds
  // a full order object (id/date/paymentStatus/status) via createOrderFromCart,
  // 7. adds it to the orders array, 8. that array is auto-saved to
  // localStorage by the useEffect above, 9. clears the cart.
  const placeorder = (paymentMethod = "cod", deliveryInfo = null) => {
    const newOrder = createOrderFromCart({
      cartitems,
      products,
      existingOrders: orders,
      paymentMethod,
      deliveryInfo,
      user,
    })

    if(!newOrder){
      toast.error("Your cart is empty")
      return { success:false }
    }

    setorders((prevOrders)=>[...prevOrders,newOrder])
    // Auto Inventory Update: every unit just ordered comes straight out of stock.
    setinventory((prevInventory)=>reduceStockForOrderItems(prevInventory,newOrder.items))
    setcartitems({}) // clear cart only after the order was successfully built
    toast.success("Order placed successfully!")
    return { success:true, order:newOrder }
  }

  // ---- updateOrderStatus() ---- used by the Admin Orders page.
  // If an order transitions INTO "Cancelled", its stock is restored.
  // If it transitions OUT OF "Cancelled" (re-activated by mistake), stock is
  // taken back out, so inventory always reflects only the orders that are
  // still "live".
  const updateOrderStatus = (orderId, newStatus) => {
    const targetOrder = orders.find((order) => order.id === orderId)
    if (!targetOrder || targetOrder.status === newStatus) return

    const wasCancelled = targetOrder.status === "Cancelled"
    const isNowCancelled = newStatus === "Cancelled"

    setorders((prevOrders)=>updateOrderStatusUtil(prevOrders,orderId,newStatus))

    if (!wasCancelled && isNowCancelled) {
      setinventory((prevInventory)=>restoreStockForOrderItems(prevInventory,targetOrder.items))
      toast.success(`Order ${orderId} cancelled - stock restored`)
    } else if (wasCancelled && !isNowCancelled) {
      setinventory((prevInventory)=>reduceStockForOrderItems(prevInventory,targetOrder.items))
      toast.success(`Order ${orderId} reactivated - stock re-deducted`)
    } else {
      toast.success(`Order ${orderId} marked as ${newStatus}`)
    }
  }

  // ---- updateStock() ---- admin sets a product's stock to an exact number.
  const updateStock = (productId, newStock) => {
    setinventory((prevInventory)=>updateStockUtil(prevInventory,productId,newStock))
  }

  // ---- getLowStockProducts() ---- reads the *current* inventory state.
  const getLowStockProducts = () => getLowStockProductsUtil(inventory)

  // ---- getProductStockStatus() ---- single source of truth for every
  // customer-facing stock badge (Collection cards, Product page, Cart),
  // so all of them stay in sync with the same `inventory` state that the
  // Admin Inventory page writes to - no separate customer-side copy of the
  // "In Stock / Low Stock / Out Of Stock" rule.
  const getProductStockStatus = (productId) => {
    const stock = getStockForProduct(inventory,productId)
    return { stock, status: getStockStatus(stock) }
  }

  // Orders scoped to the logged-in customer ("User A must not see ORD003").
  // Recomputed whenever `orders` or `user` changes; admin pages ignore this
  // and read the full `orders` array instead.
  const myOrders = getOrdersForUser(orders, user?.id)

  // ---- addProduct() ---- Admin > Add Product.
  // Product Added -> Inventory Created -> Stock = Initial Quantity, per spec.
  // The product catalogue (name/price/images/etc.) and the stock number are
  // kept in two places on purpose, same as every other product here: the
  // catalogue is what the storefront displays, inventory is what changes on
  // every order/restock. Both are updated together so they can never drift.
  const addProduct = (formData) => {
    const newProduct = buildNewProduct(products, formData)
    setProducts((prev)=>[...prev,newProduct])
    setinventory((prev)=>[...prev,{
      productId:newProduct._id,
      name:newProduct.name,
      image:newProduct.image[0],
      category:newProduct.category,
      subCategory:newProduct.subCategory,
      price:newProduct.price,
      sizes:newProduct.sizes,
      stock:Math.max(0,Number(formData.stock)||0),
    }])
    toast.success("Product added successfully")
    return newProduct
  }

  // ---- updateProduct() ---- Admin > Edit Product.
  // Updates the catalogue entry and mirrors the display fields + stock onto
  // the matching inventory row in the same call, so Product List, the
  // Inventory page, and the Customer Store all reflect the change immediately.
  const updateProduct = (productId, formData) => {
    setProducts((prev)=>updateProductUtil(prev,productId,formData))
    setinventory((prev)=>prev.map((row)=>
      row.productId===productId
        ? {
            ...row,
            name:formData.name ?? row.name,
            image:formData.image ? formData.image[0] : row.image,
            category:formData.category ?? row.category,
            subCategory:formData.subCategory ?? row.subCategory,
            price:formData.price ?? row.price,
            sizes:formData.sizes ?? row.sizes,
            stock:formData.stock !== undefined ? Math.max(0,Number(formData.stock)||0) : row.stock,
          }
        : row
    ))
    toast.success("Product updated successfully")
  }

  // ---- deleteProduct() ---- Admin > Delete Product.
  // Removes the product from the catalogue (Product List + Customer Store,
  // since both read from `products`) and drops its inventory row too.
  const deleteProduct = (productId) => {
    setProducts((prev)=>deleteProductUtil(prev,productId))
    setinventory((prev)=>prev.filter((row)=>row.productId!==productId))
    toast.success("Product deleted")
  }

  const value={
    products,currency,delivery_fees,
    addProduct,updateProduct,deleteProduct,
    search,setsearch,showsearch,setshowsearch,
    cartitems,addtocart,
    getcartitem,updatequantity,removefromcart,
    getcartamount,
    orders,placeorder,updateOrderStatus,myOrders,
    inventory,updateStock,getLowStockProducts,getProductStockStatus,
    navigate
  } 
  return (
   <Shopcontext.Provider  value={value}>
         {props.children}
   </Shopcontext.Provider>
  )
}
export default Shopcontextprovider
