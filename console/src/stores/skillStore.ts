import { create } from 'zustand'

export interface Skill {
  name: string
  description: string
  version: string
  enabled: boolean
  source: 'openclaw-bundled' | 'openclaw-workspace' | 'clawhub'
  installedAt?: Date
  author?: string
  downloads?: number
  rating?: number
}

interface SkillState {
  skills: Skill[]
  loading: boolean
  marketSkills: Skill[]
  marketLoading: boolean
  
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  updateSkill: (name: string, updates: Partial<Skill>) => void
  removeSkill: (name: string) => void
  setLoading: (loading: boolean) => void
  setMarketSkills: (skills: Skill[]) => void
  setMarketLoading: (loading: boolean) => void
}

export const useSkillStore = create<SkillState>((set) => ({
  skills: [],
  loading: false,
  marketSkills: [],
  marketLoading: false,

  setSkills: (skills) => set({ skills }),
  
  addSkill: (skill) =>
    set((state) => ({
      skills: [...state.skills, skill],
    })),

  updateSkill: (name, updates) =>
    set((state) => ({
      skills: state.skills.map((s) =>
        s.name === name ? { ...s, ...updates } : s
      ),
    })),

  removeSkill: (name) =>
    set((state) => ({
      skills: state.skills.filter((s) => s.name !== name),
    })),

  setLoading: (loading) => set({ loading }),
  setMarketSkills: (skills) => set({ marketSkills: skills }),
  setMarketLoading: (loading) => set({ marketLoading: loading }),
}))
