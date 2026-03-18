import { useState, useEffect, useRef, useCallback } from 'react'
import { CAROUSEL_SLIDES } from '../data/accounts'

export default function Carousel({ onRent }) {
  const [cur, setCur] = useState(0)
  const timerRef = useRef(null)

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCur((p) => (p + 1) % CAROUSEL_SLIDES.length)
    }, 4000)
  }, [])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  const go = (i) => {
    clearInterval(timerRef.current)
    setCur(i)
    startTimer()
  }

  const prev = () => go((cur - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)
  const next = () => go((cur + 1) % CAROUSEL_SLIDES.length)

  const s = CAROUSEL_SLIDES[cur]

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-52 md:h-64 select-none"
      style={{ background: s.from }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-8 md:px-16 z-10">
        <div className="flex-1">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            {s.tag}
          </span>

          <h2 className="text-white font-black text-2xl md:text-3xl mb-2 leading-tight">
            {s.title}
          </h2>

          <p className="text-white/80 text-sm mb-4">{s.sub}</p>

          <div className="flex items-center gap-4">
            <span className="text-yellow-300 font-black text-2xl">{s.price}</span>
            <button
              className="bg-white text-brand font-black px-6 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              onClick={() => onRent()}
            >
              立即租用
            </button>
          </div>
        </div>

        <div className="text-8xl md:text-9xl opacity-25 hidden md:block">{s.emoji}</div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors text-xl"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors text-xl"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${
              i === cur ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}