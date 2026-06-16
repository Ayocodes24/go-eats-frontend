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
// GET /restaurant/ → raw array or empty array (never 404 now)
export const getRestaurants   = ()     => api.get('/restaurant/')
export const getRestaurant    = (id)   => api.get(`/restaurant/${id}`)
// POST /restaurant/ — multipart/form-data with optional file or image_url field
export const addRestaurant    = (data) => {
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') form.append(k, v) })
  return api.post('/restaurant/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const deleteRestaurant = (id)   => api.delete(`/restaurant/${id}`)

// ── Menu ─────────────────────────────────────────────────
// GET /restaurant/menu?restaurant_id=X → raw array or empty array
export const getMenus       = (restaurantId) =>
  api.get('/restaurant/menu', restaurantId ? { params: { restaurant_id: restaurantId } } : {})
// POST /restaurant/menu — JSON body; if photo is set, Unsplash is skipped
export const addMenuItem    = (data)                   => api.post('/restaurant/menu', data)
export const deleteMenuItem = (restaurantId, menuId)   => api.delete(`/restaurant/menu/${restaurantId}/${menuId}`)

// ── Cart ─────────────────────────────────────────────────
export const getCart        = ()           => api.get('/cart/list')
export const addToCart      = (data)       => api.post('/cart/add', data)
export const removeFromCart = (cartItemId) => api.delete(`/cart/remove/${cartItemId}`)
export const placeOrder     = (address)    => api.post('/cart/order/new', { delivery_address: address })

// ── Orders ───────────────────────────────────────────────
export const getOrders          = ()   => api.get('/cart/orders')
export const getOrderItems      = (id) => api.get(`/cart/orders/${id}`)
export const getOrderDeliveries = (id) => api.get(`/cart/orders/deliveries/${id}`)

// ── Reviews ──────────────────────────────────────────────
export const getReviews   = (restaurantId)        => api.get(`/review/${restaurantId}`)
export const addReview    = (restaurantId, data)  => api.post(`/review/${restaurantId}`, data)
export const deleteReview = (reviewId)            => api.delete(`/review/${reviewId}`)

// ── Delivery ─────────────────────────────────────────────
export const addDeliveryPerson = (data)            => api.post('/delivery/add', data)
export const loginDelivery     = (data)            => api.post('/delivery/login', data)
export const updateOrderStatus = (orderId, status) => api.post('/delivery/update-order', { order_id: orderId, status })
export const getDeliveries     = (orderId)         => api.get(`/delivery/deliveries/${orderId}`)

export default api
