const STATUS_MAP = {
  online:  { label: '在线', cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  pulse: true  },
  busy:    { label: '忙碌', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', pulse: true  },
  offline: { label: '离线', cls: 'bg-gray-100 text-gray-400',    dot: 'bg-gray-400',   pulse: false },
}

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.offline
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? 'status-pulse' : ''}`} />
      {s.label}
    </span>
  )
}