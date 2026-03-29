import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

const QUICK_REPLIES = [
  '查询订单', '申请退款', '账号有问题', '如何付款', '价格咨询', '联系人工客服',
]

const FAQ = [
  { q: '如何租用账号？',     a: '在首页选择账号 → 点击"立即租用" → 选择时长 → 支付宝/微信付款 → 联系客服获取账号。' },
  { q: '支持哪些支付方式？', a: '目前支持支付宝和微信支付，付款后请截图发给客服核验。' },
  { q: '租用后可以退款吗？', a: '租用前取消可全额退款。租用开始后如有问题，平台担保处理，支持全额退款。' },
  { q: '账号安全吗？',       a: '所有账号均经过实名认证，平台担保交付。严禁修改密码或绑定支付方式。' },
  { q: '如何联系人工客服？', a: '可在聊天窗口直接发消息，或通过微信 zuhao_kefu / QQ 8888-0001 联系我们。' },
]

export default function SupportPage() {
  const { user }                        = useAuth()
  const [tab,          setTab]          = useState('chat')
  const [messages,     setMessages]     = useState([])
  const [input,        setInput]        = useState('')
  const [connected,    setConnected]    = useState(false)
  const [connecting,   setConnecting]   = useState(true)
  const [onlineCount,  setOnlineCount]  = useState(0)
  const [isTyping,     setIsTyping]     = useState(false)
  const [openFaq,      setOpenFaq]      = useState(null)
  const socketRef  = useRef(null)
  const chatEndRef = useRef(null)
  const typingRef  = useRef(null)
  const mySocketId = useRef(null)

  useEffect(() => {
    setConnecting(true)

    const socket = io(SOCKET_URL, {
      transports:           ['polling', 'websocket'],
      reconnection:         true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
      timeout:              20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setConnecting(false)
      mySocketId.current = socket.id

      socket.emit('user:join', {
        username: user?.username || '访客',
        role:     user?.role     || 'user',
      })
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setConnected(false)
      setConnecting(false)
    })

    socket.on('disconnect', (reason) => {
      setConnected(false)
      console.log('Disconnected:', reason)
    })

    socket.on('reconnect', () => {
      setConnected(true)
      socket.emit('user:join', {
        username: user?.username || '访客',
        role:     user?.role     || 'user',
      })
    })

    // ✅ Load chat history — set all at once, no duplicates
    socket.on('chat:history', (history) => {
      setMessages(history.slice(-50))
    })

    // ✅ New message — only add if not already in list
    socket.on('chat:message', (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id)
        if (exists) return prev
        return [...prev, msg]
      })
      setIsTyping(false)
    })

    socket.on('chat:typing', (data) => {
      if (data.socketId !== socket.id) {
        setIsTyping(true)
        clearTimeout(typingRef.current)
        typingRef.current = setTimeout(() => setIsTyping(false), 2000)
      }
    })

    socket.on('users:online', (count) => setOnlineCount(count))

    // Welcome message
    setMessages([{
      id:      'welcome',
      text:    '您好！我是客服小安 😊 很高兴为您服务！请问有什么可以帮助您？',
      sender:  '客服小安',
      role:    'support',
      time:    new Date().toISOString(),
      type:    'support',
      socketId: 'support',
    }])

    return () => {
      clearTimeout(typingRef.current)
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text) => {
    const t = (text || input).trim()
    if (!t) return
    if (!socketRef.current?.connected) {
      alert('连接已断开，请刷新页面重试')
      return
    }
    socketRef.current.emit('chat:message', { text: t })
    setInput('')
  }

  const handleTyping = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:typing', { username: user?.username || '访客' })
    }
  }

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-brand rounded-full" />
        <h1 className="font-black text-gray-800 text-xl">客服中心</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { k: 'chat', l: '💬 在线客服' },
          { k: 'faq',  l: '❓ 常见问题' },
          { k: 'info', l: '📞 联系方式' },
        ].map(({ k, l }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === k
                ? 'bg-brand text-white shadow-md shadow-red-100'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Chat window */}
          <div
            className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            style={{ height: '600px' }}
          >
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-black">
                  客
                </div>
                <div>
                  <div className="font-bold text-gray-800">客服小安</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {connecting ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                        <span className="text-yellow-600">连接中...</span>
                      </>
                    ) : connected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-pulse inline-block" />
                        <span className="text-green-600">在线</span>
                        {onlineCount > 0 && (
                          <span className="text-gray-400">· {onlineCount} 人在线</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        <span className="text-red-500">已断开</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">平均响应 36秒</div>
            </div>

            {/* Disconnected banner */}
            {!connected && !connecting && (
              <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs text-red-600 flex items-center justify-between flex-shrink-0">
                <span>⚠️ 连接已断开，消息可能无法发送</span>
                <button
                  onClick={() => window.location.reload()}
                  className="underline font-semibold"
                >
                  刷新重连
                </button>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {messages.map((msg) => {
                const isSupport = msg.type === 'support'
                const isMe      = msg.socketId === mySocketId.current

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isMe && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        isSupport ? 'bg-brand' : 'bg-blue-500'
                      }`}>
                        {isSupport ? '客' : msg.sender?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-xs text-gray-400 px-1">{msg.sender}</span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand text-white rounded-br-sm'
                          : isSupport
                          ? 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                          : 'bg-blue-50 border border-blue-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 px-1">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                    客
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto bg-white flex-shrink-0">
              {QUICK_REPLIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full hover:border-brand hover:text-brand transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2 bg-white flex-shrink-0">
              <input
                value={input}
                onChange={e => { setInput(e.target.value); handleTyping() }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={connected ? '输入消息，按 Enter 发送…' : '连接中，请稍候…'}
                disabled={!connected}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || !connected}
                className="bg-brand hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Quick quote */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="font-bold text-gray-800 mb-4">📋 快速报价</div>
              <QuoteWidget onSend={sendMessage} />
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="font-bold text-gray-800 mb-3">📞 联系方式</div>
              <div className="space-y-2.5">
                {[
                  { ic:'💙', label:'支付宝客服', val:'zuhao_kefu' },
                  { ic:'💚', label:'微信客服',   val:'zuhao_kefu' },
                  { ic:'🐧', label:'QQ客服',     val:'8888-0001'  },
                  { ic:'⏰', label:'服务时间',   val:'9:00-23:00' },
                ].map(({ ic, label, val }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      {ic} {label}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ TAB ── */}
      {tab === 'faq' && (
        <div className="max-w-3xl">
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-gray-800">{item.q}</span>
                  <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
            <div className="text-2xl mb-2">🤔</div>
            <div className="font-bold text-gray-800 mb-1">没找到答案？</div>
            <div className="text-sm text-gray-500 mb-3">联系我们的在线客服，36秒内回复</div>
            <button
              onClick={() => setTab('chat')}
              className="bg-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors"
            >
              💬 立即咨询
            </button>
          </div>
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          {[
            { ic:'💙', title:'支付宝客服', desc:'扫码或搜索账号添加', val:'zuhao_kefu',       color:'bg-blue-50 border-blue-100',   btn:'bg-[#1678ff] text-white'  },
            { ic:'💚', title:'微信客服',   desc:'微信搜索添加好友',   val:'zuhao_kefu',       color:'bg-green-50 border-green-100', btn:'bg-[#07c160] text-white'  },
            { ic:'🐧', title:'QQ客服',     desc:'工作时间在线回复',   val:'8888-0001',        color:'bg-blue-50 border-blue-100',   btn:'bg-blue-500 text-white'   },
            { ic:'📧', title:'邮箱',       desc:'非紧急问题可发邮件', val:'support@61zh.com', color:'bg-gray-50 border-gray-100',   btn:'bg-gray-700 text-white'   },
          ].map(({ ic, title, desc, val, color, btn }) => (
            <div key={title} className={`rounded-2xl border p-5 shadow-sm ${color}`}>
              <div className="text-3xl mb-3">{ic}</div>
              <div className="font-bold text-gray-800 mb-1">{title}</div>
              <div className="text-xs text-gray-500 mb-3">{desc}</div>
              <div className="font-mono font-bold text-gray-800 bg-white rounded-xl px-3 py-2 text-sm mb-3 border border-white">
                {val}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(val); alert('已复制！') }}
                className={`w-full py-2 rounded-xl text-sm font-bold ${btn}`}
              >
                复制
              </button>
            </div>
          ))}

          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="font-bold text-gray-800 mb-4">⏰ 客服工作时间</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { day:'周一至周五', time:'9:00 - 23:00',  active: true  },
                { day:'周六',       time:'9:00 - 22:00',  active: true  },
                { day:'周日',       time:'10:00 - 21:00', active: true  },
                { day:'节假日',     time:'10:00 - 20:00', active: false },
              ].map(({ day, time, active }) => (
                <div key={day} className={`rounded-xl p-3 text-center border ${
                  active ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className="font-semibold text-sm text-gray-800">{day}</div>
                  <div className={`text-xs mt-1 font-bold ${active ? 'text-green-600' : 'text-gray-500'}`}>
                    {time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

// ── Quote Widget ──
function QuoteWidget({ onSend }) {
  const [game,  setGame]  = useState('20')
  const [hours, setHours] = useState('1')
  const [tier,  setTier]  = useState('1')

  const base  = (parseFloat(game) * parseFloat(tier)).toFixed(1)
  const total = (parseFloat(game) * parseFloat(tier) * parseFloat(hours) + 2).toFixed(1)

  return (
    <div>
      {[
        ['游戏', game,  setGame,  [['20','英雄联盟'],['15','王者荣耀'],['25','绝地求生'],['30','原神'],['18','CS2']]],
        ['时长', hours, setHours, [['1','1小时'],['2','2小时'],['4','4小时'],['8','包天']]],
        ['等级', tier,  setTier,  [['1','普通'],['1.5','中阶'],['2.2','高阶']]],
      ].map(([label, val, setter, opts]) => (
        <div key={label} className="mb-2.5">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">{label}</label>
          <select
            value={val}
            onChange={e => setter(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
          >
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      ))}

      <div className="bg-red-50 rounded-xl p-3 mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>基础单价</span><span>¥{base}/小时</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-red-100">
          <span className="text-gray-700">合计</span>
          <span className="text-brand text-base font-black">¥{total}</span>
        </div>
      </div>

      <button
        onClick={() => onSend(`你好，我想咨询报价：游戏租金约¥${total}，请问有没有合适的账号？`)}
        className="w-full bg-brand text-white font-bold py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors"
      >
        发送询价
      </button>
    </div>
  )
}