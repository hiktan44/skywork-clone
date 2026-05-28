export enum ProjectType {
  SLIDES = 'SLIDES',
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  SHEET = 'SHEET',
  WEBSITE = 'WEBSITE',
  VIDEO = 'VIDEO'
}

export enum Plan {
  FREE = 'FREE',
  PRO = 'PRO'
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Plan;
  projects?: Project[];
  tasks?: ScheduledTask[];
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  user?: User;
  title: string;
  type: ProjectType;
  outputUrl: string | null;
  thumbnailUrl: string | null;
  isPublic: boolean;
  prompt: string;
  createdAt: Date;
}

export interface ScheduledTask {
  id: string;
  userId: string;
  user?: User;
  name: string;
  cron: string;
  module: ProjectType;
  prompt: string;
  active: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  createdAt: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  module: ProjectType;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
}