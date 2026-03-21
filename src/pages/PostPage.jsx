import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createAccount } from '../api/account.service'

const GAMES = [
  '英雄联盟', '绝地求生', '原神', 'CS2',
  '王者荣耀', '永劫无间', 'FIFA Online', '三角洲行动',
]

const CATEGORIES = [
  { value: 'moba',  label: 'MOBA'      },
  { value: 'fps',   label: 'FPS/射击'  },
  { value: 'rpg',   label: 'RPG'       },
  { value: 'sport', label: '体育竞技'  },
  { value: 'other', label: '其他'      },
]

const EMOJIS = ['⚔️','🎯','🌟','💣','👑','🔥','⚽','🪖','🏆','💎']

export default function PostPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    game:          '',
    rank:          '',
    category:      'moba',
    price:         '',
    originalPrice: '',
    deliveryTime:  '15',
    description:   '',
    tags:          '',
    contact:       '',
    pricingNote:   '',
    emoji:         '⚔️',
  })

  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')
  const [success, setSuccess]   = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async () => {
    setError('')

    // Validation
    if (!form.game)        { setError('请选择游戏名称'); return }
    if (!form.rank)        { setError('请输入账号段位'); return }
    if (!form.price)       { setError('请输入租金');     return }
    if (!form.description) { setError('请输入账号描述'); return }
    if (!form.contact)     { setError('请输入联系方式'); return }

    if (!user) {
      setError('请先登录后再发布')
      return
    }

    setLoading(true)
    try {
      await createAccount(form)
      setSuccess(true)
      // Reset form
      setForm({
        game: '', rank: '', category: 'moba',
        price: '', originalPrice: '', deliveryTime: '15',
        description: '', tags: '', contact: '',
        pricingNote: '', emoji: '⚔️',
      })
    } catch (err) {
      setError(err.response?.data?.message || '发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-brand rounded-full" />
        <h1 className="font-black text-gray-800 text-xl">发布租号信息</h1>
      </div>

      {/* Not logged in warning */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700 mb-4 flex gap-2">
          <span>⚠️</span>
          <span>请先登录后再发布账号信息</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 mb-4 flex items-center gap-2">
          <span>🎉</span>
          <span>发布成功！您的账号信息已提交审核，通常2小时内审核完成并上架。</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="bg-blue-50 text-blue-700 rounded-xl p-4 text-sm flex gap-2 mb-6">
          <span>ℹ️</span>
          <span>请确保账号信息真实，平台提供担保交付服务，成交后收取8%佣金。</span>
        </div>

        {/* Emoji picker */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            选择图标
          </label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setForm({ ...form, emoji: e })}
                className={`w-10 h-10 rounded-xl border text-xl transition-all ${
                  form.emoji === e
                    ? 'border-brand bg-red-50'
                    : 'border-gray-200 hover:border-brand'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              游戏名称 *
            </label>
            <select
              name="game"
              value={form.game}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            >
              <option value="">请选择游戏</option>
              {GAMES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              账号段位 *
            </label>
            <input
              name="rank"
              value={form.rank}
              onChange={handleChange}
              placeholder="如：钻石I / Lv.100"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              游戏分类
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              租金（元/小时）*
            </label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              min="1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              原价（元/小时）
            </label>
            <input
              name="originalPrice"
              type="number"
              value={form.originalPrice}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              担保交付时间（分钟）
            </label>
            <input
              name="deliveryTime"
              type="number"
              value={form.deliveryTime}
              onChange={handleChange}
              placeholder="15"
              min="5"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            亮点标签（逗号分隔）
          </label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="如：200+皮肤,高胜率,无封禁记录"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            账号描述 *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="详细描述账号情况，如主玩英雄、胜率、皮肤数量等…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors resize-none h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              联系方式（微信/QQ）*
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="请输入联系方式"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              价格备注
            </label>
            <input
              name="pricingNote"
              value={form.pricingNote}
              onChange={handleChange}
              placeholder="阶梯定价、包天价格等"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !user}
          className={`mt-6 font-black px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-red-100 ${
            loading || !user
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand hover:bg-brand-dark text-white'
          }`}
        >
          {loading ? '提交中…' : '✅ 提交发布'}
        </button>
      </div>
    </div>
  )
}