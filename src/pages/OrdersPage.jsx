import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, cancelOrder } from '../api/order.service'

const STATUS_MAP = {
  pending_confirmation: { label: '待确认', cls: 'bg-yellow-100 text-yellow-700', ic: '⏳' },
  confirmed:            { label: '已确认', cls: 'bg-blue-100 text-blue-700',    ic: '✅' },
  paid:                 { label: '已付款', cls: 'bg-purple-100 text-purple-700', ic: '💰' },
  in_progress:          { label: '租用中', cls: 'bg-teal-100 text-teal-700',    ic: '🎮' },
  completed:            { label: '已完成', cls: 'bg-green-100 text-green-700',  ic: '🏆' },
  cancelled:            { label: '已取消', cls: 'bg-red-100 text-red-600',      ic: '❌' },
  refunded:             { label: '已退款', cls: 'bg-gray-100 text-gray-500',    ic: '↩️' },
  disputed:             { label: '申诉中', cls: 'bg-orange-100 text-orange-600',ic: '⚠️' },
}

const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-500', ic: '•' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.cls}`}>
      {s.ic} {s.label}
    </span>
  )
}

export default function OrdersPage({ onOpen }) {
  const { user }              = useAuth()
  const [orders,   setOrders]  = useState([])
  const [loading,  setLoading] = useState(true)
  const [filter,   setFilter]  = useState('all')
  const [search,   setSearch]  = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (user) fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await getMyOrders()
      setOrders(res.data.orders || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('确定取消此订单？')) return
    try {
      await cancelOrder(id)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.message || '取消失败')
    }
  }

  const filtered = orders.filter(o => {
    const matchFilter =
      filter === 'all'       ? true :
      filter === 'active'    ? ['pending_confirmation','confirmed','paid','in_progress'].includes(o.status) :
      filter === 'completed' ? o.status === 'completed' :
      filter === 'cancelled' ? o.status === 'cancelled' : true
    const matchSearch =
      !search ||
      o.orderNo?.includes(search) ||
      o.account?.game?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // Stats
  const stats = {
    total:     orders.length,
    active:    orders.filter(o => ['pending_confirmation','confirmed','paid','in_progress'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    spent:     orders.filter(o => o.status === 'completed').reduce((s,o) => s + (o.totalAmount||0), 0),
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <div className="font-bold text-xl text-gray-800 mb-2">请先登录</div>
        <div className="text-gray-400 text-sm">登录后查看您的订单</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-brand rounded-full" />
        <h1 className="font-black text-gray-800 text-xl">我的订单</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { ic:'📦', label:'全部订单',   val: stats.total,     color:'text-gray-800'   },
          { ic:'🎮', label:'进行中',     val: stats.active,    color:'text-blue-600'   },
          { ic:'🏆', label:'已完成',     val: stats.completed, color:'text-green-600'  },
          { ic:'💰', label:'累计消费',   val: `¥${stats.spent}`, color:'text-brand'    },
        ].map(({ ic, label, val, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">{ic}</div>
            <div className={`text-xl font-black ${color}`}>{val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-xs focus-within:border-brand transition-colors">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索订单号或游戏…"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { k:'all',       l:'全部'   },
            { k:'active',    l:'进行中' },
            { k:'completed', l:'已完成' },
            { k:'cancelled', l:'已取消' },
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === k
                  ? 'bg-brand text-white shadow-md shadow-red-100'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-brand hover:text-brand'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="text-5xl mb-3">📦</div>
          <div className="font-bold text-gray-700 mb-2">
            {filter === 'all' ? '暂无订单' : '暂无符合条件的订单'}
          </div>
          <div className="text-gray-400 text-sm mb-4">
            去首页浏览账号，开始您的游戏之旅！
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors"
          >
            浏览账号
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ord => (
            <div
              key={ord._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Order header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400">{ord.orderNo}</span>
                  <Badge status={ord.status} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(ord.createdAt).toLocaleDateString('zh-CN', {
                    year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
                  })}
                </span>
              </div>

              {/* Order body */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Game icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#1e3a5f22,#1e3a5f55)' }}
                >
                  {ord.account?.emoji || '🎮'}
                </div>

                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 mb-1">
                    {ord.account?.game || '账号已删除'} · {ord.account?.rank || '—'}段
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>⏱ {ord.hours}小时</span>
                    <span>💳 {ord.paymentMethod === 'alipay' ? '支付宝' : '微信'}</span>
                    {ord.buyerContact && <span>📱 {ord.buyerContact}</span>}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-brand">¥{ord.totalAmount}</div>
                  <div className="text-xs text-gray-400">含服务费</div>
                </div>
              </div>

              {/* Order actions */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/30">
                <div className="text-xs text-gray-400">
                  {ord.status === 'pending_confirmation' && '⏳ 等待卖家确认，预计15分钟内'}
                  {ord.status === 'confirmed'            && '✅ 卖家已确认，请尽快完成付款'}
                  {ord.status === 'paid'                 && '💰 已付款，客服正在核验'}
                  {ord.status === 'in_progress'          && '🎮 租用中，请勿修改账号信息'}
                  {ord.status === 'completed'            && '🏆 租用已完成，感谢您的使用！'}
                  {ord.status === 'cancelled'            && '❌ 订单已取消'}
                  {ord.status === 'refunded'             && '↩️ 退款已处理'}
                </div>
                <div className="flex gap-2">
                  {/* View detail */}
                  <button
                    onClick={() => setSelected(selected === ord._id ? null : ord._id)}
                    className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:border-brand hover:text-brand transition-colors"
                  >
                    {selected === ord._id ? '收起' : '详情'}
                  </button>

                  {/* Pay button */}
                  {ord.status === 'confirmed' && (
                    <button className="text-xs bg-[#1678ff] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#0d6aed] transition-colors">
                      💙 立即付款
                    </button>
                  )}

                  {/* Cancel button */}
                  {['pending_confirmation','confirmed'].includes(ord.status) && (
                    <button
                      onClick={() => handleCancel(ord._id)}
                      className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {selected === ord._id && (
                <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/30">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      ['订单号',   ord.orderNo],
                      ['游戏',     ord.account?.game || '—'],
                      ['段位',     ord.account?.rank || '—'],
                      ['租用时长', `${ord.hours}小时`],
                      ['基础费用', `¥${ord.pricePerHour} × ${ord.hours}h`],
                      ['担保费',   `¥${ord.serviceFee || 2}`],
                      ['合计',     `¥${ord.totalAmount}`],
                      ['支付方式', ord.paymentMethod === 'alipay' ? '💙 支付宝' : '💚 微信'],
                      ['联系方式', ord.buyerContact || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                        <div className="font-semibold text-gray-800 text-sm">{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Payment instructions if confirmed */}
                  {ord.status === 'confirmed' && (
                    <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-4 text-sm">
                      <div className="font-bold text-green-700 mb-2">📋 付款须知</div>
                      <div className="text-gray-600 space-y-1">
                        <div>• 请在30分钟内完成付款，超时订单自动取消</div>
                        <div>• 付款后截图发给客服：微信 <strong>zuhao_kefu</strong> / QQ <strong>8888-0001</strong></div>
                        <div>• 平台担保交付，遇到问题全额退款</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}