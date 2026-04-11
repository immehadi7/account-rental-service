import API from './axios'

export const createAlipayPayment = (orderId) => API.post('/payments/alipay/create', { orderId })
export const createWechatPayment = (orderId) => API.post('/payments/wechat/create', { orderId })
export const getPaymentStatus = (paymentId) => API.get(`/payments/${paymentId}/status`)
