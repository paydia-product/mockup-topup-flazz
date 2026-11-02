"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  X,
  ChevronLeft,
  Nfc,
  CreditCard,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  Share2,
  MessageCircle,
  Bell,
  WifiOff,
} from "lucide-react"

type Screen =
  | "nfc-not-supported"
  | "nfc-disabled"
  | "scan-card"
  | "scanning"
  | "scan-error"
  | "card-detail"
  | "select-nominal"
  | "review"
  | "input-pin"
  | "write-card"
  | "writing-card"
  | "processing"
  | "result-success"
  | "result-failed"
  | "result-pending"
  | "result-refund"
  | "cancel-modal"
  | "insufficient-balance"

type ResultView = "success" | "failed" | "pending" | "refund"

interface FlazzTopUpProps {
  onClose: () => void
  initialScreen?: Screen
  hasNfc?: boolean
  nfcEnabled?: boolean
  onToggleHasNfc?: () => void
  onToggleNfcEnabled?: () => void
  failScan?: boolean
  onToggleFailScan?: () => void
  isConnected?: boolean
  onToggleConnection?: () => void
}

export default function FlazzTopUp({
  onClose,
  initialScreen = "scan-card",
  hasNfc = true,
  nfcEnabled = true,
  onToggleHasNfc,
  onToggleNfcEnabled,
  failScan = false,
  onToggleFailScan,
  isConnected = true,
  onToggleConnection,
}: FlazzTopUpProps) {
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null)
  const [customNominal, setCustomNominal] = useState("")
  const [pin, setPin] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [resultView, setResultView] = useState<ResultView>("success")
  const [manualShowNotif, setManualShowNotif] = useState(false)

  const cardData = {
    cardNumber: "6025 8600 0012 3456 7890",
    balance: 102485,
    lastUpdated: "7 Mei 2026, 09:00",
    lastTopUp: "7 Mei 2026, 09:00 - Rp100.000",
    transactions: [
      { type: "Payment", date: "11 Mei 2026, 16:00", amount: -3000 },
      { type: "Payment", date: "11 Mei 2026, 10:00", amount: -3000 },
      { type: "Top Up", date: "10 Mei 2026, 10:00", amount: 50000 },
      { type: "Payment", date: "9 Mei 2026, 15:30", amount: -5000 },
      { type: "Payment", date: "9 Mei 2026, 08:00", amount: -3000 },
      { type: "Top Up", date: "8 Mei 2026, 12:00", amount: 100000 },
      { type: "Payment", date: "7 Mei 2026, 18:00", amount: -3000 },
      { type: "Payment", date: "7 Mei 2026, 07:30", amount: -3000 },
      { type: "Payment", date: "6 Mei 2026, 14:00", amount: -5000 },
      { type: "Top Up", date: "5 Mei 2026, 09:00", amount: 50000 },
    ],
  }

  const nominalPresets = [20000, 50000, 100000, 200000, 300000, 500000]
  const adminFee = 1500
  const paydiaBalance = 1250000

  useEffect(() => {
    if (!hasNfc) {
      setScreen("nfc-not-supported")
    }
  }, [hasNfc])

  // Sync resultView and show notification when entering result screens
  useEffect(() => {
    const resultMap: Record<string, ResultView> = {
      "result-success": "success",
      "result-failed": "failed",
      "result-pending": "pending",
      "result-refund": "refund",
    }
    if (resultMap[screen]) {
      setResultView(resultMap[screen])
      setShowNotification(true)
      const timer = setTimeout(() => setShowNotification(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [screen])

  // Scanning animation
  useEffect(() => {
    if (screen === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            if (failScan) {
              setTimeout(() => setScreen("scan-error"), 500)
            } else {
              setTimeout(() => setScreen("card-detail"), 500)
            }
            return 100
          }
          return p + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
    setScanProgress(0)
  }, [screen, failScan])

  // Processing animation
  useEffect(() => {
    if (screen === "processing") {
      const steps = [
        "Menghubungkan ke kartu...",
        "Memproses pembayaran...",
        "Mengisi saldo kartu...",
        "Menyelesaikan transaksi...",
      ]
      let step = 0
      const interval = setInterval(() => {
        step++
        setProcessingStep(step)
        if (step >= steps.length) {
          clearInterval(interval)
          if (failScan) {
            setTimeout(() => setScreen("result-failed"), 1000)
          } else {
            setTimeout(() => setScreen("result-success"), 1000)
          }
        }
      }, 1500)
      return () => clearInterval(interval)
    }
    setProcessingStep(0)
  }, [screen, failScan])

  const getTotal = () => {
    const nominal = selectedNominal || parseInt(customNominal) || 0
    return nominal + adminFee
  }

  const getNominal = () => selectedNominal || parseInt(customNominal) || 0

  const validateNominal = () => {
    const nominal = getNominal()
    if (nominal < 20000) return "Minimal Top Up Rp20.000 dan saldo maksimal Rp2.000.000"
    if (cardData.balance + nominal > 2000000) return "Minimal Top Up Rp20.000 dan saldo maksimal Rp2.000.000"
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount)
  }

  const handleBack = () => {
    if (screen === "card-detail" || screen === "review") {
      setShowCancelModal(true)
    } else if (screen === "select-nominal") {
      setScreen("card-detail")
    } else if (screen === "input-pin") {
      setScreen("review")
    } else {
      onClose()
    }
  }

  const switchResultScreen = (view: ResultView) => {
    setScreen(`result-${view}` as Screen)
  }

  // Nominal to show in notifications (fallback to 100k if user hasn't set one yet)
  const displayNominal = getNominal() > 0 ? getNominal() : 100000

  const notifConfigs: Record<ResultView, { bg: string; text: string }> = {
    success: {
      bg: "bg-[#2540c9]",
      text: `Top Up Flazz Berhasil! Rp${formatCurrency(displayNominal)} telah ditambahkan ke kartu Flazz kamu.`,
    },
    failed: {
      bg: "bg-red-500",
      text: `Top Up Flazz Gagal. Top Up Rp${formatCurrency(displayNominal)} tidak berhasil diproses. Silakan coba lagi atau hubungi CS.`,
    },
    pending: {
      bg: "bg-amber-500",
      text: `Top Up Flazz Rp${formatCurrency(displayNominal)} masih dalam proses. Kami akan konfirmasi hasilnya segera.`,
    },
    refund: {
      bg: "bg-blue-500",
      text: `Dana Top Up Flazz Rp${formatCurrency(displayNominal)} telah dikembalikan ke saldo Paydia karena transaksi tidak dapat diproses.`,
    },
  }

  const notifNode = (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-3 flex items-start gap-3">
      <div className={`w-10 h-10 ${notifConfigs[resultView].bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Bell className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900 text-sm">Paydia</span>
          <span className="text-slate-400 text-xs">Sekarang</span>
        </div>
        <p className="text-slate-600 text-sm mt-0.5">{notifConfigs[resultView].text}</p>
      </div>
    </div>
  )

  const isResultScreen = screen.startsWith("result-")

  const commonProps = {
    hasNfc,
    nfcEnabled,
    onToggleHasNfc,
    onToggleNfcEnabled,
    failScan,
    onToggleFailScan,
    screen,
    showNotif: showNotification || manualShowNotif,
    notifNode,
    isResultScreen,
    currentResultView: resultView,
    onSwitchResult: switchResultScreen,
    isConnected,
    onToggleConnection,
  }

  // Screen: NFC Not Supported
  if (screen === "nfc-not-supported") {
    return (
      <ScreenWrapper {...commonProps}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Nfc className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">NFC Tidak Tersedia</h2>
          <p className="text-slate-600 leading-relaxed">
            Perangkat kamu tidak mendukung NFC. Harap gunakan perangkat yang mendukung NFC untuk melanjutkan.
          </p>
          <button
            onClick={onClose}
            className="mt-8 w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Kembali ke Home
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: NFC Disabled
  if (screen === "nfc-disabled") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Top Up Flazz" onBack={onClose} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Nfc className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Aktifkan NFC</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Fitur ini membutuhkan NFC, pastikan NFC di perangkat anda sudah aktif.
          </p>
          <div className="mt-4 text-left w-full bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Cara mengaktifkan NFC:</p>
            <ol className="text-sm text-slate-600 space-y-1">
              <li>1. Buka Settings di perangkat Anda</li>
              <li>2. Pilih menu Connections atau NFC</li>
              <li>3. Nyalakan toggle NFC</li>
              <li>4. Kembali ke aplikasi Paydia</li>
            </ol>
          </div>
          <div className="mt-4 text-left w-full bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Testing:</span> Nyalakan toggle &quot;NFC Aktif&quot; di panel Testing Controls di atas layar, lalu tekan tombol Coba Lagi.
            </p>
          </div>
          <button
            onClick={() => setScreen("scan-card")}
            className="mt-6 w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Coba Lagi
          </button>
          <button
            onClick={onClose}
            className="mt-3 w-full py-3 text-slate-600 font-medium active:scale-[0.98] transition-transform"
          >
            Batal
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Scan Card
  if (screen === "scan-card") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Top Up Flazz" onBack={onClose} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-[#eef2ff] rounded-full" />
            <div className="absolute inset-4 bg-[#dbeafe] rounded-full animate-ping opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-[#2540c9]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Silakan Scan Kartu Flazz</h2>
          <p className="text-slate-600 text-sm">Tempelkan kartu Flazz BCA ke area NFC perangkat Anda</p>
          <button
            onClick={() => {
              if (!nfcEnabled) {
                setScreen("nfc-disabled")
              } else {
                setScreen("scanning")
              }
            }}
            className="mt-8 w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Scan Kartu
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Scanning
  if (screen === "scanning") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Top Up Flazz" onBack={() => setScreen("scan-card")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative w-40 h-40 mb-6">
            <div className="absolute inset-0 bg-[#eef2ff] rounded-full" />
            <div className="absolute inset-4 bg-[#dbeafe] rounded-full animate-ping opacity-30" />
            <div className="absolute inset-8 bg-[#bfdbfe] rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Nfc className="w-12 h-12 text-[#2540c9] animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Sedang Membaca Kartu...</h2>
          <p className="text-slate-600 text-sm">Tahan kartu tetap di posisi hingga proses selesai</p>
          <button
            onClick={() => setScreen("scan-card")}
            className="mt-8 px-8 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform"
          >
            Batal
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Scan Error
  if (screen === "scan-error") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Top Up Flazz" onBack={onClose} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Gagal Membaca Kartu</h2>
          <p className="text-slate-600 text-sm">
            Pastikan kartu kamu ditempelkan dengan benar dan coba lagi.
          </p>
          <button
            onClick={() => setScreen("scanning")}
            className="mt-8 w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Coba Lagi
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Card Detail
  if (screen === "card-detail") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Detail Kartu Flazz" onBack={handleBack} />
        <div className="flex-1 overflow-auto px-4 pb-24">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <p className="text-green-800 text-sm">Scan berhasil, saldo telah diperbarui</p>
          </div>

          <div className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-2xl p-5 text-white mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium opacity-90">Kartu Flazz BCA</span>
            </div>
            <p className="text-xs opacity-70 mb-1">Nomor Kartu</p>
            <p className="font-mono text-lg tracking-wider mb-4">{cardData.cardNumber}</p>
            <p className="text-xs opacity-70 mb-1">Saldo</p>
            <p className="text-3xl font-bold">Rp{formatCurrency(cardData.balance)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Terakhir diperbarui</span>
              <span className="text-slate-900 text-sm font-medium">{cardData.lastUpdated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Top Up Terakhir</span>
              <span className="text-slate-900 text-sm font-medium">{cardData.lastTopUp}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="text-slate-900 font-semibold mb-3">Riwayat Transaksi</h3>
            <div className="max-h-[200px] overflow-y-auto space-y-3 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {cardData.transactions.map((tx, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-slate-900 text-sm font-medium">{tx.type}</p>
                    <p className="text-slate-500 text-xs">{tx.date}</p>
                  </div>
                  <span className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-slate-900"}`}>
                    {tx.amount > 0 ? "+" : ""}Rp{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <button
            onClick={() => setScreen("select-nominal")}
            className="w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Top Up Saldo
          </button>
        </div>

        {showCancelModal && (
          <CancelModal
            onCancel={() => {
              setShowCancelModal(false)
              onClose()
            }}
            onContinue={() => setShowCancelModal(false)}
          />
        )}
      </ScreenWrapper>
    )
  }

  // Screen: Select Nominal
  if (screen === "select-nominal") {
    const error = validateNominal()
    const hasValue = getNominal() > 0

    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Pilih Nominal" onBack={() => setScreen("card-detail")} />
        <div className="flex-1 overflow-auto px-4 pb-24">
          <p className="text-slate-600 text-sm mb-4">Pilih nominal top up untuk kartu Flazz kamu</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {nominalPresets.map((nominal) => (
              <button
                key={nominal}
                onClick={() => {
                  setSelectedNominal(nominal)
                  setCustomNominal("")
                }}
                className={`py-4 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                  selectedNominal === nominal
                    ? "bg-[#2540c9] text-white"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                Rp{formatCurrency(nominal)}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Atau masukkan nominal lain</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={customNominal ? Number(customNominal).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setCustomNominal(val)
                  setSelectedNominal(null)
                }}
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#2540c9] focus:border-transparent"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Min. Rp20.000 | Maks. saldo kartu Rp2.000.000</p>
          </div>

          {hasValue && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <button
            onClick={() => setScreen("review")}
            disabled={!hasValue || !!error}
            className={`w-full py-4 rounded-xl font-semibold active:scale-[0.98] transition-all ${
              hasValue && !error
                ? "bg-[#2540c9] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Lanjutkan
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Review
  if (screen === "review") {
    const total = getTotal()
    const insufficientBalance = total > paydiaBalance

    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Review Pembayaran" onBack={handleBack} />
        <div className="flex-1 overflow-auto px-4 pb-24">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#2540c9] rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Kartu Flazz BCA</p>
                <p className="text-xs text-slate-500 font-mono">{cardData.cardNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Nominal Top Up</span>
              <span className="text-slate-900 font-semibold">Rp{formatCurrency(getNominal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Biaya Admin</span>
              <span className="text-slate-900 font-semibold">Rp{formatCurrency(adminFee)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="text-slate-900 font-semibold">Total Pembayaran</span>
              <span className="text-[#2540c9] font-bold text-lg">Rp{formatCurrency(total)}</span>
            </div>
          </div>

          <div className={`rounded-xl p-4 mb-4 ${insufficientBalance ? "bg-red-50 border border-red-200" : "bg-white border border-slate-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Sumber Pembayaran</span>
              {insufficientBalance && (
                <span className="text-red-600 text-xs font-medium">Saldo Tidak Mencukupi</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2540c9] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">p</span>
                </div>
                <span className="font-medium text-slate-900">Saldo Paydia</span>
              </div>
              <span className={`font-semibold ${insufficientBalance ? "text-red-600" : "text-slate-900"}`}>
                Rp{formatCurrency(paydiaBalance)}
              </span>
            </div>
            {insufficientBalance && (
              <button className="mt-3 w-full py-2 border border-[#2540c9] text-[#2540c9] rounded-lg font-medium text-sm">
                Top Up Saldo Paydia
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <button
            onClick={() => setScreen("input-pin")}
            disabled={insufficientBalance}
            className={`w-full py-4 rounded-xl font-semibold active:scale-[0.98] transition-all ${
              insufficientBalance
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#2540c9] text-white"
            }`}
          >
            Konfirmasi Pembayaran
          </button>
        </div>

        {showCancelModal && (
          <CancelModal
            onCancel={() => {
              setShowCancelModal(false)
              setScreen("select-nominal")
            }}
            onContinue={() => setShowCancelModal(false)}
          />
        )}
      </ScreenWrapper>
    )
  }

  // Screen: Input PIN
  if (screen === "input-pin") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Masukkan PIN" onBack={() => setScreen("review")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 bg-[#eef2ff] rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-[#2540c9] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">p</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Masukkan PIN Paydia</h2>
          <p className="text-slate-500 text-sm mb-8">Masukkan 6 digit PIN untuk konfirmasi</p>

          <div className="flex gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? "bg-[#2540c9]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === "del") {
                    setPin((p) => p.slice(0, -1))
                  } else if (key !== "" && pin.length < 6) {
                    const newPin = pin + key
                    setPin(newPin)
                    if (newPin.length === 6) {
                      setTimeout(() => setScreen("write-card"), 300)
                    }
                  }
                }}
                className={`h-14 rounded-xl font-semibold text-xl transition-all active:scale-95 ${
                  key === ""
                    ? "invisible"
                    : key === "del"
                    ? "text-[#2540c9]"
                    : "bg-slate-100 text-slate-900 active:bg-slate-200"
                }`}
              >
                {key === "del" ? (
                  <ChevronLeft className="w-6 h-6 mx-auto" />
                ) : (
                  key
                )}
              </button>
            ))}
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Write Card (tempelkan kartu untuk mengisi saldo)
  if (screen === "write-card") {
    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Top Up Flazz" onBack={() => setScreen("input-pin")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-[#eef2ff] rounded-full" />
            <div className="absolute inset-4 bg-[#dbeafe] rounded-full animate-ping opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-[#2540c9]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Tempelkan Kartu Flazz</h2>
          <p className="text-slate-600 text-sm mb-2">Tempelkan kartu Flazz ke perangkat untuk mengisi saldo</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4 max-w-xs">
            <p className="text-amber-800 text-xs">
              Pastikan kartu tetap menempel hingga proses selesai
            </p>
          </div>
          <button
            onClick={() => {
              if (!nfcEnabled) {
                setScreen("nfc-disabled")
              } else {
                setScreen("processing")
              }
            }}
            className="mt-8 w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Scan Kartu
          </button>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Processing
  if (screen === "processing") {
    const steps = [
      "Menghubungkan ke kartu...",
      "Memproses pembayaran...",
      "Mengisi saldo kartu...",
      "Menyelesaikan transaksi...",
    ]

    return (
      <ScreenWrapper {...commonProps}>
        <Header title="Top Up Flazz" onBack={() => setScreen("write-card")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-[calc(100%-56px)]">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-[#2540c9] rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Nfc className="w-10 h-10 text-[#2540c9]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Memproses Top Up</h2>
          <p className="text-slate-600 text-sm mb-6">{steps[Math.min(processingStep, steps.length - 1)]}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-xs">
            <p className="text-amber-800 text-sm font-medium">
              Jangan lepaskan kartu dari perangkat hingga proses selesai
            </p>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Result Success
  if (screen === "result-success") {
    return (
      <ScreenWrapper {...commonProps}>
        <div className="bg-gradient-to-b from-green-500 to-green-600 pt-12 pb-8 px-6 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Top Up Berhasil</h2>
          <p className="opacity-90">Kartu Flazz BCA</p>
        </div>

        <div className="px-4 -mt-4 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <p className="text-slate-500 text-sm mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold text-slate-900">Rp{formatCurrency(getTotal())}</p>
            </div>
            <div className="space-y-3">
              <DetailRow label="Nomor Kartu" value={cardData.cardNumber} mono />
              <DetailRow label="Saldo Baru" value={`Rp${formatCurrency(cardData.balance + getNominal())}`} highlight />
              <DetailRow label="Nomor Referensi" value="TXN240510001234" mono />
              <DetailRow label="Tanggal & Waktu" value="10 Mei 2026, 14:30:45" />
              <div className="border-t border-slate-100 pt-3">
                <DetailRow label="Nominal Top Up" value={`Rp${formatCurrency(getNominal())}`} />
                <DetailRow label="Biaya Layanan" value={`Rp${formatCurrency(adminFee)}`} />
                <DetailRow label="Total Pembayaran" value={`Rp${formatCurrency(getTotal())}`} bold />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
            >
              Selesai
            </button>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform">
                <Share2 className="w-5 h-5" />
                Bagikan
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform">
                <MessageCircle className="w-5 h-5" />
                Hubungi CS
              </button>
            </div>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Result Failed
  if (screen === "result-failed") {
    return (
      <ScreenWrapper {...commonProps}>
        <div className="bg-gradient-to-b from-red-500 to-red-600 pt-12 pb-8 px-6 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Top Up Gagal</h2>
          <p className="opacity-90">Kartu Flazz BCA</p>
        </div>

        <div className="px-4 -mt-4 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <p className="text-slate-500 text-sm mb-1">Nominal Pembayaran</p>
              <p className="text-3xl font-bold text-slate-900">Rp{formatCurrency(getTotal())}</p>
            </div>
            <div className="space-y-3">
              <DetailRow label="Nomor Kartu" value={cardData.cardNumber} mono />
              <DetailRow label="Nomor Referensi" value="TXN240510001234" mono />
              <DetailRow label="Tanggal & Waktu" value="10 Mei 2026, 14:30:45" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setScreen("scan-card")}
              className="w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
            >
              Coba Lagi
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-slate-200 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform"
            >
              Selesai
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 text-[#2540c9] font-medium active:scale-[0.98] transition-transform">
              <MessageCircle className="w-5 h-5" />
              Hubungi CS Paydia
            </button>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Result Pending
  if (screen === "result-pending") {
    return (
      <ScreenWrapper {...commonProps}>
        <div className="bg-gradient-to-b from-amber-500 to-amber-600 pt-12 pb-8 px-6 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Top Up Pending</h2>
          <p className="opacity-90">Kartu Flazz BCA</p>
        </div>

        <div className="px-4 -mt-4 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
              <p className="text-amber-800 text-sm">
                Transaksi sedang diproses. Kami akan menginformasikan hasilnya segera.
              </p>
            </div>
            <div className="text-center pb-4 border-b border-slate-100">
              <p className="text-slate-500 text-sm mb-1">Nominal Pembayaran</p>
              <p className="text-3xl font-bold text-slate-900">Rp{formatCurrency(getTotal())}</p>
            </div>
            <div className="space-y-3">
              <DetailRow label="Nomor Kartu" value={cardData.cardNumber} mono />
              <DetailRow label="Nomor Referensi" value="TXN240510001234" mono />
              <DetailRow label="Tanggal & Waktu" value="10 Mei 2026, 14:30:45" />
              <div className="border-t border-slate-100 pt-3">
                <DetailRow label="Nominal Top Up" value={`Rp${formatCurrency(getNominal())}`} />
                <DetailRow label="Biaya Layanan" value={`Rp${formatCurrency(adminFee)}`} />
                <DetailRow label="Total Pembayaran" value={`Rp${formatCurrency(getTotal())}`} bold />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform">
              <RefreshCw className="w-5 h-5" />
              Refresh Status
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform">
              <MessageCircle className="w-5 h-5" />
              Hubungi CS Paydia
            </button>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  // Screen: Result Refund
  if (screen === "result-refund") {
    return (
      <ScreenWrapper {...commonProps}>
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-12 pb-8 px-6 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Dana Dikembalikan</h2>
          <p className="opacity-90">Kartu Flazz BCA</p>
        </div>

        <div className="px-4 -mt-4 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
              <p className="text-blue-800 text-sm">
                Dana telah dikembalikan ke saldo Paydia karena transaksi tidak dapat diproses.
              </p>
            </div>
            <div className="text-center pb-4 border-b border-slate-100">
              <p className="text-slate-500 text-sm mb-1">Nominal Dikembalikan</p>
              <p className="text-3xl font-bold text-slate-900">Rp{formatCurrency(getTotal())}</p>
            </div>
            <div className="space-y-3">
              <DetailRow label="Nomor Kartu" value={cardData.cardNumber} mono />
              <DetailRow label="Nomor Referensi" value="TXN240510001234" mono />
              <DetailRow label="Tanggal & Waktu" value="10 Mei 2026, 14:30:45" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
            >
              Selesai
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform">
              <MessageCircle className="w-5 h-5" />
              Hubungi CS Paydia
            </button>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  return null
}

// ─── Helper Components ────────────────────────────────────────────────────────

const RESULT_LABELS: Record<ResultView, string> = {
  success: "Berhasil",
  failed: "Gagal",
  pending: "Pending",
  refund: "Refund",
}

const RESULT_COLORS: Record<ResultView, string> = {
  success: "bg-green-500",
  failed: "bg-red-500",
  pending: "bg-amber-500",
  refund: "bg-blue-500",
}

function ScreenWrapper({
  children,
  hasNfc,
  nfcEnabled,
  onToggleHasNfc,
  onToggleNfcEnabled,
  failScan,
  onToggleFailScan,
  screen,
  showNotif,
  notifNode,
  isResultScreen,
  currentResultView,
  onSwitchResult,
  isConnected,
  onToggleConnection,
}: {
  children: React.ReactNode
  hasNfc?: boolean
  nfcEnabled?: boolean
  onToggleHasNfc?: () => void
  onToggleNfcEnabled?: () => void
  failScan?: boolean
  onToggleFailScan?: () => void
  screen?: string
  showNotif?: boolean
  notifNode?: React.ReactNode
  isResultScreen?: boolean
  currentResultView?: ResultView
  onSwitchResult?: (view: ResultView) => void
  isConnected?: boolean
  onToggleConnection?: () => void
}) {
  const showFailScanToggle =
    screen === "scanning" || screen === "scan-card" || screen === "writing-card" || screen === "write-card" || screen === "processing"

  return (
    <div className="fixed inset-0 bg-slate-200 z-50 flex items-start justify-center gap-4 py-4 px-4 overflow-auto">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[400px] bg-white shadow-2xl overflow-hidden min-h-[820px] rounded-[2.5rem] border-8 border-slate-900 flex flex-col flex-shrink-0">
        <div className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden">
          {/* Result state switcher — shown on all result screens */}
          {isResultScreen && onSwitchResult && (
            <div className="flex-shrink-0 flex gap-1.5 p-2 bg-white border-b border-slate-100">
              {(Object.keys(RESULT_LABELS) as ResultView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => onSwitchResult(view)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
                    currentResultView === view
                      ? `${RESULT_COLORS[view]} text-white shadow-sm`
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {RESULT_LABELS[view]}
                </button>
              ))}
            </div>
          )}

          {/* Scrollable content with notification overlay */}
          <div className="flex-1 overflow-auto relative">
            {showNotif && notifNode && (
              <div className="absolute top-2 left-2 right-2 z-10 animate-in slide-in-from-top duration-300">
                {notifNode}
              </div>
            )}
            {children}
          </div>

          {/* No Connection Modal */}
          {isConnected === false && (
            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center p-6">
              <div className="bg-white rounded-3xl w-full max-w-[340px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <div className="flex justify-end pt-4 pr-4">
                  <button
                    onClick={onToggleConnection}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center px-6 pb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-5 text-center leading-snug">
                    Ups, Terjadi Gangguan Koneksi Internet
                  </h2>

                  {/* Robot illustration */}
                  <div className="relative w-48 h-48 mb-5">
                    <Image
                      src="/no-connection-robot.png"
                      alt="Robot tidak terhubung"
                      fill
                      className="object-contain"
                      sizes="192px"
                    />
                  </div>

                  <p className="text-slate-500 text-center text-sm mb-6">
                    Aplikasi tidak dapat terhubung ke server. Mohon periksa jaringan Anda.
                  </p>

                  <button
                    onClick={onToggleConnection}
                    className="w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
                  >
                    Buka Pengaturan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Testing Controls — right side, desktop only */}
      {onToggleHasNfc && onToggleNfcEnabled && (
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4 space-y-4">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Testing Controls</p>

            {/* Device NFC Support */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasNfc ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-slate-700 text-sm">Device Support NFC</span>
              </div>
              <button
                onClick={onToggleHasNfc}
                className={`relative w-11 h-6 rounded-full transition-colors ${hasNfc ? "bg-green-500" : "bg-slate-300"}`}
                aria-label="Toggle NFC support"
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasNfc ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* NFC Enabled */}
            <div className={`flex items-center justify-between ${!hasNfc ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${nfcEnabled ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="text-slate-700 text-sm">NFC Aktif</span>
              </div>
              <button
                onClick={onToggleNfcEnabled}
                className={`relative w-11 h-6 rounded-full transition-colors ${nfcEnabled ? "bg-green-500" : "bg-slate-300"}`}
                aria-label="Toggle NFC enabled"
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${nfcEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* Fail Scan — on scan and processing screens */}
            {showFailScanToggle && onToggleFailScan && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${failScan ? "bg-red-500" : "bg-slate-300"}`} />
                  <span className="text-slate-700 text-sm">Gagalkan Scan</span>
                </div>
                <button
                  onClick={onToggleFailScan}
                  className={`relative w-11 h-6 rounded-full transition-colors ${failScan ? "bg-red-500" : "bg-slate-300"}`}
                  aria-label="Toggle fail scan"
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${failScan ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            )}

            {/* Koneksi toggle */}
            {onToggleConnection && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-slate-700 text-sm">Koneksi</span>
                </div>
                <button
                  onClick={onToggleConnection}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isConnected ? "bg-green-500" : "bg-slate-300"}`}
                  aria-label="Toggle koneksi"
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isConnected ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            )}

            {/* Result state switcher — shown in controls when on result screen */}
            {isResultScreen && onSwitchResult && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Tampilan Hasil</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(RESULT_LABELS) as ResultView[]).map((view) => (
                    <button
                      key={view}
                      onClick={() => onSwitchResult(view)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                        currentResultView === view
                          ? `${RESULT_COLORS[view]} text-white`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {RESULT_LABELS[view]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Header({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
}) {
  return (
    <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-slate-100">
      <button
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-slate-700" />
      </button>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </div>
  )
}

function CancelModal({
  onCancel,
  onContinue,
}: {
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="w-full max-w-[400px] bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Yakin Batalkan Top Up Flazz?</h3>
        <p className="text-slate-600 mb-6">
          Kamu mungkin harus scan ulang kartu Flazz mu dan memulai proses ulang dari awal.
        </p>
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-[#2540c9] text-white py-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Lanjut Top Up
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 border border-slate-200 rounded-xl text-slate-700 font-medium active:scale-[0.98] transition-transform"
          >
            Ya, Batalkan
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono,
  bold,
  highlight,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-sm">{label}</span>
      <span
        className={`text-sm text-right ${mono ? "font-mono" : ""} ${
          bold ? "font-bold text-slate-900" : "font-medium text-slate-900"
        } ${highlight ? "text-green-600 font-bold" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
