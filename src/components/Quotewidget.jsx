import { useState } from 'react'

const GAME_OPTS  = [['20','英雄联盟'],['15','王者荣耀'],['25','绝地求生'],['30','原神'],['18','CS2']]
const HOUR_OPTS  = [['1','1小时'],['2','2小时'],['4','4小时'],['8','8小时（包天）'],['24','24小时']]
const LEVEL_OPTS = [['1','普通（白银-黄金）'],['1.5','中阶（铂金-钻石）'],['2.2','高阶（大师-王者）']]

export default function QuoteWidget({ onRequest }) {
  const [game,  setGame]  = useState('20')
  const [hours, setHours] = useState('1')
  const [tier,  setTier]  = useState('1')

  const base  = (parseFloat(game) * parseFloat(tier)).toFixed(1)
  const time  = (parseFloat(game) * parseFloat(tier) * parseFloat(hours)).toFixed(1)
  const total = (parseFloat(time) + 2).toFixed(1)
  const delivery = parseFloat(hours) >= 8 ? '30' : parseFloat(hours) >= 4 ? '20' : '15'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-brand rounded-full" />
        <h3 className="font-black text-gray-800">📋 快速报价</h3>
      </div>

      {[
        ['游戏类型', game,  setGame,  GAME_OPTS],
        ['租用时长', hours, setHours, HOUR_OPTS],
        ['账号等级', tier,  setTier,  LEVEL_OPTS],
      ].map(([label, val, setter, opts]) => (
        <div key={label} className="mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">
            {label}
          </label>
          <select
            value={val}
            onChange={(e) => setter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
          >
            {opts.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      ))}

      {/* Price breakdown */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>基础单价</span><span>¥{base}/小时</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>时长费用</span><span>¥{time}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>担保服务费</span><span>¥2.00</span>
        </div>
        <div className="flex justify-between font-black text-gray-800 pt-2 border-t border-red-100 text-base">
          <span>合计报价</span>
          <span className="text-brand text-xl">¥{total}</span>
        </div>
        <div className="text-xs text-gray-400">
          ⏱ 担保交付时间：<strong className="text-brand">{delivery}分钟内</strong>
        </div>
      </div>

      <button
        onClick={onRequest}
        className="w-full mt-4 bg-brand hover:bg-brand-dark text-white font-black py-3 rounded-xl text-sm transition-colors shadow-lg shadow-red-100"
      >
        立即询单 →
      </button>
    </div>
  )
}