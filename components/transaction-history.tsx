"use client"

import { Check, X, Clock, RefreshCw, SlidersHorizontal, CreditCard } from "lucide-react"

type TxStatus = "success" | "failed" | "pending" | "refund"

interface Transaction {
  id: string
  title: string
  subtitle: string
  amount: number
  datetime: string
  status: TxStatus
  type?: "flazz" | "qris" | "pulsa" | "transfer"
}

const transactions: Transaction[] = [
  // Top Up Flazz entries
  {
    id: "f1",
    title: "Top Up Flazz",
    subtitle: "Kartu Flazz BCA",
    amount: -50000,
    datetime: "08 Mei 2026, 13:56:13",
    status: "success",
    type: "flazz",
  },
  {
    id: "f2",
    title: "Top Up Flazz",
    subtitle: "Kartu Flazz BCA",
    amount: 20000,
    datetime: "08 Mei 2026, 13:00:01",
    status: "failed",
    type: "flazz",
  },
  {
    id: "f3",
    title: "Top Up Flazz",
    subtitle: "Kartu Flazz BCA",
    amount: 20000,
    datetime: "08 Mei 2026, 12:45:30",
    status: "pending",
    type: "flazz",
  },
  {
    id: "f4",
    title: "Top Up Flazz",
    subtitle: "Kartu Flazz BCA",
    amount: 20000,
    datetime: "08 Mei 2026, 12:30:00",
    status: "refund",
    type: "flazz",
  },
  // QRIS entries
  {
    id: "q1",
    title: "Pembayaran",
    subtitle: "Musholla Al-Ikhlas",
    amount: -1,
    datetime: "08 Mei 2026, 13:56 WIB",
    status: "success",
    type: "qris",
  },
  {
    id: "q2",
    title: "Pembayaran",
    subtitle: "Musholla Al-Ikhlas",
    amount: -1,
    datetime: "08 Mei 2026, 13:55 WIB",
    status: "success",
    type: "qris",
  },
  {
    id: "q3",
    title: "Pembayaran",
    subtitle: "Musholla Al-Ikhlas",
    amount: -1,
    datetime: "08 Mei 2026, 13:54 WIB",
    status: "success",
    type: "qris",
  },
  {
    id: "q4",
    title: "Pembayaran",
    subtitle: "Musholla Al-Ikhlas",
    amount: -1,
    datetime: "08 Mei 2026, 13:51 WIB",
    status: "success",
    type: "qris",
  },
  {
    id: "q5",
    title: "Pembayaran",
    subtitle: "Musholla Al-Ikhlas",
    amount: -1,
    datetime: "08 Mei 2026, 11:44 WIB",
    status: "success",
    type: "qris",
  },
  {
    id: "q6",
    title: "Pembayaran",
    subtitle: "NUR HOLIS, Makanan & Minu",
    amount: -5000,
    datetime: "07 Mei 2026, 18:35 WIB",
    status: "success",
    type: "qris",
  },
  {
    id: "d1",
    title: "Transaksi Digital",
    subtitle: "Pulsa",
    amount: -6500,
    datetime: "07 Mei 2026, 16:18 WIB",
    status: "success",
    type: "pulsa",
  },
  {
    id: "t1",
    title: "Top Up Transfer Bank",
    subtitle: "BCA",
    amount: 20066,
    datetime: "07 Mei 2026, 12:36 WIB",
    status: "success",
    type: "transfer",
  },
  {
    id: "t2",
    title: "Top Up Transfer Bank",
    subtitle: "BCA",
    amount: 12020,
    datetime: "07 Mei 2026, 12:19 WIB",
    status: "success",
    type: "transfer",
  },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.abs(amount))
}

function StatusIcon({ status }: { status: TxStatus }) {
  switch (status) {
    case "success":
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4.5 h-4.5 text-white" strokeWidth={3} />
        </div>
      )
    case "failed":
      return (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <X className="w-4.5 h-4.5 text-white" strokeWidth={3} />
        </div>
      )
    case "pending":
      return (
        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Clock className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
      )
    case "refund":
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
      )
  }
}

function getAmountDisplay(tx: Transaction) {
  const formatted = `Rp${formatCurrency(tx.amount)}`

  switch (tx.status) {
    case "success": {
      // Debit (negative) = red with minus, Credit (positive like transfer/refund) = green with plus
      if (tx.amount < 0) {
        return { text: `-${formatted}`, color: "text-red-500" }
      }
      return { text: `+${formatted}`, color: "text-green-600" }
    }
    case "failed":
      return { text: formatted, color: "text-slate-900" }
    case "pending":
      return { text: formatted, color: "text-slate-900" }
    case "refund":
      return { text: `+${formatted}`, color: "text-green-600" }
    default:
      return { text: formatted, color: "text-slate-900" }
  }
}

export default function TransactionHistory({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Riwayat Transaksi</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all">
          <SlidersHorizontal className="w-5 h-5 text-slate-600" strokeWidth={2} />
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Month header */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-slate-900 font-semibold text-sm">Mei 2026</p>
          </div>

          {/* Entries */}
          {transactions.map((tx, index) => {
            const amountDisplay = getAmountDisplay(tx)
            return (
              <div key={tx.id}>
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <StatusIcon status={tx.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-medium leading-snug">{tx.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{tx.subtitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${amountDisplay.color}`}>
                      {amountDisplay.text}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{tx.datetime}</p>
                  </div>
                </div>
                {index < transactions.length - 1 && (
                  <div className="mx-4 border-b border-slate-50" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
