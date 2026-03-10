import React, { useState } from 'react'
import { Card, Button, Modal, Form, Input, Select, Tag, message, Popconfirm } from 'antd'
import { 
  PlusOutlined, 
  RobotOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SwapOutlined,
  FolderOutlined
} from '@ant-design/icons'
import { useAgentStore, Agent } from '../stores/agentStore'
import { useStatusStore } from '../stores/statusStore'
import './Agents.css'

const Agents: React.FC = () => {
  const { agents, currentAgent, addAgent, updateAgent, removeAgent, setCurrentAgent } = useAgentStore()
  const { updateSystemStatus } = useStatusStore()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [form] = Form.useForm()

  const handleCreate = () => {
    form.resetFields()
    setCreateModalOpen(true)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    form.setFieldsValue({
      name: agent.name,
      emoji: agent.emoji,
      model: agent.model,
      identityName: agent.identity?.name,
      creature: agent.identity?.creature,
      vibe: agent.identity?.vibe,
    })
    setEditModalOpen(true)
  }

  const handleCreateSubmit = () => {
    form.validateFields().then((values) => {
      const newAgent: Agent = {
        id: values.id || Date.now().toString(),
        name: values.name,
        emoji: values.emoji || '🤖',
        model: values.model || 'Kimi K2.5',
        workspace: `~/.openclaw/workspaces/${values.id}`,
        identity: {
          name: values.identityName,
          creature: values.creature,
          vibe: values.vibe,
        },
        skillsCount: 0,
        isActive: false,
        createdAt: new Date(),
      }
      addAgent(newAgent)
      setCreateModalOpen(false)
      form.resetFields()
      message.success('分身创建成功')
    })
  }

  const handleEditSubmit = () => {
    form.validateFields().then((values) => {
      if (editingAgent) {
        updateAgent(editingAgent.id, {
          name: values.name,
          emoji: values.emoji,
          model: values.model,
          identity: {
            name: values.identityName,
            creature: values.creature,
            vibe: values.vibe,
          },
        })
        setEditModalOpen(false)
        setEditingAgent(null)
        form.resetFields()
        message.success('分身更新成功')
      }
    })
  }

  const handleSwitch = (agent: Agent) => {
    setCurrentAgent(agent)
    updateSystemStatus({ currentAgent: agent.id })
    message.success(`已切换到 ${agent.name}`)
  }

  const handleDelete = (id: string) => {
    removeAgent(id)
    message.success('分身已删除')
  }

  const modelOptions = [
    { label: 'Kimi K2.5', value: 'Kimi K2.5' },
    { label: 'GPT-4', value: 'GPT-4' },
    { label: 'Claude 3', value: 'Claude 3' },
    { label: 'Gemini Pro', value: 'Gemini Pro' },
  ]

  const emojiOptions = ['🤖', '💻', '✍️', '🎨', '📊', '🔬', '📚', '🎵', '🚀', '🌟', '🎯', '🔮']

  return (
    <div className="agents-page">
      <div className="agents-header">
        <h1>🤖 Agent 分身管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建新分身
        </Button>
      </div>

      <div className="agents-grid">
        {agents.length === 0 ? (
          <Card className="empty-card">
            <div className="empty-content">
              <RobotOutlined className="empty-icon" />
              <h3>还没有创建分身</h3>
              <p>创建您的第一个 AI 分身，让它帮您完成各种任务</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                创建分身
              </Button>
            </div>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card 
              key={agent.id} 
              className={`agent-card ${currentAgent?.id === agent.id ? 'active' : ''}`}
            >
              <div className="agent-header">
                <div className="agent-avatar">
                  <span className="avatar-emoji">{agent.emoji}</span>
                </div>
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  {currentAgent?.id === agent.id && (
                    <Tag color="green">当前活跃</Tag>
                  )}
                </div>
              </div>

              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">模型</span>
                  <Tag color="blue">{agent.model}</Tag>
                </div>
                <div className="detail-row">
                  <span className="detail-label">身份</span>
                  <span className="detail-value">{agent.identity?.name || '未设置'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">技能数</span>
                  <span className="detail-value">{agent.skillsCount}</span>
                </div>
                <div className="detail-row">
                  <FolderOutlined className="detail-icon" />
                  <span className="detail-value workspace">{agent.workspace}</span>
                </div>
              </div>

              <div className="agent-actions">
                {currentAgent?.id !== agent.id && (
                  <Button 
                    type="primary" 
                    icon={<SwapOutlined />}
                    onClick={() => handleSwitch(agent)}
                  >
                    切换
                  </Button>
                )}
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(agent)}
                >
                  配置
                </Button>
                <Popconfirm
                  title="确定要删除这个分身吗？"
                  description="删除后无法恢复"
                  onConfirm={() => handleDelete(agent.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title="创建新分身"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateSubmit}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="分身 ID"
            rules={[{ required: true, message: '请输入分身 ID' }]}
          >
            <Input placeholder="唯一标识，如：translator" />
          </Form.Item>
          <Form.Item
            name="name"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="如：翻译专家" />
          </Form.Item>
          <Form.Item name="emoji" label="图标">
            <Select placeholder="选择一个图标">
              {emojiOptions.map((emoji) => (
                <Select.Option key={emoji} value={emoji}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="model" label="模型" initialValue="Kimi K2.5">
            <Select options={modelOptions} />
          </Form.Item>
          <Form.Item name="identityName" label="身份名称">
            <Input placeholder="如：翻译官" />
          </Form.Item>
          <Form.Item name="creature" label="类型">
            <Select placeholder="选择类型">
              <Select.Option value="AI助手">AI助手</Select.Option>
              <Select.Option value="机器人">机器人</Select.Option>
              <Select.Option value="虚拟角色">虚拟角色</Select.Option>
              <Select.Option value="数字人">数字人</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="vibe" label="风格">
            <Select placeholder="选择风格">
              <Select.Option value="专业严谨">专业严谨</Select.Option>
              <Select.Option value="活泼有趣">活泼有趣</Select.Option>
              <Select.Option value="温和亲切">温和亲切</Select.Option>
              <Select.Option value="简洁高效">简洁高效</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑分身"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingAgent(null)
        }}
        onOk={handleEditSubmit}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="emoji" label="图标">
            <Select>
              {emojiOptions.map((emoji) => (
                <Select.Option key={emoji} value={emoji}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="model" label="模型">
            <Select options={modelOptions} />
          </Form.Item>
          <Form.Item name="identityName" label="身份名称">
            <Input />
          </Form.Item>
          <Form.Item name="creature" label="类型">
            <Select>
              <Select.Option value="AI助手">AI助手</Select.Option>
              <Select.Option value="机器人">机器人</Select.Option>
              <Select.Option value="虚拟角色">虚拟角色</Select.Option>
              <Select.Option value="数字人">数字人</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="vibe" label="风格">
            <Select>
              <Select.Option value="专业严谨">专业严谨</Select.Option>
              <Select.Option value="活泼有趣">活泼有趣</Select.Option>
              <Select.Option value="温和亲切">温和亲切</Select.Option>
              <Select.Option value="简洁高效">简洁高效</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Agents
