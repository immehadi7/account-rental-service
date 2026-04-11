import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const TABS = [
  { k: 'dashboard', l: '📊 Dashboard' },
  { k: 'users', l: '👥 Users' },
  { k: 'accounts', l: '🎮 Inventory' },
  { k: 'orders', l: '📦 Orders' },
  { k: 'payments', l: '💰 Payments' },
  { k: 'security', l: '🔒 Security' },
  { k: 'settings', l: '⚙️ Settings' },
]

const STATUS_COLORS = {
  online: 'bg-green-100 text-green-700',
  busy: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-500',
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  paid: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  confirmed: 'bg-purple-100 text-purple-700',
  pending_confirmation: 'bg-yellow-100 text-yellow-700',
  payment_submitted: 'bg-orange-100 text-orange-700',
  manual_review_pending: 'bg-orange-100 text-orange-700',
  refunded: 'bg-red-100 text-red-600',
}

const Badge = ({ status, label }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
      STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'
    }`}
  >
    {label}
  </span>
)

export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [accounts, setAccounts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [editAcc, setEditAcc] = useState(null)
  const [showEdit, setShowEdit] = useState(false)

  // ── Settings state ─────────────────────────────────────────────
  const SETTINGS_DEFAULT = {
    mock: {
      enabled: true,
      sms: true,
      wechat: true,
      alipayLogin: true,
      alipayPayment: true,
      fixedOtp: '123456',
      paymentDelaySeconds: 3,
      wechatOpenId: 'mock_wechat_openid',
      wechatNickname: '微信用户',
      alipayUserId: 'mock_alipay_user',
      alipayNickname: '支付宝用户',
    },
    sms: {
      enabled: false,
      username: '',
      apiKey: '',
      passwordMd5: '',
      signature: '',
    },
    wechatLogin: {
      enabled: false,
      appId: '',
      appSecret: '',
      redirectUri: '',
    },
    alipayLogin: {
      enabled: false,
      appId: '',
      privateKey: '',
      alipayPublicKey: '',
      gatewayUrl: 'https://openapi.alipay.com/gateway.do',
      redirectUri: '',
    },
    wechatPay: {
      enabled: false,
      appId: '',
      mchId: '',
      apiKey: '',
      apiV3Key: '',
      serialNumber: '',
      notifyUrl: '',
    },
    alipayPay: {
      enabled: false,
      appId: '',
      privateKey: '',
      alipayPublicKey: '',
      gatewayUrl: 'https://openapi.alipay.com/gateway.do',
      notifyUrl: '',
      returnUrl: '',
    },
  }

  const [settings, setSettings] = useState(SETTINGS_DEFAULT)
  const [settingsSaving, setSettingsSaving] = useState(null)
  const [settingsMsg, setSettingsMsg] = useState({})

  useEffect(() => {
    fetchAll()
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings')
      if (res.data.settings) {
        const s = res.data.settings
        setSettings(prev => ({
          mock: { ...prev.mock, ...(s.mock || {}) },
          sms: { ...prev.sms, ...(s.sms || {}) },
          wechatLogin: { ...prev.wechatLogin, ...(s.wechatLogin || {}) },
          alipayLogin: { ...prev.alipayLogin, ...(s.alipayLogin || {}) },
          wechatPay: { ...prev.wechatPay, ...(s.wechatPay || {}) },
          alipayPay: { ...prev.alipayPay, ...(s.alipayPay || {}) },
        }))
      }
    } catch (err) {
      console.error('Failed to load settings', err)
    }
  }

  const saveSettings = async section => {
    setSettingsSaving(section)
    setSettingsMsg(m => ({ ...m, [section]: '' }))

    try {
      const payload = { [section]: settings[section] }
      const res = await API.put('/settings', payload)

      if (res.data.settings) {
        const s = res.data.settings
        setSettings(prev => ({
          mock: { ...prev.mock, ...(s.mock || {}) },
          sms: { ...prev.sms, ...(s.sms || {}) },
          wechatLogin: { ...prev.wechatLogin, ...(s.wechatLogin || {}) },
          alipayLogin: { ...prev.alipayLogin, ...(s.alipayLogin || {}) },
          wechatPay: { ...prev.wechatPay, ...(s.wechatPay || {}) },
          alipayPay: { ...prev.alipayPay, ...(s.alipayPay || {}) },
        }))
      }

      setSettingsMsg(m => ({ ...m, [section]: 'success' }))
      setTimeout(() => {
        setSettingsMsg(m => ({ ...m, [section]: '' }))
      }, 3000)
    } catch (err) {
      console.error(err)
      setSettingsMsg(m => ({ ...m, [section]: 'error' }))
      setTimeout(() => {
        setSettingsMsg(m => ({ ...m, [section]: '' }))
      }, 3000)
    } finally {
      setSettingsSaving(null)
    }
  }

  const updateSetting = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [accRes, ordRes, usrRes] = await Promise.all([
        API.get('/accounts/admin/all'),
        API.get('/orders/admin/all'),
        API.get('/auth/users'),
      ])
      setAccounts(accRes.data.accounts || [])
      setOrders(ordRes.data.orders || [])
      setUsers(usrRes.data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalUsers: users.length,
    bannedUsers: users.filter(u => u.isBanned).length,
    totalAccounts: accounts.length,
    pendingAccounts: accounts.filter(a => a.approvalStatus === 'pending').length,
    availableAccounts: accounts.filter(a => a.status === 'online').length,
    rentedAccounts: accounts.filter(a => a.status === 'busy').length,
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    pendingOrders: orders.filter(o => o.status === 'pending_confirmation').length,
    totalRevenue: orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((s, o) => s + (o.totalAmount || 0), 0),
    pendingPayments: orders.filter(
      o =>
        ['unpaid', 'pending', 'payment_submitted', 'manual_review_pending'].includes(o.paymentStatus) &&
        o.status === 'confirmed'
    ).length,
    paidPayments: orders.filter(o => o.paymentStatus === 'paid').length,
  }

  const approveAccount = async (id, status) => {
    try {
      await API.patch(`/accounts/${id}/approve`, { approvalStatus: status })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteAccount = async id => {
    if (!window.confirm('确定删除此账号？')) return
    try {
      await API.delete(`/accounts/${id}`)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const updateAccountStatus = async (id, status) => {
    try {
      await API.patch(`/accounts/${id}/status`, { status })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const banUser = async (id, isBanned) => {
    try {
      await API.patch(`/auth/users/${id}/ban`, { isBanned })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteUser = async id => {
    if (!window.confirm('确定删除此用户？')) return
    try {
      await API.delete(`/auth/users/${id}`)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const saveEditAcc = async () => {
    try {
      await API.put(`/accounts/${editAcc._id}`, editAcc)
      setShowEdit(false)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <div className="font-bold text-xl text-gray-800 mb-2">无权限访问</div>
        <div className="text-gray-400 text-sm">此页面仅管理员可访问</div>
      </div>
    )
  }

  const filteredUsers = users.filter(
    u =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredAccounts = accounts.filter(
    a =>
      a.game?.toLowerCase().includes(search.toLowerCase()) ||
      a.rank?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredOrders = orders.filter(
    o =>
      o.orderNo?.includes(search) ||
      o.buyer?.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-black text-lg">
              ⚙️
            </div>
            <div>
              <div className="font-black text-xl text-gray-800">管理后台</div>
              <div className="text-xs text-gray-400">61租号平台 · 欢迎，{user.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索..."
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand transition-colors w-48"
              />
            </div>
            <button
              onClick={() => {
                fetchAll()
                fetchSettings()
              }}
              className="bg-white border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm font-semibold hover:border-brand hover:text-brand transition-colors"
            >
              🔄 刷新
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                tab === k
                  ? 'bg-brand text-white shadow-md shadow-red-100'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
              }`}
            >
              {l}
              {k === 'accounts' && stats.pendingAccounts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.pendingAccounts}
                </span>
              )}
              {k === 'payments' && stats.pendingPayments > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.pendingPayments}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full spin" />
          </div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { ic: '👥', label: '总用户', val: stats.totalUsers, sub: `${stats.bannedUsers} 封禁` },
                    { ic: '🎮', label: '总账号', val: stats.totalAccounts, sub: `${stats.pendingAccounts} 待审核` },
                    { ic: '📦', label: '总订单', val: stats.totalOrders, sub: `${stats.completedOrders} 已完成` },
                    { ic: '💰', label: '总收入', val: `¥${stats.totalRevenue}`, sub: `${stats.paidPayments} 笔已付款` },
                  ].map(({ ic, label, val, sub }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="text-3xl mb-3">{ic}</div>
                      <div className="text-2xl font-black text-gray-800 mb-1">{val}</div>
                      <div className="text-xs font-semibold text-gray-500">{label}</div>
                      <div className="text-xs text-gray-400 mt-1">{sub}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">🎮 账号状态</div>
                    <div className="space-y-2">
                      {[
                        ['在线可用', stats.availableAccounts, 'text-green-600'],
                        ['租用中', stats.rentedAccounts, 'text-yellow-600'],
                        ['待审核', stats.pendingAccounts, 'text-red-500'],
                      ].map(([label, val, color]) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{label}</span>
                          <span className={`font-black text-lg ${color}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">📦 订单状态</div>
                    <div className="space-y-2">
                      {[
                        ['待确认', stats.pendingOrders, 'text-yellow-600'],
                        ['已完成', stats.completedOrders, 'text-green-600'],
                        ['总订单', stats.totalOrders, 'text-blue-600'],
                      ].map(([label, val, color]) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{label}</span>
                          <span className={`font-black text-lg ${color}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">⚡ 快捷操作</div>
                    <div className="space-y-2">
                      {[
                        { label: `审核账号 (${stats.pendingAccounts})`, tab: 'accounts', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        { label: `待付款订单 (${stats.pendingPayments})`, tab: 'payments', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        { label: `封禁用户 (${stats.bannedUsers})`, tab: 'users', color: 'bg-red-50 text-red-600 border-red-200' },
                      ].map(({ label, tab: t, color }) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${color}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="font-bold text-gray-800 mb-4">🕐 最近订单</div>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(ord => (
                      <div key={ord._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">📦</div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {ord.account?.game || '已删除'} · {ord.hours}h
                            </div>
                            <div className="text-xs text-gray-400">
                              {ord.buyer?.username} · {ord.orderNo}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-brand">¥{ord.totalAmount}</span>
                          <Badge
                            status={ord.status}
                            label={
                              ord.status === 'completed'
                                ? '已完成'
                                : ord.status === 'paid'
                                  ? '已付款'
                                  : ord.status === 'cancelled'
                                    ? '已取消'
                                    : ord.status === 'confirmed'
                                      ? '已确认'
                                      : ord.status === 'pending_confirmation'
                                        ? '待确认'
                                        : ord.status
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-gray-800">用户管理</div>
                  <div className="text-xs text-gray-400">共 {filteredUsers.length} 个用户</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['用户', '手机/邮箱', '角色', '登录次数', '状态', '注册时间', '操作'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  u.role === 'admin' ? 'bg-red-500' : u.role === 'seller' ? 'bg-blue-500' : 'bg-brand'
                                }`}
                              >
                                {u.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{u.username}</div>
                                {u.isBanned && <div className="text-xs text-red-500">已封禁</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            <div>{u.phone || '—'}</div>
                            <div>{u.email || '—'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                u.role === 'admin'
                                  ? 'bg-red-100 text-red-600'
                                  : u.role === 'seller'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {u.role === 'admin' ? '管理员' : u.role === 'seller' ? '卖家' : '用户'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-center">{u.loginCount || 0}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                u.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {u.isBanned ? '已封禁' : '正常'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {u.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => banUser(u._id, !u.isBanned)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                      u.isBanned
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    }`}
                                  >
                                    {u.isBanned ? '解封' : '封禁'}
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u._id)}
                                    className="bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                                  >
                                    删除
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">暂无用户</div>}
                </div>
              </div>
            )}

            {tab === 'accounts' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-gray-800">账号库存管理</div>
                  <div className="text-xs text-gray-400">共 {filteredAccounts.length} 个账号</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['游戏', '段位', '价格', '佣金', '押金', '卖家', '在线状态', '审核状态', '操作'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAccounts.map(acc => (
                        <tr key={acc._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{acc.emoji}</span>
                              <div>
                                <div className="font-semibold text-gray-800">{acc.game}</div>
                                <div className="text-xs text-gray-400">{acc.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{acc.rank}</td>
                          <td className="px-4 py-3 font-bold text-brand">¥{acc.price}/h</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{acc.commission ?? 8}%</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {acc.deposit != null && acc.deposit > 0 ? `¥${acc.deposit}` : '不收'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{acc.seller?.username || '未知'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={acc.status}
                              onChange={e => updateAccountStatus(acc._id, e.target.value)}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                acc.status === 'online'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : acc.status === 'busy'
                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                            >
                              <option value="online">在线</option>
                              <option value="busy">忙碌</option>
                              <option value="offline">离线</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              status={acc.approvalStatus}
                              label={
                                acc.approvalStatus === 'approved'
                                  ? '已通过'
                                  : acc.approvalStatus === 'pending'
                                    ? '待审核'
                                    : '已拒绝'
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {acc.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => approveAccount(acc._id, 'approved')}
                                    className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-green-200"
                                  >
                                    通过
                                  </button>
                                  <button
                                    onClick={() => approveAccount(acc._id, 'rejected')}
                                    className="bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-200"
                                  >
                                    拒绝
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setEditAcc({ ...acc })
                                  setShowEdit(true)
                                }}
                                className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-blue-200"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => deleteAccount(acc._id)}
                                className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-100 hover:text-red-600"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAccounts.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">暂无账号</div>}
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-gray-800">订单管理</div>
                  <div className="text-xs text-gray-400">共 {filteredOrders.length} 个订单</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['订单号', '账号', '时长', '金额', '买家', '支付方式', '状态', '时间'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map(ord => (
                        <tr key={ord._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{ord.orderNo}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{ord.account?.game || '已删除'}</td>
                          <td className="px-4 py-3 text-gray-600">{ord.hours}h</td>
                          <td className="px-4 py-3 font-bold text-brand">¥{ord.totalAmount}</td>
                          <td className="px-4 py-3 text-gray-600">{ord.buyer?.username || '未知'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                ord.paymentMethod === 'alipay'
                                  ? 'bg-blue-100 text-blue-700'
                                  : ord.paymentMethod === 'wechat'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {ord.paymentMethod === 'alipay'
                                ? '💙 支付宝'
                                : ord.paymentMethod === 'wechat'
                                  ? '💚 微信'
                                  : '余额'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              status={ord.status}
                              label={
                                ord.status === 'completed'
                                  ? '已完成'
                                  : ord.status === 'paid'
                                    ? '已付款'
                                    : ord.status === 'cancelled'
                                      ? '已取消'
                                      : ord.status === 'confirmed'
                                        ? '已确认'
                                        : ord.status === 'pending_confirmation'
                                          ? '待确认'
                                          : ord.status
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(ord.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">暂无订单</div>}
                </div>
              </div>
            )}

            {tab === 'payments' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    ['💰', '总收入', `¥${stats.totalRevenue}`, 'text-brand'],
                    ['✅', '已付款', stats.paidPayments, 'text-green-600'],
                    ['⏳', '待付款', stats.pendingPayments, 'text-yellow-600'],
                  ].map(([ic, label, val, color]) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="text-3xl mb-2">{ic}</div>
                      <div className={`text-2xl font-black mb-1 ${color}`}>{val}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="font-bold text-gray-800">付款记录</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['订单号', '买家', '金额', '支付方式', '付款状态', '时间'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map(ord => (
                          <tr key={ord._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{ord.orderNo}</td>
                            <td className="px-4 py-3 text-gray-700">{ord.buyer?.username || '未知'}</td>
                            <td className="px-4 py-3 font-bold text-brand">¥{ord.totalAmount}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  ord.paymentMethod === 'alipay'
                                    ? 'bg-blue-100 text-blue-700'
                                    : ord.paymentMethod === 'wechat'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {ord.paymentMethod === 'alipay'
                                  ? '💙 支付宝'
                                  : ord.paymentMethod === 'wechat'
                                    ? '💚 微信支付'
                                    : '余额'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : ord.paymentStatus === 'refunded'
                                      ? 'bg-red-100 text-red-600'
                                      : ord.paymentStatus === 'payment_submitted' ||
                                          ord.paymentStatus === 'manual_review_pending'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {ord.paymentStatus === 'paid'
                                  ? '✅ 已付款'
                                  : ord.paymentStatus === 'refunded'
                                    ? '↩️ 已退款'
                                    : ord.paymentStatus === 'payment_submitted' ||
                                        ord.paymentStatus === 'manual_review_pending'
                                      ? '🧾 待人工审核'
                                      : '⏳ 未付款'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {new Date(ord.createdAt).toLocaleDateString('zh-CN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-4">🔒 安全概览</div>
                    <div className="space-y-3">
                      {[
                        ['总用户数', stats.totalUsers, 'text-blue-600'],
                        ['封禁用户', stats.bannedUsers, 'text-red-600'],
                        ['正常用户', stats.totalUsers - stats.bannedUsers, 'text-green-600'],
                      ].map(([label, val, color]) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className={`font-black text-lg ${color}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-4">📊 活动追踪</div>
                    <div className="space-y-3">
                      {[
                        [
                          '今日订单',
                          orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
                          'text-blue-600',
                        ],
                        [
                          '今日收入',
                          `¥${orders
                            .filter(
                              o =>
                                new Date(o.createdAt).toDateString() === new Date().toDateString() &&
                                o.paymentStatus === 'paid'
                            )
                            .reduce((s, o) => s + o.totalAmount, 0)}`,
                          'text-green-600',
                        ],
                        ['异常订单', orders.filter(o => o.status === 'disputed').length, 'text-red-600'],
                      ].map(([label, val, color]) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className={`font-black text-lg ${color}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="font-bold text-gray-800 mb-4">🚫 封禁用户列表</div>
                  {users.filter(u => u.isBanned).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">暂无封禁用户</div>
                  ) : (
                    <div className="space-y-2">
                      {users
                        .filter(u => u.isBanned)
                        .map(u => (
                          <div key={u._id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-sm">
                                {u.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800 text-sm">{u.username}</div>
                                <div className="text-xs text-red-500">{u.banReason || '未注明原因'}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => banUser(u._id, false)}
                              className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200"
                            >
                              解除封禁
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="space-y-6">
                {(() => {
                  const Field = ({
                    label,
                    section,
                    field,
                    type = 'text',
                    placeholder = '',
                    hint = '',
                  }) => (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
                      <input
                        type={type}
                        value={settings[section][field] || ''}
                        onChange={e => updateSetting(section, field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand transition-colors"
                      />
                      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
                    </div>
                  )

                  const Toggle = ({ section, label }) => (
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        onClick={() => updateSetting(section, 'enabled', !settings[section].enabled)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings[section].enabled ? 'bg-brand' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            settings[section].enabled ? 'translate-x-5' : ''
                          }`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                    </label>
                  )

                  const SaveBtn = ({ section }) => (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => saveSettings(section)}
                        disabled={settingsSaving === section}
                        className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark disabled:opacity-60 transition-colors"
                      >
                        {settingsSaving === section ? '保存中…' : '保存设置'}
                      </button>
                      {settingsMsg[section] === 'success' && (
                        <span className="text-green-600 text-sm font-semibold">✅ 已保存</span>
                      )}
                      {settingsMsg[section] === 'error' && (
                        <span className="text-red-500 text-sm font-semibold">❌ 保存失败</span>
                      )}
                    </div>
                  )

                  const Card = ({ icon, title, children }) => (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="font-bold text-gray-800">{title}</span>
                      </div>
                      <div className="p-5 space-y-4">{children}</div>
                    </div>
                  )

                  const MockSwitch = ({ field, label }) => (
                    <label className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                      <button
                        type="button"
                        onClick={() => updateSetting('mock', field, !settings.mock[field])}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings.mock[field] ? 'bg-brand' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            settings.mock[field] ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </label>
                  )

                  return (
                    <>
                      <Card icon="🧪" title="模拟模式配置（开发 / 演示用）">
                        <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800">
                          开启后，系统将优先使用模拟数据进行短信验证码、微信登录、支付宝登录、支付宝支付。后续管理员可在下方继续填写真实配置，并在准备上线时关闭模拟模式。
                        </div>

                        <MockSwitch field="enabled" label="启用全局模拟模式" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <MockSwitch field="sms" label="模拟短信验证码" />
                          <MockSwitch field="wechat" label="模拟微信登录" />
                          <MockSwitch field="alipayLogin" label="模拟支付宝登录" />
                          <MockSwitch field="alipayPayment" label="模拟支付宝支付" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field
                            label="固定短信验证码"
                            section="mock"
                            field="fixedOtp"
                            placeholder="123456"
                            hint="模拟短信开启时，前端输入该验证码即可通过。"
                          />
                          <Field
                            label="模拟支付完成秒数"
                            section="mock"
                            field="paymentDelaySeconds"
                            type="number"
                            placeholder="3"
                            hint="模拟支付创建后，多少秒自动变为已付款。"
                          />
                          <Field
                            label="微信模拟 OpenID"
                            section="mock"
                            field="wechatOpenId"
                            placeholder="mock_wechat_openid"
                          />
                          <Field
                            label="微信模拟昵称"
                            section="mock"
                            field="wechatNickname"
                            placeholder="微信用户"
                          />
                          <Field
                            label="支付宝模拟用户ID"
                            section="mock"
                            field="alipayUserId"
                            placeholder="mock_alipay_user"
                          />
                          <Field
                            label="支付宝模拟昵称"
                            section="mock"
                            field="alipayNickname"
                            placeholder="支付宝用户"
                          />
                        </div>

                        <SaveBtn section="mock" />
                      </Card>

                      <Card icon="📱" title="短信验证配置 (SMSBao)">
                        <Toggle section="sms" label="启用短信登录 / 验证码" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field label="SMSBao 用户名" section="sms" field="username" placeholder="您的 smsbao.com 账号" />
                          <Field
                            label="API Key / 密码"
                            section="sms"
                            field="apiKey"
                            type="password"
                            placeholder="如使用明文密码，后端可转换为 MD5"
                          />
                          <Field
                            label="密码 MD5（可选）"
                            section="sms"
                            field="passwordMd5"
                            placeholder="若已提前生成 MD5，可直接填写"
                          />
                          <Field label="短信签名（可选）" section="sms" field="signature" placeholder="如：【61租号】" />
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                          <strong>说明：</strong> 开发阶段可先开启“模拟短信验证码”。上线前再填写 SMSBao 真实配置。
                        </div>
                        <SaveBtn section="sms" />
                      </Card>

                      <Card icon="💚" title="微信登录配置">
                        <Toggle section="wechatLogin" label="启用微信登录" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field label="App ID" section="wechatLogin" field="appId" placeholder="wx1234567890abcdef" />
                          <Field
                            label="App Secret"
                            section="wechatLogin"
                            field="appSecret"
                            type="password"
                            placeholder="微信开放平台 App Secret"
                            hint="敏感字段，建议后端返回时脱敏。"
                          />
                          <Field
                            label="Redirect URI"
                            section="wechatLogin"
                            field="redirectUri"
                            placeholder="https://yourdomain.com/api/auth/wechat/callback"
                            hint="需与微信开放平台配置保持一致。"
                          />
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700">
                          <strong>说明：</strong> 当前可先通过“模拟微信登录”完成开发，后续替换为真实 AppID / Secret。
                        </div>
                        <SaveBtn section="wechatLogin" />
                      </Card>

                      <Card icon="💙" title="支付宝登录配置">
                        <Toggle section="alipayLogin" label="启用支付宝登录" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field label="App ID" section="alipayLogin" field="appId" placeholder="2021001234567890" />
                          <Field
                            label="应用私钥"
                            section="alipayLogin"
                            field="privateKey"
                            type="password"
                            placeholder="RSA2 私钥内容"
                          />
                          <Field
                            label="支付宝公钥"
                            section="alipayLogin"
                            field="alipayPublicKey"
                            placeholder="支付宝公钥字符串"
                          />
                          <Field
                            label="网关地址"
                            section="alipayLogin"
                            field="gatewayUrl"
                            placeholder="https://openapi.alipay.com/gateway.do"
                          />
                          <Field
                            label="Redirect URI"
                            section="alipayLogin"
                            field="redirectUri"
                            placeholder="https://yourdomain.com/api/auth/alipay/callback"
                          />
                        </div>
                        <SaveBtn section="alipayLogin" />
                      </Card>

                      <Card icon="💰" title="微信支付配置">
                        <Toggle section="wechatPay" label="启用微信支付" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field label="App ID" section="wechatPay" field="appId" placeholder="wx1234567890abcdef" />
                          <Field label="商户号 (MCH ID)" section="wechatPay" field="mchId" placeholder="1234567890" />
                          <Field label="API Key" section="wechatPay" field="apiKey" type="password" placeholder="微信支付 API 密钥" />
                          <Field label="API v3 Key" section="wechatPay" field="apiV3Key" type="password" placeholder="微信支付 v3 密钥" />
                          <Field label="证书序列号" section="wechatPay" field="serialNumber" placeholder="API 证书序列号" />
                          <Field
                            label="支付回调地址 (Notify URL)"
                            section="wechatPay"
                            field="notifyUrl"
                            placeholder="https://api.yourdomain.com/api/payments/wechat/notify"
                          />
                        </div>
                        <SaveBtn section="wechatPay" />
                      </Card>

                      <Card icon="🧾" title="支付宝支付配置">
                        <Toggle section="alipayPay" label="启用支付宝支付" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field label="App ID" section="alipayPay" field="appId" placeholder="2021001234567890" />
                          <Field label="应用私钥" section="alipayPay" field="privateKey" type="password" placeholder="RSA2 私钥" />
                          <Field
                            label="支付宝公钥"
                            section="alipayPay"
                            field="alipayPublicKey"
                            placeholder="支付宝公钥字符串"
                          />
                          <Field
                            label="网关地址"
                            section="alipayPay"
                            field="gatewayUrl"
                            placeholder="https://openapi.alipay.com/gateway.do"
                          />
                          <Field
                            label="异步通知地址 (Notify URL)"
                            section="alipayPay"
                            field="notifyUrl"
                            placeholder="https://api.yourdomain.com/api/payments/alipay/notify"
                          />
                          <Field
                            label="同步跳转地址 (Return URL)"
                            section="alipayPay"
                            field="returnUrl"
                            placeholder="https://yourdomain.com/payment-result"
                          />
                        </div>
                        <SaveBtn section="alipayPay" />
                      </Card>
                    </>
                  )
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {showEdit && editAcc && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="font-bold text-gray-800">编辑账号</div>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['游戏名称', 'game', 'text'],
                ['段位', 'rank', 'text'],
                ['租金/小时', 'price', 'number'],
                ['原价', 'originalPrice', 'number'],
                ['交付时间(分钟)', 'deliveryTime', 'number'],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
                  <input
                    type={type}
                    value={editAcc[field] || ''}
                    onChange={e => setEditAcc({ ...editAcc, [field]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold"
                >
                  取消
                </button>
                <button
                  onClick={saveEditAcc}
                  className="flex-1 bg-brand text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}