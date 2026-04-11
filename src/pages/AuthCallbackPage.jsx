import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthCallbackPage() {
  const { login } = useAuth()
  const [message, setMessage] = useState('正在处理授权登录…')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const encodedUser = params.get('user')

    try {
      if (!token || !encodedUser) throw new Error('缺少登录凭证')
      const user = JSON.parse(decodeURIComponent(encodedUser))
      login(token, user)
      setMessage('登录成功，正在返回首页…')
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (error) {
      setMessage(error.message || '第三方登录失败')
    }
  }, [login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="text-3xl mb-3">🔐</div>
        <div className="font-black text-lg text-gray-800 mb-2">授权处理中</div>
        <div className="text-sm text-gray-500">{message}</div>
      </div>
    </div>
  )
}
