import { create } from 'zustand'

export interface Agent {
  id: string
  name: string
  emoji: string
  model: string
  workspace: string
  identity?: {
    name?: string
    creature?: string
    vibe?: string
    emoji?: string
  }
  skillsCount: number
  isActive: boolean
  createdAt: Date
}

interface AgentState {
  agents: Agent[]
  currentAgent: Agent | null
  loading: boolean
  
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  removeAgent: (id: string) => void
  setCurrentAgent: (agent: Agent | null) => void
  setLoading: (loading: boolean) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  currentAgent: null,
  loading: false,

  setAgents: (agents) => set({ agents }),
  
  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      currentAgent:
        state.currentAgent?.id === id
          ? { ...state.currentAgent, ...updates }
          : state.currentAgent,
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      currentAgent:
        state.currentAgent?.id === id ? null : state.currentAgent,
    })),

  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  setLoading: (loading) => set({ loading }),
}))
