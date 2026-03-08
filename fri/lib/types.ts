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
}
