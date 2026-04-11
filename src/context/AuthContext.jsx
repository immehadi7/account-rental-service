import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth.service'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const cachedUser = localStorage.getItem('user')
    if (cachedUser && !user) {
      try {
        setUser(JSON.parse(cachedUser))
      } catch {}
    }

    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data.user)
          localStorage.setItem('user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-brand rounded-full mx-auto mb-3 spin" />
          <div className="text-sm text-gray-400">加载中…</div>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
