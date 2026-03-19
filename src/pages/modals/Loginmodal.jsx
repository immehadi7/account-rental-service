import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { login, register } from '../../api/auth.service'

export default function LoginModal({ onClose }) {
  const { login: saveUser } = useAuth()
  const [tab,      setTab]      = useState('phone')
  const [username, setUsername] = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [otp,      setOtp]      = useState('')
  const [agreed,   setAgreed]   = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [otpTimer])

  const sendOtp = () => {
    if (!phone) { setError('请输入手机号'); return }
    setOtpTimer(60)
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    if (!agreed) { setError('请先同意用户协议和隐私政策'); return }

    setLoading(true)
    try {
      let res

      if (tab === 'phone') {
        // Register with phone
        if (!phone) { setError('请输入手机号'); setLoading(false); return }
        res = await register({
          username: `user_${phone.slice(-4)}`,
          phone,
          password: otp || '123456',
        })
      } else {
        // Login with username + password
        if (!username || !password) {
          setError('请输入账号和密码')
          setLoading(false)
          return
        }
        res = await login({ username, password })
      }

      // Save token and user to context
      saveUser(res.data.token, res.data.user)
      onClose()

    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-gradient-to-br from-brand to-brand-dark p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white, transparent)' }}
          />
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              🎮
            </div>
            <div className="text-white font-black text-xl">61租号</div>
            <div className="text-white/70 text-sm mt-1">游戏账号租赁平台</div>
          </div>
        </div>

        <div className="p-6">
          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {[{ k: 'phone', l: '手机验证码登录' }, { k: 'pass', l: '账号密码登录' }].map(({ k, l }) => (
              <button
                key={k}
                onClick={() => { setTab(k); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === k ? 'bg-white text-brand shadow-sm' : 'text-gray-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Phone tab */}
          {tab === 'phone' && (
            <>
              <div className="mb-3">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="请输入验证码"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
                />
                <button
                  onClick={sendOtp}
                  disabled={otpTimer > 0 || !phone}
                  className={`px-3 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    otpTimer > 0 || !phone
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand text-white hover:bg-brand-dark'
                  }`}
                >
                  {otpTimer > 0 ? `${otpTimer}s后重发` : '获取验证码'}
                </button>
              </div>
              <div className="text-xs text-gray-400 mb-4">
                未注册手机号验证后自动创建账号
              </div>
            </>
          )}

          {/* Password tab */}
          {tab === 'pass' && (
            <>
              <div className="mb-3">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Agreement */}
          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-brand"
            />
            <span className="text-xs text-gray-500">
              我已阅读并同意{' '}
              <span className="text-brand">《用户协议》</span>
              {' '}和{' '}
              <span className="text-brand">《隐私政策》</span>
            </span>
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-base font-black text-white transition-all ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-dark shadow-lg shadow-red-100'
            }`}
          >
            {loading ? '处理中…' : tab === 'phone' ? '登录 / 注册' : '登录'}
          </button>

          {/* Divider */}
          <div className="relative text-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <span className="relative bg-white px-3 text-xs text-gray-400">
              其他方式登录
            </span>
          </div>

          {/* Social */}
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:border-[#1678ff] hover:text-[#1678ff] flex items-center justify-center gap-1.5 transition-colors">
              💙 支付宝
            </button>
            <button className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:border-green-500 hover:text-green-600 flex items-center justify-center gap-1.5 transition-colors">
              💚 微信
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}