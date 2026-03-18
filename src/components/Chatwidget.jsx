import { useState, useRef, useEffect } from 'react'

const REPLIES = {
  '查询订单':  '请提供订单号，我马上为您查询最新状态 📦',
  '账号有问题':'非常抱歉！请描述具体问题，我们会立即处理，支持担保退款 ⚡',
  '申请退款':  '好的，请提供订单号和退款原因，24小时内处理完毕 💰',
  '获取报价':  '请告知游戏类型和租用时长，我为您生成专属报价 📋',
}

const QUICK = ['查询订单', '账号有问题', '申请退款', '获取报价']

export default function ChatWidget() {
  const [msgs, setMsgs] = useState([
    { type: 'agent', text: '您好！我是客服小安，有什么可以帮助您的吗？😊' },
    { type: 'agent', text: '可处理：订单查询、账号问题、退款申请、投诉建议等。' },
  ])
  const [inp, setInp] = useState('')
  const areaRef = useRef(null)

  useEffect(() => {
    if (areaRef.current) areaRef.current.scrollTop = areaRef.current.scrollHeight
  }, [msgs])

  const send = (text) => {
    const t = text || inp.trim()
    if (!t) return
    setMsgs((p) => [...p, { type: 'user', text: t }])
    setInp('')
    setTimeout(() => {
      const reply = REPLIES[t] || '感谢咨询！人工客服将在36秒内回复您，请稍候 😊'
      setMsgs((p) => [...p, { type: 'agent', text: reply }])
    }, 800)
  }

  return (
    <>
      {/* Message area */}
      <div
        ref={areaRef}
        className="h-44 overflow-y-auto bg-gray-50 rounded-xl p-3 mb-3 flex flex-col gap-2"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-snug ${
              m.type === 'user'
                ? 'bg-brand text-white self-end'
                : 'bg-white border border-gray-100 text-gray-700 self-start'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2 mb-3">
        <input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="输入消息…"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand transition-colors"
        />
        <button
          onClick={() => send()}
          className="px-4 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors"
        >
          发送
        </button>
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 flex-wrap">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full hover:border-brand hover:text-brand transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </>
  )
}