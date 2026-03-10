import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeOutlined, 
  MessageOutlined, 
  RobotOutlined, 
  AppstoreOutlined, 
  SettingOutlined,
  DashboardOutlined,
  CodeOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useStatusStore } from '../stores/statusStore'
import './Sidebar.css'

interface NavItem {
  path: string
  icon: React.ReactNode
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: <HomeOutlined />, label: '主页' },
  { path: '/status', icon: <DashboardOutlined />, label: '状态监控' },
  { path: '/chat', icon: <MessageOutlined />, label: '对话' },
  { path: '/agents', icon: <RobotOutlined />, label: '分身管理' },
  { path: '/skills', icon: <AppstoreOutlined />, label: '技能库' },
  { path: '/developer', icon: <CodeOutlined />, label: '开发者' },
  { path: '/logs', icon: <FileTextOutlined />, label: '日志' },
  { path: '/settings', icon: <SettingOutlined />, label: '设置' },
]

const Sidebar: React.FC = () => {
  const { systemStatus } = useStatusStore()

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className={`status-dot ${systemStatus.gatewayConnected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">
            {systemStatus.gatewayConnected ? '已连接' : '未连接'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
