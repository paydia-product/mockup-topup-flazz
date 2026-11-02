"use client"

import { useState } from "react"
import { ChevronLeft, CreditCard, QrCode, Smartphone } from "lucide-react"

type NotifTab = "info" | "transaksi"

interface NotificationItem {
  id: string
  icon: "qris" | "flazz" | "pulsa"
  title: string
  description: string
  datetime: string
  unread?: boolean
  action?: string
}

const transactionNotifications: NotificationItem[] = [
  {
    id: "1",
    icon: "flazz",
    title: "Top Up Flazz Berhasil",
    description: "Transaksi Top Up kartu Flazz sebesar Rp50.000 berhasil",
    datetime: "08 May 2026 13:56:13",
    unread: true,
    action: "open-flazz-result",
  },
  {
    id: "2",
    icon: "qris",
    title: "Pembayaran QRIS Berhasil",
    description: "Transaksi pembayaran QRIS di Musholla Al-Ikhlas sebesar Rp1 berhasil",
    datetime: "08 May 2026 13:55:58",
  },
  {
    id: "3",
    icon: "qris",
    title: "Pembayaran QRIS Berhasil",
    description: "Transaksi pembayaran QRIS di Musholla Al-Ikhlas sebesar Rp1 berhasil",
    datetime: "08 May 2026 13:54:03",
  },
  {
    id: "4",
    icon: "qris",
    title: "Pembayaran QRIS Berhasil",
    description: "Transaksi pembayaran QRIS di Musholla Al-Ikhlas sebesar Rp1 berhasil",
    datetime: "08 May 2026 13:51:36",
  },
  {
    id: "5",
    icon: "qris",
    title: "Pembayaran QRIS Berhasil",
    description: "Transaksi pembayaran QRIS di Musholla Al-Ikhlas sebesar Rp1 berhasil",
    datetime: "08 May 2026 11:44:01",
  },
  {
    id: "6",
    icon: "qris",
    title: "Pembayaran QRIS Berhasil",
    description: "Transaksi pembayaran QRIS di NUR HOLIS, Makanan & Minu sebesar Rp5.000 berhasil",
    datetime: "07 May 2026 18:35:53",
  },
  {
    id: "7",
    icon: "pulsa",
    title: "Pembayaran Pulsa Berhasil",
    description: "Transaksi pembelian pulsa sebesar Rp6.500 berhasil",
    datetime: "07 May 2026 16:18:16",
  },
]

const infoNotifications: NotificationItem[] = [
  {
    id: "i1",
    icon: "qris",
    title: "Promo Cashback QRIS",
    description: "Dapatkan cashback 10% untuk setiap transaksi QRIS hingga akhir bulan",
    datetime: "08 May 2026 09:00:00",
    unread: true,
  },
  {
    id: "i2",
    icon: "flazz",
    title: "Fitur Baru: Top Up Flazz",
    description: "Kini kamu bisa top up kartu Flazz langsung dari aplikasi Paydia",
    datetime: "07 May 2026 10:00:00",
    unread: true,
  },
]

function NotifIcon({ type }: { type: "qris" | "flazz" | "pulsa" }) {
  const iconMap = {
    qris: QrCode,
    flazz: CreditCard,
    pulsa: Smartphone,
  }
  const Icon = iconMap[type]

  return (
    <div className="w-10 h-10 bg-[#2540c9] rounded-full flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
    </div>
  )
}

export default function Notifications({
  onBack,
  onOpenFlazzResult,
}: {
  onBack: () => void
  onOpenFlazzResult?: () => void
}) {
  const [activeTab, setActiveTab] = useState<NotifTab>("transaksi")

  const notifications = activeTab === "transaksi" ? transactionNotifications : infoNotifications
  const hasUnreadInfo = infoNotifications.some((n) => n.unread)
  const hasUnreadTransaksi = transactionNotifications.some((n) => n.unread)

  const handleNotifClick = (notif: NotificationItem) => {
    if (notif.action === "open-flazz-result" && onOpenFlazzResult) {
      onOpenFlazzResult()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-200 z-50 flex items-start justify-center py-4 px-4 overflow-auto">
      <div className="relative w-full max-w-[400px] bg-white shadow-2xl overflow-hidden min-h-[820px] rounded-[2.5rem] border-8 border-slate-900 flex flex-col flex-shrink-0">
        <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
          {/* Header */}
          <div className="bg-white px-4 py-4 flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Notifikasi</h1>
          </div>

          {/* Tab Switcher */}
          <div className="px-4 pb-3">
            <div className="bg-slate-100 rounded-full p-1 flex">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all relative ${
                  activeTab === "info"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Info
                {hasUnreadInfo && (
                  <span className="absolute top-1.5 right-[calc(50%-24px)] w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("transaksi")}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all relative ${
                  activeTab === "transaksi"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Transaksi
                {hasUnreadTransaksi && (
                  <span className="absolute top-1.5 right-[calc(50%-40px)] w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-auto">
            {notifications.map((notif, index) => (
              <div key={notif.id}>
                <button
                  className={`w-full text-left px-5 py-4 flex items-start gap-3.5 transition-colors ${
                    notif.action ? "active:bg-slate-50 cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <NotifIcon type={notif.icon} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#2540c9] font-semibold text-sm leading-snug">
                      {notif.title}
                    </h3>
                    <p className="text-slate-700 text-sm mt-0.5 leading-snug">
                      {notif.description}
                    </p>
                    <p className="text-[#2540c9] text-xs mt-1.5 opacity-70">
                      {notif.datetime}
                    </p>
                  </div>
                </button>
                {index < notifications.length - 1 && (
                  <div className="mx-5 border-b border-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
