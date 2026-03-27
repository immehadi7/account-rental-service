import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createAccount } from '../api/account.service'

const GAMES = [
  '英雄联盟', '绝地求生', '原神', 'CS2',
  '王者荣耀', '永劫无间', 'FIFA Online', '三角洲行动',
]

const FLAT_FEE_GAMES = ['三角洲行动']

const CATEGORIES = [
  { value: 'moba',  label: 'MOBA'     },
  { value: 'fps',   label: 'FPS/射击' },
  { value: 'rpg',   label: 'RPG'      },
  { value: 'sport', label: '体育竞技' },
  { value: 'other', label: '其他'     },
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
    deposit:       '',
    deliveryTime:  '15',
    description:   '',
    tags:          '',
    contact:       '',
    pricingNote:   '',
    emoji:         '⚔️',
  })

  const [images,  setImages]  = useState([])   // preview URLs
  const [files,   setFiles]   = useState([])   // actual File objects
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const isFlatFee = FLAT_FEE_GAMES.includes(form.game)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  // ✅ Image upload handler
  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length + files.length > 5) {
      setError('最多上传5张图片')
      return
    }
    const newPreviews = selected.map(f => URL.createObjectURL(f))
    setImages(p => [...p, ...newPreviews])
    setFiles(p  => [...p, ...selected])
  }

  const removeImage = (index) => {
    setImages(p => p.filter((_, i) => i !== index))
    setFiles(p  => p.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError('')

    if (!form.game)        { setError('请选择游戏名称'); return }
    if (!form.rank)        { setError('请输入账号段位'); return }
    if (!form.price)       { setError('请输入租金');     return }
    if (!form.description) { setError('请输入账号描述'); return }
    if (!form.contact)     { setError('请输入联系方式'); return }
    if (!user)             { setError('请先登录后再发布'); return }

    setLoading(true)
    try {
      // ✅ Convert images to base64 strings to send with form
      const imageBase64s = await Promise.all(
        files.map(file => new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        }))
      )

      await createAccount({
        ...form,
        images:  imageBase64s,
        deposit: form.deposit ? Number(form.deposit) : Math.max(50, Number(form.price) * 2),
      })

      setSuccess(true)
      setForm({
        game: '', rank: '', category: 'moba',
        price: '', originalPrice: '', deposit: '',
        deliveryTime: '15', description: '', tags: '',
        contact: '', pricingNote: '', emoji: '⚔️',
      })
      setImages([])
      setFiles([])
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

          {/* ✅ Price label changes based on game */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              {isFlatFee ? '租金（固定费用）*' : '租金（元/小时）*'}
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
            {isFlatFee && (
              <p className="text-xs text-blue-500 mt-1">
                三角洲行动按固定租金收费，不按小时计算
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              {isFlatFee ? '原价（元）' : '原价（元/小时）'}
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

          {/* ✅ Deposit field */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              安全押金（元）
            </label>
            <input
              name="deposit"
              type="number"
              value={form.deposit}
              onChange={handleChange}
              placeholder={form.price ? `建议: ¥${Math.max(50, Number(form.price) * 2)}` : '留空自动计算'}
              min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              留空则自动设为租金2倍（最低¥50），租用结束后退回
            </p>
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

        {/* ✅ Image upload section */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            账号截图（最多5张）
          </label>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {images.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {images.length < 5 && (
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-brand transition-colors">
              <span className="text-2xl">📸</span>
              <div>
                <div className="text-sm font-semibold text-gray-600">点击上传截图</div>
                <div className="text-xs text-gray-400">支持 JPG/PNG，单张最大2MB，最多5张</div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
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

        {/* Price summary preview */}
        {form.price && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm">
            <div className="font-semibold text-gray-700 mb-2">💰 费用预览</div>
            <div className="space-y-1 text-gray-500">
              <div className="flex justify-between">
                <span>{isFlatFee ? '固定租金' : '租金/小时'}</span>
                <span>¥{form.price}</span>
              </div>
              <div className="flex justify-between">
                <span>安全押金</span>
                <span>¥{form.deposit || Math.max(50, Number(form.price) * 2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200 mt-1">
                <span>买家首次支付</span>
                <span className="text-brand">
                  ¥{(
                    Number(form.price) +
                    Number(form.deposit || Math.max(50, Number(form.price) * 2)) +
                    2
                  ).toFixed(2)}
                  {!isFlatFee && ' /小时起'}
                </span>
              </div>
              <div className="text-xs text-gray-400">含¥2担保服务费，押金租用结束后退回</div>
            </div>
          </div>
        )}

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