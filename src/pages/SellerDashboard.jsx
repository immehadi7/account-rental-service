import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyAccounts, updateStatus } from '../api/account.service'
import { getSellerOrders } from '../api/order.service'
import API from '../api/axios'

const TABS = [
  { k: 'overview',  l: '📊',  full: '概览'    },
  { k: 'listings',  l: '🎮',  full: '账号管理' },
  { k: 'orders',    l: '📦',  full: '订单管理' },
  { k: 'earnings',  l: '💰',  full: '收益钱包' },
  { k: 'analytics', l: '📈',  full: '数据分析' },
  { k: 'settings',  l: '⚙️',  full: '设置'    },
]

const STATUS_MAP = {
  completed:            { label: '已完成', cls: 'bg-green-100 text-green-700'   },
  paid:                 { label: '已付款', cls: 'bg-blue-100 text-blue-700'    },
  confirmed:            { label: '已确认', cls: 'bg-purple-100 text-purple-700' },
  pending_confirmation: { label: '待确认', cls: 'bg-yellow-100 text-yellow-700' },
  cancelled:            { label: '已取消', cls: 'bg-red-100 text-red-600'      },
  in_progress:          { label: '租用中', cls: 'bg-teal-100 text-teal-700'    },
}

const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
}

// Simple bar chart component
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.earnings), 1)
  return (
    <div className="flex items-end gap-1.5 h-32 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-brand font-bold">
            {d.earnings > 0 ? `¥${d.earnings}` : ''}
          </div>
          <div
            className="w-full bg-brand rounded-t-lg transition-all duration-500 min-h-[4px]"
            style={{
              height: `${Math.max((d.earnings / max) * 80, 4)}px`,
              opacity: 0.6 + (d.earnings / max) * 0.4,
            }}
          />
          <div className="text-xs text-gray-400 whitespace-nowrap">{d.date}</div>
        </div>
      ))}
    </div>
  )
}

// Skeleton loader
const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
)

export default function SellerDashboard({ setPage }) {
  const { user }                     = useAuth()
  const [tab,        setTab]         = useState('overview')
  const [accounts,   setAccounts]    = useState([])
  const [orders,     setOrders]      = useState([])
  const [analytics,  setAnalytics]   = useState(null)
  const [loading,    setLoading]     = useState(true)
  const [search,     setSearch]      = useState('')
  const [filter,     setFilter]      = useState('all')
  const [darkMode,   setDarkMode]    = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif,  setShowNotif]   = useState(false)
  const [withdraw,   setWithdraw]    = useState(false)
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const notifRef = useRef(null)

  useEffect(() => { if (user) fetchAll() }, [user])

  useEffect(() => {
    // Simulate real-time notifications
    const timer = setInterval(() => {
      const types = [
        '🎉 新订单！买家提交了租用请求',
        '💰 收到付款！请及时处理订单',
        '⏰ 账号租用时间即将到期',
      ]
      const random = types[Math.floor(Math.random() * types.length)]
      setNotifications(p => [{
        id: Date.now(),
        msg: random,
        time: new Date().toLocaleTimeString('zh-CN'),
        read: false,
      }, ...p.slice(0, 9)])
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [accRes, ordRes, anaRes] = await Promise.all([
        getMyAccounts(),
        getSellerOrders(),
        API.get('/orders/seller/analytics'),
      ])
      setAccounts(accRes.data.accounts || [])
      setOrders(ordRes.data.orders     || [])
      setAnalytics(anaRes.data.analytics || null)

      // Generate initial notifications
      const ords = ordRes.data.orders || []
      const pending = ords.filter(o => o.status === 'pending_confirmation')
      if (pending.length > 0) {
        setNotifications([{
          id: 1,
          msg: `📦 您有 ${pending.length} 个订单等待确认`,
          time: '刚刚',
          read: false,
        }])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    const next = currentStatus === 'online' ? 'offline' : 'online'
    try {
      await updateStatus(id, next)
      setAccounts(p => p.map(a => a._id === id ? { ...a, status: next } : a))
    } catch (err) { console.error(err) }
  }

  const markAllRead = () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredAccounts = accounts.filter(a => {
    const matchSearch = a.game?.toLowerCase().includes(search.toLowerCase()) ||
                        a.rank?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all'      ? true :
                        filter === 'online'   ? a.status === 'online' :
                        filter === 'offline'  ? a.status === 'offline' :
                        filter === 'pending'  ? a.approvalStatus === 'pending' : true
    return matchSearch && matchFilter
  })

  const filteredOrders = orders.filter(o =>
    o.orderNo?.includes(search) ||
    o.buyer?.username?.toLowerCase().includes(search.toLowerCase()) ||
    o.account?.game?.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <div className="font-bold text-xl text-gray-800 mb-2">请先登录</div>
        <div className="text-gray-400 text-sm">登录后查看卖家中心</div>
      </div>
    )
  }

  const dm = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'

  return (
    <div className={`min-h-screen ${dm} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-200">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={`font-black text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {user.username}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-pulse"></span>
                卖家中心 · 在线
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={`hidden md:flex items-center gap-2 border rounded-xl px-3 py-2 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索..."
                className="bg-transparent outline-none text-sm w-36"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 hover:border-brand'
                }`}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className={`absolute right-0 top-12 w-72 rounded-2xl shadow-xl border z-50 overflow-hidden ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-bold text-sm">通知</span>
                    <button onClick={markAllRead} className="text-xs text-brand">全部已读</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">暂无通知</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${
                          !n.read ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''
                        }`}>
                          <div className="text-sm">{n.msg}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 hover:border-brand'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Add account */}
            <button
              onClick={() => setPage('post')}
              className="bg-brand text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-brand-dark transition-colors shadow-md shadow-red-100"
            >
              + 发布账号
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className={`flex gap-1 mb-6 p-1 rounded-2xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } shadow-sm overflow-x-auto`}>
          {TABS.map(({ k, l, full }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                tab === k
                  ? 'bg-brand text-white shadow-md'
                  : darkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-brand'
              }`}
            >
              <span>{l}</span>
              <span className="hidden sm:inline">{full}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <>
            {/* ══ OVERVIEW ══ */}
            {tab === 'overview' && (
              <div>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { ic:'💰', label:'今日收益',   val:`¥${analytics?.todayEarnings || 0}`,  sub:'今天',   color:'text-brand'      },
                    { ic:'📅', label:'本月收益',   val:`¥${analytics?.monthEarnings || 0}`,  sub:'本月',   color:'text-green-600'  },
                    { ic:'📦', label:'待处理订单', val: analytics?.pendingOrders || 0,        sub:'待确认', color:'text-yellow-600' },
                    { ic:'🎮', label:'在线账号',   val: accounts.filter(a=>a.status==='online').length, sub:'可租用', color:'text-blue-600' },
                  ].map(({ ic, label, val, sub, color }) => (
                    <div key={label} className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                      <div className="flex items-start justify-between">
                        <div className="text-3xl">{ic}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
                        }`}>{sub}</span>
                      </div>
                      <div className={`text-2xl font-black mt-3 mb-1 ${color}`}>{val}</div>
                      <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts + Quick actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* 7-day earnings chart */}
                  <div className={`md:col-span-2 rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        📈 近7天收益
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        总计：¥{analytics?.last7Days?.reduce((s,d) => s+d.earnings, 0) || 0}
                      </div>
                    </div>
                    {analytics?.last7Days && <BarChart data={analytics.last7Days} />}
                  </div>

                  {/* Quick actions */}
                  <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      ⚡ 快捷操作
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { ic:'➕', label:'发布新账号',   action: () => setPage('post'),             color:'bg-brand text-white'                    },
                        { ic:'📦', label:'查看新订单',   action: () => setTab('orders'),            color:'bg-blue-500 text-white'                  },
                        { ic:'💸', label:'申请提现',     action: () => { setTab('earnings'); setWithdraw(true) }, color:'bg-green-500 text-white' },
                        { ic:'📊', label:'查看数据',     action: () => setTab('analytics'),         color:'bg-purple-500 text-white'                },
                      ].map(({ ic, label, action, color }) => (
                        <button
                          key={label}
                          onClick={action}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 ${color}`}
                        >
                          <span>{ic}</span>{label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account status + recent orders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      🎮 账号状态
                    </div>
                    {[
                      ['🟢 在线可租', accounts.filter(a=>a.status==='online').length,  'text-green-600' ],
                      ['🟡 租用中',   accounts.filter(a=>a.status==='busy').length,    'text-yellow-600'],
                      ['⚫ 已下架',   accounts.filter(a=>a.status==='offline').length, 'text-gray-500'  ],
                      ['⏳ 审核中',   accounts.filter(a=>a.approvalStatus==='pending').length, 'text-orange-500'],
                    ].map(([label, val, color]) => (
                      <div key={label} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${
                        darkMode ? 'border-gray-700' : 'border-gray-50'
                      }`}>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
                        <span className={`text-xl font-black ${color}`}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        🕐 最近订单
                      </div>
                      <button onClick={() => setTab('orders')} className="text-xs text-brand">查看全部 →</button>
                    </div>
                    {orders.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">暂无订单</div>
                    ) : (
                      <div className="space-y-2">
                        {orders.slice(0, 4).map(ord => (
                          <div key={ord._id} className={`flex justify-between items-center py-2 border-b last:border-0 ${
                            darkMode ? 'border-gray-700' : 'border-gray-50'
                          }`}>
                            <div>
                              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {ord.account?.game || '已删除'} · {ord.hours}h
                              </div>
                              <div className="text-xs text-gray-400">{ord.buyer?.username}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-brand text-sm">¥{ord.totalAmount}</div>
                              <Badge status={ord.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ ACCOUNT MANAGEMENT ══ */}
            {tab === 'listings' && (
              <div>
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 max-w-xs ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <span className="text-gray-400">🔍</span>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="搜索账号..."
                      className="bg-transparent outline-none text-sm flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { k: 'all',     l: '全部'   },
                      { k: 'online',  l: '🟢 在线' },
                      { k: 'offline', l: '⚫ 离线' },
                      { k: 'pending', l: '⏳ 审核' },
                    ].map(({ k, l }) => (
                      <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          filter === k
                            ? 'bg-brand text-white'
                            : darkMode
                            ? 'bg-gray-800 border border-gray-700 text-gray-300'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-brand'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage('post')}
                    className="bg-brand text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-brand-dark ml-auto"
                  >
                    + 发布新账号
                  </button>
                </div>

                {filteredAccounts.length === 0 ? (
                  <div className={`rounded-2xl border p-12 text-center ${card}`}>
                    <div className="text-5xl mb-3">🎮</div>
                    <div className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      没有找到账号
                    </div>
                    <button
                      onClick={() => setPage('post')}
                      className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm mt-2"
                    >
                      立即发布
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAccounts.map(acc => (
                      <div key={acc._id} className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${card}`}>
                        <div
                          className="h-28 flex items-center justify-center text-5xl relative"
                          style={{ background: 'linear-gradient(135deg,#1e3a5f22,#1e3a5f55)' }}
                        >
                          {acc.emoji || '🎮'}
                          {/* Status indicator */}
                          <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                            acc.status === 'online' ? 'bg-green-500 status-pulse' :
                            acc.status === 'busy'   ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {acc.game}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              acc.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                              acc.approvalStatus === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                                                                  'bg-red-100 text-red-600'
                            }`}>
                              {acc.approvalStatus === 'approved' ? '已上架' :
                               acc.approvalStatus === 'pending'  ? '审核中' : '已拒绝'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mb-1">{acc.rank}段</div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(acc.tags || []).slice(0, 2).map(t => (
                              <span key={t} className="tag-chip bg-gray-100 text-gray-500">{t}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-black text-brand text-lg">¥{acc.price}/h</span>
                            <div className="text-xs text-gray-400">
                              👁{acc.views||0} · 📦{acc.orders||0}
                            </div>
                          </div>
                          {/* Status toggle */}
                          <button
                            onClick={() => toggleStatus(acc._id, acc.status)}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                              acc.status === 'online'
                                ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            {acc.status === 'online' ? '🟢 在线 (点击下架)' : '⚫ 已下架 (点击上线)'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ORDERS ══ */}
            {tab === 'orders' && (
              <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    订单管理
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="搜索订单..."
                      className={`border rounded-xl px-3 py-1.5 text-sm outline-none w-36 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200 focus:border-brand'
                      }`}
                    />
                    <span className="text-xs text-gray-400">共 {filteredOrders.length} 个</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        {['订单号','账号','时长','金额','买家','联系方式','支付','状态','时间'].map(h => (
                          <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map(ord => (
                        <tr key={ord._id} className={`transition-colors ${
                          darkMode ? 'hover:bg-gray-700 divide-gray-700' : 'hover:bg-gray-50'
                        }`}>
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">{ord.orderNo}</td>
                          <td className={`px-4 py-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {ord.account?.game || '已删除'}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{ord.hours}h</td>
                          <td className="px-4 py-3 font-bold text-brand">¥{ord.totalAmount}</td>
                          <td className="px-4 py-3 text-gray-500">{ord.buyer?.username || '未知'}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{ord.buyerContact || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              ord.paymentMethod === 'alipay' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {ord.paymentMethod === 'alipay' ? '💙 支付宝' : '💚 微信'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><Badge status={ord.status} /></td>
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

            {/* ══ EARNINGS & WALLET ══ */}
            {tab === 'earnings' && (
              <div>
                {/* Earnings cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { ic:'💰', label:'历史总收益',   val:`¥${analytics?.totalEarnings||0}`,  color:'text-brand'     },
                    { ic:'📅', label:'本月收益',     val:`¥${analytics?.monthEarnings||0}`,  color:'text-green-600' },
                    { ic:'🎯', label:'今日收益',     val:`¥${analytics?.todayEarnings||0}`,  color:'text-blue-600'  },
                  ].map(({ ic, label, val, color }) => (
                    <div key={label} className={`rounded-2xl border p-6 shadow-sm text-center ${card}`}>
                      <div className="text-4xl mb-3">{ic}</div>
                      <div className={`text-3xl font-black mb-1 ${color}`}>{val}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Withdraw */}
                <div className={`rounded-2xl border p-5 shadow-sm mb-6 ${card}`}>
                  <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    💸 申请提现
                  </div>
                  {withdraw ? (
                    <div className="space-y-3 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                          提现金额
                        </label>
                        <input
                          type="number"
                          value={withdrawAmt}
                          onChange={e => setWithdrawAmt(e.target.value)}
                          placeholder="输入提现金额"
                          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 focus:border-brand'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                          提现方式
                        </label>
                        <div className="flex gap-2">
                          {['💙 支付宝', '💚 微信', '🏦 银行卡'].map(m => (
                            <button key={m} className={`flex-1 py-2 rounded-xl border text-sm font-bold ${
                              darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
                            }`}>{m}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWithdraw(false)}
                          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => { setWithdraw(false); alert('提现申请已提交，1-3工作日内到账') }}
                          className="flex-1 bg-brand text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark"
                        >
                          提交申请
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setWithdraw(true)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                    >
                      💸 申请提现
                    </button>
                  )}
                </div>

                {/* Transaction history */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                  <div className={`px-5 py-4 border-b font-bold ${
                    darkMode ? 'border-gray-700 text-white' : 'border-gray-100 text-gray-800'
                  }`}>
                    💳 交易记录
                  </div>
                  {orders.filter(o => o.status === 'completed').length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">暂无收益记录</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {orders.filter(o => o.status === 'completed').map(ord => (
                        <div key={ord._id} className={`flex items-center justify-between px-5 py-3.5 ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold">
                              ¥
                            </div>
                            <div>
                              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {ord.account?.game || '已删除'} · {ord.hours}h
                              </div>
                              <div className="text-xs text-gray-400">
                                {ord.orderNo} · {new Date(ord.createdAt).toLocaleDateString('zh-CN')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-green-600">+¥{ord.totalAmount}</div>
                            <div className="text-xs text-gray-400">
                              {ord.paymentMethod === 'alipay' ? '💙 支付宝' : '💚 微信'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ ANALYTICS ══ */}
            {tab === 'analytics' && (
              <div>
                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* 7-day chart */}
                  <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      📈 近7天收益趋势
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      总计：¥{analytics?.last7Days?.reduce((s,d)=>s+d.earnings,0)||0}
                    </div>
                    {analytics?.last7Days && <BarChart data={analytics.last7Days} />}
                  </div>

                  {/* Orders chart */}
                  <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      📦 近7天订单量
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      总计：{analytics?.last7Days?.reduce((s,d)=>s+d.orders,0)||0} 单
                    </div>
                    {analytics?.last7Days && (
                      <div className="flex items-end gap-1.5 h-32 mt-2">
                        {analytics.last7Days.map((d, i) => {
                          const max = Math.max(...analytics.last7Days.map(x=>x.orders), 1)
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="text-xs text-blue-500 font-bold">
                                {d.orders > 0 ? d.orders : ''}
                              </div>
                              <div
                                className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 min-h-[4px]"
                                style={{ height: `${Math.max((d.orders/max)*80,4)}px`, opacity: 0.7 }}
                              />
                              <div className="text-xs text-gray-400 whitespace-nowrap">{d.date}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top performing games */}
                <div className={`rounded-2xl border p-5 shadow-sm mb-4 ${card}`}>
                  <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    🏆 最佳表现游戏
                  </div>
                  {analytics?.topGames?.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">暂无数据</div>
                  ) : (
                    <div className="space-y-3">
                      {(analytics?.topGames || []).map((g, i) => {
                        const max = analytics.topGames[0]?.earnings || 1
                        return (
                          <div key={g.game} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              i === 0 ? 'bg-yellow-400 text-yellow-900' :
                              i === 1 ? 'bg-gray-300 text-gray-700' :
                              i === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-gray-100 text-gray-500'
                            }`}>
                              {i+1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {g.game}
                                </span>
                                <span className="text-sm font-black text-brand">¥{g.earnings}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand rounded-full transition-all duration-700"
                                  style={{ width: `${(g.earnings/max)*100}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">{g.orders} 笔订单</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label:'总账号数',   val: accounts.length,                                      color:'text-blue-600'   },
                    { label:'总订单数',   val: orders.length,                                        color:'text-green-600'  },
                    { label:'完成率',     val: orders.length ? `${Math.round((analytics?.completedOrders||0)/orders.length*100)}%` : '0%', color:'text-purple-600' },
                    { label:'总收益',     val: `¥${analytics?.totalEarnings||0}`,                   color:'text-brand'      },
                  ].map(({ label, val, color }) => (
                    <div key={label} className={`rounded-2xl border p-4 shadow-sm text-center ${card}`}>
                      <div className={`text-2xl font-black ${color}`}>{val}</div>
                      <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ SETTINGS ══ */}
            {tab === 'settings' && (
              <div className="max-w-2xl">
                <div className={`rounded-2xl border p-5 shadow-sm mb-4 ${card}`}>
                  <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    👤 个人信息
                  </div>
                  <div className="space-y-3">
                    {[
                      ['用户名',   user.username, 'text'],
                      ['手机号',   user.phone||'未绑定', 'tel'],
                      ['邮箱',     user.email||'未绑定', 'email'],
                    ].map(([label, val, type]) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{label}</label>
                        <input
                          type={type}
                          defaultValue={val}
                          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-brand'
                              : 'border-gray-200 focus:border-brand'
                          }`}
                        />
                      </div>
                    ))}
                    <button className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors">
                      保存修改
                    </button>
                  </div>
                </div>

                <div className={`rounded-2xl border p-5 shadow-sm mb-4 ${card}`}>
                  <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    💳 收款方式
                  </div>
                  <div className="space-y-3">
                    {[
                      { ic: '💙', label: '支付宝账号', placeholder: '请输入支付宝账号' },
                      { ic: '💚', label: '微信号',     placeholder: '请输入微信号' },
                      { ic: '🏦', label: '银行卡号',   placeholder: '请输入银行卡号' },
                    ].map(({ ic, label, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                          {ic} {label}
                        </label>
                        <input
                          placeholder={placeholder}
                          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-brand'
                              : 'border-gray-200 focus:border-brand'
                          }`}
                        />
                      </div>
                    ))}
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                      保存收款方式
                    </button>
                  </div>
                </div>

                <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                  <div className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    🔒 安全设置
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">当前密码</label>
                      <input type="password" placeholder="输入当前密码" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 focus:border-brand'
                      }`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">新密码</label>
                      <input type="password" placeholder="输入新密码" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 focus:border-brand'
                      }`} />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        🌙 深色模式
                      </span>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          darkMode ? 'bg-brand' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                          darkMode ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                    <button className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors">
                      修改密码
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}