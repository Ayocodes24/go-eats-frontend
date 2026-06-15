import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ── Auth ─────────────────────────────────────────────────
export const register   = (data) => api.post('/user/', data)
export const login      = (data) => api.post('/user/login', data)
export const deleteUser = (id)   => api.delete(`/user/${id}`)

// ── Restaurants ──────────────────────────────────────────
// Returns: raw array [{restaurant_id, name, store_image, description, address, city, state}]
export const getRestaurants   = ()     => api.get('/restaurant/')
export const getRestaurant    = (id)   => api.get(`/restaurant/${id}`)
export const addRestaurant    = (form) => api.post('/restaurant/', form)
export const deleteRestaurant = (id)   => api.delete(`/restaurant/${id}`)

// ── Menu ─────────────────────────────────────────────────
// Returns: raw array [{menu_id, restaurant_id, name, description, photo, price, category, available}]
export const getMenus       = (restaurantId) =>
  api.get('/restaurant/menu', restaurantId ? { params: { restaurant_id: restaurantId } } : {})
export const addMenuItem    = (data)                   => api.post('/restaurant/menu', data)
export const deleteMenuItem = (restaurantId, menuId)   => api.delete(`/restaurant/menu/${restaurantId}/${menuId}`)

// ── Cart ─────────────────────────────────────────────────
// GET /cart/list → { items: [{cart_item_id, item_id, restaurant_id, quantity, menu_item: {...}}] }
export const getCart        = ()           => api.get('/cart/list')
// POST /cart/add body: { item_id, restaurant_id, quantity }
export const addToCart      = (data)       => api.post('/cart/add', data)
// DELETE /cart/remove/:cart_item_id
export const removeFromCart = (cartItemId) => api.delete(`/cart/remove/${cartItemId}`)
// POST /cart/order/new body: { delivery_address }
export const placeOrder     = (address)    => api.post('/cart/order/new', { delivery_address: address })

// ── Orders ───────────────────────────────────────────────
// GET /cart/orders → { orders: [...] }
export const getOrders          = ()   => api.get('/cart/orders')
// GET /cart/orders/:id → { orders: [...] }  (items for this order)
export const getOrderItems      = (id) => api.get(`/cart/orders/${id}`)
// GET /cart/orders/deliveries/:id → { delivery_info: [...] }
export const getOrderDeliveries = (id) => api.get(`/cart/orders/deliveries/${id}`)

// ── Reviews ──────────────────────────────────────────────
export const getReviews   = (restaurantId)        => api.get(`/review/${restaurantId}`)
export const addReview    = (restaurantId, data)  => api.post(`/review/${restaurantId}`, data)
export const deleteReview = (reviewId)            => api.delete(`/review/${reviewId}`)

// ── Delivery ─────────────────────────────────────────────
export const addDeliveryPerson = (data)             => api.post('/delivery/add', data)
export const loginDelivery     = (data)             => api.post('/delivery/login', data)
// POST /delivery/update-order body: { order_id, status }
export const updateOrderStatus = (orderId, status)  => api.post('/delivery/update-order', { order_id: orderId, status })
// GET /delivery/deliveries/:order_id → { deliveries: [...] }
export const getDeliveries     = (orderId)          => api.get(`/delivery/deliveries/${orderId}`)

export default api
