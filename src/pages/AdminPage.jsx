import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const TABS = [
  { k: 'dashboard', l: '📊 Dashboard'    },
  { k: 'users',     l: '👥 Users'        },
  { k: 'accounts',  l: '🎮 Inventory'    },
  { k: 'orders',    l: '📦 Orders'       },
  { k: 'payments',  l: '💰 Payments'     },
  { k: 'security',  l: '🔒 Security'     },
]

const STATUS_COLORS = {
  online:    'bg-green-100 text-green-700',
  busy:      'bg-yellow-100 text-yellow-700',
  offline:   'bg-gray-100 text-gray-500',
  approved:  'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  rejected:  'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  paid:      'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  confirmed: 'bg-purple-100 text-purple-700',
  pending_confirmation: 'bg-yellow-100 text-yellow-700',
}

const Badge = ({ status, label }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
    {label}
  </span>
)

export default function AdminPage() {
  const { user }                  = useAuth()
  const [tab,      setTab]        = useState('dashboard')
  const [accounts, setAccounts]   = useState([])
  const [orders,   setOrders]     = useState([])
  const [users,    setUsers]      = useState([])
  const [loading,  setLoading]    = useState(false)
  const [search,   setSearch]     = useState('')
  const [editAcc,  setEditAcc]    = useState(null)
  const [showEdit, setShowEdit]   = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [accRes, ordRes, usrRes] = await Promise.all([
        API.get('/accounts/admin/all'),
        API.get('/orders/admin/all'),
        API.get('/auth/users'),
      ])
      setAccounts(accRes.data.accounts || [])
      setOrders(ordRes.data.orders     || [])
      setUsers(usrRes.data.users       || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Stats
  const stats = {
    totalUsers:       users.length,
    bannedUsers:      users.filter(u => u.isBanned).length,
    totalAccounts:    accounts.length,
    pendingAccounts:  accounts.filter(a => a.approvalStatus === 'pending').length,
    availableAccounts: accounts.filter(a => a.status === 'online').length,
    rentedAccounts:   accounts.filter(a => a.status === 'busy').length,
    totalOrders:      orders.length,
    completedOrders:  orders.filter(o => o.status === 'completed').length,
    pendingOrders:    orders.filter(o => o.status === 'pending_confirmation').length,
    totalRevenue:     orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0),
    pendingPayments:  orders.filter(o => o.paymentStatus === 'unpaid' && o.status === 'confirmed').length,
    paidPayments:     orders.filter(o => o.paymentStatus === 'paid').length,
  }

  const approveAccount = async (id, status) => {
    try {
      await API.patch(`/accounts/${id}/approve`, { approvalStatus: status })
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const deleteAccount = async (id) => {
    if (!window.confirm('确定删除此账号？')) return
    try {
      await API.delete(`/accounts/${id}`)
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const updateAccountStatus = async (id, status) => {
    try {
      await API.patch(`/accounts/${id}/status`, { status })
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const banUser = async (id, isBanned) => {
    try {
      await API.patch(`/auth/users/${id}/ban`, { isBanned })
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('确定删除此用户？')) return
    try {
      await API.delete(`/auth/users/${id}`)
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const saveEditAcc = async () => {
    try {
      await API.put(`/accounts/${editAcc._id}`, editAcc)
      setShowEdit(false)
      fetchAll()
    } catch (err) { console.error(err) }
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

  const filteredUsers    = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredAccounts = accounts.filter(a =>
    a.game?.toLowerCase().includes(search.toLowerCase()) ||
    a.rank?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredOrders   = orders.filter(o =>
    o.orderNo?.includes(search) ||
    o.buyer?.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── HEADER ── */}
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
              onClick={fetchAll}
              className="bg-white border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm font-semibold hover:border-brand hover:text-brand transition-colors"
            >
              🔄 刷新
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
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
            {/* ══ DASHBOARD ══ */}
            {tab === 'dashboard' && (
              <div>
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { ic:'👥', label:'总用户',     val: stats.totalUsers,       color:'blue',   sub: `${stats.bannedUsers} 封禁`          },
                    { ic:'🎮', label:'总账号',     val: stats.totalAccounts,    color:'purple', sub: `${stats.pendingAccounts} 待审核`     },
                    { ic:'📦', label:'总订单',     val: stats.totalOrders,      color:'green',  sub: `${stats.completedOrders} 已完成`     },
                    { ic:'💰', label:'总收入',     val: `¥${stats.totalRevenue}`, color:'yellow', sub: `${stats.paidPayments} 笔已付款`   },
                  ].map(({ ic, label, val, sub }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="text-3xl mb-3">{ic}</div>
                      <div className="text-2xl font-black text-gray-800 mb-1">{val}</div>
                      <div className="text-xs font-semibold text-gray-500">{label}</div>
                      <div className="text-xs text-gray-400 mt-1">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Status cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">🎮 账号状态</div>
                    <div className="space-y-2">
                      {[
                        ['在线可用', stats.availableAccounts, 'text-green-600'],
                        ['租用中',   stats.rentedAccounts,    'text-yellow-600'],
                        ['待审核',   stats.pendingAccounts,   'text-red-500'   ],
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
                        ['待确认', stats.pendingOrders,   'text-yellow-600'],
                        ['已完成', stats.completedOrders, 'text-green-600' ],
                        ['总订单', stats.totalOrders,     'text-blue-600'  ],
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
                        { label: `审核账号 (${stats.pendingAccounts})`,  tab: 'accounts', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        { label: `待付款订单 (${stats.pendingPayments})`, tab: 'payments', color: 'bg-blue-50 text-blue-700 border-blue-200'       },
                        { label: `封禁用户 (${stats.bannedUsers})`,       tab: 'users',    color: 'bg-red-50 text-red-600 border-red-200'          },
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

                {/* Recent orders */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="font-bold text-gray-800 mb-4">🕐 最近订单</div>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(ord => (
                      <div key={ord._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                            📦
                          </div>
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
                              ord.status === 'completed'            ? '已完成' :
                              ord.status === 'paid'                 ? '已付款' :
                              ord.status === 'cancelled'            ? '已取消' :
                              ord.status === 'confirmed'            ? '已确认' :
                              ord.status === 'pending_confirmation' ? '待确认' : ord.status
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ USERS ══ */}
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
                        {['用户','手机/邮箱','角色','登录次数','状态','注册时间','操作'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                u.role === 'admin' ? 'bg-red-500' : u.role === 'seller' ? 'bg-blue-500' : 'bg-brand'
                              }`}>
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
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              u.role === 'admin'  ? 'bg-red-100 text-red-600' :
                              u.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-500'
                            }`}>
                              {u.role === 'admin' ? '管理员' : u.role === 'seller' ? '卖家' : '用户'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-center">
                            {u.loginCount || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              u.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                            }`}>
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
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">暂无用户</div>
                  )}
                </div>
              </div>
            )}

            {/* ══ ACCOUNTS INVENTORY ══ */}
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
                        {['游戏','段位','价格','佣金','押金','卖家','在线状态','审核状态','操作'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
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
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {acc.commission ?? 8}%
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {acc.deposit != null && acc.deposit > 0 ? `¥${acc.deposit}` : '不收'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {acc.seller?.username || '未知'}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={acc.status}
                              onChange={e => updateAccountStatus(acc._id, e.target.value)}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                acc.status === 'online'  ? 'bg-green-100 text-green-700 border-green-200' :
                                acc.status === 'busy'    ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                           'bg-gray-100 text-gray-500 border-gray-200'
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
                                acc.approvalStatus === 'approved' ? '已通过' :
                                acc.approvalStatus === 'pending'  ? '待审核' : '已拒绝'
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
                                onClick={() => { setEditAcc({...acc}); setShowEdit(true) }}
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
                  {filteredAccounts.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">暂无账号</div>
                  )}
                </div>
              </div>
            )}

            {/* ══ ORDERS ══ */}
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
                        {['订单号','账号','时长','金额','买家','支付方式','状态','时间'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map(ord => (
                        <tr key={ord._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{ord.orderNo}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {ord.account?.game || '已删除'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{ord.hours}h</td>
                          <td className="px-4 py-3 font-bold text-brand">¥{ord.totalAmount}</td>
                          <td className="px-4 py-3 text-gray-600">{ord.buyer?.username || '未知'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              ord.paymentMethod === 'alipay'  ? 'bg-blue-100 text-blue-700' :
                              ord.paymentMethod === 'wechat'  ? 'bg-green-100 text-green-700' :
                                                                'bg-gray-100 text-gray-500'
                            }`}>
                              {ord.paymentMethod === 'alipay' ? '💙 支付宝' :
                               ord.paymentMethod === 'wechat' ? '💚 微信' : '余额'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              status={ord.status}
                              label={
                                ord.status === 'completed'            ? '已完成' :
                                ord.status === 'paid'                 ? '已付款' :
                                ord.status === 'cancelled'            ? '已取消' :
                                ord.status === 'confirmed'            ? '已确认' :
                                ord.status === 'pending_confirmation' ? '待确认' : ord.status
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
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">暂无订单</div>
                  )}
                </div>
              </div>
            )}

            {/* ══ PAYMENTS ══ */}
            {tab === 'payments' && (
              <div>
                {/* Payment stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    ['💰', '总收入',    `¥${stats.totalRevenue}`, 'text-brand'  ],
                    ['✅', '已付款',    stats.paidPayments,       'text-green-600'],
                    ['⏳', '待付款',    stats.pendingPayments,    'text-yellow-600'],
                  ].map(([ic, label, val, color]) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="text-3xl mb-2">{ic}</div>
                      <div className={`text-2xl font-black mb-1 ${color}`}>{val}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Payment list */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="font-bold text-gray-800">付款记录</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['订单号','买家','金额','支付方式','付款状态','时间'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
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
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                ord.paymentMethod === 'alipay' ? 'bg-blue-100 text-blue-700' :
                                ord.paymentMethod === 'wechat' ? 'bg-green-100 text-green-700' :
                                                                  'bg-gray-100 text-gray-500'
                              }`}>
                                {ord.paymentMethod === 'alipay' ? '💙 支付宝' :
                                 ord.paymentMethod === 'wechat' ? '💚 微信支付' : '余额'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                ord.paymentStatus === 'paid'     ? 'bg-green-100 text-green-700' :
                                ord.paymentStatus === 'refunded' ? 'bg-red-100 text-red-600' :
                                                                    'bg-yellow-100 text-yellow-700'
                              }`}>
                                {ord.paymentStatus === 'paid'     ? '✅ 已付款' :
                                 ord.paymentStatus === 'refunded' ? '↩️ 已退款' : '⏳ 未付款'}
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

            {/* ══ SECURITY ══ */}
            {tab === 'security' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-4">🔒 安全概览</div>
                    <div className="space-y-3">
                      {[
                        ['总用户数',    stats.totalUsers,   'text-blue-600' ],
                        ['封禁用户',    stats.bannedUsers,  'text-red-600'  ],
                        ['正常用户',    stats.totalUsers - stats.bannedUsers, 'text-green-600'],
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
                        ['今日订单', orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length, 'text-blue-600'],
                        ['今日收入', `¥${orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.paymentStatus === 'paid').reduce((s,o) => s + o.totalAmount, 0)}`, 'text-green-600'],
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

                {/* Banned users list */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="font-bold text-gray-800 mb-4">🚫 封禁用户列表</div>
                  {users.filter(u => u.isBanned).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">暂无封禁用户</div>
                  ) : (
                    <div className="space-y-2">
                      {users.filter(u => u.isBanned).map(u => (
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
          </>
        )}
      </div>

      {/* ══ EDIT ACCOUNT MODAL ══ */}
      {showEdit && editAcc && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="font-bold text-gray-800">编辑账号</div>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">×</button>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['游戏名称', 'game',     'text'],
                ['段位',     'rank',     'text'],
                ['租金/小时', 'price',   'number'],
                ['原价',     'originalPrice', 'number'],
                ['交付时间(分钟)', 'deliveryTime', 'number'],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
                  <input
                    type={type}
                    value={editAcc[field] || ''}
                    onChange={e => setEditAcc({...editAcc, [field]: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowEdit(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold">取消</button>
                <button onClick={saveEditAcc} className="flex-1 bg-brand text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}