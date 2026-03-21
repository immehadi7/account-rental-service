import { useAuth } from '../context/AuthContext'

export default function Navbar({ page, setPage, searchQ, setSearchQ, onLogin }) {
  const { user, logout } = useAuth()

  const navItems = [
    { k: 'home', l: '首页'   },
    { k: 'post', l: '发布租号' },
    { k: 'cs',   l: '客服中心' },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">

        {/* Logo */}
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-black text-sm">
            租
          </div>
          <span className="font-black text-gray-800 text-base hidden sm:block">
            61租号
          </span>
        </button>

        {/* Nav links */}

        {user && (
  <button
    onClick={() => setPage('seller')}
    className={`nav-link px-3 py-1.5 text-sm font-semibold transition-colors ${
      page === 'seller' ? 'text-brand active' : 'text-gray-500 hover:text-brand'
    }`}
  >
    🏪 卖家中心
  </button>
)}
        <div className="flex items-center gap-1 flex-1">
          {navItems.map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setPage(k)}
              className={`nav-link px-3 py-1.5 text-sm font-semibold transition-colors ${
                page === k ? 'text-brand active' : 'text-gray-500 hover:text-brand'
              }`}
            >
              {l}
            </button>
          ))}

          {/* ✅ Admin link — only shows for admin users */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setPage('admin')}
              className={`nav-link px-3 py-1.5 text-sm font-semibold transition-colors ${
                page === 'admin' ? 'text-brand active' : 'text-gray-500 hover:text-brand'
              }`}
            >
              ⚙️ 管理后台
            </button>
          )}
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-brand transition-colors flex-1 max-w-xs">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="搜索游戏、段位..."
            className="bg-transparent outline-none text-sm flex-1 text-gray-700"
          />
        </div>

        {/* Auth section */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {user.username}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-red-500 font-semibold transition-colors px-2"
              >
                退出
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="text-sm text-gray-500 hover:text-brand font-semibold transition-colors hidden sm:block"
              >
                登录
              </button>
              <button
                onClick={onLogin}
                className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors shadow-md shadow-red-100"
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}