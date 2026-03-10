import React, { useEffect, useRef } from 'react'
import { Card, Badge, Progress, Tag, Button } from 'antd'
import { 
  SyncOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CloudServerOutlined,
  RobotOutlined,
  MessageOutlined,
  SearchOutlined,
  FileTextOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { useStatusStore, Activity } from '../stores/statusStore'
import './Status.css'

const Status: React.FC = () => {
  const { 
    systemStatus, 
    activities, 
    sessionStats, 
    agentPosition,
    agentAction,
    updateSystemStatus,
    clearActivities,
    setAgentPosition
  } = useStatusStore()

  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkGateway = async () => {
      try {
        if (window.electronAPI?.checkGateway) {
          const connected = await window.electronAPI.checkGateway()
          updateSystemStatus({ gatewayConnected: connected })
        } else {
          updateSystemStatus({ gatewayConnected: false })
        }
      } catch {
        updateSystemStatus({ gatewayConnected: false })
      }
    }

    checkGateway()
    const interval = setInterval(checkGateway, 10000)

    return () => clearInterval(interval)
  }, [updateSystemStatus])

  useEffect(() => {
    const interval = setInterval(() => {
      if (systemStatus.isRunning) {
        updateSystemStatus({ uptime: systemStatus.uptime + 1 })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [systemStatus.isRunning, systemStatus.uptime, updateSystemStatus])

  useEffect(() => {
    const animateAgent = () => {
      const time = Date.now() / 1000
      const x = Math.sin(time * 0.5) * 20
      const y = Math.cos(time * 0.3) * 10
      const z = Math.sin(time * 0.2) * 5
      setAgentPosition({ x, y, z })
    }

    const interval = setInterval(animateAgent, 50)
    return () => clearInterval(interval)
  }, [setAgentPosition])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'message': return <MessageOutlined />
      case 'thinking': return <ThunderboltOutlined />
      case 'reading': return <FileTextOutlined />
      case 'searching': return <SearchOutlined />
      case 'generating': return <RobotOutlined />
      case 'complete': return <CheckCircleOutlined />
      case 'error': return <ExclamationCircleOutlined />
      default: return <ClockCircleOutlined />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'message': return '#6366f1'
      case 'thinking': return '#f59e0b'
      case 'reading': return '#22d3ee'
      case 'searching': return '#8b5cf6'
      case 'generating': return '#10b981'
      case 'complete': return '#10b981'
      case 'error': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getActionLabel = (action: typeof agentAction) => {
    switch (action) {
      case 'idle': return '空闲中'
      case 'thinking': return '思考中'
      case 'working': return '工作中'
      case 'talking': return '对话中'
      default: return '未知'
    }
  }

  return (
    <div className="status-page">
      <div className="status-header">
        <h1>📊 状态监控</h1>
        <div className="status-actions">
          <Button 
            icon={<SyncOutlined />} 
            onClick={() => {
              if (window.electronAPI?.checkGateway) {
                window.electronAPI.checkGateway()
              }
            }}
          >
            刷新状态
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={clearActivities}
          >
            清除日志
          </Button>
        </div>
      </div>

      <div className="status-grid">
        <div className="status-cards">
          <Card className="status-card" size="small">
            <div className="card-header">
              <CloudServerOutlined className="card-icon" />
              <span>系统状态</span>
            </div>
            <div className="card-content">
              <div className="status-row">
                <span className="label">运行状态</span>
                <Badge 
                  status={systemStatus.isRunning ? 'success' : 'error'} 
                  text={systemStatus.isRunning ? '运行中' : '已停止'}
                />
              </div>
              <div className="status-row">
                <span className="label">运行时长</span>
                <span className="value">{formatUptime(systemStatus.uptime)}</span>
              </div>
              <div className="status-row">
                <span className="label">CPU</span>
                <Progress percent={systemStatus.cpu} size="small" style={{ width: 100 }} />
              </div>
              <div className="status-row">
                <span className="label">内存</span>
                <span className="value">{systemStatus.memory} MB</span>
              </div>
            </div>
          </Card>

          <Card className="status-card" size="small">
            <div className="card-header">
              <RobotOutlined className="card-icon" />
              <span>当前 Agent</span>
            </div>
            <div className="card-content">
              <div className="status-row">
                <span className="label">Agent</span>
                <Tag color="blue">{systemStatus.currentAgent}</Tag>
              </div>
              <div className="status-row">
                <span className="label">模型</span>
                <span className="value">{systemStatus.currentModel}</span>
              </div>
              <div className="status-row">
                <span className="label">会话状态</span>
                <Badge 
                  status={systemStatus.sessionActive ? 'processing' : 'default'} 
                  text={systemStatus.sessionActive ? '活跃' : '空闲'}
                />
              </div>
            </div>
          </Card>

          <Card className="status-card" size="small">
            <div className="card-header">
              <CloudServerOutlined className="card-icon gateway-icon" />
              <span>Gateway</span>
            </div>
            <div className="card-content">
              <div className="status-row">
                <span className="label">端口</span>
                <span className="value">{systemStatus.gatewayPort}</span>
              </div>
              <div className="status-row">
                <span className="label">状态</span>
                <Badge 
                  status={systemStatus.gatewayConnected ? 'success' : 'error'} 
                  text={systemStatus.gatewayConnected ? '正常' : '未连接'}
                />
              </div>
              <div className="status-row">
                <span className="label">连接</span>
                <span className="value">本地</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="scene-card" title="🦁 RofenClaw 空间场景">
          <div className="scene-container" ref={sceneRef}>
            <div className="scene-3d">
              <div className="scene-floor"></div>
              <div className="scene-grid"></div>
              
              <div 
                className={`agent-avatar ${agentAction}`}
                style={{
                  transform: `translateX(${agentPosition.x}px) translateY(${agentPosition.y}px) scale(${1 + agentPosition.z * 0.01})`
                }}
              >
                <div className="avatar-body">
                  <div className="avatar-head">🦁</div>
                  <div className="avatar-glow"></div>
                </div>
                <div className="avatar-shadow"></div>
                <div className="avatar-status">
                  <Tag color={agentAction === 'idle' ? 'default' : 'processing'}>
                    {getActionLabel(agentAction)}
                  </Tag>
                </div>
              </div>

              <div className="floating-particles">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="particle"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${3 + Math.random() * 4}s`
                    }}
                  />
                ))}
              </div>

              <div className="scene-info">
                <div className="info-item">
                  <span className="info-label">位置</span>
                  <span className="info-value">
                    X: {agentPosition.x.toFixed(1)} Y: {agentPosition.y.toFixed(1)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">状态</span>
                  <span className="info-value">{getActionLabel(agentAction)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="status-bottom">
        <Card className="activity-card" title="🔄 当前活动">
          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="activity-empty">
                <ClockCircleOutlined />
                <span>暂无活动记录</span>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="activity-item animate-slideUp">
                  <div 
                    className="activity-icon"
                    style={{ color: getActivityColor(activity.type) }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">{activity.content}</span>
                    {activity.details && (
                      <span className="activity-details">{activity.details}</span>
                    )}
                  </div>
                  <span className="activity-time">{formatTime(activity.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="stats-card" title="📈 会话统计">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{sessionStats.todayMessages}</div>
              <div className="stat-label">今日对话</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{sessionStats.totalTokens.toLocaleString()}</div>
              <div className="stat-label">总 Token</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{sessionStats.cacheHitRate}%</div>
              <div className="stat-label">缓存命中</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Status
