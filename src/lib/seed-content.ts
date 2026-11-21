import type { Language } from '@/lib/use-lang';

/**
 * English display text for the built-in demo projects and skills that script/migrate.mjs seeds
 * (Turkish in the database). Only rows whose id is listed here are overlaid, and only when the
 * UI language is English; user-created rows and the Turkish UI are returned untouched.
 */

interface ProjectText {
  title: string;
  prompt: string;
}

interface SkillText {
  name: string;
  description: string;
  tags: string[];
  examplePrompt?: string;
}

const PROJECTS_EN: Record<string, ProjectText> = {
  'demo-project-slides': { title: 'Coffee Shop Presentation', prompt: 'Create a presentation for a coffee shop' },
  'demo-project-document': { title: 'Market Analysis Report', prompt: 'Q4 market analysis report' },
  'demo-project-image': { title: 'Product Promo Image', prompt: 'Modern product promo image' },
  'demo-project-sheet': { title: 'Budget Spreadsheet', prompt: 'Monthly budget tracking spreadsheet' },
  'demo-project-website': { title: 'Landing Page', prompt: 'SaaS product landing page' },
  'demo-project-video': { title: 'Tutorial Video', prompt: 'Product usage tutorial' },
  'showcase-slides-pitch': {
    title: 'Fintech Investor Deck',
    prompt:
      'Prepare a 12-slide investor deck for a pre-seed fintech startup: problem, solution, market size, business model, team and funding ask',
  },
  'showcase-slides-q3': {
    title: 'Q3 Sales Performance',
    prompt:
      'Create a management presentation comparing third-quarter sales performance by region, with target vs. actual charts',
  },
  'showcase-document-kvkk': {
    title: 'KVKK Compliance Checklist',
    prompt: 'Prepare a KVKK (Turkish data protection law) compliance checklist and a draft privacy notice for a small e-commerce company',
  },
  'showcase-document-plan': {
    title: 'Café Business Plan',
    prompt: 'Write a 3-year business plan and financial summary for a third-wave coffee shop opening in Izmir',
  },
  'showcase-image-social': {
    title: 'Launch Social Media Visual',
    prompt: 'Design an Instagram and LinkedIn post visual for a new mobile app launch; purple-orange palette, clean typography',
  },
  'showcase-image-menu': {
    title: 'Restaurant Menu Card',
    prompt: 'Design an A4 menu card for a restaurant serving Aegean cuisine: starters, main courses, desserts',
  },
  'showcase-sheet-crm': {
    title: 'B2B Sales Funnel Spreadsheet',
    prompt: 'Create a sales funnel spreadsheet for a B2B sales team with stage, probability, expected revenue and owner columns',
  },
  'showcase-sheet-stock': {
    title: 'Stock and Order Tracking',
    prompt: 'Prepare an inventory tracking spreadsheet for a small boutique with product, stock quantity, reorder level and supplier information',
  },
  'showcase-website-clinic': {
    title: 'Dental Clinic Website',
    prompt: 'Create a one-page website for a dental clinic with services, doctors, online appointment and contact sections',
  },
  'showcase-website-portfolio': {
    title: 'Architect Portfolio Site',
    prompt: 'Design a portfolio site for a freelance interior designer with a project gallery, about me and contact pages',
  },
  'showcase-video-reels': {
    title: 'Product Promo Reels',
    prompt: 'A 30-second vertical promo video for a smart thermos: scene plan, voice-over script and subtitles',
  },
  'showcase-video-onboarding': {
    title: 'New Hire Onboarding',
    prompt: 'A 2-minute onboarding video script explaining company culture and first-week steps for new hires',
  },
};

const SKILLS_EN: Record<string, SkillText> = {
  'demo-skill-document': {
    name: 'Professional Document Creator',
    description: 'Creates professional documents, reports and articles',
    tags: ['document', 'report'],
  },
  'demo-skill-slides': {
    name: 'Presentation Creator',
    description: 'Turns narratives into professional slides',
    tags: ['presentation', 'slides'],
  },
  'demo-skill-image': {
    name: 'Image Creator',
    description: 'Creates image drafts from text',
    tags: ['image', 'design'],
  },
  'demo-skill-sheet': {
    name: 'Data Analysis and Spreadsheet',
    description: 'Turns raw data into well-organised spreadsheets',
    tags: ['spreadsheet', 'data'],
  },
  'demo-skill-website': {
    name: 'Website Creator',
    description: 'Creates website drafts from natural language',
    tags: ['website', 'landing page'],
  },
  'demo-skill-video': {
    name: 'Video Planner',
    description: 'Plans storyboards and video editing',
    tags: ['video', 'storyboard'],
  },
  'skill-pitch-deck': {
    name: 'Investor Pitch Deck',
    description: 'Prepares an investor deck that presents your startup through the problem, solution, market and financial targets',
    tags: ['presentation', 'investor', 'startup'],
    examplePrompt: 'Prepare a 10-slide investor deck for my SaaS startup',
  },
  'skill-meeting-notes': {
    name: 'Meeting Summary',
    description: 'Turns meeting notes into a list of decisions, owners and dated action items',
    tags: ['meeting', 'summary', 'action'],
    examplePrompt: 'Turn these meeting notes into a list of decisions and actions: ',
  },
  'skill-social-pack': {
    name: 'Social Media Content Pack',
    description: 'Produces post copy, visual briefs and hashtag suggestions for a week',
    tags: ['social media', 'content', 'image'],
    examplePrompt: 'Prepare a one-week Instagram content pack for my café',
  },
  'skill-finance-report': {
    name: 'Financial Summary Spreadsheet',
    description: 'Builds a monthly summary, margin and trend table from income and expense data',
    tags: ['finance', 'spreadsheet', 'report'],
    examplePrompt: 'Create a profit margin spreadsheet from my monthly income and expense data',
  },
  'skill-landing-copy': {
    name: 'Landing Page Copy',
    description: 'Writes headlines, benefit points, FAQ and call-to-action copy for a product landing page',
    tags: ['website', 'copy', 'conversion'],
    examplePrompt: 'Write landing page copy for my online accounting app',
  },
  'skill-video-script': {
    name: 'Video Script',
    description: 'Prepares a scene-by-scene script, voice-over and subtitle text for a short video',
    tags: ['video', 'script', 'reels'],
    examplePrompt: 'Write a 30-second Reels script for my product',
  },
};

/** Returns the project with English title/prompt when it is a known demo row and lang is `en`. */
export function localizeProject<T extends { id: string; title: string; prompt: string }>(project: T, lang: Language): T {
  if (lang !== 'en') return project;
  const text = PROJECTS_EN[project.id];
  return text ? { ...project, ...text } : project;
}

/** Same for skills; `defaultParams.examplePrompt` is replaced too when present. */
export function localizeSkill<
  T extends { id: string; name: string; description: string; tags?: string[]; defaultParams?: { examplePrompt?: unknown } | null },
>(skill: T, lang: Language): T {
  if (lang !== 'en') return skill;
  const text = SKILLS_EN[skill.id];
  if (!text) return skill;
  const defaultParams =
    skill.defaultParams && text.examplePrompt !== undefined
      ? { ...skill.defaultParams, examplePrompt: text.examplePrompt }
      : skill.defaultParams;
  return { ...skill, name: text.name, description: text.description, tags: text.tags, defaultParams };
}
