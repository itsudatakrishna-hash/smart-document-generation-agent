import React from 'react'
import { FilePlus, Library, LayoutTemplate, PenTool, Settings, Bot, ChevronRight } from 'lucide-react'

const navItems = [
  { id: 'generate',   label: 'Generate',       icon: FilePlus,       badge: null },
  { id: 'library',    label: 'Document Library', icon: Library,       badge: null },
  { id: 'templates',  label: 'Templates',      icon: LayoutTemplate,  badge: null },
  { id: 'signatures', label: 'e-Signatures',   icon: PenTool,         badge: 2 },
  { id: 'settings',   label: 'Settings',       icon: Settings,        badge: null },
]

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100 leading-none">DocuAgent</p>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Document Generation</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2 py-2">Workspace</p>
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-violet-600/20 text-violet-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={15} className={active ? 'text-violet-400' : 'text-slate-500'} />
                {label}
              </span>
              {badge && (
                <span className="text-[10px] font-semibold bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {badge}
                </span>
              )}
              {active && !badge && <ChevronRight size={12} className="text-violet-500" />}
            </button>
          )
        })}
      </nav>

      {/* Agent status */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-lg p-2.5 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Agent Ready</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">claude-sonnet-4-6 · 6 tools active</p>
        </div>
      </div>
    </aside>
  )
}
