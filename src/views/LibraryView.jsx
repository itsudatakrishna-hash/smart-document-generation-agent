import React, { useState } from 'react'
import { Library, Search, Download, ExternalLink, FileText, Shield, Briefcase, BarChart2, ChevronDown } from 'lucide-react'
import { documents } from '../data/mockData'

const TYPE_CONFIG = {
  invoice:  { icon: FileText,  label: 'Invoice',   color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  nda:      { icon: Shield,    label: 'NDA',        color: 'text-violet-400', bg: 'bg-violet-500/10' },
  proposal: { icon: Briefcase, label: 'Proposal',   color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  report:   { icon: BarChart2, label: 'Report',     color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
}

const STATUS_CONFIG = {
  generated: { label: 'Generated', classes: 'bg-slate-700 text-slate-300' },
  sent:      { label: 'Sent',      classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  signed:    { label: 'Signed',    classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
}

const SIG_CONFIG = {
  not_required: { label: '—',             classes: 'text-slate-600' },
  pending:      { label: 'Awaiting',      classes: 'text-amber-400' },
  viewed:       { label: 'Viewed',        classes: 'text-blue-400' },
  signed:       { label: 'Signed',        classes: 'text-emerald-400' },
}

export default function LibraryView() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const filtered = documents
    .filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.client.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || d.type === filterType
      return matchSearch && matchType
    })
    .sort((a, b) => {
      const va = a[sortField] || ''
      const vb = b[sortField] || ''
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const SortIcon = ({ field }) => (
    <ChevronDown
      size={11}
      className={`inline ml-0.5 transition-transform ${sortField === field && sortDir === 'asc' ? 'rotate-180' : ''} ${sortField === field ? 'text-violet-400' : 'text-slate-600'}`}
    />
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <Library size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Document Library</span>
          <span className="text-[10px] bg-violet-500/20 text-violet-400 rounded-full px-1.5 py-0.5 ml-1">{documents.length} docs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 w-52" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
            <option value="all">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => handleSort('name')}>
                Name <SortIcon field="name" />
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => handleSort('client')}>
                Client <SortIcon field="client" />
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300" onClick={() => handleSort('createdAt')}>
                Date <SortIcon field="createdAt" />
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Size</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">e-Sig</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map(doc => {
              const tc = TYPE_CONFIG[doc.type]
              const sc = STATUS_CONFIG[doc.status] || STATUS_CONFIG.generated
              const sigc = SIG_CONFIG[doc.signatureStatus] || SIG_CONFIG.not_required
              const Icon = tc?.icon || FileText
              return (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tc?.bg}`}>
                      <Icon size={13} className={tc?.color} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-200 max-w-[240px] truncate">{doc.name}</p>
                    {doc.amount && <p className="text-xs text-slate-500 mt-0.5">{doc.amount}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{doc.client}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{doc.createdAt}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{doc.fileSize}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.classes}`}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${sigc.classes}`}>{sigc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-violet-600/15 text-violet-400 border border-violet-500/25 hover:bg-violet-600/25 transition-colors">
                        <Download size={10} /> PDF
                      </button>
                      {doc.driveUrl && (
                        <button className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors">
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <Library size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No documents match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
