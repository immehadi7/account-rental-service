import { useState } from 'react'
import { createAlipayPayment, createWechatPayment } from '../../api/payment.service'
import { submitPayment } from '../../api/order.service'

export default function AlipayModal({ acc, orderId, hours, method = 'alipay', totalOverride, onClose }) {
  const total = totalOverride ? Number(totalOverride).toFixed(2) : acc ? (Number(acc.price) * Number(hours) + 2).toFixed(2) : '0.00'
  const isWechat = method === 'wechat'
  const isFlatFee = acc?.game === '三角洲行动'
  const [loading, setLoading] = useState(false)
  const [manualProof, setManualProof] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleGatewayPay = async () => {
    if (!orderId) {
      setError('缺少订单信息，请重新发起订单')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (isWechat) {
        const res = await createWechatPayment(orderId)
        setMessage(res.data.message || '微信支付接口已预留')
      } else {
        const res = await createAlipayPayment(orderId)
        if (res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl
          return
        }
        setMessage('已创建支付，请继续完成付款')
      }
    } catch (err) {
      setError(err.response?.data?.message || '创建支付失败')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!orderId) {
      setError('缺少订单信息，请重新发起订单')
      return
    }
    if (!manualProof) {
      setError('请输入付款截图地址或凭证说明')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await submitPayment(orderId, { paymentScreenshot: manualProof })
      setMessage(res.data.message || '已提交人工审核')
    } catch (err) {
      setError(err.response?.data?.message || '提交付款凭证失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-enter bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden">
        <div className={`px-5 py-4 text-white ${isWechat ? 'bg-[#07c160]' : 'bg-[#1678ff]'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{isWechat ? '💚' : '💙'}</span>
              <span className="font-bold">{isWechat ? '微信支付' : '支付宝支付'}</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition-colors">×</button>
          </div>
          <div className="text-2xl font-black">¥{total}</div>
          <div className="text-xs opacity-75 mt-0.5">{acc?.game} · {acc?.rank}段 {isFlatFee ? '' : `· ${hours}小时`}</div>
        </div>

        <div className="p-4">
          <div className="space-y-2 mb-4 text-xs text-gray-500">
            <div>• 推荐先点击“发起官方支付”进入真实支付流程</div>
            <div>• 如需人工审核，可在下方提交付款截图地址</div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">⚠️ {error}</div>}
          {message && <div className="bg-green-50 border border-green-200 text-green-600 text-xs rounded-lg p-2.5 mb-3">✅ {message}</div>}

          <button onClick={handleGatewayPay} disabled={loading} className={`w-full py-2.5 rounded-xl text-sm font-bold text-white mb-3 ${loading ? 'bg-gray-300' : isWechat ? 'bg-[#07c160]' : 'bg-[#1678ff]'}`}>
            {loading ? '处理中…' : isWechat ? '发起微信支付' : '发起官方支付'}
          </button>

          <div className="border border-gray-100 rounded-xl p-3 mb-3">
            <div className="font-bold text-xs text-gray-700 mb-2">人工审核备用方案</div>
            <textarea value={manualProof} onChange={(e) => setManualProof(e.target.value)} placeholder="粘贴付款截图地址、网盘链接或付款说明" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand transition-colors resize-none h-20 mb-2" />
            <button onClick={handleManualSubmit} disabled={loading} className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">提交人工审核</button>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 text-xs text-yellow-700 mb-3">⏳ 正式支付结果以服务端回调为准，前端不会直接标记已支付</div>
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">关闭</button>
        </div>
      </div>
    </div>
  )
}
