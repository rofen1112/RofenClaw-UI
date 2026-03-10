import React, { useState, useRef, useEffect } from 'react'
import { Button, Select, Tooltip, message, Dropdown, Menu, Tag, Spin } from 'antd'
import { 
  PlayCircleOutlined, 
  ClearOutlined,
  CopyOutlined,
  HistoryOutlined,
  CodeOutlined,
  BugOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { useStatusStore } from '../stores/statusStore'
import './Developer.css'

interface CodeHistory {
  id: string
  code: string
  language: string
  timestamp: Date
  result?: string
  error?: string
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'bash', label: 'Bash', icon: '💻' },
  { value: 'powershell', label: 'PowerShell', icon: '⚡' },
  { value: 'sql', label: 'SQL', icon: '🗃️' },
  { value: 'json', label: 'JSON', icon: '📋' },
]

const Developer: React.FC = () => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState<CodeHistory[]>([])
  const [fontSize, setFontSize] = useState(14)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  
  const { addActivity, setAgentAction } = useStatusStore()

  useEffect(() => {
    const savedHistory = localStorage.getItem('openclaw-dev-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('openclaw-dev-history', JSON.stringify(history.slice(0, 50)))
  }, [history])

  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [output])

  const handleRun = async () => {
    if (!code.trim()) {
      message.warning('请输入代码')
      return
    }

    setIsRunning(true)
    setOutput('')
    setAgentAction('working')
    
    addActivity({
      type: 'message',
      content: `执行 ${language} 代码...`,
    })

    const startTime = Date.now()

    try {
      let result = ''
      
      if (language === 'javascript' || language === 'typescript') {
        result = await executeJavaScript(code)
      } else if (language === 'json') {
        result = executeJSON(code)
      } else {
        result = await executeViaGateway(code, language)
      }

      const executionTime = Date.now() - startTime
      setOutput(`✅ 执行成功 (${executionTime}ms)\n\n${result}`)
      
      const historyItem: CodeHistory = {
        id: Date.now().toString(),
        code,
        language,
        timestamp: new Date(),
        result,
      }
      setHistory(prev => [historyItem, ...prev.slice(0, 49)])
      
      addActivity({
        type: 'complete',
        content: `代码执行完成 (${executionTime}ms)`,
      })
    } catch (error: any) {
      setOutput(`❌ 执行错误\n\n${error.message}`)
      
      const historyItem: CodeHistory = {
        id: Date.now().toString(),
        code,
        language,
        timestamp: new Date(),
        error: error.message,
      }
      setHistory(prev => [historyItem, ...prev.slice(0, 49)])
      
      addActivity({
        type: 'error',
        content: `代码执行失败: ${error.message}`,
      })
    } finally {
      setIsRunning(false)
      setAgentAction('idle')
    }
  }

  const executeJavaScript = (code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const logs: string[] = []
        const originalConsole = {
          log: console.log,
          error: console.error,
          warn: console.warn,
          info: console.info,
        }

        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(formatValue).join(' ')),
          error: (...args: any[]) => logs.push('❌ ' + args.map(formatValue).join(' ')),
          warn: (...args: any[]) => logs.push('⚠️ ' + args.map(formatValue).join(' ')),
          info: (...args: any[]) => logs.push('ℹ️ ' + args.map(formatValue).join(' ')),
        }

        const wrappedCode = `
          (function() {
            const console = ${JSON.stringify(mockConsole)};
            Object.assign(console, {
              log: ${mockConsole.log.toString()},
              error: ${mockConsole.error.toString()},
              warn: ${mockConsole.warn.toString()},
              info: ${mockConsole.info.toString()}
            });
            ${code}
          })()
        `

        const result = eval(wrappedCode)
        
        Object.assign(console, originalConsole)
        
        let output = logs.join('\n')
        if (result !== undefined) {
          output += (output ? '\n\n' : '') + '返回值: ' + formatValue(result)
        }
        
        resolve(output || '(无输出)')
      } catch (error: any) {
        reject(error)
      }
    })
  }

  const executeJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed, null, 2)
    } catch (error: any) {
      throw new Error(`JSON 解析错误: ${error.message}`)
    }
  }

  const executeViaGateway = async (code: string, lang: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:18789/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 921c1d25ed0ece93983617c63152e99c7cdb65218d9eca5d',
        },
        body: JSON.stringify({
          model: 'kimi-k2.5',
          messages: [
            {
              role: 'system',
              content: `你是一个代码执行助手。用户会给你${lang}代码，请执行并返回结果。只返回执行结果，不要解释。`
            },
            {
              role: 'user',
              content: `执行以下${lang}代码并返回结果：\n\`\`\`${lang}\n${code}\n\`\`\``
            }
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gateway 请求失败: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || '(无输出)'
    } catch (error: any) {
      if (error.message.includes('Gateway') || error.message.includes('fetch')) {
        throw new Error('Gateway 未连接，无法执行此语言代码')
      }
      throw error
    }
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return String(value)
      }
    }
    return String(value)
  }

  const handleClear = () => {
    setCode('')
    setOutput('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    message.success('代码已复制')
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output)
    message.success('输出已复制')
  }

  const handleLoadFromHistory = (item: CodeHistory) => {
    setCode(item.code)
    setLanguage(item.language)
    if (item.result) {
      setOutput(item.result)
    } else if (item.error) {
      setOutput(`❌ 执行错误\n\n${item.error}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleRun()
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      message.success('代码已保存到历史记录')
    }
  }

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + '  ' + code.substring(end)
        setCode(newCode)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.substring(0, start) + snippet + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + snippet.length
        textarea.focus()
      }, 0)
    }
  }

  const snippetsMenu = (
    <Menu>
      <Menu.ItemGroup title="JavaScript">
        <Menu.Item onClick={() => insertSnippet('console.log()')}>console.log()</Menu.Item>
        <Menu.Item onClick={() => insertSnippet('async function () {\n  \n}')}>async function</Menu.Item>
        <Menu.Item onClick={() => insertSnippet('try {\n  \n} catch (error) {\n  console.error(error);\n}')}>try-catch</Menu.Item>
        <Menu.Item onClick={() => insertSnippet('const response = await fetch(url);\nconst data = await response.json();')}>fetch</Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup title="Python">
        <Menu.Item onClick={() => insertSnippet('print()')}>print()</Menu.Item>
        <Menu.Item onClick={() => insertSnippet('def function_name():\n    ')}>def function</Menu.Item>
        <Menu.Item onClick={() => insertSnippet('for item in items:\n    ')}>for loop</Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  )

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="developer-page">
      <div className="developer-header">
        <div className="header-left">
          <CodeOutlined className="header-icon" />
          <h1>开发者环境</h1>
          <Select
            value={language}
            onChange={setLanguage}
            options={LANGUAGES.map(l => ({ value: l.value, label: `${l.icon} ${l.label}` }))}
            style={{ width: 160, marginLeft: 16 }}
          />
        </div>
        <div className="header-right">
          <Dropdown overlay={snippetsMenu} placement="bottomRight">
            <Button icon={<CodeOutlined />}>代码片段</Button>
          </Dropdown>
          <Tooltip title="字体大小">
            <Select
              value={fontSize}
              onChange={setFontSize}
              options={[12, 14, 16, 18, 20].map(s => ({ value: s, label: `${s}px` }))}
              style={{ width: 80 }}
            />
          </Tooltip>
          <Tooltip title="清空 (Ctrl+L)">
            <Button icon={<ClearOutlined />} onClick={handleClear} />
          </Tooltip>
          <Tooltip title="复制代码">
            <Button icon={<CopyOutlined />} onClick={handleCopy} />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
            loading={isRunning}
            className="run-btn"
          >
            运行 (Ctrl+Enter)
          </Button>
        </div>
      </div>

      <div className="developer-content">
        <div className="editor-section">
          <div className="editor-header">
            <span className="editor-title">
              <CodeOutlined /> 代码编辑器
            </span>
            <div className="editor-actions">
              <Tag color={isRunning ? 'processing' : 'default'}>
                {isRunning ? '执行中...' : '就绪'}
              </Tag>
            </div>
          </div>
          <div className="editor-wrapper">
            <div className="line-numbers">
              {code.split('\n').map((_, i) => (
                <div key={i} className="line-number">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                handleTab(e)
                handleKeyDown(e)
              }}
              placeholder={`输入 ${LANGUAGES.find(l => l.value === language)?.label} 代码... (Ctrl+Enter 运行)`}
              style={{ fontSize }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="output-section">
          <div className="output-header">
            <span className="output-title">
              <ThunderboltOutlined /> 输出结果
            </span>
            <div className="output-actions">
              {output && (
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopyOutput}>
                  复制
                </Button>
              )}
            </div>
          </div>
          <div className="output-content" ref={outputRef}>
            {isRunning ? (
              <div className="output-loading">
                <Spin />
                <span>执行中...</span>
              </div>
            ) : output ? (
              <pre className="output-text">{output}</pre>
            ) : (
              <div className="output-empty">
                <CodeOutlined />
                <span>运行代码后在此查看结果</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="developer-sidebar">
        <div className="sidebar-section">
          <div className="section-header">
            <HistoryOutlined />
            <span>执行历史</span>
            {history.length > 0 && (
              <Button 
                size="small" 
                type="text"
                onClick={() => setHistory([])}
              >
                清空
              </Button>
            )}
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">暂无历史记录</div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => handleLoadFromHistory(item)}
                >
                  <div className="history-header">
                    <Tag>{LANGUAGES.find(l => l.value === item.language)?.icon}</Tag>
                    <span className="history-time">{formatTime(item.timestamp)}</span>
                  </div>
                  <div className="history-preview">
                    {item.code.substring(0, 50)}...
                  </div>
                  <div className={`history-status ${item.error ? 'error' : 'success'}`}>
                    {item.error ? '❌ 错误' : '✅ 成功'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <BugOutlined />
            <span>快捷操作</span>
          </div>
          <div className="quick-actions">
            <Button block onClick={() => setCode('console.log("Hello, RofenClaw!");')}>
              Hello World
            </Button>
            <Button block onClick={() => setCode(`// 获取当前时间
const now = new Date();
console.log('当前时间:', now.toLocaleString('zh-CN'));
console.log('时间戳:', now.getTime());`)}>
              获取时间
            </Button>
            <Button block onClick={() => setCode(`// JSON 处理示例
const data = {
  name: "OpenClaw",
  version: "1.0.0",
  features: ["对话", "技能", "分身"]
};
console.log(JSON.stringify(data, null, 2));`)}>
              JSON 示例
            </Button>
            <Button block onClick={() => setCode(`// 异步操作示例
async function fetchData() {
  try {
    const response = await fetch('https://api.github.com');
    const data = await response.json();
    console.log('GitHub API:', data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}
fetchData();`)}>
              异步请求
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Developer
