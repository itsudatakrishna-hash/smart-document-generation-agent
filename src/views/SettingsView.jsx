import React, { useState } from 'react'
import { Settings, HardDrive, Cloud, Mail, PenTool, Save, Check, Eye, EyeOff } from 'lucide-react'
import { defaultSettings } from '../data/mockData'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-800 bg-slate-900/70">
        <Icon size={15} className="text-violet-400" />
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 block mb-1">{label}</label>
      {hint && <p className="text-[10px] text-slate-600 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  )
}

export default function SettingsView() {
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Settings</span>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            saved
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-violet-600 text-white hover:bg-violet-500'
          }`}
        >
          {saved ? <><Check size={12} /> Saved!</> : <><Save size={12} /> Save Changes</>}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-4">

          {/* API */}
          <Section icon={Settings} title="Anthropic API">
            <Field label="API Key" hint="Used to power the document generation agent">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 pr-10"
                />
                <button onClick={() => setShowKey(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <Field label="Model">
              <select value="claude-sonnet-4-20250514" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500">
                <option value="claude-sonnet-4-20250514">claude-sonnet-4-20250514</option>
                <option value="claude-opus-4-20250514">claude-opus-4-20250514</option>
              </select>
            </Field>
          </Section>

          {/* Storage */}
          <Section icon={Cloud} title="Output Destinations">
            <Field label="Google Drive Folder" hint="Relative path inside your connected Drive">
              <input value={settings.driveFolder} onChange={e => update('driveFolder', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="S3 Bucket Name">
                <input value={settings.s3Bucket} onChange={e => update('s3Bucket', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500" />
              </Field>
              <Field label="S3 Region">
                <select value={settings.s3Region} onChange={e => update('s3Region', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500">
                  {['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Email */}
          <Section icon={Mail} title="Email Configuration">
            <div className="grid grid-cols-2 gap-3">
              <Field label="From Address">
                <input value={settings.defaultEmailFrom} onChange={e => update('defaultEmailFrom', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500" />
              </Field>
              <Field label="Default Recipient">
                <input value={settings.defaultEmailRecipient} onChange={e => update('defaultEmailRecipient', e.target.value)} placeholder="Optional" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500" />
              </Field>
            </div>
          </Section>

          {/* e-Signature */}
          <Section icon={PenTool} title="e-Signature Provider">
            <Field label="Provider">
              <select value={settings.signatureProvider} onChange={e => update('signatureProvider', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500">
                <option value="docusign">DocuSign</option>
                <option value="hellosign">HelloSign (Dropbox Sign)</option>
                <option value="adobe">Adobe Acrobat Sign</option>
              </select>
            </Field>
          </Section>

          {/* Automation */}
          <Section icon={HardDrive} title="Automation">
            {[
              { key: 'autoUploadDrive', label: 'Auto-upload to Google Drive', hint: 'After each successful generation' },
              { key: 'autoSendEmail',   label: 'Auto-send via email',         hint: 'Immediately after document is ready' },
              { key: 'autoRequestSignature', label: 'Auto-request e-signature', hint: 'For contracts and NDAs' },
            ].map(({ key, label, hint }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">{label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{hint}</p>
                </div>
                <Toggle checked={settings[key]} onChange={v => update(key, v)} />
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  )
}
