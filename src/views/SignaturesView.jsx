import React, { useState } from 'react'
import { PenTool, Send, Eye, CheckCircle2, Clock, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { signatures as initialSigs } from '../data/mockData'

const STATUS_STEPS = ['sent', 'viewed', 'signed']

const STATUS_CONFIG = {
  pending: { label: 'Awaiting',    color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock },
  viewed:  { label: 'Viewed',      color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: Eye },
  signed:  { label: 'Signed',      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  expired: { label: 'Expired',     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: AlertCircle },
}

function SignatureTimeline({ sig }) {
  const steps = [
    { key: 'sent',   label: 'Sent',   icon: Send,          timestamp: sig.sentAt },
    { key: 'viewed', label: 'Viewed', icon: Eye,           timestamp: sig.viewedAt },
    { key: 'signed', label: 'Signed', icon: CheckCircle2,  timestamp: sig.signedAt },
  ]
  const currentIdx = sig.status === 'signed' ? 2 : sig.status === 'viewed' ? 1 : 0

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i <= currentIdx
        const Icon = step.icon
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-violet-600/20 border-violet-500/50' : 'bg-slate-800 border-slate-700'}`}>
                <Icon size={13} className={done ? 'text-violet-400' : 'text-slate-600'} />
              </div>
              <p className={`text-[9px] mt-1 ${done ? 'text-slate-400' : 'text-slate-600'}`}>{step.label}</p>
              {step.timestamp && done && <p className="text-[8px] text-slate-600 mt-0.5 max-w-[70px] text-center leading-tight">{step.timestamp.slice(5, 16)}</p>}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${i < currentIdx ? 'bg-violet-500/40' : 'bg-slate-700'}`} style={{ minWidth: 24 }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default function SignaturesView() {
  const [signatures, setSignatures] = useState(initialSigs)

  const handleResend = (id) => {
    setSignatures(prev => prev.map(s => s.id === id ? { ...s, sentAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : s))
  }

  const stats = {
    total: signatures.length,
    signed: signatures.filter(s => s.status === 'signed').length,
    viewed: signatures.filter(s => s.status === 'viewed').length,
    pending: signatures.filter(s => s.status === 'pending').length,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <PenTool size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-slate-200">e-Signature Tracker</span>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Sent',  value: stats.total,   color: 'text-slate-300',    bg: 'bg-slate-800/60 border-slate-700' },
            { label: 'Pending',     value: stats.pending, color: 'text-amber-400',    bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Viewed',      value: stats.viewed,  color: 'text-blue-400',     bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Signed',      value: stats.signed,  color: 'text-emerald-400',  bg: 'bg-emerald-500/10 border-emerald-500/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Signature cards */}
        <div className="space-y-3">
          {signatures.map(sig => {
            const sc = STATUS_CONFIG[sig.status] || STATUS_CONFIG.pending
            const StatusIcon = sc.icon
            return (
              <div key={sig.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-200 truncate">{sig.documentName}</p>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.color} border ${sc.border}`}>
                        <StatusIcon size={8} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span>To: {sig.recipient}</span>
                      <span className="font-mono text-slate-600">#{sig.trackingId}</span>
                    </div>
                    <SignatureTimeline sig={sig} />
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200 transition-colors">
                      <ExternalLink size={10} /> View Doc
                    </button>
                    {sig.status !== 'signed' && (
                      <button onClick={() => handleResend(sig.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-violet-600/15 text-violet-400 border border-violet-500/25 hover:bg-violet-600/25 transition-colors">
                        <RefreshCw size={10} /> Resend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
