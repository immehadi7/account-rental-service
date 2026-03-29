import API from './axios'

export const getAccounts              = (params)      => API.get('/accounts', { params })
export const getAccount               = (id)          => API.get(`/accounts/${id}`)
export const createAccount            = (data)        => API.post('/accounts', data)
export const updateAccount            = (id, data)    => API.put(`/accounts/${id}`, data)
export const deleteAccount            = (id)          => API.delete(`/accounts/${id}`)
export const updateStatus             = (id, status)  => API.patch(`/accounts/${id}/status`, { status })
export const getMyAccounts            = ()            => API.get('/accounts/user/my')
export const updateCommissionDeposit  = (id, data)   => API.patch(`/accounts/${id}/commission-deposit`, data)