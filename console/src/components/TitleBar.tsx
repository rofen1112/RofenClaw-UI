import React from 'react'
import { Button, Tooltip, message } from 'antd'
import { 
  MinusOutlined, 
  BorderOutlined, 
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons'
import './TitleBar.css'

const TitleBar: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isElectron, setIsElectron] = React.useState(false)

  React.useEffect(() => {
    setIsElectron(!!window.electronAPI)
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow()
    } else {
      message.info('浏览器模式下无法最小化窗口')
    }
  }

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow()
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow()
    } else {
      if (confirm('确定要关闭页面吗？')) {
        window.close()
      }
    }
  }

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <div className="title-bar-logo">
          <span className="logo-icon">🦁</span>
          <span className="logo-text">RofenClaw</span>
        </div>
      </div>
      
      <div className="title-bar-center">
        <span className="title-bar-title">控制台</span>
        {!isElectron && <span className="browser-mode-tag">浏览器预览</span>}
      </div>
      
      <div className="title-bar-right">
        <div className="title-bar-controls">
          <Tooltip title={isElectron ? '最小化' : '浏览器模式不支持'}>
            <Button 
              type="text" 
              size="small"
              className={`title-bar-btn ${!isElectron ? 'disabled-btn' : ''}`}
              onClick={handleMinimize}
              icon={<MinusOutlined />}
              disabled={!isElectron}
            />
          </Tooltip>
          <Tooltip title={isElectron ? '最大化' : (isFullscreen ? '退出全屏' : '全屏')}>
            <Button 
              type="text" 
              size="small"
              className="title-bar-btn"
              onClick={handleMaximize}
              icon={isElectron ? <BorderOutlined /> : (isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />)}
            />
          </Tooltip>
          <Tooltip title={isElectron ? '关闭' : '关闭页面'}>
            <Button 
              type="text" 
              size="small"
              className="title-bar-btn close-btn"
              onClick={handleClose}
              icon={<CloseOutlined />}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default TitleBar
