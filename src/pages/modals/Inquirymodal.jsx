import { useState } from 'react'

export default function InquiryModal({ acc, onClose, onPay }) {
  const [step,    setStep]    = useState(1)
  const [hours,   setHours]   = useState(1)
  const [contact, setContact] = useState('')
  const [note,    setNote]    = useState('')

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="font-bold text-gray-800">发起询单</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 text-xl"
          >
            ×
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-5 py-3 gap-2">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  step > s
                    ? 'bg-brand text-white'
                    : step === s
                    ? 'border-2 border-brand text-brand'
                    : 'border-2 border-gray-200 text-gray-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-brand' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="p-5">
          {/* Step 1 — fill form */}
          {step === 1 && (
            <div>
              <div className="bg-blue-50 text-blue-700 rounded-lg p-3 text-sm mb-4 flex gap-2">
                <span>ℹ️</span>
                <span>提交询单后，卖家将在15分钟内确认并回复，确认后再付款。</span>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  租用时长
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 4, 8, 24].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHours(h)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                        hours === h
                          ? 'bg-brand border-brand text-white'
                          : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
                      }`}
                    >
                      {h === 8 ? '包天' : h === 24 ? '24小时' : `${h}小时`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  联系方式 *
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="微信 / QQ / Telegram"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="特殊要求、指定时间段等..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors resize-none h-20"
                />
              </div>

              <div className="bg-yellow-50 text-yellow-700 rounded-lg p-3 text-sm flex gap-2 mb-4">
                <span>⏳</span>
                <span>询单确认后方可付款，平台担保交付，保障双方权益。</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-brand text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark"
                >
                  提交询单
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — waiting */}
          {step === 2 && (
            <div className="text-center py-6">
              <div className="w-14 h-14 border-4 border-gray-100 border-t-brand rounded-full mx-auto mb-4 spin" />
              <div className="font-bold text-lg mb-2">等待卖家确认中…</div>
              <div className="text-gray-400 text-sm mb-6">预计15分钟内确认，请稍候</div>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-brand border border-brand px-4 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-all"
              >
                模拟卖家确认 →
              </button>
            </div>
          )}

          {/* Step 3 — confirmed */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-3 pop">
                ✅
              </div>
              <div className="font-bold text-lg text-green-600 mb-1">卖家已确认！</div>
              <div className="text-gray-400 text-sm mb-4">
                请在30分钟内完成付款，超时将自动取消
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-left text-sm text-gray-600 mb-4 space-y-2">
                <div className="font-bold text-green-700 mb-2">📋 付款须知</div>
                <div>• 付款后请将截图发给客服核验</div>
                <div>• 客服微信：<strong>zuhao_kefu</strong></div>
                <div>• 客服QQ：<strong>8888-0001</strong></div>
                <div>• 担保交付，有问题全额退款</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold"
                >
                  关闭
                </button>
                <button
                  onClick={() => { onClose(); onPay(acc, hours) }}
                  className="flex-1 bg-[#1678ff] text-white py-2.5 rounded-xl text-sm font-bold"
                >
                  💙 支付宝付款
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}