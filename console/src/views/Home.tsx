import React from 'react'
import { Card, Button, Row, Col, Statistic, Tag } from 'antd'
import { 
  MessageOutlined, 
  RobotOutlined, 
  AppstoreOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useStatusStore } from '../stores/statusStore'
import { useAgentStore } from '../stores/agentStore'
import { useSkillStore } from '../stores/skillStore'
import './Home.css'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { systemStatus, sessionStats } = useStatusStore()
  const { agents } = useAgentStore()
  const { skills } = useSkillStore()

  const quickActions = [
    { 
      icon: <MessageOutlined />, 
      title: '开始对话', 
      description: '与 AI 助手进行智能对话',
      path: '/chat',
      color: '#6366f1'
    },
    { 
      icon: <RobotOutlined />, 
      title: '管理分身', 
      description: '创建和配置 AI 分身',
      path: '/agents',
      color: '#22d3ee'
    },
    { 
      icon: <AppstoreOutlined />, 
      title: '技能库', 
      description: '浏览和安装技能扩展',
      path: '/skills',
      color: '#10b981'
    },
    { 
      icon: <ThunderboltOutlined />, 
      title: '状态监控', 
      description: '查看系统运行状态',
      path: '/status',
      color: '#f59e0b'
    },
  ]

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="welcome-section">
          <div className="welcome-icon">🦁</div>
          <div className="welcome-text">
            <h1>欢迎使用 RofenClaw</h1>
            <p>您的智能助手管理中心</p>
          </div>
        </div>
        <div className="status-badge">
          <Tag color={systemStatus.gatewayConnected ? 'success' : 'error'}>
            {systemStatus.gatewayConnected ? 'Gateway 已连接' : 'Gateway 未连接'}
          </Tag>
        </div>
      </div>

      <Row gutter={[20, 20]} className="stats-row">
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="今日对话" 
              value={sessionStats.todayMessages} 
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="AI 分身" 
              value={agents.length} 
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="已安装技能" 
              value={skills.length} 
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="缓存命中率" 
              value={sessionStats.cacheHitRate} 
              suffix="%" 
            />
          </Card>
        </Col>
      </Row>

      <div className="quick-actions">
        <h2>快速操作</h2>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col span={6} key={index}>
              <Card 
                className="action-card"
                hoverable
                onClick={() => navigate(action.path)}
              >
                <div className="action-icon" style={{ background: action.color }}>
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">
                  <ArrowRightOutlined />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="recent-section">
        <h2>最近活动</h2>
        <Card className="recent-card">
          <div className="recent-empty">
            <MessageOutlined className="empty-icon" />
            <p>开始您的第一次对话吧</p>
            <Button type="primary" onClick={() => navigate('/chat')}>
              开始对话
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Home
