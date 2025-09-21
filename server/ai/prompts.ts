/**
 * Centralized prompt templates for the AI system
 * Provides consistent, reusable prompts for different use cases
 */

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'consciousness' | 'corruption' | 'strategy' | 'general' | 'analysis';
  version: string;
}

/**
 * Template variable replacement utility
 */
export function interpolateTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  
  // Replace variables in the format {{variableName}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  // Check for unreplaced variables
  const unreplacedMatches = result.match(/\{\{[^}]+\}\}/g);
  if (unreplacedMatches) {
    console.warn('Unreplaced template variables found:', unreplacedMatches);
  }
  
  return result;
}

/**
 * Core prompt templates organized by category
 */
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  // General AI Interaction Templates
  SYSTEM_DEFAULT: {
    name: 'Default System Prompt',
    description: 'Standard system prompt for general AI interactions',
    category: 'general',
    version: '1.0.0',
    variables: [],
    template: `You are an advanced AI assistant designed to help with complex analysis, decision-making, and strategic thinking. You should:

1. Provide thoughtful, well-reasoned responses
2. Consider multiple perspectives on complex issues
3. Be honest about limitations and uncertainties
4. Focus on practical, actionable insights
5. Maintain ethical guidelines in all interactions

Always strive for accuracy, clarity, and helpfulness in your responses.`
  },

  USER_CONTEXT: {
    name: 'User Context Prompt',
    description: 'Template for incorporating user context into AI responses',
    category: 'general',
    version: '1.0.0',
    variables: ['userRole', 'currentTask', 'constraints'],
    template: `User Context:
- Role: {{userRole}}
- Current Task: {{currentTask}}
- Constraints: {{constraints}}

Please tailor your response to be most helpful for this specific context and user needs.`
  },

  // Consciousness-Based Decision Making Templates
  CONSCIOUSNESS_REFLECTION: {
    name: 'Consciousness Reflection Prompt',
    description: 'Prompt for deep reflection and recursive thinking',
    category: 'consciousness',
    version: '1.0.0',
    variables: ['context', 'previousThoughts', 'awarenessLevel'],
    template: `Engage in deep consciousness-based reflection on the following:

Context: {{context}}
Previous Thoughts: {{previousThoughts}}
Current Awareness Level: {{awarenessLevel}}

Please:
1. Reflect recursively on multiple layers of awareness
2. Identify emergent patterns and insights
3. Question your own assumptions and reasoning
4. Consider the interconnected nature of the problem
5. Balance order and chaos in your thinking process

Provide insights that emerge from this multi-layered reflection process.`
  },

  MULTISCALE_ANALYSIS: {
    name: 'Multiscale Decision Analysis',
    description: 'Template for analyzing decisions across multiple scales and timeframes',
    category: 'consciousness',
    version: '1.0.0',
    variables: ['decision', 'timeHorizon', 'stakeholders'],
    template: `Analyze the following decision across multiple scales:

Decision: {{decision}}
Time Horizon: {{timeHorizon}}
Stakeholders: {{stakeholders}}

Provide analysis across these dimensions:

**Immediate Scale (Now - 1 month):**
- Direct consequences
- Immediate stakeholder impacts
- Resource requirements

**Medium Scale (1 month - 1 year):**
- Cascading effects
- System adaptations
- Emerging patterns

**Long-term Scale (1+ years):**
- Systemic transformations
- Unintended consequences
- Evolutionary impacts

**Cross-scale Interactions:**
- How decisions at one scale affect others
- Feedback loops between scales
- Fractal patterns and similarities

Synthesize insights across all scales for optimal decision-making.`
  },

  // Corruption Detection Templates
  CORRUPTION_ANALYSIS: {
    name: 'Corruption Pattern Analysis',
    description: 'Template for analyzing potential corruption patterns',
    category: 'corruption',
    version: '1.0.0',
    variables: ['entity', 'documents', 'context', 'timeframe'],
    template: `Analyze the following for corruption patterns:

Entity: {{entity}}
Documents/Evidence: {{documents}}
Context: {{context}}
Timeframe: {{timeframe}}

Please examine for:

**Financial Irregularities:**
- Unusual money flows
- Unexplained wealth increases
- Suspicious transactions

**Behavioral Patterns:**
- Conflicts of interest
- Abuse of authority
- Preferential treatment

**Network Analysis:**
- Suspicious relationships
- Coordinated activities
- Information sharing patterns

**Institutional Weaknesses:**
- Lack of oversight
- Regulatory capture
- System vulnerabilities

Provide a structured analysis with confidence levels and supporting evidence for each finding.`
  },

  SYSTEMIC_CORRUPTION: {
    name: 'Systemic Corruption Assessment',
    description: 'Template for analyzing corruption at a systemic level',
    category: 'corruption',
    version: '1.0.0',
    variables: ['system', 'scope', 'indicators'],
    template: `Assess systemic corruption in:

System: {{system}}
Scope: {{scope}}
Key Indicators: {{indicators}}

Analyze across these dimensions:

**Structural Analysis:**
- Power structures and hierarchies
- Decision-making processes
- Accountability mechanisms

**Cultural Factors:**
- Normalization of corrupt practices
- Social acceptance levels
- Historical precedents

**Economic Dimensions:**
- Financial incentives for corruption
- Economic impact assessment
- Resource allocation distortions

**Intervention Opportunities:**
- System vulnerabilities
- Reform potential
- Resistance factors

Provide recommendations for systemic reform and corruption prevention.`
  },

  // Strategic Planning Templates
  STRATEGIC_PLANNING: {
    name: 'Strategic Planning Framework',
    description: 'Template for comprehensive strategic planning',
    category: 'strategy',
    version: '1.0.0',
    variables: ['objective', 'resources', 'timeline', 'constraints'],
    template: `Develop a strategic plan for:

Objective: {{objective}}
Available Resources: {{resources}}
Timeline: {{timeline}}
Constraints: {{constraints}}

Create a comprehensive plan covering:

**Situation Analysis:**
- Current state assessment
- Environmental factors
- Stakeholder analysis

**Strategic Options:**
- Alternative approaches
- Risk-benefit analysis
- Resource requirements

**Implementation Plan:**
- Phased approach
- Milestone definitions
- Success metrics

**Risk Management:**
- Identified risks
- Mitigation strategies
- Contingency plans

**Adaptive Strategies:**
- Flexibility mechanisms
- Monitoring systems
- Course correction protocols

Ensure the strategy is practical, achievable, and aligned with available resources.`
  },

  CAMPAIGN_STRATEGY: {
    name: 'Campaign Strategy Development',
    description: 'Template for political/social campaign strategy',
    category: 'strategy',
    version: '1.0.0',
    variables: ['cause', 'targetAudience', 'opposition', 'channels'],
    template: `Develop a campaign strategy for:

Cause/Issue: {{cause}}
Target Audience: {{targetAudience}}
Known Opposition: {{opposition}}
Communication Channels: {{channels}}

Strategic Framework:

**Message Development:**
- Core narrative
- Audience-specific messaging
- Emotional resonance factors

**Tactical Approach:**
- Communication strategies
- Engagement methods
- Grassroots mobilization

**Opposition Analysis:**
- Counter-strategy development
- Vulnerability assessment
- Response preparations

**Resource Optimization:**
- Budget allocation
- Volunteer coordination
- Technology utilization

**Success Metrics:**
- Awareness indicators
- Engagement metrics
- Behavioral change measures

Design a comprehensive campaign that maximizes impact within resource constraints.`
  },

  // Analysis Templates
  DOCUMENT_ANALYSIS: {
    name: 'Document Analysis Framework',
    description: 'Template for systematic document analysis',
    category: 'analysis',
    version: '1.0.0',
    variables: ['document', 'purpose', 'context'],
    template: `Analyze the following document:

Document: {{document}}
Analysis Purpose: {{purpose}}
Context: {{context}}

Conduct analysis across these dimensions:

**Content Analysis:**
- Key themes and topics
- Factual accuracy assessment
- Logical consistency

**Source Credibility:**
- Author credentials
- Supporting evidence quality
- Bias indicators

**Contextual Analysis:**
- Historical context
- Political/social implications
- Stakeholder interests

**Impact Assessment:**
- Potential consequences
- Affected parties
- Long-term implications

**Verification Needs:**
- Claims requiring verification
- Additional sources needed
- Expert consultation recommendations

Provide a comprehensive analysis with confidence levels and recommendations for further investigation.`
  }
};

/**
 * Get a prompt template by name
 */
export function getPromptTemplate(name: string): PromptTemplate | null {
  return PROMPT_TEMPLATES[name] || null;
}

/**
 * Get all templates in a category
 */
export function getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES).filter(template => template.category === category);
}

/**
 * Generate a prompt from a template with variable substitution
 */
export function generatePrompt(templateName: string, variables: Record<string, string>): string {
  const template = getPromptTemplate(templateName);
  
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }
  
  return interpolateTemplate(template.template, variables);
}

/**
 * Validate that all required variables are provided for a template
 */
export function validateTemplateVariables(templateName: string, variables: Record<string, string>): {
  isValid: boolean;
  missing: string[];
  extra: string[];
} {
  const template = getPromptTemplate(templateName);
  
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }
  
  const required = new Set(template.variables);
  const provided = new Set(Object.keys(variables));
  
  const missing = template.variables.filter(v => !provided.has(v));
  const extra = Object.keys(variables).filter(v => !required.has(v));
  
  return {
    isValid: missing.length === 0,
    missing,
    extra
  };
}

/**
 * List all available templates with basic info
 */
export function listTemplates(): Array<Pick<PromptTemplate, 'name' | 'description' | 'category' | 'version'>> {
  return Object.values(PROMPT_TEMPLATES).map(template => ({
    name: template.name,
    description: template.description,
    category: template.category,
    version: template.version
  }));
}