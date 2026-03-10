import React, { useState } from 'react'
import { Card, Tabs, Button, Input, Tag, Switch, Modal, Empty, message } from 'antd'
import { 
  SearchOutlined, 
  DownloadOutlined, 
  ReloadOutlined,
  DeleteOutlined,
  CloudDownloadOutlined,
  StarOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import { useSkillStore, Skill } from '../stores/skillStore'
import './Skills.css'

const Skills: React.FC = () => {
  const { skills, updateSkill, removeSkill } = useSkillStore()
  const [searchText, setSearchText] = useState('')
  const [installModalOpen, setInstallModalOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchText.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleToggleEnable = (name: string, enabled: boolean) => {
    updateSkill(name, { enabled })
    message.success(enabled ? '技能已启用' : '技能已禁用')
  }

  const handleUninstall = (name: string) => {
    removeSkill(name)
    message.success('技能已卸载')
  }

  const handleInstall = (skill: Skill) => {
    setSelectedSkill(skill)
    setInstallModalOpen(true)
  }

  const confirmInstall = () => {
    if (selectedSkill) {
      message.success(`${selectedSkill.name} 安装成功`)
      setInstallModalOpen(false)
      setSelectedSkill(null)
    }
  }

  const getSourceLabel = (source: Skill['source']) => {
    switch (source) {
      case 'openclaw-bundled': return '内置'
      case 'openclaw-workspace': return '本地'
      case 'clawhub': return 'ClawHub'
      default: return '未知'
    }
  }

  const getSourceColor = (source: Skill['source']) => {
    switch (source) {
      case 'openclaw-bundled': return 'blue'
      case 'openclaw-workspace': return 'green'
      case 'clawhub': return 'purple'
      default: return 'default'
    }
  }

  const mockMarketSkills: Skill[] = [
    { name: 'data-viz', description: '数据可视化生成工具', version: '1.3.0', enabled: false, source: 'clawhub', downloads: 12500, rating: 4.8, author: 'OpenClaw Team' },
    { name: 'auto-email', description: '自动邮件处理助手', version: '2.1.0', enabled: false, source: 'clawhub', downloads: 8200, rating: 4.6, author: 'Community' },
    { name: 'doc-writer', description: '文档自动生成器', version: '1.5.0', enabled: false, source: 'clawhub', downloads: 15300, rating: 4.9, author: 'OpenClaw Team' },
    { name: 'image-gen', description: 'AI图像生成集成', version: '1.0.0', enabled: false, source: 'clawhub', downloads: 22100, rating: 4.7, author: 'Community' },
    { name: 'calendar', description: '日历管理集成', version: '1.2.0', enabled: false, source: 'clawhub', downloads: 5600, rating: 4.5, author: 'Community' },
    { name: 'security', description: '安全审计工具', version: '2.0.0', enabled: false, source: 'clawhub', downloads: 9800, rating: 4.8, author: 'RofenClaw Team' },
  ]

  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const tabItems = [
    {
      key: 'installed',
      label: (
        <span>
          <AppstoreOutlined />
          已安装 ({skills.length})
        </span>
      ),
      children: (
        <div className="skills-list">
          <div className="skills-toolbar">
            <Input
              placeholder="搜索技能..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button icon={<ReloadOutlined />}>检查更新</Button>
          </div>

          {filteredSkills.length === 0 ? (
            <Empty description="暂无已安装的技能" />
          ) : (
            filteredSkills.map((skill) => (
              <Card key={skill.name} className="skill-card">
                <div className="skill-header">
                  <div className="skill-icon">📦</div>
                  <div className="skill-info">
                    <div className="skill-name">
                      {skill.name}
                      <Tag color={getSourceColor(skill.source)}>{getSourceLabel(skill.source)}</Tag>
                    </div>
                    <div className="skill-desc">{skill.description}</div>
                  </div>
                  <div className="skill-version">v{skill.version}</div>
                  <Switch
                    checked={skill.enabled}
                    onChange={(checked) => handleToggleEnable(skill.name, checked)}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                  />
                </div>
                <div className="skill-footer">
                  <span className="skill-meta">
                    来源: {getSourceLabel(skill.source)}
                    {skill.installedAt && ` · 安装于 ${skill.installedAt.toLocaleDateString()}`}
                  </span>
                  <div className="skill-actions">
                    {skill.source !== 'openclaw-bundled' && (
                      <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleUninstall(skill.name)}>
                        卸载
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'market',
      label: (
        <span>
          <CloudDownloadOutlined />
          ClawHub 市场
        </span>
      ),
      children: (
        <div className="market-grid">
          {mockMarketSkills.map((skill) => (
            <Card key={skill.name} className="market-card" hoverable>
              <div className="market-header">
                <div className="market-icon">🧩</div>
                <div className="market-info">
                  <div className="market-name">{skill.name}</div>
                  <div className="market-author">{skill.author}</div>
                </div>
              </div>
              <div className="market-desc">{skill.description}</div>
              <div className="market-stats">
                <span className="stat">
                  <StarOutlined style={{ color: '#f59e0b' }} />
                  {skill.rating}
                </span>
                <span className="stat">
                  <DownloadOutlined />
                  {formatDownloads(skill.downloads || 0)}
                </span>
                <Tag>v{skill.version}</Tag>
              </div>
              <Button 
                type="primary" 
                block 
                icon={<DownloadOutlined />}
                onClick={() => handleInstall(skill)}
              >
                安装
              </Button>
            </Card>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="skills-page">
      <div className="skills-header">
        <h1>📦 技能库管理</h1>
      </div>

      <Tabs defaultActiveKey="installed" items={tabItems} />

      <Modal
        title="安装技能"
        open={installModalOpen}
        onCancel={() => setInstallModalOpen(false)}
        onOk={confirmInstall}
        okText="确认安装"
        cancelText="取消"
      >
        {selectedSkill && (
          <div className="install-preview">
            <div className="preview-header">
              <span className="preview-icon">🧩</span>
              <div>
                <h3>{selectedSkill.name}</h3>
                <p>v{selectedSkill.version}</p>
              </div>
            </div>
            <p className="preview-desc">{selectedSkill.description}</p>
            <div className="preview-info">
              <span>作者: {selectedSkill.author}</span>
              <span>评分: {selectedSkill.rating}</span>
              <span>下载: {formatDownloads(selectedSkill.downloads || 0)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Skills
