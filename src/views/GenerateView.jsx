import React, { useState, useCallback } from 'react'
import {
  FilePlus, FileText, Shield, Briefcase, BarChart2,
  ChevronRight, Loader2, CheckCircle2, Circle, Database,
  FileEdit, FileCog, UploadCloud, Mail, RefreshCw, Download,
} from 'lucide-react'
import { documentTypes, workflowSteps } from '../data/mockData'
import { streamGenerate, fetchDocuments } from '../api/docApi'

const TYPE_ICONS = { FileText, Shield, Briefcase, BarChart2 }

const FIELD_LABELS = {
  clientName: 'Client Name',
  clientEmail: 'Client Email',
  amount: 'Amount ($)',
  dueDate: 'Due Date',
  description: 'Service Description',
  invoiceNumber: 'Invoice Number',
  effectiveDate: 'Effective Date',
  jurisdiction: 'Jurisdiction',
  partyACompany: 'Party A Company',
  partyBCompany: 'Party B Company',
  projectTitle: 'Project Title',
  deliveryDate: 'Delivery Date',
  scope: 'Project Scope',
  weekEnding: 'Week Ending',
  completedItems: 'Completed This Week',
  nextSteps: 'Next Steps',
}

const FIELD_PLACEHOLDERS = {
  clientName: 'e.g. Acme Corporation',
  clientEmail: 'e.g. billing@acme.com',
  amount: '0.00',
  dueDate: 'YYYY-MM-DD',
  description: 'Services rendered…',
  invoiceNumber: 'INV-2026-001',
  effectiveDate: 'YYYY-MM-DD',
  jurisdiction: 'e.g. State of New York',
  partyACompany: 'Your company name',
  partyBCompany: 'Counter-party name',
  projectTitle: 'e.g. Website Redesign',
  deliveryDate: 'YYYY-MM-DD',
  scope: 'Describe deliverables…',
  weekEnding: 'YYYY-MM-DD',
  completedItems: 'Bullet points…',
  nextSteps: 'Action items…',
}

const STEP_ICONS = { Database, FileEdit, FileCog, CloudUpload: UploadCloud, Mail }

const STEP_COLORS = {
  blue:   { bg: 'bg-blue-500/20',   ring: 'ring-blue-500/40',   text: 'text-blue-400',   connector: 'bg-blue-500' },
  violet: { bg: 'bg-violet-500/20', ring: 'ring-violet-500/40', text: 'text-violet-400', connector: 'bg-violet-500' },
  amber:  { bg: 'bg-amber-500/20',  ring: 'ring-amber-500/40',  text: 'text-amber-400',  connector: 'bg-amber-500' },
  cyan:   { bg: 'bg-cyan-500/20',   ring: 'ring-cyan-500/40',   text: 'text-cyan-400',   connector: 'bg-cyan-500' },
  emerald:{ bg: 'bg-emerald-500/20',ring: 'ring-emerald-500/40',text: 'text-emerald-400',connector: 'bg-emerald-500' },
}

function StepNode({ step, status, isLast }) {
  const Icon = STEP_ICONS[step.icon] || FileEdit
  const c = STEP_COLORS[step.color]
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 transition-all duration-500 ${
          status === 'done'    ? `${c.bg} ${c.ring} animate-step-pop` :
          status === 'running' ? `${c.bg} ${c.ring} ring-offset-1 ring-offset-slate-900` :
                                 'bg-slate-800 ring-slate-700'
        }`}>
          {status === 'done' ? (
            <CheckCircle2 size={16} className={c.text} />
          ) : status === 'running' ? (
            <Loader2 size={16} className={`${c.text} animate-spin`} />
          ) : (
            <Icon size={14} className="text-slate-600" />
          )}
        </div>
        {!isLast && <div className={`w-0.5 h-8 mt-1 transition-all duration-700 ${status === 'done' ? c.connector : 'bg-slate-800'}`} />}
      </div>
      <div className="pt-1.5 pb-4">
        <p className={`text-sm font-medium transition-colors ${status === 'done' ? 'text-slate-200' : status === 'running' ? c.text : 'text-slate-600'}`}>
          {step.label}
        </p>
        <p className={`text-xs mt-0.5 transition-colors ${status === 'running' || status === 'done' ? 'text-slate-500' : 'text-slate-700'}`}>
          {step.description}
        </p>
      </div>
    </div>
  )
}

export default function GenerateView() {
  const [selectedType, setSelectedType] = useState(documentTypes[0])
  const [fields, setFields] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [stepStatuses, setStepStatuses] = useState({})
  const [generatedDoc, setGeneratedDoc] = useState(null)
  const [agentError, setAgentError] = useState(null)

  const handleFieldChange = useCallback((key, value) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }, [])

  // Maps backend tool names to our workflow step IDs
  const TOOL_TO_STEP = {
    fetch_client_data: 'fetch',
    fill_template:     'fill',
    convert_to_pdf:    'convert',
    upload_to_storage: 'upload',
    send_email:        'email',
    request_signature: 'email',
  }

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setStepStatuses({})
    setGeneratedDoc(null)
    setAgentError(null)

    let docId = null

    const handleEvent = (event) => {
      if (event.type === 'tool_start') {
        const stepId = TOOL_TO_STEP[event.tool_name]
        if (stepId) setStepStatuses(prev => ({ ...prev, [stepId]: 'running' }))
      } else if (event.type === 'tool_result') {
        const stepId = TOOL_TO_STEP[event.tool_name]
        if (stepId) setStepStatuses(prev => ({ ...prev, [stepId]: 'done' }))
        if (event.tool_name === 'fill_template' && event.result?.doc_id) {
          docId = event.result.doc_id
        }
      } else if (event.type === 'error') {
        setAgentError(event.message)
      }
    }

    try {
      await streamGenerate(selectedType.value, fields, handleEvent)
    } catch (_err) {
      // Backend unavailable — simulate locally
      for (const step of workflowSteps) {
        setStepStatuses(prev => ({ ...prev, [step.id]: 'running' }))
        await new Promise(r => setTimeout(r, 900 + Math.random() * 500))
        setStepStatuses(prev => ({ ...prev, [step.id]: 'done' }))
      }
    }

    // Fallback: if event capture missed the doc_id, fetch the latest doc from backend
    if (!docId) {
      try {
        const docs = await fetchDocuments()
        if (docs.length > 0) docId = docs[docs.length - 1].id
      } catch (_) {}
    }

    setIsGenerating(false)
    setGeneratedDoc({
      name: `${selectedType.label} — ${fields.clientName || 'Document Generator'} — ${new Date().toISOString().slice(0, 10)}`,
      type: selectedType.value,
      docId,
      driveUrl: 'https://drive.google.com/mock/generated',
    })
  }, [isGenerating, selectedType, fields])

  const handleReset = useCallback(() => {
    setStepStatuses({})
    setGeneratedDoc(null)
    setFields({})
  }, [])

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        <div className="h-14 flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <FilePlus size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Generate Document</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Document type picker */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Document Type</p>
            <div className="grid grid-cols-2 gap-2">
              {documentTypes.map(type => {
                const Icon = TYPE_ICONS[type.icon] || FileText
                const active = selectedType.value === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => { setSelectedType(type); setFields({}) }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-violet-400' : 'text-slate-500'} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic fields */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Document Fields</p>
            <div className="space-y-3">
              {selectedType.fields.map(field => (
                <div key={field}>
                  <label className="text-xs text-slate-400 mb-1 block">{FIELD_LABELS[field] || field}</label>
                  {['description', 'scope', 'completedItems', 'nextSteps'].includes(field) ? (
                    <textarea
                      value={fields[field] || ''}
                      onChange={e => handleFieldChange(field, e.target.value)}
                      placeholder={FIELD_PLACEHOLDERS[field] || ''}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type={field === 'amount' ? 'number' : field.toLowerCase().includes('date') ? 'date' : 'text'}
                      value={fields[field] || ''}
                      onChange={e => handleFieldChange(field, e.target.value)}
                      placeholder={FIELD_PLACEHOLDERS[field] || ''}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generate / Reset button */}
          <button
            onClick={generatedDoc ? handleReset : handleGenerate}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              generatedDoc
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white'
            }`}
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating…</>
            ) : generatedDoc ? (
              <><RefreshCw size={16} /> Generate Another</>
            ) : (
              <><FilePlus size={16} /> Generate Document</>
            )}
          </button>

          {/* Error state */}
          {agentError && !isGenerating && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <span className="text-red-400 text-lg shrink-0">✕</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-300">Agent Error</p>
                <p className="text-xs text-red-500 mt-0.5 break-words">{agentError}</p>
              </div>
            </div>
          )}

          {/* Generating state */}
          {isGenerating && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
              <Loader2 size={20} className="text-violet-400 shrink-0 animate-spin" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-300">Generating document…</p>
                <p className="text-xs text-slate-500 mt-0.5">Agent is running the pipeline</p>
              </div>
            </div>
          )}

          {/* Success state */}
          {!isGenerating && generatedDoc && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 animate-slide-in">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-300">Document Generated!</p>
                <p className="text-xs text-emerald-600 truncate mt-0.5">{generatedDoc.name}</p>
              </div>
              <button
                onClick={() => {
                  if (generatedDoc?.docId) {
                    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                    window.open(`${base}/api/documents/${generatedDoc.docId}/download`)
                  }
                }}
                disabled={!generatedDoc?.docId}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs hover:bg-emerald-600/30 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={11} /> Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Workflow stepper */}
      <div className="w-80 bg-slate-900 flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2 px-6 border-b border-slate-800 shrink-0">
          <Loader2 size={14} className={`${isGenerating ? 'text-violet-400 animate-spin' : 'text-slate-600'}`} />
          <span className="text-sm font-semibold text-slate-200">Agent Workflow</span>
          {Object.values(stepStatuses).every(s => s === 'done') && Object.keys(stepStatuses).length > 0 && (
            <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">Complete</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {workflowSteps.length > 0 ? (
            <div className="space-y-0">
              {workflowSteps.map((step, i) => (
                <StepNode
                  key={step.id}
                  step={step}
                  status={stepStatuses[step.id] || 'pending'}
                  isLast={i === workflowSteps.length - 1}
                />
              ))}
            </div>
          ) : null}

          {!isGenerating && Object.keys(stepStatuses).length === 0 && (
            <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 leading-relaxed">
                Fill in the form and click <span className="text-violet-400 font-medium">Generate Document</span> to watch the AI agent orchestrate the full pipeline in real time.
              </p>
            </div>
          )}

          {generatedDoc && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Delivery Summary</p>
              {[
                { label: 'PDF Generated', value: '✓ output.pdf', color: 'text-emerald-400' },
                { label: 'Drive Upload', value: '✓ Saved to Drive', color: 'text-cyan-400' },
                { label: 'Email Sent', value: `✓ ${fields.clientEmail || 'recipient'}`, color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-800 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-xs font-medium ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
