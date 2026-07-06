export interface Conversation {
  id: string
  customerMessage: string
  finResponse: string
  resolved: boolean
  csatScore?: number
  reopened?: boolean
  followUpWithin7Days?: boolean
  timestamp?: string
}

export type FailureCategory =
  | 'knowledge_gap'
  | 'ambiguous_query'
  | 'missing_primitive'
  | 'instruction_conflict'
  | 'out_of_scope'
  | 'genuine_resolution'

export interface ClassifiedConversation extends Conversation {
  genuinelyResolved: boolean
  failureCategory: FailureCategory
  confidenceScore: number
  explanation: string
  recommendedFix: string
}

export interface PlaybookItem {
  priority: 1 | 2 | 3
  category: FailureCategory
  action: string
  estimatedImpact: string
  effort: 'low' | 'medium' | 'high'
  detail: string
  implementationSketch?: string // For missing_primitive items: what an FDE would build
}

export interface MissingPrimitive {
  name: string
  frequency: number              // how many conversations failed because of this
  customerImpact: string         // what the customer experienced
  productInput: string           // what Fin would need natively to solve this
  estimatedBuildDays: string     // e.g. "2–3 days"
  apiDependency: string          // e.g. "Stripe Billing API"
}

export interface RoadmapSignal {
  missingPrimitiveCount: number
  topPrimitives: MissingPrimitive[]
  estimatedResolutionRecovery: string  // e.g. "+18% genuine resolution rate if built"
  prioritySummary: string              // one sentence for R&D handoff
}

export interface AnalysisResult {
  totalConversations: number
  reportedResolutionRate: number
  genuineResolutionRate: number
  assumedResolutionCount: number
  failureBreakdown: Record<FailureCategory, number>
  classifiedConversations: ClassifiedConversation[]
  kbHealthScore: number
  kbCoverageScore: number
  kbFreshnessScore: number
  kbClarityScore: number
  estimatedMonthlyCost: number
  estimatedWastedSpend: number
  fixPlaybook: PlaybookItem[]
  deploymentScore: number        // 0–100 overall Fin deployment health score
  roadmapSignal: RoadmapSignal   // structured output for R&D / product feedback
}
