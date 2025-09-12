import { DynamicField, UseCaseDefinition, TaskDefinition, DomainDefinition } from '@/types';

// ====== SHARED FIELDS (DRY helpers you can spread into tasks) ======
const FMT_TONE_LANG: DynamicField[] = [
  { id: 'tone', label: 'Tone', type: 'select', options: ['Neutral','Professional','Friendly','Persuasive','Executive','Academic','Technical'] },
  { id: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g., executives, engineers, customers' },
  { id: 'language', label: 'Language', type: 'select', options: ['English','Spanish','French','German','Portuguese','Italian','Japanese','Korean','Chinese'], default: 'English' },
  { id: 'writing_length', label: 'Target Length', type: 'select', options: ['Short','Medium','Long','One-page','2-3 pages'] }
];

const FMT_OUTPUT: DynamicField[] = [
  { id: 'output_format', label: 'Output Format', type: 'select', options: ['Markdown','Plain text','HTML','JSON','CSV','PowerPoint outline','Email draft'], default: 'Markdown' },
  { id: 'include_citations', label: 'Include Citations/Links', type: 'checkbox', default: false },
  { id: 'structured_schema', label: 'Structured Schema (JSON key list)', type: 'textarea', placeholder: 'List of fields to include in JSON output' }
];

const SOURCE_FIELDS: DynamicField[] = [
  { id: 'input_text', label: 'Input Text', type: 'textarea', placeholder: 'Paste content or notes here' },
  { id: 'input_urls', label: 'Reference URLs (comma-sep)', type: 'text', placeholder: 'https://… , https://…' },
  { id: 'file_hint', label: 'File Hints', type: 'text', placeholder: 'Describe uploaded files or data sources' }
];

const PRIVACY_FIELDS: DynamicField[] = [
  { id: 'contains_sensitive', label: 'Contains Sensitive Data', type: 'checkbox', default: false },
  { id: 'redact_pii', label: 'Redact PII', type: 'checkbox', default: true }
];

const REVIEW_FLAGS: DynamicField[] = [
  { id: 'add_critique', label: 'Add Critique/Issues List', type: 'checkbox', default: true },
  { id: 'add_rewrite', label: 'Provide Improved Rewrite', type: 'checkbox', default: true }
];

const PLANNING_FIELDS: DynamicField[] = [
  { id: 'time_horizon', label: 'Time Horizon', type: 'select', options: ['Now/Next','Quarter','6–12 months','1–3 years'] },
  { id: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'Budget, headcount, regs, deadlines, tech limits' },
  { id: 'success_metrics', label: 'Success Metrics', type: 'textarea', placeholder: 'KPIs, acceptance criteria' }
];

const DATA_FIELDS: DynamicField[] = [
  { id: 'data_shape', label: 'Data Shape', type: 'select', options: ['Table','CSV','JSON','Free text','Mixed/Unstructured'], default: 'Table' },
  { id: 'analysis_focus', label: 'Analysis Focus', type: 'multiselect', options: ['Descriptive','Diagnostic','Predictive','Prescriptive','Anomaly detection','Segmentation'] },
  { id: 'visuals', label: 'Include Visuals', type: 'multiselect', options: ['Table','Chart suggestions','SQL examples','Python snippets'] }
];

const ENG_STACK_FIELDS: DynamicField[] = [
  { id: 'language_preference', label: 'Programming Language', type: 'select', options: ['Python','JavaScript/TypeScript','Go','Java','C#','.NET','SQL','Other'] },
  { id: 'frameworks', label: 'Frameworks/Libs', type: 'text', placeholder: 'e.g., React, FastAPI, Django, Node, dbt' },
  { id: 'env_target', label: 'Target Env', type: 'select', options: ['Local','Docker','Kubernetes','Serverless','Edge','Mobile'] }
];

// ====== 8 HIGH-LEVEL USE CASES ======
export const USE_CASES: UseCaseDefinition[] = [
  // 1) Research & Knowledge Work
  {
    id: 'research-knowledge',
    name: 'Research & Knowledge',
    description: 'Search, synthesize, compare, and summarize information across domains.',
    tasks: [
      {
        id: 'literature-review',
        name: 'Literature/Market Review',
        description: 'Synthesize sources into an objective brief with citations.',
        fields: [
          ...SOURCE_FIELDS,
          { id: 'scope', label: 'Scope', type: 'select', options: ['Snapshot','Last 6 months','Last 12 months','All-time'] },
          { id: 'depth', label: 'Depth', type: 'select', options: ['Executive summary','Detailed brief','Deep dive'] },
          ...FMT_TONE_LANG, ...FMT_OUTPUT, ...PRIVACY_FIELDS
        ]
      },
      {
        id: 'compare-options',
        name: 'Compare Options',
        description: 'Side-by-side evaluation (vendors, products, policies, strategies).',
        fields: [
          { id: 'options', label: 'Options to Compare (comma-sep)', type: 'textarea', required: true },
          { id: 'criteria', label: 'Decision Criteria', type: 'textarea', placeholder: 'Price, features, risk, timeline…' },
          { id: 'scorecard', label: 'Return Scorecard', type: 'checkbox', default: true },
          ...FMT_OUTPUT, ...REVIEW_FLAGS
        ]
      },
      {
        id: 'extract-structure',
        name: 'Extract & Structure',
        description: 'Pull entities/facts and return as structured data.',
        fields: [
          ...SOURCE_FIELDS,
          { id: 'entity_schema', label: 'Entities/Fields to Extract', type: 'textarea', required: true, placeholder: 'name, date, amount, risk_level…' },
          ...FMT_OUTPUT, ...PRIVACY_FIELDS
        ]
      }
    ]
  },

  // 2) Content & Communication
  {
    id: 'content-comms',
    name: 'Content & Communication',
    description: 'Generate, rewrite, translate, and tailor content for audiences and channels.',
    tasks: [
      {
        id: 'generate-content',
        name: 'Create Content',
        description: 'Blog posts, emails, briefs, social posts, landing copy.',
        fields: [
          ...SOURCE_FIELDS,
          { id: 'content_type', label: 'Content Type', type: 'select', options: ['Email','Blog post','Executive summary','Press release','Social post','FAQ','One-pager'] },
          { id: 'channel', label: 'Channel', type: 'select', options: ['Email','Web','LinkedIn','X/Twitter','Deck'] },
          ...FMT_TONE_LANG, ...FMT_OUTPUT
        ]
      },
      {
        id: 'transform-content',
        name: 'Transform/Rewrite',
        description: 'Rewrite, summarize, expand, translate, or change style.',
        fields: [
          ...SOURCE_FIELDS,
          { id: 'transform_ops', label: 'Operations', type: 'multiselect', options: ['Summarize','Expand','Simplify','Translate','Change tone','Make bullet points','Explain like I’m 5'] },
          ...FMT_TONE_LANG, ...FMT_OUTPUT, ...REVIEW_FLAGS
        ]
      },
      {
        id: 'outreach-sequences',
        name: 'Outreach Sequences',
        description: 'Multi-touch campaigns (sales, recruiting, fundraising).',
        fields: [
          { id: 'persona', label: 'Target Persona', type: 'text', placeholder: 'e.g., VP Eng in fintech' },
          { id: 'sequence_length', label: 'Steps', type: 'select', options: ['3','5','7'] },
          { id: 'cadence_days', label: 'Cadence (days)', type: 'number', min: 1, max: 60, default: 4 },
          ...FMT_TONE_LANG, ...FMT_OUTPUT
        ]
      }
    ]
  },

  // 3) Data, Analytics & BI
  {
    id: 'data-analytics',
    name: 'Data, Analytics & BI',
    description: 'Analyze, visualize, model and recommend actions on data.',
    tasks: [
      {
        id: 'exploratory-analysis',
        name: 'Exploratory Analysis',
        description: 'Describe trends, anomalies, segments; suggest visuals.',
        fields: [ ...DATA_FIELDS, ...SOURCE_FIELDS, ...FMT_OUTPUT ]
      },
      {
        id: 'sql-assistant',
        name: 'SQL Assistant',
        description: 'Generate/critique SQL from business questions or schemas.',
        fields: [
          { id: 'db_flavor', label: 'DB Flavor', type: 'select', options: ['Postgres','Snowflake','BigQuery','MySQL','SQL Server','Redshift'] },
          { id: 'schema', label: 'Schema/Tables', type: 'textarea', placeholder: 'DDL, table names, columns' },
          { id: 'question', label: 'Business Question', type: 'textarea', required: true },
          { id: 'return_explain', label: 'Explain Query', type: 'checkbox', default: true },
          ...FMT_OUTPUT
        ]
      },
      {
        id: 'financial-modeling',
        name: 'Financial Modeling',
        description: 'KPIs, variance, ROI, scenario/sensitivity analysis.',
        fields: [
          { id: 'model_goal', label: 'Goal', type: 'select', options: ['Revenue','Cost','Cash flow','Unit economics','ROI','Forecast'] },
          { id: 'assumptions', label: 'Key Assumptions', type: 'textarea' },
          { id: 'scenarios', label: 'Scenarios', type: 'multiselect', options: ['Base','Best','Worst','Custom'] },
          ...FMT_OUTPUT
        ]
      }
    ]
  },

  // 4) Software & Automation Engineering
  {
    id: 'software-automation',
    name: 'Software & Automation',
    description: 'Generate, review, test, document, and ship software and automations.',
    tasks: [
      {
        id: 'code-generate',
        name: 'Code Generation',
        description: 'Create new modules, microservices, scripts, or UI components.',
        fields: [ ...ENG_STACK_FIELDS, { id: 'requirements', label: 'Requirements', type: 'textarea', required: true }, ...REVIEW_FLAGS, ...FMT_OUTPUT ]
      },
      {
        id: 'code-review',
        name: 'Code Review',
        description: 'Quality, security, performance critique + fixes.',
        fields: [
          { id: 'security_focus', label: 'Security Focus', type: 'multiselect', options: ['OWASP Top 10','AuthN/AuthZ','Secrets','Crypto','Input validation'] },
          { id: 'perf_focus', label: 'Performance Focus', type: 'multiselect', options: ['Latency','CPU','Memory','I/O','DB queries','Caching'] },
          ...SOURCE_FIELDS, ...REVIEW_FLAGS, ...FMT_OUTPUT
        ]
      },
      {
        id: 'ci-cd-devops',
        name: 'CI/CD & DevOps',
        description: 'Pipelines, IaC, deployment strategies, observability.',
        fields: [
          { id: 'platform', label: 'Platform', type: 'select', options: ['GitHub Actions','GitLab CI','Jenkins','CircleCI','Azure DevOps','AWS CodePipeline'] },
          { id: 'deploy_strategy', label: 'Deployment Strategy', type: 'select', options: ['Blue-Green','Rolling','Canary','Feature flags'] },
          { id: 'infra_as_code', label: 'IaC', type: 'select', options: ['Terraform','Pulumi','CloudFormation','None'] },
          ...FMT_OUTPUT
        ]
      }
    ]
  },

  // 5) Operations, Projects & Processes
  {
    id: 'operations-projects',
    name: 'Operations & Project Management',
    description: 'Draft charters, break down work, estimate, and track execution.',
    tasks: [
      {
        id: 'project-charter',
        name: 'Project Charter',
        description: 'Goals, scope, risks, stakeholders, RACI.',
        fields: [ { id: 'project_type', label: 'Project Type', type: 'select', options: ['Software','Marketing','Process','Research','Construction','Event'] }, ...PLANNING_FIELDS, ...FMT_OUTPUT ]
      },
      {
        id: 'work-breakdown',
        name: 'Work Breakdown (WBS)',
        description: 'Milestones, tasks, estimates, dependencies.',
        fields: [
          { id: 'granularity', label: 'Granularity', type: 'select', options: ['Epics','Stories','Tasks'] },
          { id: 'estimation_mode', label: 'Estimation Mode', type: 'select', options: ['t-shirt','story points','hours/days'] },
          ...FMT_OUTPUT
        ]
      },
      {
        id: 'process-design',
        name: 'Process Design',
        description: 'Document current vs. future state; SOPs and playbooks.',
        fields: [
          { id: 'process_area', label: 'Process Area', type: 'text', placeholder: 'e.g., onboarding, incident response' },
          { id: 'include_risks', label: 'Include Risks & Controls', type: 'checkbox', default: true },
          ...FMT_OUTPUT
        ]
      }
    ]
  },

  // 6) Strategy, Consulting & Decision Support
  {
    id: 'strategy-consulting',
    name: 'Strategy & Consulting',
    description: 'Assess situations, build roadmaps, and recommend actions.',
    tasks: [
      {
        id: 'assessment',
        name: 'Situation/Needs Assessment',
        description: 'Diagnostic across functions; gap analysis.',
        fields: [
          { id: 'industry', label: 'Industry', type: 'select', options: ['Technology','Healthcare','Finance','Manufacturing','Retail','Public Sector','Non-profit'] },
          { id: 'company_size', label: 'Company Size', type: 'select', options: ['Startup','SMB','Mid-market','Enterprise'] },
          { id: 'focus_areas', label: 'Focus Areas', type: 'multiselect', options: ['Strategy','Ops','Tech','Finance','HR','Marketing','Risk'] },
          ...FMT_OUTPUT
        ]
      },
      {
        id: 'strategic-roadmap',
        name: 'Strategic Roadmap',
        description: 'Phased plan with milestones and investments.',
        fields: [ ...PLANNING_FIELDS, { id: 'priorities', label: 'Priority Buckets', type: 'multiselect', options: ['Critical','High','Medium','Long-term'] }, ...FMT_OUTPUT ]
      }
    ]
  },

  // 7) Compliance, Legal & Policy
  {
    id: 'compliance-legal-policy',
    name: 'Compliance, Legal & Policy',
    description: 'Draft, analyze, and summarize policies, controls, and legal docs (non-advisory).',
    tasks: [
      {
        id: 'policy-brief',
        name: 'Policy Brief',
        description: 'Summarize policy and impacts with recommendations.',
        fields: [
          { id: 'policy_area', label: 'Policy Area', type: 'select', options: ['Privacy','Security','Healthcare','Finance','Environmental','Employment','Public Safety'] },
          { id: 'gov_level', label: 'Level', type: 'select', options: ['Org','Municipal','State','Federal','International'] },
          ...FMT_OUTPUT, ...PRIVACY_FIELDS
        ]
      },
      {
        id: 'doc-review',
        name: 'Document Review',
        description: 'Flag risks/clauses; generate plain-language summary.',
        fields: [
          ...SOURCE_FIELDS,
          { id: 'doc_type', label: 'Document Type', type: 'select', options: ['Contract','Policy','SOP','Terms','RFP','Ordinance'] },
          ...REVIEW_FLAGS, ...FMT_OUTPUT, ...PRIVACY_FIELDS
        ]
      }
    ]
  },

  // 8) Growth: Marketing, Sales & Fundraising (incl. Grants)
  {
    id: 'growth',
    name: 'Growth (Marketing, Sales & Fundraising)',
    description: 'Campaigns, collateral, ICPs, proposals, and grants.',
    tasks: [
      {
        id: 'campaign-kit',
        name: 'Campaign Kit',
        description: 'Messaging, value props, assets, and split-tests.',
        fields: [
          { id: 'goal', label: 'Goal', type: 'select', options: ['Lead gen','Activation','Retention','Upsell','Community'] },
          { id: 'persona', label: 'ICP/Persona', type: 'text' },
          { id: 'channels', label: 'Channels', type: 'multiselect', options: ['Email','Social','Paid','Events','Partners'] },
          ...FMT_TONE_LANG, ...FMT_OUTPUT
        ]
      },
      {
        id: 'grant-proposal',
        name: 'Grant/Proposal Writer',
        description: 'Draft proposals with data-driven need, approach, budget.',
        fields: [
          { id: 'grant_type', label: 'Grant/Proposal Type', type: 'select', options: ['Federal','State/Local','Foundation','Corporate','RFP'] },
          { id: 'funding_amount', label: 'Funding Amount', type: 'text', required: true, placeholder: '$250K' },
          { id: 'duration', label: 'Project Duration', type: 'select', options: ['6 months','1 year','2 years','Multi-year'] },
          { id: 'target_population', label: 'Target Population/Beneficiaries', type: 'textarea' },
          { id: 'include_budget', label: 'Include Budget Breakdown', type: 'checkbox', default: true },
          ...FMT_TONE_LANG, ...FMT_OUTPUT
        ]
      },
      {
        id: 'sales-assets',
        name: 'Sales Assets',
        description: 'ICPs, objection handling, battlecards, demos scripts.',
        fields: [
          { id: 'asset_type', label: 'Asset Type', type: 'select', options: ['ICP','One-pager','Deck outline','Battlecard','Demo script','FAQ'] },
          ...FMT_TONE_LANG, ...FMT_OUTPUT
        ]
      }
    ]
  }
];

// ====== DOMAINS ======
export const DOMAINS: DomainDefinition[] = [
  { id: 'general', name: 'General', description: 'General purpose tasks' },
  { id: 'software-engineering', name: 'Software Engineering', description: 'Software development and engineering' },
  { id: 'marketing', name: 'Marketing & Sales', description: 'Marketing, sales, and customer engagement' },
  { id: 'finance', name: 'Finance', description: 'Financial analysis and management' },
  { id: 'healthcare', name: 'Healthcare', description: 'Healthcare and medical' },
  { id: 'legal', name: 'Legal', description: 'Legal and compliance' },
  { id: 'education', name: 'Education', description: 'Educational content and training' },
  { id: 'non-profit', name: 'Non-profit', description: 'Non-profit organizations' },
  { id: 'government', name: 'Government', description: 'Government and public sector' },
  { id: 'media', name: 'Media & Publishing', description: 'Media, publishing, and content creation' },
  { id: 'consulting', name: 'Consulting', description: 'Consulting and advisory services' },
  { id: 'insurance', name: 'Insurance', description: 'Insurance and risk management' },
  { id: 'energy', name: 'Energy', description: 'Energy and utilities' },
  { id: 'transportation', name: 'Transportation', description: 'Transportation and logistics' },
  { id: 'hr', name: 'Human Resources', description: 'Human resources and talent management' }
];

// ====== HELPER FUNCTIONS ======
export function getTasksForUseCase(useCaseId: string): TaskDefinition[] {
  const useCase = USE_CASES.find(uc => uc.id === useCaseId);
  return useCase ? useCase.tasks : [];
}

export function getFieldsFor(useCaseId: string, taskId: string): DynamicField[] {
  const useCase = USE_CASES.find(uc => uc.id === useCaseId);
  if (!useCase) return [];
  
  const task = useCase.tasks.find(t => t.id === taskId);
  return task ? task.fields : [];
}
