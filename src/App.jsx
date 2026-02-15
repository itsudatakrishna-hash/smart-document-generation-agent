import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import GenerateView from './views/GenerateView'
import LibraryView from './views/LibraryView'
import TemplatesView from './views/TemplatesView'
import SignaturesView from './views/SignaturesView'
import SettingsView from './views/SettingsView'

const VIEWS = { generate: GenerateView, library: LibraryView, templates: TemplatesView, signatures: SignaturesView, settings: SettingsView }

export default function App() {
  const [activeView, setActiveView] = useState('generate')
  const ActiveView = VIEWS[activeView] || GenerateView

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-hidden">
        <ActiveView onNavigate={setActiveView} />
      </main>
    </div>
  )
}
