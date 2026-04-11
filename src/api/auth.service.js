import API from './axios'

export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)
export const sendPhoneCode = (data) => API.post('/auth/send-code', data)
export const verifyPhoneCode = (data) => API.post('/auth/verify-code', data)
export const phoneRegisterOrLogin = (data) => API.post('/auth/phone-register-or-login', data)
export const getMe = () => API.get('/auth/me')
export const updateProfile = (data) => API.put('/auth/me', data)
export const changePassword = (data) => API.put('/auth/password', data)

export const getWechatLoginUrl = () => `${API.defaults.baseURL}/auth/wechat`
export const getAlipayLoginUrl = () => `${API.defaults.baseURL}/auth/alipay`
