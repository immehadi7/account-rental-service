export default function AlipayModal({ acc, hours, method = 'alipay', onClose }) {
  const total    = acc ? (acc.price * hours + 2).toFixed(2) : '0.00'
  const isWechat = method === 'wechat'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`p-5 text-white text-center ${isWechat ? 'bg-[#07c160]' : 'bg-[#1678ff]'}`}>
          <div className="text-4xl mb-2">{isWechat ? '💚' : '💙'}</div>
          <div className="text-lg font-bold">{isWechat ? '微信支付' : '支付宝支付'}</div>
          <div className="text-3xl font-black mt-1">¥{total}</div>
          <div className="text-sm opacity-80 mt-1">
            {acc?.game} · {acc?.rank}段 · {hours}小时
          </div>
        </div>

        <div className="p-5">
          {/* QR box */}
          <div className="flex justify-center mb-4">
            <div className={`relative w-40 h-40 border-2 rounded-xl flex items-center justify-center overflow-hidden ${
              isWechat ? 'border-[#07c160] bg-green-50' : 'border-[#1678ff] bg-blue-50'
            }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">{isWechat ? '💚' : '💙'}</div>
                <div className="text-xs text-gray-500">
                  使用{isWechat ? '微信' : '支付宝'}扫码
                </div>
              </div>
              <div
                className="absolute left-0 right-0 h-0.5 scan-line"
                style={{
                  background: isWechat ? '#07c160' : '#1678ff',
                  boxShadow: `0 0 8px ${isWechat ? '#07c160' : '#1678ff'}`
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {[
              `打开手机${isWechat ? '微信' : '支付宝'}APP`,
              '点击"扫一扫"扫描上方二维码',
              '确认支付金额后完成支付',
              '付款截图发给客服核验，系统自动发货',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isWechat ? 'bg-green-100 text-[#07c160]' : 'bg-blue-100 text-[#1678ff]'
                }`}>
                  {i + 1}
                </span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700 mb-4">
            ⏳ 二维码有效期15分钟，请勿关闭此窗口
          </div>

          {/* Contact info */}
          <div className={`rounded-xl p-3 text-xs mb-4 ${isWechat ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
            <div className="font-bold mb-1">📋 付款后联系客服</div>
            <div>• 客服微信：<strong>zuhao_kefu</strong></div>
            <div>• 客服QQ：<strong>8888-0001</strong></div>
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