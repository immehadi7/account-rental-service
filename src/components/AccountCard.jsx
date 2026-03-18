import StatusBadge from './Statusbadge'

export default function AccountCard({ acc, onClick }) {
  return (
    <div
      className="card-hover bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer shadow-sm"
      onClick={() => onClick(acc)}
    >
      {/* Thumbnail */}
      <div
        className="relative h-28 flex items-center justify-center text-5xl"
        style={{ background: `linear-gradient(135deg, ${acc.color}22, ${acc.color}55)` }}
      >
        <span className="relative z-10">{acc.emoji}</span>

        <div className="absolute top-2 left-2">
          <StatusBadge status={acc.status} />
        </div>

        <div className="absolute top-2 right-2 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
          出租中
        </div>

        {/* fade bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10"
          style={{ background: 'linear-gradient(to top, white, transparent)' }}
        />
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className="tag-chip text-xs font-bold"
            style={{ background: acc.bg, color: acc.color }}
          >
            {acc.game}
          </span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs font-semibold text-gray-600">{acc.rank}段</span>
        </div>

        <p className="text-sm font-medium text-gray-800 leading-snug mb-2 line-clamp-2">
          {acc.desc}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {acc.tags.slice(0, 3).map((t) => (
            <span key={t} className="tag-chip bg-gray-100 text-gray-500">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <span className="text-lg font-black text-brand">¥{acc.price}</span>
            <span className="text-xs text-gray-400 line-through ml-1">¥{acc.orig}</span>
            <span className="text-xs text-gray-400">/小时</span>
          </div>
          <button
            className="bg-brand hover:bg-brand-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); onClick(acc) }}
          >
            立即租用
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">⏱ {acc.delivery}分钟内交付</span>
          <span className="text-xs text-gray-400">👁 {acc.views.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}