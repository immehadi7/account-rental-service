export default function AlipayModal({ acc, hours, onClose }) {
  const total = acc ? (acc.price * hours + 2).toFixed(2) : '0.00'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Blue header */}
        <div className="bg-[#1678ff] p-5 text-white text-center">
          <div className="text-4xl mb-2">💙</div>
          <div className="text-lg font-bold">支付宝支付</div>
          <div className="text-3xl font-black mt-1">¥{total}</div>
          <div className="text-sm opacity-80 mt-1">
            {acc?.game} · {acc?.rank}段 · {hours}小时
          </div>
        </div>

        <div className="p-5">
          {/* QR box */}
          <div className="flex justify-center mb-4">
            <div className="relative w-40 h-40 border-2 border-[#1678ff] rounded-xl flex items-center justify-center bg-blue-50 overflow-hidden">
              <div className="text-center">
                <div className="text-4xl mb-2">💙</div>
                <div className="text-xs text-gray-500">使用支付宝扫码</div>
              </div>
              {/* Animated scan line */}
              <div className="absolute left-0 right-0 h-0.5 bg-[#1678ff] scan-line"
                   style={{ boxShadow: '0 0 8px #1678ff' }} />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {[
              '打开手机支付宝APP',
              '点击"扫一扫"扫描上方二维码',
              '确认支付金额后完成支付',
              '付款截图发给客服核验，系统自动发货',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1678ff] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700 mb-4">
            ⏳ 二维码有效期15分钟，请勿关闭此窗口
          </div>

          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}