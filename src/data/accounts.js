export const GAMES = [
  '全部', '英雄联盟', '无畏契约', '绝地求生', '原神',
  'CS2', '王者荣耀', '穿越火线', '地下城与勇士', '永劫无间', 
  'Apex英雄', '崩坏：星穹铁道', 'FIFA Online', '三角洲行动',
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
    title: '无畏契约神话账号',
    sub: '全套紫金/龙炎 · 顶尖神话排位 · 极速交付',
    price: '¥25/小时',
    tag: '限时特惠',
    emoji: '🔫',
    from: '#ff4655',
    to: '#990000',
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
    title: '地下城与勇士连击号',
    sub: '满级打造 · 稀有天空套 · 高抗魔值',
    price: '¥20/小时',
    tag: '品质认证',
    emoji: '🧝‍♂️',
    from: '#b8860b',
    to: '#8b6508',
  },
]

// Added the new highly popular games with custom colors and emojis
const GAME_META = [
  { name: '英雄联盟', emoji: '⚔️', color: '#1e3a5f', bg: '#e8f0ff', cat: 'moba' },
  { name: '无畏契约', emoji: '🔫', color: '#ff4655', bg: '#ffe5e7', cat: 'fps'  },
  { name: '绝地求生', emoji: '🎯', color: '#3d2b1f', bg: '#fff3e0', cat: 'fps'  },
  { name: '原神',     emoji: '🌟', color: '#4a1a6b', bg: '#f3e8ff', cat: 'rpg'  },
  { name: 'CS2',      emoji: '💣', color: '#1a2a1a', bg: '#e8ffe8', cat: 'fps'  },
  { name: '王者荣耀', emoji: '👑', color: '#5a3000', bg: '#fff8e0', cat: 'moba' },
  { name: '穿越火线', emoji: '🔥', color: '#8b0000', bg: '#ffe4e1', cat: 'fps'  },
  { name: '地下城与勇士', emoji: '🧝‍♂️', color: '#b8860b', bg: '#fff8dc', cat: 'rpg' },
  { name: '永劫无间', emoji: '🗡️', color: '#4a0000', bg: '#ffe8e8', cat: 'rpg'  },
  { name: 'Apex英雄', emoji: '🚀', color: '#cc0000', bg: '#ffe5e5', cat: 'fps'  },
  { name: '崩坏：星穹铁道', emoji: '🚂', color: '#483d8b', bg: '#e6e6fa', cat: 'rpg' },
  { name: 'FIFA Online', emoji: '⚽', color: '#003a1a', bg: '#e0ffe8', cat: 'sport' },
  { name: '三角洲行动', emoji: '🪖', color: '#1a2a00', bg: '#eaffd6', cat: 'fps' },
]

const RANKS = ['黄金', '铂金', '钻石', '大师', '王者', '挑战者', '传奇', '精英']

const ALL_TAGS = [
  ['高胜率', '全英雄', '豪华皮肤'],
  ['多把稀有武器', '满级通行证', '稳定'],
  ['满命角色', '全探索', '极速号'],
  ['高信誉', '无封禁', '精准皮肤'],
  ['绝版时装', '极品装备', '顶分'],
  ['稀有套装', '干净记录', '全天在线'],
  ['顶级阵容', '高化学反应', '竞技号'],
  ['特种装备', '精锐皮肤', '满级配件'],
]

const PRICES  = [12, 15, 16, 18, 20, 22, 25, 28, 30, 35]
const EXTRAS  = [8, 10, 12, 15, 18, 20]
const STATUSES = ['online', 'online', 'online', 'busy', 'offline']
const DELIVERIES = [8, 10, 12, 15, 20]

// Increased length to 120 so you have exactly 10 pages of accounts to click through
export const ACCOUNTS = Array.from({ length: 120 }, (_, i) => {
  const g        = GAME_META[i % GAME_META.length]
  const isDelta  = g.name === '三角洲行动'
  const rank     = RANKS[Math.floor(Math.random() * RANKS.length)]
  
  let basePrice  = PRICES[Math.floor(Math.random() * PRICES.length)]
  const price    = isDelta ? basePrice * 3 : basePrice
  
  const orig     = price + EXTRAS[Math.floor(Math.random() * EXTRAS.length)]
  const status   = STATUSES[Math.floor(Math.random() * STATUSES.length)]
  const tags     = ALL_TAGS[i % ALL_TAGS.length]
  const delivery = DELIVERIES[Math.floor(Math.random() * DELIVERIES.length)]

  return {
    _id:      String(i + 1),
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
    unit:     isDelta ? '租' : '小时',
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