import React, { useState, useEffect } from 'react'
import { Card, Tabs, Form, Input, Select, Switch, Button, Divider, message, Space, Alert, Tag } from 'antd'
import { 
  SettingOutlined, 
  CloudServerOutlined, 
  KeyOutlined,
  ApiOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import './Settings.css'

interface AppConfig {
  language: string
  autoStart: boolean
  showSplash: boolean
  minimizeToTray: boolean
  defaultAgent: string
  maxConcurrent: number
  subagentConcurrent: number
  defaultModel: string
  gatewayPort: number
  theme: string
}

const Settings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<AppConfig>({
    language: 'zh-CN',
    autoStart: false,
    showSplash: true,
    minimizeToTray: true,
    defaultAgent: 'main',
    maxConcurrent: 4,
    subagentConcurrent: 8,
    defaultModel: 'Kimi K2.5',
    gatewayPort: 18789,
    theme: 'dark',
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      if (window.electronAPI?.getConfig) {
        const savedConfig = await window.electronAPI.getConfig()
        if (savedConfig) {
          setConfig(prev => ({ ...prev, ...savedConfig.console }))
          form.setFieldsValue({ ...config, ...savedConfig.console })
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      const newConfig = { ...config, ...values }
      
      if (window.electronAPI?.saveConfig) {
        const savedConfig = await window.electronAPI.getConfig()
        if (savedConfig) {
          savedConfig.console = newConfig
          await window.electronAPI.saveConfig(savedConfig)
        }
      }
      setConfig(newConfig)
      message.success('设置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    message.info('已重置为默认值')
  }

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <SettingOutlined />
          常规设置
        </span>
      ),
      children: (
        <div className="settings-section">
          <Form form={form} layout="vertical" initialValues={config}>
            <Form.Item name="language" label="语言">
              <Select>
                <Select.Option value="zh-CN">简体中文</Select.Option>
                <Select.Option value="en-US">English</Select.Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">启动选项</Divider>

            <Form.Item name="autoStart" label="开机自动启动" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="showSplash" label="显示启动画面" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="minimizeToTray" label="关闭时最小化到托盘" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Divider orientation="left">默认设置</Divider>

            <Form.Item name="defaultAgent" label="默认 Agent">
              <Select>
                <Select.Option value="main">main (主控)</Select.Option>
                <Select.Option value="coder">coder (编程专家)</Select.Option>
                <Select.Option value="writer">writer (写作专家)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="maxConcurrent" label="最大并发任务">
              <Input type="number" min={1} max={10} />
            </Form.Item>

            <Form.Item name="subagentConcurrent" label="子 Agent 并发数">
              <Input type="number" min={1} max={20} />
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'model',
      label: (
        <span>
          <CloudServerOutlined />
          模型配置
        </span>
      ),
      children: (
        <div className="settings-section">
          <Form form={form} layout="vertical">
            <Form.Item name="defaultModel" label="默认模型">
              <Select>
                <Select.Option value="Kimi K2.5">Kimi K2.5 (推荐)</Select.Option>
                <Select.Option value="GPT-4">GPT-4</Select.Option>
                <Select.Option value="Claude 3">Claude 3</Select.Option>
                <Select.Option value="Gemini Pro">Gemini Pro</Select.Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">模型提供商</Divider>

            <div className="provider-card">
              <div className="provider-header">
                <div className="provider-info">
                  <h4>Moonshot (Kimi)</h4>
                  <span className="provider-url">https://api.moonshot.cn/v1</span>
                </div>
                <Tag color="success">已连接</Tag>
              </div>
              <div className="provider-details">
                <span>模型: kimi-k2.5</span>
                <span>上下文: 256K</span>
              </div>
              <div className="provider-actions">
                <Button size="small">编辑</Button>
                <Button size="small" danger>删除</Button>
              </div>
            </div>

            <Button type="dashed" block icon={<ApiOutlined />} style={{ marginTop: 16 }}>
              添加新模型提供商
            </Button>
          </Form>
        </div>
      ),
    },
    {
      key: 'api',
      label: (
        <span>
          <KeyOutlined />
          API 密钥
        </span>
      ),
      children: (
        <div className="settings-section">
          <Alert
            message="安全提示"
            description="API 密钥将安全存储在本地，不会上传到云端。请勿将密钥分享给他人。"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />

          <div className="api-key-card">
            <div className="api-key-header">
              <span className="api-key-name">Moonshot API Key</span>
              <Tag color="success">有效</Tag>
            </div>
            <div className="api-key-value">
              <Input.Password value="sk-****-****-****-****OhtfNIZL0K7" readOnly />
            </div>
            <div className="api-key-actions">
              <Button size="small">显示</Button>
              <Button size="small">重新验证</Button>
              <Button size="small">更新</Button>
            </div>
          </div>

          <div className="api-key-card">
            <div className="api-key-header">
              <span className="api-key-name">Brave Search API Key</span>
              <Tag color="success">有效</Tag>
            </div>
            <div className="api-key-value">
              <Input.Password value="BSAo****-****-****-****-NY-N" readOnly />
            </div>
            <div className="api-key-actions">
              <Button size="small">显示</Button>
              <Button size="small">重新验证</Button>
              <Button size="small">更新</Button>
            </div>
          </div>

          <Button type="dashed" block icon={<KeyOutlined />} style={{ marginTop: 16 }}>
            添加新 API 密钥
          </Button>
        </div>
      ),
    },
    {
      key: 'gateway',
      label: (
        <span>
          <CloudServerOutlined />
          Gateway
        </span>
      ),
      children: (
        <div className="settings-section">
          <Form form={form} layout="vertical">
            <Form.Item name="gatewayPort" label="Gateway 端口">
              <Input type="number" min={1024} max={65535} />
            </Form.Item>

            <Divider orientation="left">连接状态</Divider>

            <div className="gateway-status">
              <div className="status-item">
                <span className="status-label">状态</span>
                <Tag color="success">运行中</Tag>
              </div>
              <div className="status-item">
                <span className="status-label">地址</span>
                <span className="status-value">http://localhost:18789</span>
              </div>
              <div className="status-item">
                <span className="status-label">模式</span>
                <span className="status-value">本地</span>
              </div>
            </div>

            <Space style={{ marginTop: 16 }}>
              <Button>重启 Gateway</Button>
              <Button danger>停止 Gateway</Button>
            </Space>
          </Form>
        </div>
      ),
    },
    {
      key: 'appearance',
      label: (
        <span>
          <GlobalOutlined />
          外观
        </span>
      ),
      children: (
        <div className="settings-section">
          <Form form={form} layout="vertical">
            <Form.Item name="theme" label="主题">
              <Select>
                <Select.Option value="dark">深色模式</Select.Option>
                <Select.Option value="light">浅色模式</Select.Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">主题预览</Divider>

            <div className="theme-preview">
              <div className="preview-card dark">
                <div className="preview-header"></div>
                <div className="preview-sidebar"></div>
                <div className="preview-content"></div>
              </div>
              <div className="preview-card light">
                <div className="preview-header"></div>
                <div className="preview-sidebar"></div>
                <div className="preview-content"></div>
              </div>
            </div>
          </Form>
        </div>
      ),
    },
  ]

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ 设置中心</h1>
        <Space>
          <Button onClick={handleReset}>恢复默认</Button>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存设置
          </Button>
        </Space>
      </div>

      <Card className="settings-card">
        <Tabs defaultActiveKey="general" items={tabItems} tabPosition="left" />
      </Card>
    </div>
  )
}

export default Settings
