import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import Layout from './components/Layout'
import Home from './views/Home'
import Chat from './views/Chat'
import Agents from './views/Agents'
import Skills from './views/Skills'
import Settings from './views/Settings'
import Status from './views/Status'
import Developer from './views/Developer'
import Logs from './views/Logs'
import './styles/global.css'

const App: React.FC = () => {
  const { theme } = useThemeStore()
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    setIsElectron(!!window.electronAPI)
  }, [])

  return (
    <div className={`app-${theme} ${isElectron ? 'electron-mode' : 'browser-mode'}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chat" element={<Chat />} />
            <Route path="agents" element={<Agents />} />
            <Route path="skills" element={<Skills />} />
            <Route path="settings" element={<Settings />} />
            <Route path="status" element={<Status />} />
            <Route path="developer" element={<Developer />} />
            <Route path="logs" element={<Logs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
