import { useEffect, useState } from 'react'
import { cancelOrder, getMyOrders } from '../api/order.service'

const statusMap = {
  pending_confirmation: { text: '待确认', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { text: '待支付', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  payment_pending: { text: '支付中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  manual_review_pending: { text: '待人工审核', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  paid: { text: '已支付', color: 'bg-green-50 text-green-700 border-green-200' },
  in_progress: { text: '进行中', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { text: '已完成', color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { text: '已取消', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  refunded: { text: '已退款', color: 'bg-pink-50 text-pink-700 border-pink-200' },
}

function Badge({ status }) {
  const item = statusMap[status] || { text: status, color: 'bg-gray-50 text-gray-700 border-gray-200' }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${item.color}`}>{item.text}</span>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const loadOrders = () => {
    setLoading(true)
    getMyOrders()
      .then((res) => setOrders(res.data.orders || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('确认取消该订单吗？')) return
    await cancelOrder(id)
    loadOrders()
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-400">加载订单中…</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="font-black text-2xl text-gray-800 mb-4">我的订单</div>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">暂无订单</div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => (
            <div key={ord._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3"><span className="font-mono text-xs text-gray-400">{ord.orderNo}</span><Badge status={ord.status} /></div>
                <span className="text-xs text-gray-400">{new Date(ord.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1e3a5f22,#1e3a5f55)' }}>{ord.account?.emoji || '🎮'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 mb-1">{ord.account?.game || '账号已删除'} · {ord.account?.rank || '—'}段</div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>⏱ {ord.hours}小时</span>
                    <span>💳 {ord.paymentMethod === 'alipay' ? '支付宝' : ord.paymentMethod === 'wechat' ? '微信' : '人工审核'}</span>
                    <span>状态：{ord.paymentStatus}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-brand">¥{ord.totalAmount}</div>
                  <div className="text-xs text-gray-400">含服务费</div>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/30">
                <div className="text-xs text-gray-400">
                  {ord.status === 'pending_confirmation' && '⏳ 等待卖家确认'}
                  {ord.status === 'confirmed' && '✅ 卖家已确认，请尽快完成付款'}
                  {ord.status === 'payment_pending' && '💳 已创建支付，请等待支付完成'}
                  {ord.status === 'manual_review_pending' && '🧾 付款凭证已提交，等待人工审核'}
                  {ord.status === 'paid' && '💰 已支付'}
                  {ord.status === 'completed' && '🏆 租用已完成'}
                  {ord.status === 'cancelled' && '❌ 订单已取消'}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(selected === ord._id ? null : ord._id)} className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:border-brand hover:text-brand transition-colors">{selected === ord._id ? '收起' : '详情'}</button>
                  {['pending_confirmation', 'confirmed', 'payment_pending', 'manual_review_pending'].includes(ord.status) && (
                    <button onClick={() => handleCancel(ord._id)} className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">取消</button>
                  )}
                </div>
              </div>
              {selected === ord._id && (
                <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/30">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      ['订单号', ord.orderNo],
                      ['游戏', ord.account?.game || '—'],
                      ['段位', ord.account?.rank || '—'],
                      ['租用时长', `${ord.hours}小时`],
                      ['合计', `¥${ord.totalAmount}`],
                      ['支付方式', ord.paymentMethod],
                      ['支付状态', ord.paymentStatus],
                      ['联系方式', ord.buyerContact || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-white rounded-xl p-3 border border-gray-100"><div className="text-xs text-gray-400 mb-0.5">{label}</div><div className="font-semibold text-gray-800 text-sm">{val}</div></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
