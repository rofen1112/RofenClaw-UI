import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Input, Button, Card, Tag, Spin, Tooltip, Avatar, Modal, Input as AntInput, Dropdown, Menu, message, Empty, Popconfirm, Alert } from 'antd'
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined,
  CopyOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  DownOutlined,
  PlusOutlined,
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  MoreOutlined,
  SaveOutlined,
  HistoryOutlined,
  ApiOutlined,
  DisconnectOutlined
} from '@ant-design/icons'
import { useStatusStore } from '../stores/statusStore'
import { useChatStore, Conversation, ReasoningStep } from '../stores/chatStore'
import gatewayAPI from '../services/gateway'
import './Chat.css'

const Chat: React.FC = () => {
  const [input, setInput] = useState('')
  const [expandedReasoning, setExpandedReasoning] = useState<string[]>([])
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [gatewayConnected, setGatewayConnected] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const { addActivity, setAgentAction, updateSystemStatus } = useStatusStore()
  const {
    conversations,
    currentConversationId,
    loading,
    getCurrentConversation,
    createConversation,
    deleteConversation,
    updateConversation,
    setCurrentConversation,
    addMessage,
    clearMessages,
    toggleFavorite,
    getRecentConversations,
    setLoading,
    saveToMemory,
  } = useChatStore()

  const currentConversation = getCurrentConversation()
  const messages = currentConversation?.messages || []
  const recentConversations = getRecentConversations()

  const checkGatewayConnection = useCallback(async () => {
    const connected = await gatewayAPI.checkHealth()
    setGatewayConnected(connected)
    updateSystemStatus({ gatewayConnected: connected })
    return connected
  }, [updateSystemStatus])

  useEffect(() => {
    checkGatewayConnection()
    const interval = setInterval(checkGatewayConnection, 30000)
    return () => clearInterval(interval)
  }, [checkGatewayConnection])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  useEffect(() => {
    if (!currentConversationId && conversations.length === 0) {
      createConversation()
    }
  }, [currentConversationId, conversations.length, createConversation])

  const handleSend = async () => {
    if (!input.trim() || loading || !currentConversationId) return

    const userContent = input.trim()
    
    addMessage(currentConversationId, {
      role: 'user',
      content: userContent,
    })
    
    setInput('')
    setLoading(true)
    setAgentAction('thinking')
    setStreamingContent('')

    addActivity({
      type: 'message',
      content: `收到用户消息: "${userContent.substring(0, 30)}..."`,
    })

    const connected = await checkGatewayConnection()
    
    if (connected) {
      try {
        abortControllerRef.current = new AbortController()
        
        addActivity({
          type: 'thinking',
          content: '正在连接 Gateway...',
        })

        const chatMessages = messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }))
        chatMessages.push({ role: 'user', content: userContent })

        let fullContent = ''
        
        const response = await gatewayAPI.chat(
          chatMessages,
          (chunk) => {
            fullContent += chunk
            setStreamingContent(fullContent)
          },
          abortControllerRef.current.signal
        )

        addMessage(currentConversationId, {
          role: 'assistant',
          content: response,
        })

        addActivity({
          type: 'complete',
          content: '生成回复完成',
        })
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          message.error(`请求失败: ${error.message}`)
          addActivity({
            type: 'error',
            content: `请求失败: ${error.message}`,
          })
        }
      } finally {
        setStreamingContent('')
        abortControllerRef.current = null
      }
    } else {
      addActivity({
        type: 'thinking',
        content: 'Gateway 未连接，使用模拟回复',
      })

      const reasoningSteps: ReasoningStep[] = [
        {
          id: '1',
          type: 'analyze',
          title: '📋 分析任务',
          details: ['识别用户意图', '确定所需工具'],
          status: 'completed',
        },
        {
          id: '2',
          type: 'generate',
          title: '💡 生成回复',
          details: ['模拟模式运行中'],
          status: 'completed',
        },
      ]

      setTimeout(() => {
        if (currentConversationId) {
          addMessage(currentConversationId, {
            role: 'assistant',
            content: `⚠️ **Gateway 未连接**\n\n我收到了您的消息："${userContent}"\n\n当前 Gateway 服务未运行（端口 18789），这是模拟回复。\n\n请启动 Gateway 以获得真实的 AI 响应：\n\`\`\`bash\nopenclaw start\n\`\`\``,
            reasoning: reasoningSteps,
          })
        }
        
        addActivity({
          type: 'complete',
          content: '模拟回复完成',
        })
      }, 1000)
    }
    
    setLoading(false)
    setAgentAction('idle')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleReasoning = (id: string) => {
    setExpandedReasoning(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const getReasoningIcon = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'analyze': return <ThunderboltOutlined />
      case 'search': return <SearchOutlined />
      case 'read': return <FileTextOutlined />
      case 'generate': return <CheckCircleOutlined />
      default: return <ThunderboltOutlined />
    }
  }

  const getReasoningColor = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'analyze': return '#f59e0b'
      case 'search': return '#8b5cf6'
      case 'read': return '#22d3ee'
      case 'generate': return '#10b981'
      default: return '#6366f1'
    }
  }

  const handleNewConversation = () => {
    createConversation()
    message.success('已创建新对话')
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id)
  }

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id)
    message.success('对话已删除')
  }

  const handleEditConversation = (conversation: Conversation) => {
    setEditingConversation(conversation)
    setEditTitle(conversation.title)
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingConversation && editTitle.trim()) {
      updateConversation(editingConversation.id, { title: editTitle.trim() })
      message.success('对话标题已更新')
    }
    setEditModalOpen(false)
    setEditingConversation(null)
  }

  const handleClearMessages = () => {
    if (currentConversationId) {
      clearMessages(currentConversationId)
      message.success('对话已清空')
    }
  }

  const handleSaveToMemory = async () => {
    if (currentConversationId) {
      await saveToMemory(currentConversationId)
      message.success('对话已保存到记忆')
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  const getConversationMenu = (conversation: Conversation) => (
    <Menu>
      <Menu.Item key="rename" icon={<EditOutlined />} onClick={() => handleEditConversation(conversation)}>
        重命名
      </Menu.Item>
      <Menu.Item key="favorite" icon={conversation.isFavorite ? <StarFilled /> : <StarOutlined />} onClick={() => toggleFavorite(conversation.id)}>
        {conversation.isFavorite ? '取消收藏' : '收藏'}
      </Menu.Item>
      <Menu.Item key="save" icon={<SaveOutlined />} onClick={() => saveToMemory(conversation.id)}>
        保存到记忆
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteConversation(conversation.id)}>
        删除对话
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="chat-page">
      <div className={`chat-sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
        <div className="sidebar-header">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleNewConversation}
            block
          >
            新建对话
          </Button>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="section-title">
              <HistoryOutlined />
              <span>最近对话</span>
            </div>
            <div className="conversation-list">
              {recentConversations.length === 0 ? (
                <Empty description="暂无对话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                recentConversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="conversation-icon">
                      {conversation.isFavorite ? (
                        <StarFilled style={{ color: '#f59e0b' }} />
                      ) : (
                        <FolderOutlined />
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-title">{conversation.title}</div>
                      <div className="conversation-meta">
                        <span>{conversation.messages.length} 条消息</span>
                        <span>{formatTime(conversation.updatedAt)}</span>
                      </div>
                    </div>
                    <Dropdown overlay={getConversationMenu(conversation)} trigger={['click']} placement="bottomRight">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<MoreOutlined />}
                        className="conversation-more"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-main">
        {!gatewayConnected && (
          <Alert
            message="Gateway 未连接"
            description="OpenClaw Gateway 服务未运行，当前为模拟模式。请运行 'openclaw start' 启动服务。"
            type="warning"
            showIcon
            icon={<DisconnectOutlined />}
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={checkGatewayConnection}>
                重试连接
              </Button>
            }
          />
        )}
        
        <div className="chat-header">
          <div className="chat-title">
            <Button 
              type="text" 
              icon={<FolderOutlined />}
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="toggle-sidebar-btn"
            />
            <RobotOutlined className="chat-icon" />
            <h1>{currentConversation?.title || '智能对话'}</h1>
            {currentConversation?.isFavorite && (
              <StarFilled style={{ color: '#f59e0b', marginLeft: 8 }} />
            )}
            {gatewayConnected ? (
              <Tag color="success" style={{ marginLeft: 8 }}>
                <ApiOutlined /> Gateway 已连接
              </Tag>
            ) : (
              <Tag color="warning" style={{ marginLeft: 8 }}>
                <DisconnectOutlined /> 模拟模式
              </Tag>
            )}
          </div>
          <div className="chat-actions">
            <Tooltip title="收藏对话">
              <Button 
                icon={currentConversation?.isFavorite ? <StarFilled /> : <StarOutlined />}
                onClick={() => currentConversationId && toggleFavorite(currentConversationId)}
                disabled={!currentConversationId}
              />
            </Tooltip>
            <Tooltip title="保存到记忆">
              <Button 
                icon={<SaveOutlined />}
                onClick={handleSaveToMemory}
                disabled={!currentConversationId || messages.length === 0}
              />
            </Tooltip>
            <Popconfirm
              title="确定清空当前对话？"
              onConfirm={handleClearMessages}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="清空对话">
                <Button icon={<DeleteOutlined />} disabled={!currentConversationId || messages.length === 0} />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>

        <div className="chat-container">
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-icon">🦁</div>
                <h2>开始与 OpenClaw 对话</h2>
                <p>输入您的问题，AI 助手将为您提供帮助</p>
                <div className="suggestions">
                  <Card className="suggestion-card" hoverable onClick={() => setInput('帮我分析这个项目的代码结构')}>
                    <span>💡 帮我分析这个项目的代码结构</span>
                  </Card>
                  <Card className="suggestion-card" hoverable onClick={() => setInput('写一个 Python 脚本处理 CSV 文件')}>
                    <span>📝 写一个 Python 脚本处理 CSV 文件</span>
                  </Card>
                  <Card className="suggestion-card" hoverable onClick={() => setInput('搜索关于 React Hooks 的最佳实践')}>
                    <span>🔍 搜索关于 React Hooks 的最佳实践</span>
                  </Card>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.role} animate-slideUp`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <Avatar icon={<UserOutlined />} style={{ background: '#6366f1' }} />
                    ) : (
                      <span className="assistant-avatar">🦁</span>
                    )}
                  </div>
                  <div className="message-content">
                    {message.role === 'assistant' && message.reasoning && (
                      <div className="reasoning-section">
                        <div 
                          className="reasoning-header"
                          onClick={() => toggleReasoning(message.id)}
                        >
                          <ThunderboltOutlined />
                          <span>思考过程</span>
                          <Tag color="blue">{message.reasoning.length} 步</Tag>
                          <DownOutlined 
                            className={`expand-icon ${expandedReasoning.includes(message.id) ? 'expanded' : ''}`} 
                          />
                        </div>
                        {expandedReasoning.includes(message.id) && (
                          <div className="reasoning-steps">
                            {message.reasoning.map((step) => (
                              <div key={step.id} className="reasoning-step">
                                <div 
                                  className="step-icon"
                                  style={{ color: getReasoningColor(step.type) }}
                                >
                                  {getReasoningIcon(step.type)}
                                </div>
                                <div className="step-content">
                                  <div className="step-title">{step.title}</div>
                                  <ul className="step-details">
                                    {step.details.map((detail, i) => (
                                      <li key={i}>{detail}</li>
                                    ))}
                                  </ul>
                                </div>
                                <Tag 
                                  color={step.status === 'completed' ? 'success' : 'processing'}
                                >
                                  {step.status === 'completed' ? '完成' : '进行中'}
                                </Tag>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                      {message.role === 'assistant' && (
                        <div className="message-actions">
                          <Tooltip title="复制">
                            <Button type="text" size="small" icon={<CopyOutlined />} />
                          </Tooltip>
                          <Tooltip title="重新生成">
                            <Button type="text" size="small" icon={<ReloadOutlined />} />
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && streamingContent && (
              <div className="message assistant animate-slideUp">
                <div className="message-avatar">
                  <span className="assistant-avatar">🦁</span>
                </div>
                <div className="message-content">
                  <div className="message-text streaming">
                    {streamingContent}
                    <span className="streaming-cursor">▌</span>
                  </div>
                </div>
              </div>
            )}
            {loading && !streamingContent && (
              <div className="message assistant loading">
                <div className="message-avatar">
                  <span className="assistant-avatar">🦁</span>
                </div>
                <div className="message-content">
                  <Spin />
                  <span className="loading-text">思考中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="chat-input"
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              className="send-btn"
            >
              发送
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="重命名对话"
        open={editModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <AntInput
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="请输入对话标题"
          onPressEnter={handleSaveEdit}
        />
      </Modal>
    </div>
  )
}

export default Chat
