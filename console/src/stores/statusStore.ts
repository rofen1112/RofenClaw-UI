import { create } from 'zustand'

export interface Activity {
  id: string
  timestamp: Date
  type: 'message' | 'thinking' | 'reading' | 'searching' | 'generating' | 'complete' | 'error'
  content: string
  details?: string
}

export interface SystemStatus {
  isRunning: boolean
  uptime: number
  cpu: number
  memory: number
  currentAgent: string
  currentModel: string
  sessionActive: boolean
  gatewayConnected: boolean
  gatewayPort: number
}

export interface SessionStats {
  todayMessages: number
  totalTokens: number
  cacheHitRate: number
}

interface StatusState {
  systemStatus: SystemStatus
  activities: Activity[]
  sessionStats: SessionStats
  agentPosition: { x: number; y: number; z: number }
  agentAction: 'idle' | 'thinking' | 'working' | 'talking'
  
  updateSystemStatus: (status: Partial<SystemStatus>) => void
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  clearActivities: () => void
  updateSessionStats: (stats: Partial<SessionStats>) => void
  setAgentPosition: (pos: { x: number; y: number; z: number }) => void
  setAgentAction: (action: StatusState['agentAction']) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useStatusStore = create<StatusState>((set) => ({
  systemStatus: {
    isRunning: true,
    uptime: 0,
    cpu: 0,
    memory: 0,
    currentAgent: 'main',
    currentModel: 'Kimi K2.5',
    sessionActive: false,
    gatewayConnected: false,
    gatewayPort: 18789,
  },
  activities: [],
  sessionStats: {
    todayMessages: 0,
    totalTokens: 0,
    cacheHitRate: 0,
  },
  agentPosition: { x: 0, y: 0, z: 0 },
  agentAction: 'idle',

  updateSystemStatus: (status) =>
    set((state) => ({
      systemStatus: { ...state.systemStatus, ...status },
    })),

  addActivity: (activity) =>
    set((state) => ({
      activities: [
        {
          id: generateId(),
          timestamp: new Date(),
          ...activity,
        },
        ...state.activities,
      ].slice(0, 100),
    })),

  clearActivities: () => set({ activities: [] }),

  updateSessionStats: (stats) =>
    set((state) => ({
      sessionStats: { ...state.sessionStats, ...stats },
    })),

  setAgentPosition: (pos) => set({ agentPosition: pos }),
  setAgentAction: (action) => set({ agentAction: action }),
}))
