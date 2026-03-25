import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import SupportPage from './pages/SupportPage'
import AdminPage from './pages/AdminPage'
import SellerDashboard from './pages/SellerDashboard'
import DetailModal from './pages/modals/DetailModal.jsx'
import AlipayModal from './pages/modals/Alipaymodal.jsx'
import LoginModal from './pages/modals/LoginModal'
import OrdersPage from './pages/OrdersPage'

export default function App() {
  const [page,            setPage]            = useState('home')
  const [searchQ,         setSearchQ]         = useState('')
  const [selectedAcc,     setSelectedAcc]     = useState(null)
  const [showAlipay,      setShowAlipay]      = useState(false)
  const [alipayHours,     setAlipayHours]     = useState(1)
  const [alipayMethod,    setAlipayMethod]    = useState('alipay')
  const [showLogin,       setShowLogin]       = useState(false)
  const [alipayTotal,     setAlipayTotal]     = useState(null) // New state for grand total override

  // Pass summary data from DetailModal to AlipayModal
  const openAlipay = (acc, h, method = 'alipay', summary = null) => {
    setSelectedAcc(acc)
    setAlipayHours(h)
    setAlipayMethod(method)
    setAlipayTotal(summary?.grandTotal || null) // Extract grandTotal from summary
    setShowAlipay(true)
  }

  const openDetail = (acc) => {
    setSelectedAcc(acc)
    setShowAlipay(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-cn">
      <Navbar
        page={page}
        setPage={setPage}
        searchQ={searchQ}
        setSearchQ={(s) => { setSearchQ(s); setPage('home') }}
        onLogin={() => setShowLogin(true)}
      />
      
      {/* ── Pages ── */}
      {page === 'home'   && <HomePage searchQ={searchQ} onOpen={openDetail} />}
      {page === 'post'   && <PostPage />}
      {page === 'cs'     && <SupportPage />}
      {page === 'admin'  && <AdminPage />}
      {page === 'seller' && <SellerDashboard setPage={setPage} />}
      {page === 'orders' && <OrdersPage />}

      {/* ── Detail Modal ── */}
      {selectedAcc && !showAlipay && (
        <DetailModal
          key={selectedAcc._id}
          acc={selectedAcc}
          onClose={() => setSelectedAcc(null)}
          onPay={(a, h, method, summary) => {
            setSelectedAcc(null)
            openAlipay(a, h, method, summary) 
          }}
        />
      )}

      {/* ── Alipay / WeChat Modal ── */}
      {showAlipay && selectedAcc && (
        <AlipayModal
          acc={selectedAcc}
          hours={alipayHours}
          method={alipayMethod}
          totalOverride={alipayTotal} // Pass the calculated total including deposit
          onClose={() => {
            setShowAlipay(false)
            setSelectedAcc(null)
            setAlipayTotal(null) // Reset total on close
          }}
        />
      )}

      {/* ── Login Modal ── */}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}

      {/* ── Mobile bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden z-40">
        {[
          { k: 'home',   l: '首页', ic: '🏠' },
          { k: 'post',   l: '发布', ic: '➕' },
          { k: 'orders', l: '订单', ic: '📦' },
          { k: 'cs',     l: '客服', ic: '💬' },
          { k: 'login',  l: '我的', ic: '👤' },
        ].map(({ k, l, ic }) => (
          <button
            key={k}
            onClick={() => {
              if (k === 'login') setShowLogin(true)
              else setPage(k)
            }}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${
              page === k ? 'text-brand' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{ic}</span>
            <span className="text-xs font-semibold">{l}</span>
          </button>
        ))}
      </div>
      <div className="h-16 md:hidden" />
    </div>
  )
}