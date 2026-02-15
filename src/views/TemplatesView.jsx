import React, { useState, useRef } from 'react'
import { LayoutTemplate, Upload, FileText, Shield, Briefcase, BarChart2, Tag, Plus, X, Check } from 'lucide-react'
import { templates as initialTemplates } from '../data/mockData'

const TYPE_CONFIG = {
  invoice:  { icon: FileText,  label: 'Invoice',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  nda:      { icon: Shield,    label: 'NDA',        color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  proposal: { icon: Briefcase, label: 'Proposal',   color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  report:   { icon: BarChart2, label: 'Report',     color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
}

function TemplateCard({ template, onSelect, selected }) {
  const tc = TYPE_CONFIG[template.type] || TYPE_CONFIG.invoice
  const Icon = tc.icon
  return (
    <div
      onClick={() => onSelect(template)}
      className={`relative bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-slate-600 ${selected ? 'border-violet-500/50 ring-1 ring-violet-500/30' : 'border-slate-800'}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
          <Check size={11} className="text-white" />
        </div>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tc.bg} border ${tc.border} mb-3`}>
        <Icon size={18} className={tc.color} />
      </div>
      <p className="text-sm font-semibold text-slate-200 mb-1">{template.name}</p>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{tc.label}</span>
        <span className="text-[10px] text-slate-600 font-mono">.{template.extension}</span>
        <span className="text-[10px] text-slate-600">{template.size}</span>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">Variables: {template.variables.length}</p>
      <div className="flex flex-wrap gap-1">
        {template.variables.slice(0, 3).map(v => (
          <span key={v} className="text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded px-1.5 py-0.5">{v}</span>
        ))}
        {template.variables.length > 3 && (
          <span className="text-[9px] text-slate-600">+{template.variables.length - 3}</span>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">Used {template.usageCount}×</span>
        <span className="text-[10px] text-slate-600">Modified {template.lastModified}</span>
      </div>
    </div>
  )
}

export default function TemplatesView() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [selected, setSelected] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const fileRef = useRef(null)

  const filtered = filterType === 'all' ? templates : templates.filter(t => t.type === filterType)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await new Promise(r => setTimeout(r, 1400))
    const newTemplate = {
      id: `tpl-00${templates.length + 1}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      type: 'invoice',
      extension: file.name.split('.').pop() || 'docx',
      size: `${Math.round(file.size / 1024)} KB`,
      lastModified: new Date().toISOString().slice(0, 10),
      variables: ['{{client_name}}', '{{amount}}', '{{date}}'],
      usageCount: 0,
    }
    setTemplates(prev => [...prev, newTemplate])
    setUploading(false)
    setUploadDone(true)
    setTimeout(() => setUploadDone(false), 2500)
    e.target.value = ''
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <LayoutTemplate size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Template Manager</span>
          <span className="text-[10px] bg-slate-700 text-slate-400 rounded-full px-1.5 py-0.5 ml-1">{templates.length} templates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button onClick={() => setFilterType('all')} className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filterType === 'all' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>All</button>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <button key={k} onClick={() => setFilterType(k)} className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filterType === k ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>{v.label}</button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept=".docx,.xlsx" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              uploadDone
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                : 'bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600/30'
            }`}
          >
            {uploading ? <><X size={12} className="animate-spin" /> Uploading…</> : uploadDone ? <><Check size={12} /> Uploaded!</> : <><Upload size={12} /> Upload Template</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(tpl => (
            <TemplateCard key={tpl.id} template={tpl} onSelect={t => setSelected(selected?.id === t.id ? null : t)} selected={selected?.id === tpl.id} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <LayoutTemplate size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No templates for this type</p>
          </div>
        )}
      </div>

      {/* Selected detail bar */}
      {selected && (
        <div className="border-t border-slate-800 bg-slate-900 p-4 flex items-center gap-6 animate-slide-in">
          <div>
            <p className="text-sm font-semibold text-slate-200">{selected.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{selected.extension.toUpperCase()} · {selected.size} · {selected.usageCount} uses</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.variables.map(v => (
              <span key={v} className="text-[10px] font-mono bg-slate-800 text-violet-400 border border-violet-500/20 rounded px-1.5 py-0.5">{v}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button className="px-3 py-1.5 rounded-lg text-xs bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 transition-colors">Use Template</button>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"><X size={14} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
