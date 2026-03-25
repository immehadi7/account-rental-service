import React from 'react'

export default function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  
  // If there's only 1 page of data, don't show the pagination bar
  if (totalPages <= 1) return null

  // Calculate which page numbers to show (maximum 5 visible at a time)
  let startPage = Math.max(1, page - 2)
  let endPage = Math.min(totalPages, page + 2)

  // Adjust if we are near the beginning or end
  if (endPage - startPage < 4) {
    if (startPage === 1) endPage = Math.min(totalPages, 5)
    else startPage = Math.max(1, totalPages - 4)
  }

  // Create an array of the visible page numbers
  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        上一页
      </button>

      {/* Render the number buttons (1, 2, 3, 4, 5...) */}
      <div className="flex gap-1.5 hidden sm:flex">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all ${
              page === p
                ? 'bg-brand border-brand text-white shadow-md shadow-red-100'
                : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand bg-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        下一页
      </button>
    </div>
  )
}