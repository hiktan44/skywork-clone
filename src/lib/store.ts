import { create } from 'zustand';
import { Project, ScheduledTask } from './types';

interface UIState {
  sidebarOpen: boolean;
  authModalOpen: boolean;
  announcementModalOpen: boolean;
  rightPanelOpen: boolean;
  authErrorCode: string | null;
  chatDraft: string;
  selectedProject: Project | null;
  trendingProjects: Project[];
  scheduledTasks: ScheduledTask[];
  toggleSidebar: () => void;
  setAuthModalOpen: (open: boolean) => void;
  setAnnouncementModalOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setAuthErrorCode: (code: string | null) => void;
  setChatDraft: (draft: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setTrendingProjects: (projects: Project[]) => void;
  setScheduledTasks: (tasks: ScheduledTask[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  authModalOpen: false,
  announcementModalOpen: false,
  rightPanelOpen: false,
  authErrorCode: null,
  chatDraft: '',
  selectedProject: null,
  trendingProjects: [],
  scheduledTasks: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAnnouncementModalOpen: (open) => set({ announcementModalOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setAuthErrorCode: (code) => set({ authErrorCode: code }),
  setChatDraft: (draft) => set({ chatDraft: draft }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setTrendingProjects: (projects) => set({ trendingProjects: projects }),
  setScheduledTasks: (tasks) => set({ scheduledTasks: tasks }),
}));