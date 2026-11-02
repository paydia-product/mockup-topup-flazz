"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Bell,
  Eye,
  EyeOff,
  Plus,
  Send,
  Download,
  Store,
  Users,
  Smartphone,
  Zap,
  Droplet,
  Heart,
  ShieldCheck,
  ReceiptText,
  Wallet,
  Wifi,
  Home,
  Clock,
  User,
  Search,
  CreditCard,
  Lock,
} from "lucide-react"
import FlazzTopUp from "./flazz-topup"
import Notifications from "./notifications"
import TransactionHistory from "./transaction-history"

type ActionId = string

export default function PaydiaApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showBalance, setShowBalance] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "favorite" | "history" | "profile">("home")
  const [page, setPage] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [showFlazz, setShowFlazz] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [flazzBadgeSeen, setFlazzBadgeSeen] = useState(false)
  const [hasNfc, setHasNfc] = useState(true)
  const [nfcEnabled, setNfcEnabled] = useState(true)
  const [failScan, setFailScan] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryAfter <= 0) {
      setRateLimited(false)
      return
    }
    const timer = setTimeout(() => setRetryAfter((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [retryAfter])

  const handleLogin = async () => {
    if (isLoggingIn || rateLimited) return
    setIsLoggingIn(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.status === 429) {
        const data = await res.json()
        setRateLimited(true)
        setRetryAfter(data.retryAfter || 300)
        setPasswordError(false)
      } else {
        const data = await res.json()
        if (data.success) {
          setIsAuthenticated(true)
          setPasswordError(false)
        } else {
          setPasswordError(true)
        }
      }
    } catch {
      setPasswordError(true)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout((showToast as any)._t)
    ;(showToast as any)._t = window.setTimeout(() => setToast(null), 1600)
  }

  const handleAction = (id: ActionId) => {
    showToast(`Membuka: ${id}`)
  }

  const primaryActions = [
    { id: "Top Up", icon: Plus },
    { id: "Kirim", icon: Send },
    { id: "Minta Uang", icon: Download },
    { id: "Merchant", icon: Store },
  ]

  const servicesPage1 = [
    { id: "Komunitas", icon: Users, badge: null },
    { id: "Pulsa & Paket Data", icon: Smartphone, badge: null },
    { id: "PLN", icon: Zap, badge: null },
    { id: "PDAM", icon: Droplet, badge: null },
    { id: "BPJS Kesehatan", icon: ShieldCheck, badge: null },
    { id: "Tagihan", icon: ReceiptText, badge: null },
    { id: "Top Up Flazz", icon: CreditCard, badge: !flazzBadgeSeen ? "New" : null },
    { id: "Internet", icon: Wifi, badge: null },
  ]

  const servicesPage2 = [{ id: "Telkom", icon: Smartphone, badge: null }]

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const w = el.clientWidth
      const idx = Math.round(el.scrollLeft / w)
      setPage(idx)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const goToPage = (p: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#3b5bdb] px-8 pt-10 pb-8 text-center">
              <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white text-xl font-semibold mb-1">Prototype Preview</h2>
              <p className="text-white/60 text-sm">Masukkan password untuk melanjutkan</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Password</label>
              <div className="relative mb-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(false)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Password"
                  className={`w-full px-4 py-3.5 pr-12 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                    passwordError
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-slate-200 focus:ring-[#2540c9]/20 focus:border-[#2540c9]"
                  }`}
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {rateLimited && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 mt-1.5">
                  <p className="text-red-600 text-xs font-medium">
                    Terlalu banyak percobaan login. Coba lagi dalam {Math.floor(retryAfter / 60)}:{String(retryAfter % 60).padStart(2, '0')}
                  </p>
                </div>
              )}
              {!rateLimited && passwordError && (
                <p className="text-red-500 text-xs mb-4 mt-1.5">Password salah. Silakan coba lagi.</p>
              )}
              {!rateLimited && !passwordError && <div className="mb-4" />}

              <button
                onClick={handleLogin}
                disabled={isLoggingIn || rateLimited}
                className="w-full bg-[#2540c9] text-white py-3.5 rounded-xl font-semibold active:scale-[0.98] transition-transform hover:bg-[#1e3399] disabled:opacity-60"
              >
                {rateLimited ? `Dikunci (${Math.floor(retryAfter / 60)}:${String(retryAfter % 60).padStart(2, '0')})` : isLoggingIn ? "Memverifikasi..." : "Masuk"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-200 flex items-start justify-center gap-4 py-4 px-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[400px] bg-white shadow-2xl overflow-hidden min-h-[820px] rounded-[2.5rem] border-8 border-slate-900 flex-shrink-0">
        {activeTab === "history" ? (
          <div className="h-full flex flex-col pb-20">
            <TransactionHistory onBack={() => setActiveTab("home")} />
          </div>
        ) : (
        <div className="bg-slate-100 pb-24 pt-2 h-full overflow-auto">
        {/* Header */}
        <div className="bg-white px-5 pt-3 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-[#2540c9] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">p</span>
              </div>
              <span className="text-[#2540c9] text-2xl font-semibold tracking-tight" style={{ fontFamily: "ui-rounded, system-ui" }}>
                paydia
              </span>
            </div>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-1 active:scale-95 transition-transform"
              aria-label="Notifikasi"
            >
              <Bell className="w-6 h-6 text-[#2540c9]" strokeWidth={1.8} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          {/* User info */}
          <div className="mt-3 flex items-start justify-between">
            <div>
              <h1 className="text-xl text-slate-900">Dion</h1>
              <button
                onClick={() => setShowBalance((v) => !v)}
                className="mt-2 flex items-center gap-2 active:scale-95 transition-transform"
                aria-label={showBalance ? "Sembunyikan saldo" : "Tampilkan saldo"}
              >
                <span className="text-slate-900 text-lg font-bold tracking-widest">
                  {showBalance ? "Rp 1.250.000" : "******"}
                </span>
                {showBalance ? (
                  <Eye className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                ) : (
                  <EyeOff className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                )}
              </button>
            </div>
            <button
              onClick={() => handleAction("Status Gold")}
              className="flex items-center gap-1 bg-gradient-to-b from-[#d4a93a] to-[#a8842a] text-white text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
              Gold
            </button>
          </div>

          {/* Primary action bar */}
          <div className="mt-5 bg-gradient-to-r from-[#3b5bdb] via-[#3454d1] to-[#4263eb] rounded-2xl px-2 py-4">
            <div className="grid grid-cols-4 gap-1">
              {primaryActions.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleAction(id)}
                  className="flex flex-col items-center gap-1.5 py-1 active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-full border-[1.5px] border-white/90 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-white text-[13px] font-medium">{id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Favorit + Promo */}
        <div className="px-3 mt-3">
          <div className="bg-white rounded-2xl p-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction("Tambah Transaksi Favorit")}
              className="border border-[#3b5bdb] rounded-xl p-3 text-left active:scale-[0.98] transition-transform"
            >
              <p className="text-slate-900 text-[15px] font-medium leading-snug">
                Transaksi
                <br />
                Favorit
              </p>
              <div className="my-3 w-7 h-7 rounded-full border-[1.5px] border-[#3b5bdb] flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#3b5bdb]" strokeWidth={2} />
              </div>
              <p className="text-slate-500 text-xs leading-snug">
                Kamu belum punya
                <br />
                transaksi favorit
              </p>
            </button>

            <button
              onClick={() => handleAction("Promo Minta Uang")}
              className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1a2980] to-[#26509b] p-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-1 mb-1">
                <div className="w-3.5 h-3.5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-[#2540c9] font-bold text-[8px]">p</span>
                </div>
                <span className="text-white text-[10px]">paydia</span>
              </div>
              <div className="flex items-start justify-between gap-1">
                <span className="text-white text-[10px]">
                  <span className="text-yellow-300 font-semibold">New</span> Feature
                </span>
                <span className="text-yellow-300 text-xs">✨</span>
              </div>
              <p className="text-white text-[11px] font-semibold leading-tight mt-1">
                Split Bill Gak Jadi
                <br />
                Drama dengan
                <br />
                fitur <span className="text-yellow-300">Minta Uang</span>
              </p>
              <div className="absolute -bottom-2 -left-2 w-16 h-20 opacity-30">
                <div className="w-full h-full bg-white/10 rounded-lg" />
              </div>
            </button>
          </div>
        </div>

        {/* Services grid - horizontal scroll snap */}
        <div className="px-3 mt-3">
          <div className="bg-white rounded-2xl p-4 pb-3">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-1"
              style={{ scrollbarWidth: "none" }}
            >
              {[servicesPage1, servicesPage2].map((items, pageIdx) => (
                <div
                  key={pageIdx}
                  className="flex-none w-full snap-start snap-always px-1"
                >
                  <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                    {items.map(({ id, icon: Icon, badge }) => (
                      <button
                        key={id}
                        onClick={() => {
                          if (id === "Top Up Flazz") {
                            setFlazzBadgeSeen(true)
                            setShowFlazz(true)
                          } else {
                            handleAction(id)
                          }
                        }}
                        className="group flex flex-col items-center gap-2"
                      >
                        <div className="relative w-14 h-14 bg-[#eef2ff] rounded-2xl flex items-center justify-center transition-all duration-150 group-active:bg-[#c7d2fe] group-active:scale-90">
                          <Icon
                            className="w-6 h-6 text-[#2540c9] transition-all duration-150 group-active:text-[#1e3a8a] group-active:scale-90"
                            strokeWidth={2}
                          />
                          {badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-900 text-[12px] text-center leading-tight font-medium px-1 transition-colors group-active:text-[#2540c9]">
                          {id}
                        </span>
                      </button>
                    ))}
                    {/* Filler to keep grid height stable on page 2 */}
                    {pageIdx === 1 &&
                      Array.from({ length: 7 }).map((_, i) => (
                        <div key={`filler-${i}`} className="w-14 h-[80px]" aria-hidden />
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <button
                onClick={() => goToPage(0)}
                aria-label="Halaman 1"
                className={`h-2 rounded-full transition-all ${
                  page === 0 ? "w-5 bg-[#2540c9]" : "w-2 bg-slate-300"
                }`}
              />
              <button
                onClick={() => goToPage(1)}
                aria-label="Halaman 2"
                className={`h-2 rounded-full transition-all ${
                  page === 1 ? "w-5 bg-[#2540c9]" : "w-2 bg-slate-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Banner image */}
        <div className="px-3 mt-3">
          <button
            onClick={() => handleAction("Banner Komunitas")}
            className="block w-full relative rounded-2xl overflow-hidden aspect-[16/10] active:scale-[0.99] transition-transform"
          >
            <Image
              src="/group-friends.jpg"
              alt="Komunitas Paydia - sekelompok teman berkumpul"
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1">
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                <span className="text-[#2540c9] font-bold text-[10px]">p</span>
              </div>
              <span className="text-white text-xs font-medium drop-shadow">paydia</span>
            </div>
          </button>
        </div>
      </div>
        )}

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100">
        <div className="flex items-center justify-around px-4 pt-3 pb-5 relative">
          <button
            onClick={() => setActiveTab("home")}
            className="flex flex-col items-center active:scale-95 transition-transform"
            aria-label="Home"
          >
            <Home
              className={`w-6 h-6 ${activeTab === "home" ? "text-[#2540c9] fill-[#2540c9]" : "text-slate-400"}`}
              strokeWidth={1.8}
            />
          </button>
          <button
            onClick={() => setActiveTab("favorite")}
            className="flex flex-col items-center active:scale-95 transition-transform"
            aria-label="Favorit"
          >
            <Heart
              className={`w-6 h-6 ${activeTab === "favorite" ? "text-[#2540c9] fill-[#2540c9]" : "text-slate-400"}`}
              strokeWidth={1.8}
            />
          </button>

          {/* QRIS center button */}
          <button
            onClick={() => handleAction("QRIS")}
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-b from-[#3b5bdb] to-[#2540c9] rounded-full flex items-center justify-center shadow-lg shadow-[#2540c9]/40 active:scale-95 transition-transform"
            aria-label="Bayar QRIS"
          >
            <span className="text-white font-bold text-sm tracking-wider" style={{ fontFamily: "ui-monospace, monospace" }}>
              QRIS
            </span>
          </button>
          <div className="w-16" aria-hidden />

          <button
            onClick={() => setActiveTab("history")}
            className="flex flex-col items-center active:scale-95 transition-transform"
            aria-label="Riwayat"
          >
            <Clock
              className={`w-6 h-6 ${activeTab === "history" ? "text-[#2540c9]" : "text-slate-400"}`}
              strokeWidth={1.8}
            />
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="flex flex-col items-center active:scale-95 transition-transform"
            aria-label="Profil"
          >
            <User
              className={`w-6 h-6 ${activeTab === "profile" ? "text-[#2540c9]" : "text-slate-400"}`}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}

      {/* Flazz Top Up Modal */}
        {showFlazz && (
          <FlazzTopUp 
            onClose={() => setShowFlazz(false)} 
            hasNfc={hasNfc} 
            nfcEnabled={nfcEnabled}
            onToggleHasNfc={() => setHasNfc(!hasNfc)}
            onToggleNfcEnabled={() => setNfcEnabled(!nfcEnabled)}
            failScan={failScan}
            onToggleFailScan={() => setFailScan(!failScan)}
            isConnected={isConnected}
            onToggleConnection={() => setIsConnected(!isConnected)}
          />
        )}

        {/* Notifications */}
        {showNotifications && (
          <Notifications
            onBack={() => setShowNotifications(false)}
            onOpenFlazzResult={() => {
              setShowNotifications(false)
              setShowFlazz(true)
            }}
          />
        )}
      </div>

      {/* NFC Testing Controls - Right side */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4">
          <p className="text-slate-600 text-xs font-semibold mb-4 uppercase tracking-wide">Testing Controls</p>
          <div className="space-y-4">
            {/* Device NFC Support Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasNfc ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-slate-700 text-sm">Device Support NFC</span>
              </div>
              <button
                onClick={() => setHasNfc(!hasNfc)}
                className={`relative w-11 h-6 rounded-full transition-colors ${hasNfc ? "bg-green-500" : "bg-slate-300"}`}
                aria-label="Toggle NFC support"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasNfc ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>
            {/* NFC Enabled Toggle */}
            <div className={`flex items-center justify-between ${!hasNfc ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${nfcEnabled ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="text-slate-700 text-sm">NFC Aktif</span>
              </div>
              <button
                onClick={() => setNfcEnabled(!nfcEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${nfcEnabled ? "bg-green-500" : "bg-slate-300"}`}
                aria-label="Toggle NFC enabled"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${nfcEnabled ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
