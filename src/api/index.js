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
export const register  = (data) => api.post('/user/', data)
export const login     = (data) => api.post('/user/login', data)
export const deleteUser = (id)  => api.delete(`/user/${id}`)

// ── Restaurants ──────────────────────────────────────────
export const getRestaurants      = ()     => api.get('/restaurant/')
export const getRestaurant       = (id)   => api.get(`/restaurant/${id}`)
export const addRestaurant       = (form) => api.post('/restaurant/', form)
export const deleteRestaurant    = (id)   => api.delete(`/restaurant/${id}`)

// ── Menu ─────────────────────────────────────────────────
export const getMenus            = (restaurantId) =>
  api.get('/restaurant/menu', restaurantId ? { params: { restaurant_id: restaurantId } } : {})
export const addMenuItem         = (data) => api.post('/restaurant/menu', data)
export const deleteMenuItem      = (restaurantId, menuId) =>
  api.delete(`/restaurant/menu/${restaurantId}/${menuId}`)

// ── Cart ─────────────────────────────────────────────────
export const getCart             = ()     => api.get('/cart/list')
export const addToCart           = (data) => api.post('/cart/add', data)
export const removeFromCart      = (id)   => api.delete(`/cart/remove/${id}`)
export const placeOrder          = (data) => api.post('/cart/order/new', data)

// ── Orders ───────────────────────────────────────────────
export const getOrders           = ()     => api.get('/cart/orders')
export const getOrderItems       = (id)   => api.get(`/cart/orders/${id}`)
export const getOrderDeliveries  = (id)   => api.get(`/cart/orders/deliveries/${id}`)

// ── Reviews ──────────────────────────────────────────────
export const getReviews    = (restaurantId) => api.get(`/review/${restaurantId}`)
export const addReview     = (restaurantId, data) => api.post(`/review/${restaurantId}`, data)
export const deleteReview  = (reviewId) => api.delete(`/review/${reviewId}`)

// ── Delivery ─────────────────────────────────────────────
export const addDeliveryPerson  = (data) => api.post('/delivery/add', data)
export const loginDelivery      = (data) => api.post('/delivery/login', data)
export const updateOrderStatus  = (data) => api.post('/delivery/update-order', data)
export const getDeliveries      = (orderId) => api.get(`/delivery/deliveries/${orderId}`)

export default api
