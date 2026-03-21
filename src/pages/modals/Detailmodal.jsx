import { useState } from 'react'
import StatusBadge from '../../components/Statusbadge.jsx'
import InquiryModal from './InquiryModal.jsx'

const DURATIONS = [
  { h: 1,  label: '1h'  },
  { h: 2,  label: '2h'  },
  { h: 4,  label: '4h'  },
  { h: 8,  label: '8h'  },
  { h: 24, label: '1天' },
  { h: 48, label: '2天' },
  { h: 72, label: '3天' },
]

export default function DetailModal({ acc, onClose, onPay }) {
  const [hours,       setHours]       = useState(1)
  const [showInquiry, setShowInquiry] = useState(false)

  if (!acc) return null

  const basePrice  = Number(acc.price) || 0
  const rentCost   = basePrice * hours
  const grandTotal = (rentCost + 2).toFixed(2)

  if (showInquiry) {
    return (
      <InquiryModal
        acc={acc}
        onClose={() => setShowInquiry(false)}
        onPay={(a, h) => { setShowInquiry(false); onPay(a, h) }}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{acc.emoji || '🎮'}</div>
            <div>
              <div className="font-bold text-gray-800">
                {acc.game} · {acc.rank}段
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={acc.status || 'offline'} />
                <span className="text-xs text-gray-400">
                  ⏱ {acc.deliveryTime || 15}分钟内交付
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col md:flex-row">

          {/* ── LEFT ── */}
          <div className="flex-1 p-5">
            <div
              className="rounded-xl h-40 flex items-center justify-center text-7xl mb-4"
              style={{ background: 'linear-gradient(135deg,#1e3a5f22,#1e3a5f55)' }}
            >
              {acc.emoji || '🎮'}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(acc.tags || []).map((t) => (
                <span key={t} className="tag-chip bg-gray-100 text-gray-600">{t}</span>
              ))}
              <span className="tag-chip bg-green-100 text-green-700">担保交付</span>
              <span className="tag-chip bg-blue-100 text-blue-700">无封禁</span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {acc.description || '暂无描述'}。平台担保交付，全额退款保障。
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                [acc.views?.toLocaleString() || '0', '浏览量'],
                [acc.orders || '0',                  '成交量'],
                ['⭐ 4.9',                            '评分'  ],
              ].map(([v, k]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="font-bold text-gray-800 text-sm">{v}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{k}</div>
                </div>
              ))}
            </div>

            {acc.seller && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">
                  {acc.seller?.username?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">
                    {acc.seller?.username || '卖家'}
                  </div>
                  <div className="text-xs text-gray-400">
                    认证卖家 · ⭐ {acc.seller?.rating || 5.0}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
              ⚠️ 严禁修改账号密码、绑定支付方式、进行消费，违者承担赔偿责任。
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="md:w-64 p-5 border-t md:border-t-0 md:border-l border-gray-100">

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-brand">¥{basePrice}</span>
              {acc.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ¥{acc.originalPrice}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mb-4">每小时 · 含担保服务费</div>

            {/* Duration buttons */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">
                选择租用时长
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATIONS.map(({ h, label }) => (
                  <button
                    key={h}
                    onClick={() => setHours(h)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      hours === h
                        ? 'bg-brand border-brand text-white'
                        : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <div className="flex justify-between text-gray-500 mb-1.5">
                <span>基础费用</span>
                <span>¥{basePrice} × {hours}h = ¥{rentCost}</span>
              </div>
              <div className="flex justify-between text-gray-500 mb-1.5">
                <span>担保服务费</span>
                <span>¥2.00</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>合计</span>
                <span className="text-brand text-base">¥{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => onPay(acc, hours)}
              className="w-full bg-[#1678ff] hover:bg-[#0d6aed] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 mb-2.5 transition-colors shadow-lg shadow-blue-200"
            >
              <span>💙</span> 支付宝付款
            </button>

            <button
              onClick={() => setShowInquiry(true)}
              className="w-full border-2 border-brand text-brand hover:bg-brand hover:text-white font-bold py-2.5 rounded-xl text-sm transition-all mb-3"
            >
              💬 先询单再付款
            </button>

            <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
              {['🛡️ 担保交付','💰 全额退款','✅ 实名认证','⚡ 极速响应'].map((t) => (
                <div key={t} className="flex items-center gap-1">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
