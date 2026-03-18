export const GAMES = [
  '全部', '英雄联盟', '绝地求生', '原神',
  'CS2', '王者荣耀', '永劫无间', 'FIFA Online', '三角洲行动',
]

export const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: '英雄联盟钻石段位账号',
    sub: '多款限定皮肤 · 高胜率保证 · 无封禁记录',
    price: '¥18/小时',
    tag: '热门推荐',
    emoji: '⚔️',
    from: '#1e3a8a',
    to: '#1e40af',
  },
  {
    id: 2,
    title: '原神AR58全探索账号',
    sub: '满命五星角色 · 全地图解锁 · 极速交付',
    price: '¥30/小时',
    tag: '限时特惠',
    emoji: '🌟',
    from: '#6d28d9',
    to: '#4c1d95',
  },
  {
    id: 3,
    title: '绝地求生顶级枪皮账号',
    sub: '稀有枪皮 · 低延迟稳定服务 · 品质认证',
    price: '¥15/小时',
    tag: '新品上架',
    emoji: '🎯',
    from: '#b45309',
    to: '#92400e',
  },
  {
    id: 4,
    title: 'CS2传奇鹰账号出租',
    sub: '无VAC记录 · 高信誉保障 · 精准皮肤',
    price: '¥22/小时',
    tag: '品质认证',
    emoji: '💣',
    from: '#065f46',
    to: '#064e3b',
  },
]

const GAME_META = [
  { name: '英雄联盟', emoji: '⚔️', color: '#1e3a5f', bg: '#e8f0ff', cat: 'moba' },
  { name: '绝地求生', emoji: '🎯', color: '#3d2b1f', bg: '#fff3e0', cat: 'fps'  },
  { name: '原神',     emoji: '🌟', color: '#4a1a6b', bg: '#f3e8ff', cat: 'rpg'  },
  { name: 'CS2',      emoji: '💣', color: '#1a2a1a', bg: '#e8ffe8', cat: 'fps'  },
  { name: '王者荣耀', emoji: '👑', color: '#5a3000', bg: '#fff8e0', cat: 'moba' },
  { name: '永劫无间', emoji: '🔥', color: '#4a0000', bg: '#ffe8e8', cat: 'rpg'  },
  { name: 'FIFA Online', emoji: '⚽', color: '#003a1a', bg: '#e0ffe8', cat: 'sport' },
  { name: '三角洲行动', emoji: '🪖', color: '#1a2a00', bg: '#eaffd6', cat: 'fps' },
]

const RANKS = ['黄金', '铂金', '钻石', '大师', '王者', '挑战者', '传奇', '精英']

const ALL_TAGS = [
  ['高胜率', '全英雄', '豪华皮肤'],
  ['多把枪皮', '低延迟', '稳定'],
  ['满命角色', '全探索', '强队'],
  ['高信誉', '无VAC', '精准皮肤'],
  ['全英雄', '传说皮肤', '顶分'],
  ['稀有套装', '干净记录', '稳定'],
  ['顶级球星', '高化学', '强阵容'],
  ['特种装备', '精锐皮肤', '顶配武器'],
]

const PRICES  = [12, 15, 16, 18, 20, 22, 25, 28, 30, 35]
const EXTRAS  = [8, 10, 12, 15, 18, 20]
const STATUSES = ['online', 'online', 'online', 'busy', 'offline']
const DELIVERIES = [8, 10, 12, 15, 20]

export const ACCOUNTS = Array.from({ length: 48 }, (_, i) => {
  const g        = GAME_META[i % GAME_META.length]
  const rank     = RANKS[Math.floor(Math.random() * RANKS.length)]
  const price    = PRICES[Math.floor(Math.random() * PRICES.length)]
  const orig     = price + EXTRAS[Math.floor(Math.random() * EXTRAS.length)]
  const status   = STATUSES[Math.floor(Math.random() * STATUSES.length)]
  const tags     = ALL_TAGS[i % ALL_TAGS.length]
  const delivery = DELIVERIES[Math.floor(Math.random() * DELIVERIES.length)]

  return {
    id:       i + 1,
    game:     g.name,
    emoji:    g.emoji,
    color:    g.color,
    bg:       g.bg,
    cat:      g.cat,
    rank,
    price,
    orig,
    status,
    tags,
    delivery,
    desc:     `${g.name} · ${rank}段 — ${tags[0]}，${tags[1]}，无封禁记录`,
    views:    Math.floor(Math.random() * 5000) + 500,
    orders:   Math.floor(Math.random() * 300)  + 10,
    stats: [
      ['63%',   '胜率'],
      [rank,    '段位'],
      ['200+',  '皮肤数'],
      [delivery + '分钟', '交付'],
      ['⭐ 4.9', '评分'],
      ['实名',   '认证'],
    ],
  }
})