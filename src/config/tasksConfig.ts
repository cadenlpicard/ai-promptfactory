// Dynamic Use Cases, Tasks & Domains Configuration
// Config-driven approach for maximum flexibility and scalability

export interface DynamicField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select/multiselect
  min?: number; // For number
  max?: number; // For number
  default?: any;
}

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  fields: DynamicField[];
}

export interface UseCaseDefinition {
  id: string;
  name: string;
  description: string;
  tasks: TaskDefinition[];
}

export interface DomainDefinition {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

// ===== DOMAINS =====
export const DOMAINS: DomainDefinition[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General purpose assistance',
    keywords: ['general', 'universal', 'common']
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property development, investment, and real estate markets',
    keywords: ['property', 'development', 'investment', 'residential', 'commercial', 'market analysis', 'valuation', 'zoning', 'ROI', 'cap rate']
  },
  {
    id: 'real-estate-developers',
    name: 'Real Estate Developers',
    description: 'Property development, construction, and project management',
    keywords: ['development', 'construction', 'project management', 'permits', 'zoning', 'financing', 'feasibility', 'timeline', 'contractors']
  },
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    description: 'Software development, programming, and technical architecture',
    keywords: ['coding', 'development', 'architecture', 'debugging', 'testing', 'deployment', 'API', 'database', 'framework']
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Digital marketing, content strategy, and sales optimization',
    keywords: ['campaigns', 'content', 'SEO', 'conversion', 'funnel', 'analytics', 'branding', 'social media', 'ROI']
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    description: 'Financial analysis, investment, and banking operations',
    keywords: ['analysis', 'investment', 'risk', 'portfolio', 'compliance', 'regulations', 'derivatives', 'valuation', 'credit']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Medical research, patient care, and healthcare administration',
    keywords: ['patient care', 'diagnosis', 'treatment', 'research', 'clinical trials', 'regulations', 'medical devices', 'pharmaceuticals']
  },
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Educational content, curriculum design, and training programs',
    keywords: ['curriculum', 'learning', 'assessment', 'pedagogy', 'e-learning', 'training', 'certification', 'academic']
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Legal research, contract analysis, and compliance',
    keywords: ['contracts', 'compliance', 'litigation', 'intellectual property', 'regulations', 'legal research', 'due diligence']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Supply Chain',
    description: 'Production processes, quality control, and supply chain management',
    keywords: ['production', 'quality control', 'supply chain', 'logistics', 'inventory', 'lean manufacturing', 'automation']
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Food',
    description: 'Farming, food production, and agricultural technology',
    keywords: ['farming', 'crops', 'livestock', 'sustainability', 'precision agriculture', 'food safety', 'organic', 'biotechnology']
  },
  {
    id: 'adtech',
    name: 'AdTech & Real-time Bidding',
    description: 'Advertising technology, programmatic advertising, and RTB',
    keywords: ['programmatic', 'RTB', 'DSP', 'SSP', 'ad exchange', 'targeting', 'optimization', 'attribution', 'fraud detection']
  },
  {
    id: 'gaming',
    name: 'Gaming & Entertainment',
    description: 'Game development, entertainment industry, and media production',
    keywords: ['game design', 'mechanics', 'monetization', 'player engagement', 'graphics', 'narrative', 'streaming', 'esports']
  },
  {
    id: 'aerospace',
    name: 'Aerospace & Defense',
    description: 'Aerospace engineering, defense systems, and space technology',
    keywords: ['aerospace', 'defense', 'satellites', 'propulsion', 'avionics', 'systems engineering', 'security clearance']
  },
  {
    id: 'biotech',
    name: 'Biotech R&D',
    description: 'Biotechnology research, drug development, and life sciences',
    keywords: ['biotechnology', 'drug development', 'clinical trials', 'genomics', 'proteomics', 'regulatory approval', 'research']
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications',
    description: 'Telecom infrastructure, network engineering, and communications',
    keywords: ['network', 'infrastructure', '5G', 'fiber optic', 'bandwidth', 'latency', 'protocols', 'telecommunications']
  }
];

// ===== USE CASES =====
export const USE_CASES: UseCaseDefinition[] = [
  {
    id: 'code-review',
    name: 'Code Review & Analysis',
    description: 'Analyze code for quality, security, and best practices',
    tasks: [
      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Comprehensive security analysis of code',
        fields: [
          {
            id: 'code_language',
            label: 'Programming Language',
            type: 'select',
            required: true,
            options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'TypeScript', 'PHP', 'Ruby', 'C++']
          },
          {
            id: 'security_focus',
            label: 'Security Focus Areas',
            type: 'multiselect',
            placeholder: 'e.g., SQL injection, XSS, authentication',
            options: ['SQL Injection', 'XSS', 'Authentication', 'Authorization', 'Input Validation', 'Cryptography', 'API Security']
          },
          {
            id: 'compliance_standards',
            label: 'Compliance Standards',
            type: 'multiselect',
            placeholder: 'e.g., OWASP, SOC2, PCI-DSS',
            options: ['OWASP', 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'ISO 27001']
          },
          {
            id: 'include_recommendations',
            label: 'Include Fix Recommendations',
            type: 'checkbox',
            default: true
          }
        ]
      },
      {
        id: 'performance-review',
        name: 'Performance Review',
        description: 'Analyze code for performance bottlenecks and optimizations',
        fields: [
          {
            id: 'performance_metrics',
            label: 'Performance Metrics',
            type: 'multiselect',
            options: ['Speed', 'Memory Usage', 'CPU Usage', 'Network I/O', 'Database Queries', 'Caching']
          },
          {
            id: 'target_environment',
            label: 'Target Environment',
            type: 'select',
            options: ['Development', 'Staging', 'Production', 'Mobile', 'Edge Computing']
          },
          {
            id: 'scale_requirements',
            label: 'Scale Requirements',
            type: 'text',
            placeholder: 'e.g., 1M users, 10K requests/sec'
          }
        ]
      },
      {
        id: 'api-contract-review',
        name: 'API Contract Review',
        description: 'Review API design, contracts, and documentation',
        fields: [
          {
            id: 'api_type',
            label: 'API Type',
            type: 'select',
            options: ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'Webhook']
          },
          {
            id: 'review_areas',
            label: 'Review Areas',
            type: 'multiselect',
            options: ['Design Patterns', 'Documentation', 'Error Handling', 'Versioning', 'Security', 'Performance']
          }
        ]
      }
    ]
  },
  {
    id: 'write-blog',
    name: 'Content Creation & Blogging',
    description: 'Create engaging blog posts and content',
    tasks: [
      {
        id: 'market-analysis-post',
        name: 'Market Analysis Post',
        description: 'Deep-dive market analysis article',
        fields: [
          {
            id: 'market_focus',
            label: 'Market Focus',
            type: 'select',
            required: true,
            options: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Luxury', 'Affordable Housing']
          },
          {
            id: 'price_range',
            label: 'Price Range',
            type: 'text',
            placeholder: 'e.g., $300K-$500K, $1M+',
            required: true
          },
          {
            id: 'geographic_area',
            label: 'Geographic Area',
            type: 'text',
            placeholder: 'e.g., Austin, TX or nationwide',
            required: true
          },
          {
            id: 'target_buyers',
            label: 'Include Target Buyer Analysis',
            type: 'checkbox',
            default: true
          },
          {
            id: 'include_trends',
            label: 'Include Market Trends',
            type: 'checkbox',
            default: true
          },
          {
            id: 'data_sources',
            label: 'Data Sources to Reference',
            type: 'multiselect',
            options: ['MLS Data', 'Census Data', 'Market Reports', 'Industry Surveys', 'Economic Indicators']
          }
        ]
      },
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'Concise executive-level summary document',
        fields: [
          {
            id: 'summary_type',
            label: 'Summary Type',
            type: 'select',
            options: ['Business Plan', 'Market Research', 'Project Status', 'Financial Report', 'Strategic Initiative']
          },
          {
            id: 'target_audience',
            label: 'Target Audience',
            type: 'select',
            options: ['Board Members', 'Investors', 'C-Suite', 'Department Heads', 'External Partners']
          },
          {
            id: 'key_metrics',
            label: 'Key Metrics to Highlight',
            type: 'textarea',
            placeholder: 'List the most important metrics and KPIs'
          }
        ]
      },
      {
        id: 'technical-tutorial',
        name: 'Technical Tutorial',
        description: 'Step-by-step technical tutorial or guide',
        fields: [
          {
            id: 'skill_level',
            label: 'Target Skill Level',
            type: 'select',
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
          },
          {
            id: 'tutorial_format',
            label: 'Tutorial Format',
            type: 'select',
            options: ['Step-by-step', 'Code-along', 'Conceptual', 'Problem-solving', 'Reference Guide']
          },
          {
            id: 'include_code',
            label: 'Include Code Examples',
            type: 'checkbox',
            default: true
          }
        ]
      }
    ]
  },
  {
    id: 'email-reply',
    name: 'Email & Communication',
    description: 'Craft professional emails and responses',
    tasks: [
      {
        id: 'client-proposal',
        name: 'Client Proposal Response',
        description: 'Respond to client proposals and RFPs',
        fields: [
          {
            id: 'proposal_type',
            label: 'Proposal Type',
            type: 'select',
            options: ['New Project', 'Contract Renewal', 'Service Expansion', 'Partnership', 'Consulting']
          },
          {
            id: 'response_timeline',
            label: 'Response Timeline',
            type: 'text',
            placeholder: 'e.g., 2 weeks, by end of month'
          },
          {
            id: 'budget_range',
            label: 'Budget Range',
            type: 'text',
            placeholder: 'e.g., $50K-$100K, TBD'
          },
          {
            id: 'key_stakeholders',
            label: 'Key Stakeholders',
            type: 'text',
            placeholder: 'Who should be included in communications?'
          }
        ]
      },
      {
        id: 'follow-up-nudge',
        name: 'Follow-up Nudge',
        description: 'Polite follow-up email for pending responses',
        fields: [
          {
            id: 'days_since_last_contact',
            label: 'Days Since Last Contact',
            type: 'number',
            min: 1,
            max: 365,
            default: 7
          },
          {
            id: 'urgency_level',
            label: 'Urgency Level',
            type: 'select',
            options: ['Low', 'Medium', 'High', 'Critical']
          },
          {
            id: 'relationship_type',
            label: 'Relationship Type',
            type: 'select',
            options: ['New Contact', 'Existing Client', 'Partner', 'Vendor', 'Internal Team']
          }
        ]
      }
    ]
  },
  {
    id: 'research',
    name: 'Research & Analysis',
    description: 'Conduct comprehensive research and analysis',
    tasks: [
      {
        id: 'market-research',
        name: 'Market Research',
        description: 'Comprehensive market analysis and research',
        fields: [
          {
            id: 'research_scope',
            label: 'Research Scope',
            type: 'select',
            options: ['Local Market', 'National Market', 'Global Market', 'Niche Segment', 'Competitive Analysis']
          },
          {
            id: 'time_horizon',
            label: 'Time Horizon',
            type: 'select',
            options: ['Current State', '6 Months', '1 Year', '3 Years', '5+ Years']
          },
          {
            id: 'research_methodology',
            label: 'Research Methodology',
            type: 'multiselect',
            options: ['Primary Research', 'Secondary Research', 'Surveys', 'Interviews', 'Data Analysis', 'Trend Analysis']
          }
        ]
      },
      {
        id: 'competitive-landscape',
        name: 'Competitive Landscape',
        description: 'Analyze competitive environment and positioning',
        fields: [
          {
            id: 'competitor_count',
            label: 'Number of Key Competitors',
            type: 'number',
            min: 1,
            max: 20,
            default: 5
          },
          {
            id: 'analysis_dimensions',
            label: 'Analysis Dimensions',
            type: 'multiselect',
            options: ['Pricing', 'Features', 'Market Share', 'Customer Satisfaction', 'Financial Performance', 'Growth Strategy']
          },
          {
            id: 'competitive_advantage',
            label: 'Our Competitive Advantages',
            type: 'textarea',
            placeholder: 'List your key differentiators'
          }
        ]
      }
    ]
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis & Insights',
    description: 'Analyze data and generate actionable insights',
    tasks: [
      {
        id: 'financial-analysis',
        name: 'Financial Analysis',
        description: 'Comprehensive financial data analysis',
        fields: [
          {
            id: 'analysis_type',
            label: 'Analysis Type',
            type: 'select',
            options: ['Revenue Analysis', 'Cost Analysis', 'Profitability', 'Cash Flow', 'ROI Analysis', 'Budget Variance']
          },
          {
            id: 'time_period',
            label: 'Time Period',
            type: 'select',
            options: ['Monthly', 'Quarterly', 'Yearly', 'YTD', 'Custom Range']
          },
          {
            id: 'key_metrics',
            label: 'Key Metrics',
            type: 'multiselect',
            options: ['Revenue', 'Expenses', 'Profit Margin', 'EBITDA', 'Cash Flow', 'ROI', 'Growth Rate']
          }
        ]
      },
      {
        id: 'dbt-model-proposal',
        name: 'DBT Model Proposal',
        description: 'Propose data transformation models and architecture',
        fields: [
          {
            id: 'model_type',
            label: 'Model Type',
            type: 'select',
            options: ['Staging', 'Intermediate', 'Mart', 'Snapshot', 'Analysis']
          },
          {
            id: 'data_sources',
            label: 'Data Sources',
            type: 'textarea',
            placeholder: 'List the source tables and systems'
          },
          {
            id: 'business_logic',
            label: 'Key Business Logic',
            type: 'textarea',
            placeholder: 'Describe the main transformations needed'
          }
        ]
      }
    ]
  },
  {
    id: 'project-planning',
    name: 'Project Planning & Management',
    description: 'Plan and manage projects effectively',
    tasks: [
      {
        id: 'project-charter',
        name: 'Project Charter',
        description: 'Create comprehensive project charter document',
        fields: [
          {
            id: 'project_type',
            label: 'Project Type',
            type: 'select',
            options: ['Software Development', 'Marketing Campaign', 'Process Improvement', 'Research', 'Construction']
          },
          {
            id: 'project_duration',
            label: 'Expected Duration',
            type: 'select',
            options: ['< 1 month', '1-3 months', '3-6 months', '6-12 months', '> 1 year']
          },
          {
            id: 'team_size',
            label: 'Team Size',
            type: 'number',
            min: 1,
            max: 100,
            default: 5
          },
          {
            id: 'budget_range',
            label: 'Budget Range',
            type: 'text',
            placeholder: 'e.g., $50K-$100K'
          }
        ]
      }
    ]
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing & Storytelling',
    description: 'Create compelling narratives and creative content',
    tasks: [
      {
        id: 'brand-story',
        name: 'Brand Story',
        description: 'Craft compelling brand narrative',
        fields: [
          {
            id: 'brand_personality',
            label: 'Brand Personality',
            type: 'multiselect',
            options: ['Professional', 'Innovative', 'Trustworthy', 'Bold', 'Friendly', 'Luxury', 'Sustainable']
          },
          {
            id: 'origin_story',
            label: 'Include Origin Story',
            type: 'checkbox',
            default: true
          },
          {
            id: 'target_emotions',
            label: 'Target Emotions',
            type: 'multiselect',
            options: ['Trust', 'Excitement', 'Confidence', 'Aspiration', 'Security', 'Innovation']
          }
        ]
      }
    ]
  },
  {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    description: 'Create clear technical documentation',
    tasks: [
      {
        id: 'api-documentation',
        name: 'API Documentation',
        description: 'Comprehensive API documentation',
        fields: [
          {
            id: 'api_type',
            label: 'API Type',
            type: 'select',
            options: ['REST', 'GraphQL', 'gRPC', 'WebSocket']
          },
          {
            id: 'include_examples',
            label: 'Include Code Examples',
            type: 'checkbox',
            default: true
          },
          {
            id: 'authentication_type',
            label: 'Authentication Type',
            type: 'select',
            options: ['API Key', 'OAuth', 'JWT', 'Basic Auth', 'Bearer Token']
          }
        ]
      }
    ]
  }
];

// ===== HELPER FUNCTIONS =====

export function getTasksForUseCase(useCaseId?: string): TaskDefinition[] {
  if (!useCaseId) return [];
  const useCase = USE_CASES.find(uc => uc.id === useCaseId);
  return useCase?.tasks || [];
}

export function getFieldsFor(useCaseId?: string, taskId?: string): DynamicField[] {
  if (!useCaseId || !taskId) return [];
  const tasks = getTasksForUseCase(useCaseId);
  const task = tasks.find(t => t.id === taskId);
  return task?.fields || [];
}

export function getUseCaseById(id: string): UseCaseDefinition | undefined {
  return USE_CASES.find(uc => uc.id === id);
}

export function getTaskById(useCaseId: string, taskId: string): TaskDefinition | undefined {
  const useCase = getUseCaseById(useCaseId);
  return useCase?.tasks.find(t => t.id === taskId);
}

export function getDomainById(id: string): DomainDefinition | undefined {
  return DOMAINS.find(d => d.id === id);
}

// Export all for easy access
export { USE_CASES as useCases, DOMAINS as domains };