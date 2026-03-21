export default function AlipayModal({ acc, hours, method = 'alipay', onClose }) {
  const total    = acc ? (acc.price * hours + 2).toFixed(2) : '0.00'
  const isWechat = method === 'wechat'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden">

        {/* Compact header */}
        <div className={`px-5 py-4 text-white ${isWechat ? 'bg-[#07c160]' : 'bg-[#1678ff]'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{isWechat ? '💚' : '💙'}</span>
              <span className="font-bold">{isWechat ? '微信支付' : '支付宝支付'}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
            >
              ×
            </button>
          </div>
          <div className="text-2xl font-black">¥{total}</div>
          <div className="text-xs opacity-75 mt-0.5">
            {acc?.game} · {acc?.rank}段 · {hours}小时
          </div>
        </div>

        <div className="p-4">
          {/* QR box — compact */}
          <div className="flex justify-center mb-4">
            <div className={`relative w-32 h-32 border-2 rounded-xl flex items-center justify-center overflow-hidden ${
              isWechat ? 'border-[#07c160] bg-green-50' : 'border-[#1678ff] bg-blue-50'
            }`}>
              <div className="text-center">
                <div className="text-3xl mb-1">{isWechat ? '💚' : '💙'}</div>
                <div className="text-xs text-gray-400">扫码付款</div>
              </div>
              <div
                className="absolute left-0 right-0 h-0.5 scan-line"
                style={{
                  background: isWechat ? '#07c160' : '#1678ff',
                  boxShadow: `0 0 6px ${isWechat ? '#07c160' : '#1678ff'}`
                }}
              />
            </div>
          </div>

          {/* Steps — compact */}
          <div className="space-y-1.5 mb-3">
            {[
              `打开${isWechat ? '微信' : '支付宝'}扫一扫`,
              '扫描二维码完成支付',
              '截图发客服核验发货',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  isWechat ? 'bg-[#07c160]' : 'bg-[#1678ff]'
                }`}>
                  {i + 1}
                </span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {/* Contact — compact */}
          <div className={`rounded-xl p-2.5 text-xs mb-3 ${
            isWechat ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
          }`}>
            <div className="font-bold mb-1">📋 客服联系</div>
            <div>微信：<strong>zuhao_kefu</strong> · QQ：<strong>8888-0001</strong></div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 text-xs text-yellow-700 mb-3">
            ⏳ 二维码15分钟内有效，请勿关闭
          </div>

          {/* Close button */}
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