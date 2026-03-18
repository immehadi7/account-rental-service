export default function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null

  // Build visible page range (current ±2)
  const range = []
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    range.push(i)
  }

  const btnBase =
    'w-9 h-9 rounded-lg border text-sm font-semibold transition-all'
  const btnActive =
    'bg-brand border-brand text-white shadow-md shadow-red-100'
  const btnIdle =
    'border-gray-200 text-gray-700 hover:border-brand hover:text-brand'

  return (
    <div className="flex items-center justify-center gap-1.5 py-8 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500
                   hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        上一页
      </button>

      {/* First page + ellipsis */}
      {range[0] > 1 && (
        <>
          <button onClick={() => onChange(1)} className={`${btnBase} ${btnIdle}`}>1</button>
          {range[0] > 2 && <span className="text-gray-400 px-1">…</span>}
        </>
      )}

      {/* Page numbers */}
      {range.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btnBase} ${p === page ? btnActive : btnIdle}`}
        >
          {p}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {range[range.length - 1] < pages && (
        <>
          {range[range.length - 1] < pages - 1 && (
            <span className="text-gray-400 px-1">…</span>
          )}
          <button onClick={() => onChange(pages)} className={`${btnBase} ${btnIdle}`}>
            {pages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500
                   hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        下一页
      </button>

      <span className="text-xs text-gray-400 ml-2">共 {pages} 页</span>
    </div>
  )
}