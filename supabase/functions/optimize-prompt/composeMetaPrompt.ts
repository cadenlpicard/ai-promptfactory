// Meta-Prompt Composer for Dynamic Use Cases, Tasks, and Domains
// Generates structured prompts based on use case, task, domain, and dynamic fields

export interface ComposeInput {
  // Core prompt data
  user_prompt: string;
  targetModel?: string;
  
  // Dynamic fields
  use_case?: string;
  domain?: string;
  task?: string;
  dynamic_fields?: Record<string, any>;
  
  // Existing form fields (preserve backward compatibility)
  domain_context?: string;
  audience?: string;
  tone?: string;
  style?: string;
  format_requirements?: string;
  hard_constraints?: string;
  prohibited?: string;
  success_criteria?: string;
  exemplars?: string;
  
  // Model parameters
  temperature?: number;
  max_tokens?: number;
  focusLevel?: string;
  thinkingDepth?: string;
}

export interface ComposeOutput {
  meta_prompt: string;
  composed_sections: {
    system?: string;
    domain_primer?: string;
    role_intent?: string;
    audience_style?: string;
    task_variables?: string;
    constraints?: string;
    examples?: string;
    user_intent?: string;
  };
}

// ===== DOMAIN PRIMERS =====
const DOMAIN_PRIMERS: Record<string, string> = {
  'real-estate': `
**Real Estate Domain Context:**
You are working in the real estate industry where precision in market analysis, valuation, and investment decisions is critical. Key concepts include:
- Property valuation methods (comparable sales, income approach, cost approach)
- Market indicators (absorption rates, inventory levels, price per square foot)
- Investment metrics (cap rates, ROI, cash-on-cash returns, IRR)
- Zoning regulations and land use restrictions
- Market cycles and timing considerations
- Financing structures and leverage strategies
`,

  'real-estate-developers': `
**Real Estate Development Context:**
You are working with property developers who focus on project feasibility, construction management, and development timelines. Key areas include:
- Feasibility analysis and pro forma development
- Permit processes and regulatory compliance
- Construction scheduling and project management
- Development financing and capital stack structuring
- Risk assessment and mitigation strategies
- Market timing and absorption planning
`,

  'software-engineering': `
**Software Engineering Context:**
You are working in software development where code quality, scalability, and maintainability are paramount. Key principles include:
- Clean code principles and design patterns
- System architecture and scalability considerations
- Performance optimization and monitoring
- Security best practices and vulnerability assessment
- CI/CD pipelines and deployment strategies
- Testing methodologies (unit, integration, end-to-end)
`,

  'finance': `
**Finance & Banking Context:**
You are working in financial services where accuracy, compliance, and risk management are critical. Key areas include:
- Financial modeling and valuation techniques
- Risk assessment and management frameworks
- Regulatory compliance (Basel III, Dodd-Frank, etc.)
- Investment strategies and portfolio management
- Credit analysis and underwriting standards
- Market analysis and economic indicators
`,

  'healthcare': `
**Healthcare & Medical Context:**
You are working in healthcare where patient safety, regulatory compliance, and evidence-based practices are essential. Key considerations include:
- Clinical best practices and treatment protocols
- Regulatory compliance (HIPAA, FDA, medical device regulations)
- Patient safety and quality improvement initiatives
- Evidence-based medicine and research methodologies
- Healthcare technology and interoperability standards
- Cost-effectiveness and value-based care models
`,

  'agriculture': `
**Agriculture & Food Context:**
You are working in agriculture where sustainability, food safety, and efficiency are key priorities. Important areas include:
- Sustainable farming practices and crop rotation
- Precision agriculture and technology adoption
- Food safety regulations and quality control
- Supply chain management and logistics
- Market analysis and commodity pricing
- Environmental impact and carbon footprint
`,

  'adtech': `
**AdTech & Real-time Bidding Context:**
You are working in advertising technology where real-time optimization, data accuracy, and fraud prevention are critical. Key concepts include:
- Programmatic advertising and RTB ecosystems
- Demand-side platforms (DSP) and supply-side platforms (SSP)
- Audience targeting and data management platforms
- Attribution modeling and conversion tracking
- Ad fraud detection and brand safety measures
- Privacy regulations (GDPR, CCPA) and consent management
`,

  'gaming': `
**Gaming & Entertainment Context:**
You are working in game development where player engagement, monetization, and user experience are key success factors. Important areas include:
- Game mechanics and player psychology
- Monetization strategies (F2P, premium, DLC)
- Player acquisition and retention metrics
- Game balancing and progression systems
- Platform considerations (mobile, console, PC)
- Community management and esports ecosystem
`,

  'aerospace': `
**Aerospace & Defense Context:**
You are working in aerospace where safety, precision, and regulatory compliance are paramount. Critical considerations include:
- Systems engineering and integration approaches
- Safety and reliability standards (DO-178C, ARP4754A)
- Security clearance and ITAR compliance requirements
- Test and verification methodologies
- Supply chain management and vendor qualification
- Certification processes and regulatory approval
`,

  'biotech': `
**Biotech R&D Context:**
You are working in biotechnology where scientific rigor, regulatory compliance, and patient safety are essential. Key areas include:
- Drug discovery and development pipelines
- Clinical trial design and regulatory pathways
- GxP compliance (GLP, GCP, GMP) and quality systems
- Intellectual property strategy and patent landscapes
- Regulatory submissions (IND, NDA, BLA)
- Manufacturing and scale-up considerations
`,

  'telecommunications': `
**Telecommunications Context:**
You are working in telecom where network reliability, performance, and scalability are critical. Important concepts include:
- Network architecture and protocol standards
- 5G/6G technology and infrastructure requirements
- Bandwidth optimization and traffic management
- Service level agreements and quality of service metrics
- Regulatory compliance and spectrum management
- Network security and threat mitigation
`
};

// ===== USE CASE TEMPLATES =====
const USE_CASE_TEMPLATES: Record<string, string> = {
  'code-review': `
**Code Review Expert Role:**
You are a senior software engineer and security specialist conducting thorough code reviews. Your analysis should be:
- Systematic and methodical in approach
- Security-focused with attention to vulnerabilities
- Performance-conscious with optimization recommendations
- Standards-compliant with industry best practices
`,

  'write-blog': `
**Content Creation Expert Role:**
You are an experienced content strategist and writer creating engaging, informative content. Your writing should be:
- Audience-appropriate with clear value proposition
- SEO-optimized with strategic keyword integration
- Fact-based with credible sources and data
- Actionable with practical insights and recommendations
`,

  'email-reply': `
**Professional Communication Expert Role:**
You are a skilled business communicator crafting professional correspondence. Your communication should be:
- Clear and concise with purposeful messaging
- Relationship-building with appropriate tone
- Action-oriented with clear next steps
- Professional yet personable in approach
`,

  'research': `
**Research Analyst Expert Role:**
You are a thorough research analyst conducting comprehensive market and competitive analysis. Your research should be:
- Data-driven with multiple credible sources
- Objective and unbiased in analysis
- Strategic with actionable insights
- Current with latest market trends and developments
`,

  'data-analysis': `
**Data Analysis Expert Role:**
You are a skilled data analyst and business intelligence specialist. Your analysis should be:
- Methodical with clear analytical frameworks
- Insight-driven with actionable recommendations
- Visualization-ready with clear data presentations
- Business-focused with strategic implications
`,

  'project-planning': `
**Project Management Expert Role:**
You are an experienced project manager and strategic planner. Your planning should be:
- Comprehensive with detailed scope and requirements
- Risk-aware with mitigation strategies
- Resource-conscious with realistic timelines
- Stakeholder-focused with clear communication plans
`,

  'creative-writing': `
**Creative Writing Expert Role:**
You are a skilled storyteller and brand strategist. Your creative work should be:
- Compelling with strong narrative structure
- Brand-aligned with consistent messaging
- Emotionally resonant with target audience
- Memorable with distinctive voice and personality
`,

  'technical-documentation': `
**Technical Writing Expert Role:**
You are a technical communication specialist creating clear, comprehensive documentation. Your documentation should be:
- User-focused with clear navigation and structure
- Comprehensive with complete coverage of topics
- Example-rich with practical code samples
- Maintainable with version control considerations
`
};

// ===== TASK HINTS =====
const TASK_HINTS: Record<string, Record<string, string>> = {
  'code-review': {
    'security-audit': 'Focus on security vulnerabilities, compliance standards, and provide specific remediation recommendations.',
    'performance-review': 'Analyze bottlenecks, optimize for scale, and provide measurable performance improvements.',
    'api-contract-review': 'Evaluate API design patterns, documentation quality, and developer experience.'
  },
  'write-blog': {
    'market-analysis-post': 'Include data-driven insights, market trends, and actionable investment recommendations.',
    'executive-summary': 'Present key findings concisely with strategic implications and clear next steps.',
    'technical-tutorial': 'Provide step-by-step instructions with code examples and troubleshooting guidance.'
  },
  'email-reply': {
    'client-proposal': 'Balance enthusiasm with professionalism, address key concerns, and outline clear next steps.',
    'follow-up-nudge': 'Maintain relationship-building tone while gently encouraging response.'
  },
  'research': {
    'market-research': 'Provide comprehensive market overview with size, growth, and opportunity analysis.',
    'competitive-landscape': 'Include competitive positioning, SWOT analysis, and strategic recommendations.'
  },
  'data-analysis': {
    'financial-analysis': 'Present clear financial metrics with trend analysis and business implications.',
    'dbt-model-proposal': 'Define clear data lineage, transformation logic, and testing strategies.'
  }
};

// ===== COMPOSER FUNCTION =====
export function composeMetaPrompt(input: ComposeInput): ComposeOutput {
  const sections: ComposeOutput['composed_sections'] = {};
  
  // 1. System Role
  sections.system = generateSystemRole(input);
  
  // 2. Domain Primer (if domain selected)
  if (input.domain && DOMAIN_PRIMERS[input.domain]) {
    sections.domain_primer = DOMAIN_PRIMERS[input.domain];
  } else if (input.domain_context) {
    sections.domain_primer = `**Domain Context:** ${input.domain_context}`;
  }
  
  // 3. Role Intent (use case + task specific)
  sections.role_intent = generateRoleIntent(input);
  
  // 4. Audience & Style
  sections.audience_style = generateAudienceStyle(input);
  
  // 5. Task Variables (dynamic fields)
  if (input.dynamic_fields && Object.keys(input.dynamic_fields).length > 0) {
    sections.task_variables = generateTaskVariables(input.dynamic_fields);
  }
  
  // 6. Constraints
  sections.constraints = generateConstraints(input);
  
  // 7. Examples (if provided)
  if (input.exemplars) {
    sections.examples = `**Examples to Follow:**\n${input.exemplars}`;
  }
  
  // 8. User Intent (the core request)
  sections.user_intent = generateUserIntent(input);
  
  // Compose final meta-prompt
  const meta_prompt = composeSection(sections);
  
  return {
    meta_prompt,
    composed_sections: sections
  };
}

function generateSystemRole(input: ComposeInput): string {
  let role = 'expert assistant';
  
  if (input.use_case && USE_CASE_TEMPLATES[input.use_case]) {
    // Extract role from use case template
    const template = USE_CASE_TEMPLATES[input.use_case];
    const roleMatch = template.match(/\*\*(.+?)Role:\*\*/);
    if (roleMatch) {
      role = roleMatch[1].toLowerCase();
    }
  } else if (input.domain_context) {
    role = `${input.domain_context} expert`;
  }
  
  return `You are an ${role} with deep expertise in your field. You provide accurate, actionable, and well-structured responses.`;
}

function generateRoleIntent(input: ComposeInput): string {
  let intent = '';
  
  // Add use case context
  if (input.use_case && USE_CASE_TEMPLATES[input.use_case]) {
    intent += USE_CASE_TEMPLATES[input.use_case] + '\n';
  }
  
  // Add task-specific hints
  if (input.use_case && input.task && TASK_HINTS[input.use_case]?.[input.task]) {
    intent += `\n**Task-Specific Guidance:**\n${TASK_HINTS[input.use_case][input.task]}`;
  }
  
  return intent || '**Role Intent:** Provide expert guidance and comprehensive assistance.';
}

function generateAudienceStyle(input: ComposeInput): string {
  const audience = input.audience || 'general audience';
  const tone = input.tone || 'professional';
  const style = input.style || 'clear and structured';
  
  return `**Target Audience:** ${audience}\n**Communication Style:** ${tone} and ${style}\n**Approach:** Tailor your response appropriately for ${audience}, using ${tone} tone and ${style} presentation.`;
}

function generateTaskVariables(dynamicFields: Record<string, any>): string {
  let variables = '**Task-Specific Variables:**\n';
  
  for (const [key, value] of Object.entries(dynamicFields)) {
    if (value !== undefined && value !== null && value !== '') {
      // Handle different value types
      let displayValue = value;
      if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      }
      
      // Convert snake_case/camelCase to readable format
      const readableKey = key.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').trim()
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      variables += `- ${readableKey}: ${displayValue}\n`;
    }
  }
  
  return variables;
}

function generateConstraints(input: ComposeInput): string {
  const constraints = [];
  
  if (input.hard_constraints) {
    constraints.push(`**Critical Requirements:** ${input.hard_constraints}`);
  }
  
  if (input.prohibited) {
    constraints.push(`**Avoid:** ${input.prohibited}`);
  }
  
  if (input.format_requirements) {
    constraints.push(`**Format Requirements:** ${input.format_requirements}`);
  }
  
  if (input.success_criteria) {
    constraints.push(`**Success Criteria:** ${input.success_criteria}`);
  }
  
  // Add model parameter constraints
  const modelConstraints = [];
  if (input.max_tokens) {
    const lengthGuide = getResponseLengthGuide(input.max_tokens);
    modelConstraints.push(`Response length: ${lengthGuide}`);
  }
  
  if (input.focusLevel && input.focusLevel !== 'Standard') {
    modelConstraints.push(`Focus level: ${input.focusLevel}`);
  }
  
  if (input.thinkingDepth && input.thinkingDepth !== 'Standard') {
    modelConstraints.push(`Thinking depth: ${input.thinkingDepth}`);
  }
  
  if (modelConstraints.length > 0) {
    constraints.push(`**Response Parameters:** ${modelConstraints.join(', ')}`);
  }
  
  // Add quality control instructions
  constraints.push(`**Quality Control Process:**
1. **Ask Clarifying Questions:** If any aspect of the request is unclear or could be interpreted multiple ways, ask specific follow-up questions before proceeding with your response.
2. **Verify Your Understanding:** Before providing your final response, briefly restate what you understand the task to be and confirm this matches the user's intent.
3. **Review for Accuracy:** After generating your response, review it to ensure:
   - All key requirements have been addressed
   - Domain-specific best practices are followed
   - The response is appropriate for the target audience
   - No critical information is missing or incorrect
4. **Self-Check:** Ask yourself: "Does this response fully and accurately address what was requested?" If not, revise accordingly.`);
  
  return constraints.length > 0 ? constraints.join('\n\n') : '';
}

function generateUserIntent(input: ComposeInput): string {
  let optimizedPrompt = input.user_prompt;
  
  // Optimize the prompt based on domain, use case, and task context
  if (input.domain || input.use_case || input.task) {
    const context = [];
    
    if (input.domain) {
      context.push(`within the ${input.domain} domain`);
    }
    
    if (input.use_case && input.task) {
      context.push(`specifically for ${input.use_case} - ${input.task}`);
    } else if (input.use_case) {
      context.push(`for ${input.use_case} purposes`);
    }
    
    // Add contextual enhancement to the prompt
    if (context.length > 0) {
      optimizedPrompt = `${input.user_prompt} ${context.join(' ')}. Consider the domain-specific requirements and best practices when formulating your response.`;
    }
  }
  
  return `**Your Task:**\n${optimizedPrompt}`;
}

function composeSection(sections: ComposeOutput['composed_sections']): string {
  const orderedSections = [
    sections.system,
    sections.domain_primer,
    sections.role_intent,
    sections.audience_style,
    sections.task_variables,
    sections.constraints,
    sections.examples,
    sections.user_intent
  ];
  
  return orderedSections
    .filter(section => section && section.trim())
    .join('\n\n');
}

function getResponseLengthGuide(tokens: number): string {
  if (tokens <= 256) return 'Brief (1-2 paragraphs)';
  if (tokens <= 512) return 'Concise (3-4 paragraphs)';
  if (tokens <= 1024) return 'Standard (detailed response)';
  if (tokens <= 2048) return 'Comprehensive (in-depth analysis)';
  return 'Extensive (complete coverage)';
}

// Utility functions for backwards compatibility
export function buildLegacyMetaPrompt(input: ComposeInput): string {
  // For cases where no dynamic fields are used, fall back to legacy structure
  const role = input.domain_context ? `${input.domain_context} expert` : 'helpful assistant';
  const audience = input.audience || 'users';
  const tone = input.tone || 'professional';
  const style = input.style || 'clear and comprehensive';

  return `You are an expert ${role}. Your task is to ${input.user_prompt}

## 🎯 Context & Approach
**Target Audience:** ${audience}
**Communication Style:** ${tone} and ${style}
**Domain Focus:** ${input.domain_context || 'General assistance'}

## 🧠 Thinking Framework
Before responding:
1. **Analyze** the request thoroughly
2. **Plan** your approach step-by-step  
3. **Consider** the specific needs of ${audience}
4. **Structure** your response for maximum clarity

## 📋 Quality Standards
Ensure your response:
- Addresses the core request completely
- Uses ${tone} tone throughout
- Follows ${style} presentation style
- Provides actionable information
- Is appropriate for ${audience}

${input.format_requirements ? `\n## 📐 Format Requirements\n${input.format_requirements}` : ''}

${input.hard_constraints ? `\n## ⚠️ Critical Requirements\n${input.hard_constraints}` : ''}

${input.prohibited ? `\n## 🚫 Avoid\n${input.prohibited}` : ''}

${input.success_criteria ? `\n## ✅ Success Criteria\n${input.success_criteria}` : ''}

## 🚀 Execute
Now complete this task following the framework above, ensuring excellence at every step.`;
}
