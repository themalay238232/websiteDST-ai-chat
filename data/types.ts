import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  children?: Array<{ label: string; path: string }>;
}

export interface ContactInformation {
  name: string;
  legalName: string;
  slogan: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  address: string;
  workingHours: string;
  website: string;
  zaloUrl: string;
  mapEmbedUrl: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  title: string;
  navLabel: string;
  eyebrow: string;
  summary: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  imageAlt?: string;
  tags: string[];
  audience: string;
  problems: string[];
  solutions: string[];
  deliverables: string[];
  process: string[];
  benefits: string[];
  faqs: FAQ[];
  relatedProjectSlugs: string[];
}

export interface Project {
  slug: string;
  title: string;
  client: string;
  industry: string;
  industryLabel: string;
  services: string[];
  summary: string;
  challenge: string;
  solution: string[];
  implementation: string[];
  results: string[];
  image?: string;
  imageAlt?: string;
  gallery?: Array<{ src: string; alt: string }>;
  relatedServiceSlugs: string[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  sections: ArticleSection[];
}

export interface TeamMember {
  role: string;
  focus: string;
  image?: string;
  imageAlt?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image?: string;
  imageAlt?: string;
}

export interface ClientPartner {
  name: string;
  image?: string;
  imageAlt?: string;
  url?: string;
}

export interface CareerPosition {
  slug: string;
  title: string;
  department: string;
  workMode: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  note: string;
}
