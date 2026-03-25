import { useState, useEffect } from 'react'
import AccountCard from '../components/AccountCard'
import Carousel from '../components/Carousel'
import Pagination from '../components/Pagination'
// Notice we are directly importing ACCOUNTS here now!
import { GAMES, ACCOUNTS } from '../data/accounts'

const PER_PAGE = 12

export default function HomePage({ searchQ, onOpen }) {
  const [filter, setFilter] = useState('全部')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Simulate a quick loading state to make it feel smooth
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [filter, page, searchQ])

  // Reset to page 1 whenever they change the filter or search
  useEffect(() => {
    setPage(1)
  }, [filter, searchQ])

  // 1. Filter the local data
  const filteredAccounts = ACCOUNTS.filter((acc) => {
    const matchGame = filter === '全部' || acc.game === filter
    const matchSearch = !searchQ || acc.game.includes(searchQ) || (acc.desc && acc.desc.includes(searchQ))
    return matchGame && matchSearch
  })

  // 2. Calculate pagination slices
  const total = filteredAccounts.length
  const paginatedAccounts = filteredAccounts.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      <Carousel onRent={() => onOpen(ACCOUNTS[0])} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        {[
          ['12,480', '在架账号数', '🎮'],
          ['98.6%', '用户好评率', '⭐'],
          ['36秒', '平均响应时间', '⚡'],
          ['¥2', '担保服务费', '🛡️'],
        ].map(([v, l, ic]) => (
          <div
            key={l}
            className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl">{ic}</div>
            <div>
              <div className="font-black text-gray-800 text-lg">{v}</div>
              <div className="text-xs text-gray-400">{l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 mb-4 flex items-center gap-2 flex-wrap shadow-sm">
        <span className="text-xs font-bold text-gray-400 uppercase">分类：</span>
        {GAMES.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
              ${
                filter === g
                  ? 'bg-brand text-white shadow-md shadow-red-100'
                  : 'border border-gray-200 text-gray-500 hover:border-brand hover:text-brand'
              }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-brand rounded-full" />
          <h2 className="font-black text-gray-800 text-lg">热门账号</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {total} 个
          </span>
        </div>
        <div className="text-xs text-gray-400">第 {page} 页</div>
      </div>

      {/* Grid of Accounts */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse"
              />
            ))}
        </div>
      ) : paginatedAccounts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <div>暂无匹配账号</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedAccounts.map((acc) => (
            <AccountCard key={acc._id} acc={acc} onClick={onOpen} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        page={page}
        total={total}
        perPage={PER_PAGE}
        onChange={(p) => {
          setPage(p)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}