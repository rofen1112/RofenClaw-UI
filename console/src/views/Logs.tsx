import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Tag, Empty, message, Badge, Tabs, Select } from 'antd'
import { 
  SearchOutlined, 
  ReloadOutlined,
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons'
import './Logs.css'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  source: string
  message: string
  details?: string
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadLogs = async () => {
    try {
      const result = await window.electronAPI?.getLogs?.()
      if (result) {
        setLogs(result)
      }
    } catch (e) {
      console.error('Failed to load logs:', e)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const exportLogs = () => {
    const content = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rofenclaw-logs-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    message.success('日志已导出')
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === '' || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.source.toLowerCase().includes(filter.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    return matchesFilter && matchesLevel
  })

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <ExclamationCircleOutlined style={{ color: '#ef4444' }} />
      case 'warn': return <WarningOutlined style={{ color: '#f59e0b' }} />
      case 'info': return <InfoCircleOutlined style={{ color: '#3b82f6' }} />
      case 'debug': return <CheckCircleOutlined style={{ color: '#10b981' }} />
      default: return <ClockCircleOutlined />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'error'
      case 'warn': return 'warning'
      case 'info': return 'processing'
      case 'debug': return 'success'
      default: return 'default'
    }
  }

  const errorCount = logs.filter(l => l.level === 'error').length
  const warnCount = logs.filter(l => l.level === 'warn').length

  return (
    <div className="logs-page">
      <div className="logs-header">
        <h1>系统日志</h1>
        <div className="logs-actions">
          <Badge count={errorCount} offset={[-5, 5]}>
            <Button onClick={loadLogs} icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Badge>
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            type={autoRefresh ? 'primary' : 'default'}
          >
            {autoRefresh ? '停止自动刷新' : '自动刷新'}
          </Button>
          <Button onClick={clearLogs} icon={<ClearOutlined />}>
            清空
          </Button>
          <Button onClick={exportLogs} icon={<DownloadOutlined />}>
            导出
          </Button>
        </div>
      </div>

      <div className="logs-stats">
        <Tag color="error">错误: {errorCount}</Tag>
        <Tag color="warning">警告: {warnCount}</Tag>
        <Tag color="processing">总计: {logs.length}</Tag>
      </div>

      <Card className="logs-card">
        <div className="logs-toolbar">
          <Input
            placeholder="搜索日志..."
            prefix={<SearchOutlined />}
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部级别' },
              { value: 'error', label: '错误' },
              { value: 'warn', label: '警告' },
              { value: 'info', label: '信息' },
              { value: 'debug', label: '调试' },
            ]}
          />
        </div>

        <div className="logs-content">
          {filteredLogs.length === 0 ? (
            <Empty description="暂无日志" />
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className={`log-entry log-${log.level}`}>
                <div className="log-header">
                  {getLevelIcon(log.level)}
                  <span className="log-time">{log.timestamp}</span>
                  <Tag color={getLevelColor(log.level)}>{log.level.toUpperCase()}</Tag>
                  <span className="log-source">{log.source}</span>
                </div>
                <div className="log-message">{log.message}</div>
                {log.details && <div className="log-details">{log.details}</div>}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default Logs
