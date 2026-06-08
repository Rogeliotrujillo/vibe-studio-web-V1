/**
 * Types & Interfaces for Vibe Studio Applet
 */

export interface ProjectDemo {
  id: string;
  title: string;
  category: string;
  badge: string;
  image: string;
  description: string;
  tags: string[];
  link: string;
}

export interface BenefitItem {
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export interface ProjectConfig {
  id: string;
  businessName: string;
  servicesSoldCount: string;
  socialLink: string;
  themeColor: 'custom' | 'obsidian' | 'indigo' | 'cyan';
  customColorHex?: string;
  contactChannel: string;
  hasTexts: 'yes' | 'need_help' | 'no';
  specialSections: string[]; // e.g. nosotros, galeria, horarios, faq
  referencesCount: number;
  additionalDetails?: string;
  createdAt: string;
  pricing: number;
}

export interface FreePreviewRequest {
  id: string;
  fullName: string;
  businessName: string;
  instagramOrTiktok: string;
  goals: string;
  currentWebsite?: string;
  includedServices?: string[];
  createdAt: string;
}
