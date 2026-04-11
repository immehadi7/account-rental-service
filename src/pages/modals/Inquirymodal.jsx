import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createOrder } from '../../api/order.service'

const DURATIONS = [
  { h: 1, label: '1h' },
  { h: 2, label: '2h' },
  { h: 4, label: '4h' },
  { h: 8, label: '8h' },
  { h: 24, label: '1天' },
  { h: 48, label: '2天' },
  { h: 72, label: '3天' },
]

const FLAT_FEE_GAMES = ['三角洲行动', 'Operation Delta']

export default function InquiryModal({ acc, onClose, onPay }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [hours, setHours] = useState(1)
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [cost, setCost] = useState(0)
  const [total, setTotal] = useState('2.00')

  const basePrice = Number(acc.price) || 0
  const serviceFee = 2
  const isFlatFee = FLAT_FEE_GAMES.includes(acc.game)

  useEffect(() => {
    if (isFlatFee) {
      setCost(basePrice)
      setTotal((basePrice + serviceFee).toFixed(2))
    } else {
      const c = basePrice * hours
      setCost(c)
      setTotal((c + serviceFee).toFixed(2))
    }
  }, [hours, basePrice, isFlatFee])

  const handleSubmit = async () => {
    setError('')
    if (!user) {
      setError('请先登录后再询单')
      return
    }
    if (!contact) {
      setError('请输入联系方式')
      return
    }

    setLoading(true)
    try {
      const res = await createOrder({
        accountId: acc._id,
        hours: isFlatFee ? 1 : hours,
        buyerContact: contact,
        note,
        paymentMethod,
      })
      setOrder(res.data.order)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || '询单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-enter bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="font-bold text-gray-800 text-sm">发起询单</div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg">×</button>
        </div>

        <div className="flex items-center px-4 py-2.5 gap-2">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step > s ? 'bg-brand text-white' : step === s ? 'border-2 border-brand text-brand' : 'border-2 border-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-brand' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="px-4 pb-4">
          {step === 1 && (
            <div>
              <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2.5 mb-3">
                <div className="text-xl">{acc.emoji || '🎮'}</div>
                <div>
                  <div className="font-semibold text-xs text-gray-800">{acc.game} · {acc.rank}段</div>
                  <div className="text-xs text-gray-400">{isFlatFee ? `租用费 ¥${basePrice}（固定）` : `¥${basePrice}/小时 · ${acc.deliveryTime || 15}分钟内交付`}</div>
                </div>
              </div>

              {!user && <div className="bg-yellow-50 text-yellow-700 rounded-lg p-2.5 text-xs mb-3 flex gap-1.5"><span>⚠️</span><span>请先登录后再询单</span></div>}

              {!isFlatFee && (
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">租用时长</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {DURATIONS.map(({ h, label }) => (
                      <button key={h} onClick={() => setHours(h)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hours === h ? 'bg-brand border-brand text-white' : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}`}>{label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-red-50 rounded-xl p-3 mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>基础费用</span><span>{isFlatFee ? `租用费 ¥${basePrice}` : `¥${basePrice} × ${hours}h = ¥${cost}`}</span></div>
                <div className="flex justify-between text-xs text-gray-500 mb-2"><span>担保服务费</span><span>¥{serviceFee}.00</span></div>
                <div className="flex justify-between items-center border-t border-red-100 pt-2"><span className="text-xs font-bold text-gray-700">合计</span><span className="text-lg font-black text-brand">¥{total}</span></div>
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">支付方式</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'alipay', label: '支付宝' },
                    { key: 'wechat', label: '微信支付' },
                    { key: 'manual', label: '人工审核' },
                  ].map((item) => (
                    <button key={item.key} onClick={() => setPaymentMethod(item.key)} className={`py-2 rounded-lg text-xs font-bold border ${paymentMethod === item.key ? 'border-brand bg-red-50 text-brand' : 'border-gray-200 text-gray-600'}`}>{item.label}</button>
                  ))}
                </div>
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">联系方式 *</label>
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="微信 / QQ / Telegram" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand transition-colors" />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">备注（可选）</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="特殊要求等..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand transition-colors resize-none h-14" />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-2.5">⚠️ {error}</div>}
              <div className="bg-yellow-50 text-yellow-700 rounded-lg p-2.5 text-xs flex gap-1.5 mb-3"><span>⏳</span><span>询单确认后方可付款，平台担保交付保障权益</span></div>

              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">取消</button>
                <button onClick={handleSubmit} disabled={loading || !user} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${loading || !user ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-dark'}`}>{loading ? '提交中…' : '提交询单'}</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-brand rounded-full mx-auto mb-3 spin" />
              <div className="font-bold text-base mb-1">等待卖家确认中…</div>
              <div className="text-gray-400 text-xs mb-3">预计15分钟内确认，请稍候</div>
              {order && <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 inline-block mb-3">订单号：{order.orderNo}</div>}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-gray-600 text-left">
                <div className="font-bold text-blue-700 mb-1">📋 等待须知</div>
                <div>• 卖家确认后您会收到通知</div>
                <div>• 确认后请在30分钟内付款</div>
                <div>• 如需帮助联系客服：<strong>zuhao_kefu</strong></div>
              </div>
              {order && (
                <button onClick={() => { setStep(3) }} className="mt-3 w-full bg-brand text-white py-2 rounded-xl text-sm font-bold">模拟进入付款页</button>
              )}
            </div>
          )}

          {step === 3 && order && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-2 pop">✅</div>
              <div className="font-bold text-base text-green-600 mb-1">卖家已确认！</div>
              <div className="text-gray-400 text-xs mb-3">请在30分钟内完成付款，超时将自动取消</div>
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 mb-3 inline-block">订单号：{order.orderNo}</div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-left text-xs text-gray-600 mb-3 space-y-1.5">
                <div className="font-bold text-green-700 mb-1">📋 付款须知</div>
                <div>• 正式支付以服务端支付状态为准</div>
                <div>• 人工审核付款会进入待审核状态</div>
                <div>• 担保交付，全额退款保障</div>
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold">关闭</button>
                <button onClick={() => { onClose(); onPay(acc, hours, paymentMethod, { grandTotal: Number(total), orderId: order._id }) }} className="flex-1 bg-[#1678ff] text-white py-2 rounded-xl text-sm font-bold">立即付款</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
