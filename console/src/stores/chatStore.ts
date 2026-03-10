import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReasoningStep {
  id: string
  type: 'analyze' | 'search' | 'read' | 'generate'
  title: string
  details: string[]
  status: 'pending' | 'running' | 'completed'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  reasoning?: ReasoningStep[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  isArchived: boolean
  tags: string[]
  summary?: string
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  loading: boolean
  
  getCurrentConversation: () => Conversation | null
  
  createConversation: (title?: string) => string
  deleteConversation: (id: string) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setCurrentConversation: (id: string | null) => void
  
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  clearMessages: (conversationId: string) => void
  
  toggleFavorite: (id: string) => void
  toggleArchive: (id: string) => void
  
  getFavoriteConversations: () => Conversation[]
  getRecentConversations: () => Conversation[]
  
  setLoading: (loading: boolean) => void
  
  saveToMemory: (conversationId: string) => Promise<void>
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      loading: false,

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get()
        if (!currentConversationId) return null
        return conversations.find(c => c.id === currentConversationId) || null
      },

      createConversation: (title) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newConversation: Conversation = {
          id,
          title: title || `新对话 ${get().conversations.length + 1}`,
          messages: [],
          createdAt: now,
          updatedAt: now,
          isFavorite: false,
          isArchived: false,
          tags: [],
        }
        set(state => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }))
        return id
      },

      deleteConversation: (id) => {
        set(state => {
          const newConversations = state.conversations.filter(c => c.id !== id)
          const newCurrentId = state.currentConversationId === id 
            ? (newConversations[0]?.id || null)
            : state.currentConversationId
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          }
        })
      },

      updateConversation: (id, updates) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id 
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        }
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                  title: c.messages.length === 0 && message.role === 'user'
                    ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                    : c.title,
                }
              : c
          ),
        }))
      },

      clearMessages: (conversationId) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? { ...c, messages: [], updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      toggleFavorite: (id) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
          ),
        }))
      },

      toggleArchive: (id) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, isArchived: !c.isArchived } : c
          ),
        }))
      },

      getFavoriteConversations: () => {
        return get().conversations.filter(c => c.isFavorite && !c.isArchived)
      },

      getRecentConversations: () => {
        return get().conversations
          .filter(c => !c.isArchived)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 20)
      },

      setLoading: (loading) => set({ loading }),

      saveToMemory: async (conversationId) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (!conversation) return
        
        try {
          if (window.electronAPI?.saveConfig) {
            const config = await window.electronAPI.getConfig()
            if (config) {
              if (!config.memories) config.memories = []
              config.memories.push({
                id: conversationId,
                title: conversation.title,
                summary: conversation.summary || conversation.messages.slice(-3).map(m => m.content).join('\n'),
                savedAt: new Date().toISOString(),
                tags: conversation.tags,
              })
              await window.electronAPI.saveConfig(config)
            }
          }
        } catch (error) {
          console.error('保存到记忆失败:', error)
        }
      },
    }),
    {
      name: 'openclaw-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
