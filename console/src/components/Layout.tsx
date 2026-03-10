import React from 'react'
import { Outlet } from 'react-router-dom'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import { useThemeStore } from '../stores/themeStore'
import './Layout.css'

const Layout: React.FC = () => {
  const { theme } = useThemeStore()

  return (
    <div className={`layout layout-${theme}`}>
      <TitleBar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
