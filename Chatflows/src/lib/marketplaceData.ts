export interface Workflow {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  creator: string;
  rating: number;
  reviews: number;
  installs: number;
  isPremium: boolean;
  price?: number;
  icon: string;
  features: string[];
  exampleOutput?: string;
  trending?: boolean;
  new?: boolean;
  templateData?: {
    nodes: any[];
    edges: any[];
  };
}

export const WORKFLOWS: Workflow[] = [];

export const CATEGORIES = [
  'All',
  'Marketing',
  'Content Creation',
  'Coding',
  'Productivity',
  'Social Media',
  'Business Automation',
  'AI Research',
  'Data Analysis'
];
