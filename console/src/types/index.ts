import { ReactNode } from 'react'

export interface NavItem {
  path: string
  icon: ReactNode
  label: string
}

export interface AppConfig {
  language: string
  autoStart: boolean
  showSplash: boolean
  minimizeToTray: boolean
  defaultAgent: string
  maxConcurrent: number
  subagentConcurrent: number
  defaultModel: string
  gatewayPort: number
  theme: 'dark' | 'light'
}

export interface OpenClawConfig {
  meta: {
    lastTouchedVersion: string
    lastTouchedAt: string
  }
  browser: {
    enabled: boolean
    defaultProfile: string
  }
  auth: {
    profiles: Record<string, {
      provider: string
      mode: string
    }>
  }
  models: {
    mode: string
    providers: Record<string, {
      baseUrl: string
      api: string
      models: Array<{
        id: string
        name: string
        reasoning: boolean
        input: string[]
        cost: {
          input: number
          output: number
          cacheRead: number
          cacheWrite: number
        }
        contextWindow: number
        maxTokens: number
      }>
    }>
  }
  agents: {
    defaults: {
      model: {
        primary: string
      }
      workspace: string
      compaction: {
        mode: string
      }
      maxConcurrent: number
      subagents: {
        maxConcurrent: number
      }
    }
    list: Array<{
      id: string
      name?: string
      workspace?: string
      agentDir?: string
      model?: string
      identity?: {
        name: string
        emoji: string
      }
    }>
  }
  gateway: {
    port: number
    mode: string
    bind: string
    auth: {
      mode: string
      token: string
    }
  }
  console?: AppConfig
  memories?: Array<{
    id: string
    title: string
    summary: string
    savedAt: string
    tags?: string[]
  }>
}

declare global {
  interface Window {
    electronAPI?: {
      getConfig: () => Promise<OpenClawConfig | null>
      saveConfig: (config: OpenClawConfig) => Promise<{ success: boolean; error?: string }>
      checkGateway: () => Promise<boolean>
      gatewayChat: (message: string) => Promise<string>
      getLogs: () => Promise<Array<{
        id: string
        timestamp: string
        level: 'info' | 'warn' | 'error' | 'debug'
        source: string
        message: string
        details?: string
      }>>
      openExternal: (url: string) => Promise<void>
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      getAppPath: () => Promise<{
        home: string
        userData: string
        openclawDir: string
      }>
      onNavigate: (callback: (route: string) => void) => void
      onRestartGateway: (callback: () => void) => void
    }
  }
}

export {}
