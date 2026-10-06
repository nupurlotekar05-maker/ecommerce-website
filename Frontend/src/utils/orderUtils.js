// utils/orderUtils.js
//
// Small, framework-agnostic helpers for order creation / persistence.
// Everything here works with plain JS data only (no React state, no DOM),
// so today it talks to localStorage, but tomorrow these same functions can
// be rewritten to call a real API (React -> Spring Boot -> MySQL) without
// touching Shopcontext.jsx or any component that uses them.

const ORDERS_STORAGE_KEY = 'ecom_orders'

// The single source of truth for the order lifecycle. Both the admin status
// dropdown and any validation logic read from this array, so adding a new
// status later only means editing it here.
export const ORDER_STATUSES = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
]

/**
 * Load previously placed orders from localStorage.
 * Called once when the app starts, so orders survive a page refresh.
 */
export const loadOrdersFromStorage = () => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load orders from localStorage:', error)
    return []
  }
}

/**
 * Persist the full orders array to localStorage.
 * Called any time the `orders` state changes.
 */
export const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error('Failed to save orders to localStorage:', error)
  }
}

// ---------------------------------------------------------------------------
// Thin, spec-named aliases (getOrders / saveOrders / updateOrderStatus /
// calculateRevenue). These are what a future `ordersService.js` calling a
// Spring Boot API would expose too - today they just wrap localStorage, but
// every caller (Shopcontext, AdminOrders) only ever talks to these function
// names, so swapping the body for an axios/fetch call later needs no changes
// anywhere else in the app.
// ---------------------------------------------------------------------------

/** Read all orders. Today: localStorage. Tomorrow: GET /api/orders */
export const getOrders = () => loadOrdersFromStorage()

/** Persist all orders. Today: localStorage. Tomorrow: handled server-side. */
export const saveOrders = (orders) => saveOrdersToStorage(orders)

/**
 * Return a new orders array with a single order's status changed.
 * Pure function - the caller (Shopcontext) is responsible for calling
 * setOrders(...) with the result and for any side effects (like restocking
 * inventory when an order is cancelled).
 */
export const updateOrderStatus = (orders, orderId, newStatus) =>
  orders.map((order) =>
    order.id === orderId ? { ...order, status: newStatus } : order
  )

/** Sum of an order's line items (price * quantity), excluding delivery fee. */
export const calculateOrderTotal = (order, deliveryFee = 0) => {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  return itemsTotal + (order.items.length > 0 ? deliveryFee : 0)
}

/**
 * Total revenue across orders. Cancelled orders don't count as revenue.
 * `deliveryFee` is optional and mirrors Shopcontext's delivery_fees constant.
 */
export const calculateRevenue = (orders, deliveryFee = 0) =>
  orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + calculateOrderTotal(order, deliveryFee), 0)

/**
 * One-shot dashboard summary: counts per status + total revenue.
 * Powers the analytics cards on the Admin Orders page.
 */
export const getOrderAnalytics = (orders, deliveryFee = 0) => {
  const counts = {
    total: orders.length,
    'Order Placed': 0,
    Packing: 0,
    Shipped: 0,
    'Out For Delivery': 0,
    Delivered: 0,
    Cancelled: 0,
  }
  orders.forEach((order) => {
    if (counts[order.status] !== undefined) counts[order.status] += 1
  })
  return {
    totalOrders: counts.total,
    pending: counts['Order Placed'],
    packing: counts.Packing,
    shipped: counts.Shipped,
    outForDelivery: counts['Out For Delivery'],
    delivered: counts.Delivered,
    cancelled: counts.Cancelled,
    totalRevenue: calculateRevenue(orders, deliveryFee),
  }
}

/**
 * Generate a simple, human-readable, sequential order id (ORD001, ORD002, ...)
 * based on how many orders already exist.
 */
export const generateOrderId = (existingOrders = []) => {
  const nextNumber = existingOrders.length + 1
  return `ORD${String(nextNumber).padStart(3, '0')}`
}

/**
 * Turn the cart's `{ itemId: { size: quantity } }` shape into a flat array
 * of order line items, pulling name/image/price from the product catalogue
 * (the cart itself never stores product details, only ids/sizes/quantities).
 */
export const buildOrderItemsFromCart = (cartitems, products) => {
  const items = []

  for (const productId in cartitems) {
    const productData = products.find((product) => product._id === productId)
    if (!productData) continue // product no longer exists in the catalogue

    for (const size in cartitems[productId]) {
      const quantity = cartitems[productId][size]
      if (quantity > 0) {
        items.push({
          productId,
          name: productData.name,
          image: productData.image[0],
          price: productData.price,
          size,
          quantity,
        })
      }
    }
  }

  return items
}

/**
 * Build a complete order object out of the current cart.
 * Returns null when the cart is empty so the caller can show an error
 * instead of creating an empty order.
 *
 * `deliveryInfo` is the validated checkout form (name/email/phone/address).
 * It's stored on the order as `address` so a future Admin Orders page can
 * show full customer details without any extra plumbing.
 *
 * `user` is the currently logged-in customer ({ id, name, email }) from
 * AuthContext. Every order is stamped with `userId` (ownership - this is
 * what a future JWT-authenticated backend would use to scope
 * `GET /api/orders` to "my orders") and `customerName` (a readable label for
 * the Admin Orders page, kept separate from `userId` per the spec: ownership
 * is decided by id, never by display name).
 */
export const createOrderFromCart = ({ cartitems, products, existingOrders, paymentMethod, deliveryInfo, user }) => {
  const items = buildOrderItemsFromCart(cartitems, products)
  if (items.length === 0) return null

  return {
    id: generateOrderId(existingOrders),
    userId: user?.id ?? null,
    customerName: user?.name ?? deliveryInfo?.firstName ?? 'Guest',
    date: new Date().toISOString(),
    paymentMethod,
    paymentStatus: 'Pending',
    status: 'Order Placed',
    items,
    address: deliveryInfo || null,
  }
}

/**
 * Orders belonging to a single user. Used by the customer-facing Orders
 * page so "User A must not see ORD003" etc. Admin pages skip this and read
 * the full `orders` array instead, since admins can see everything.
 */
export const getOrdersForUser = (orders, userId) =>
  userId ? orders.filter((order) => order.userId === userId) : []
