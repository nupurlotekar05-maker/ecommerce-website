// utils/inventoryService.js
//
// Same philosophy as orderUtils.js: plain JS functions with no React/DOM
// dependency. Today they read/write localStorage; tomorrow they can be
// rewritten to call Spring Boot endpoints (GET/PUT /api/inventory/...)
// without touching Shopcontext or any admin page.

const INVENTORY_STORAGE_KEY = 'ecom_inventory'

const LOW_STOCK_THRESHOLD = 20   // stock 1-20   -> "Low Stock" badge
const LOW_STOCK_ALERT_THRESHOLD = 10 // stock <=10   -> shows in the Low Stock Alerts panel

/**
 * Deterministic starting stock so demo data looks realistic but is stable
 * across reloads before any real numbers are entered (no Math.random, so a
 * given product always seeds to the same quantity).
 */
const seedStockFor = (index) => {
  const pattern = [45, 8, 0, 60, 15, 3, 30, 22, 55, 0, 12, 40]
  return pattern[index % pattern.length]
}

/**
 * Build the initial inventory table from the product catalogue.
 * Called only the first time (when nothing is in localStorage yet).
 */
const seedInventoryFromProducts = (products) =>
  products.map((product, index) => ({
    productId: product._id,
    name: product.name,
    image: product.image[0],
    category: product.category,
    subCategory: product.subCategory,
    price: product.price,
    sizes: product.sizes,
    stock: seedStockFor(index),
  }))

/**
 * Load inventory from localStorage, seeding it from `products` the first
 * time the app ever runs (or if a product was added to the catalogue since
 * the inventory was last saved).
 */
export const getInventory = (products = []) => {
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY)
    const existing = stored ? JSON.parse(stored) : []

    // Merge: keep saved stock numbers, add any new catalogue product that
    // doesn't have an inventory row yet, drop rows for products that no
    // longer exist. This keeps inventory in sync if assets.js changes.
    const existingById = Object.fromEntries(existing.map((row) => [row.productId, row])) // exsisting inventory by id
    const merged = products.map((product, index) => {    //
      const prev = existingById[product._id]   //every product exsisting inventory check
      return prev
        ? { ...prev, name: product.name, image: product.image[0], price: product.price } //if already  exists
        : {  // add new inventory 
            productId: product._id,
            name: product.name,
            image: product.image[0],
            category: product.category,
            subCategory: product.subCategory,
            price: product.price,
            sizes: product.sizes,
            stock: seedStockFor(index),
          }
    })

    return merged.length > 0 ? merged : seedInventoryFromProducts(products)
  } catch (error) {
    console.error('Failed to load inventory from localStorage:', error)
    return seedInventoryFromProducts(products)
  }
}

/** Persist the full inventory array. Called any time inventory state changes. */
export const saveInventory = (inventory) => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory))
  } catch (error) {
    console.error('Failed to save inventory to localStorage:', error)
  }
}

/** Current stock number for one product, 0 if it has no inventory row yet. */
export const getStockForProduct = (inventory, productId) =>
  inventory.find((row) => row.productId === productId)?.stock ?? 0

/** Stock -> badge status, per the spec's thresholds. */
export const getStockStatus = (stock) => {
  if (stock <= 0) return 'Out Of Stock'
  if (stock <= LOW_STOCK_THRESHOLD) return 'Low Stock'
  return 'In Stock'
}

/** Set a product's stock to an exact value (used by the "Update Stock" input). Never negative. */
export const updateStock = (inventory, productId, newStock) =>
  inventory.map((row) =>
    row.productId === productId ? { ...row, stock: Math.max(0, Number(newStock) || 0) } : row
  )

/** Increase stock by `amount` (manual restock, or restoring a cancelled order). */
export const increaseStock = (inventory, productId, amount) =>
  inventory.map((row) =>
    row.productId === productId ? { ...row, stock: row.stock + Math.max(0, amount) } : row
  )

/** Decrease stock by `amount`, clamped at 0 (manual adjustment, or a new order being placed). */
export const decreaseStock = (inventory, productId, amount) =>
  inventory.map((row) =>
    row.productId === productId ? { ...row, stock: Math.max(0, row.stock - Math.max(0, amount)) } : row
  )

/** Force a product straight to 0 ("Mark Out Of Stock"). */
export const markOutOfStock = (inventory, productId) =>
  inventory.map((row) => (row.productId === productId ? { ...row, stock: 0 } : row))

/**
 * Restore a previously-cancelled order's stock. Same shape as decreaseStock
 * but exported separately so call sites read clearly ("restore" vs "reduce").
 */
export const restoreStock = (inventory, productId, amount) =>
  increaseStock(inventory, productId, amount)

/** Apply every line item of a newly placed order as a stock decrease. */
export const reduceStockForOrderItems = (inventory, items) =>
  items.reduce((inv, item) => decreaseStock(inv, item.productId, item.quantity), inventory)

/** Apply every line item of a cancelled order as a stock increase. */
export const restoreStockForOrderItems = (inventory, items) =>
  items.reduce((inv, item) => increaseStock(inv, item.productId, item.quantity), inventory)

/** Rows at or below the alert threshold (stock > 0, since Out Of Stock gets its own badge). */
export const getLowStockProducts = (inventory) =>
  inventory.filter((row) => row.stock > 0 && row.stock <= LOW_STOCK_ALERT_THRESHOLD)

/** Dashboard summary for the Inventory analytics cards. */
export const getInventoryAnalytics = (inventory) => {
  const totalProducts = inventory.length
  const inStock = inventory.filter((row) => getStockStatus(row.stock) === 'In Stock').length
  const lowStock = inventory.filter((row) => getStockStatus(row.stock) === 'Low Stock').length
  const outOfStock = inventory.filter((row) => getStockStatus(row.stock) === 'Out Of Stock').length
  const totalQuantity = inventory.reduce((sum, row) => sum + row.stock, 0)

  return { totalProducts, inStock, lowStock, outOfStock, totalQuantity }
}
