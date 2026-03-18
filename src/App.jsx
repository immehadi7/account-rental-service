import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DetailModal from './pages/modals/DetailModal'
import AlipayModal from './pages/modals/AlipayModal'
import LoginModal from './pages/modals/Loginmodal'

export default function App() {
  const [page, setPage] = useState('home')
  const [searchQ, setSearchQ] = useState('')
  const [selectedAcc, setSelectedAcc] = useState(null)
  const [showAlipay, setShowAlipay] = useState(false)
  const [alipayHours, setAlipayHours] = useState(1)
  const [showLogin, setShowLogin] = useState(false)

  const openAlipay = (acc, h) => { setSelectedAcc(acc); setAlipayHours(h); setShowAlipay(true) }

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-cn">
      <Navbar page={page} setPage={setPage} searchQ={searchQ}
        setSearchQ={s => { setSearchQ(s); setPage('home') }} onLogin={() => setShowLogin(true)} />

      {page === 'home' && (
        <HomePage searchQ={searchQ} onOpen={acc => setSelectedAcc(acc)} />
      )}

      {selectedAcc && !showAlipay && (
        <DetailModal acc={selectedAcc} onClose={() => setSelectedAcc(null)}
          onPay={(a, h) => { setSelectedAcc(null); openAlipay(a, h) }} />
      )}
      {showAlipay && (
        <AlipayModal acc={selectedAcc} hours={alipayHours} onClose={() => setShowAlipay(false)} />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}