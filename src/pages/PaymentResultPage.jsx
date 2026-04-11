import { useEffect, useMemo, useState } from 'react'
import { getPaymentStatus } from '../api/payment.service'

const stateMap = {
  pending: '待支付',
  submitted: '待人工审核',
  payment_submitted: '待人工审核',
  manual_review_pending: '待人工审核',
  processing: '支付处理中',
  paid: '支付成功',
  failed: '支付失败',
  closed: '已关闭',
  refunded: '已退款',
}

const iconMap = {
  pending: '⏳',
  submitted: '🧾',
  payment_submitted: '🧾',
  manual_review_pending: '🧾',
  processing: '💳',
  paid: '✅',
  failed: '❌',
  closed: '🔒',
  refunded: '↩️',
}

const colorMap = {
  pending: 'text-yellow-600',
  submitted: 'text-orange-600',
  payment_submitted: 'text-orange-600',
  manual_review_pending: 'text-orange-600',
  processing: 'text-blue-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
  closed: 'text-gray-500',
  refunded: 'text-purple-600',
}

const isFinalStatus = status =>
  ['paid', 'failed', 'closed', 'refunded', 'submitted', 'payment_submitted', 'manual_review_pending'].includes(
    status
  )

export default function PaymentResultPage() {
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

  const paymentId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('paymentId')
  }, [])

  useEffect(() => {
    if (!paymentId) {
      setError('缺少支付记录')
      setLoading(false)
      return
    }

    let mounted = true
    let timer = null

    const fetchPayment = async (silent = false) => {
      try {
        if (!silent && mounted) setLoading(true)

        const res = await getPaymentStatus(paymentId)
        const nextPayment = res?.data?.payment || null

        if (!mounted) return

        setPayment(nextPayment)
        setError('')

        const status = nextPayment?.status

        if (status && !isFinalStatus(status)) {
          setPolling(true)
          timer = setTimeout(() => {
            fetchPayment(true)
          }, 2000)
        } else {
          setPolling(false)
        }
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || '获取支付状态失败')
        setPolling(false)
      } finally {
        if (mounted && !silent) setLoading(false)
      }
    }

    fetchPayment()

    return () => {
      mounted = false
      if (timer) clearTimeout(timer)
    }
  }, [paymentId])

  const status = payment?.status || ''
  const statusLabel = stateMap[status] || status || '未知状态'
  const statusIcon = iconMap[status] || '💳'
  const statusColor = colorMap[status] || 'text-gray-700'

  const handleBack = () => {
    window.location.href = '/orders'
  }

  const handleHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-gray-100">
        <div className="text-5xl mb-3">
          {loading ? '💳' : statusIcon}
        </div>

        <div className="font-black text-xl text-gray-800 mb-2">支付结果</div>

        {loading && (
          <div className="text-sm text-gray-500">正在查询支付状态…</div>
        )}

        {!loading && error && (
          <div>
            <div className="text-sm text-red-500 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-bold"
            >
              重新查询
            </button>
          </div>
        )}

        {!loading && payment && (
          <div>
            <div className="text-2xl font-black text-brand mb-2">
              ¥{payment.amount}
            </div>

            <div className={`text-base font-bold mb-2 ${statusColor}`}>
              状态：{statusLabel}
            </div>

            {polling && (
              <div className="text-xs text-blue-500 mb-3">
                正在自动刷新支付状态…
              </div>
            )}

            {payment.paymentMethod && (
              <div className="text-sm text-gray-600 mb-2">
                支付方式：
                {payment.paymentMethod === 'alipay'
                  ? '支付宝'
                  : payment.paymentMethod === 'wechat'
                    ? '微信支付'
                    : payment.paymentMethod}
              </div>
            )}

            {payment.merchantOrderNo && (
              <div className="text-xs text-gray-400 break-all mb-1">
                商户单号：{payment.merchantOrderNo}
              </div>
            )}

            {payment.gatewayTradeNo && (
              <div className="text-xs text-gray-400 break-all mb-1">
                网关单号：{payment.gatewayTradeNo}
              </div>
            )}

            {payment.paidAt && (
              <div className="text-xs text-gray-400 mb-1">
                支付时间：{new Date(payment.paidAt).toLocaleString('zh-CN')}
              </div>
            )}

            {(status === 'submitted' ||
              status === 'payment_submitted' ||
              status === 'manual_review_pending') && (
              <div className="mt-4 bg-orange-50 text-orange-700 text-xs rounded-xl p-3">
                您已提交付款凭证，系统正在等待人工审核，请稍后在订单页查看最终结果。
              </div>
            )}

            {status === 'pending' && (
              <div className="mt-4 bg-yellow-50 text-yellow-700 text-xs rounded-xl p-3">
                当前订单仍在等待支付或支付回调确认，请保持页面开启或稍后返回订单页查看。
              </div>
            )}

            {status === 'paid' && (
              <div className="mt-4 bg-green-50 text-green-700 text-xs rounded-xl p-3">
                支付已完成，订单状态会同步更新。
              </div>
            )}

            {status === 'failed' && (
              <div className="mt-4 bg-red-50 text-red-600 text-xs rounded-xl p-3">
                支付失败，请返回订单页重新发起支付。
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                查看订单
              </button>
              <button
                onClick={handleHome}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}