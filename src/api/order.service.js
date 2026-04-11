import API from './axios'

export const createOrder = (data) => API.post('/orders', data)
export const confirmOrder = (id) => API.patch(`/orders/${id}/confirm`)
export const submitPayment = (id, data) => API.patch(`/orders/${id}/pay`, data)
export const completeOrder = (id) => API.patch(`/orders/${id}/complete`)
export const cancelOrder = (id) => API.patch(`/orders/${id}/cancel`)
export const getMyOrders = () => API.get('/orders/my')
export const getSellerOrders = () => API.get('/orders/seller')
export const getOrder = (id) => API.get(`/orders/${id}`)
