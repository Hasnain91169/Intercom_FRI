import Anthropic from '@anthropic-ai/sdk'
import {
  Conversation,
  ClassifiedConversation,
  AnalysisResult,
  FailureCategory,
  PlaybookItem,
} from './types'

const client = new Anthropic()
const BATCH_SIZE = 10

const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert analyst evaluating Intercom Fin AI agent conversations.
For each conversation, determine:
1. Whether the resolution was GENUINE (customer's issue was actually resolved) or ASSUMED (conversation closed without confirmation)
2. If not genuinely resolved, classify the failure into exactly one category:
   - knowledge_gap: Fin couldn't find relevant information in its knowledge base
   - ambiguous_query: Customer's question was unclear and Fin guessed incorrectly
   - missing_primitive: The task requires an action or capability Fin doesn't have yet
   - instruction_conflict: Fin's instructions contradicted each other or were unclear
   - out_of_scope: The query was outside Fin's defined remit entirely
3. A confidence score (0-100) for your classification
4. A one-sentence explanation
5. A specific, actionable recommended fix

Signals that suggest ASSUMED resolution (not genuine):
- Customer reopened the conversation
- Customer followed up within 7 days on the same topic
- Low CSAT score (1-2)
- Fin said "contact our team" or escalated without resolving
- Fin admitted it didn't know the answer
- The conversation was marked resolved but the response was vague or deflecting

Signals that suggest GENUINE resolution:
- High CSAT score (4-5) with no follow-up
- Customer explicitly confirmed satisfaction
- Fin provided specific, accurate, actionable information
- No reopening or follow-up contact

Respond ONLY with valid JSON. No preamble, no markdown, no explanation outside the JSON.`

const CLASSIFICATION_RESPONSE_FORMAT = `Return a JSON array where each item has:
{
  "id": "conversation id",
  "genuinelyResolved": boolean,
  "failureCategory": "one of: knowledge_gap, ambiguous_query, missing_primitive, instruction_conflict, out_of_scope, genuine_resolution",
  "confidenceScore": number between 0 and 100,
  "explanation": "one sentence explaining your classification",
  "recommendedFix": "specific, concrete action — not generic advice"
}`

interface ClassificationResult {
  id: string
  genuinelyResolved: boolean
  failureCategory: FailureCategory
  confidenceScore: number
  explanation: string
  recommendedFix: string
}

async function classifyBatch(conversations: Conversation[]): Promise<ClassificationResult[]> {
  const conversationData = conversations.map((c) => ({
    id: c.id,
    customerMessage: c.customerMessage,
    finResponse: c.finResponse,
    reportedResolved: c.resolved,
    csatScore: c.csatScore ?? null,
    reopened: c.reopened ?? null,
    followUpWithin7Days: c.followUpWithin7Days ?? null,
  }))

  const userPrompt = `Analyse these ${conversations.length} Fin AI agent conversations and classify each one.

Conversations:
${JSON.stringify(conversationData, null, 2)}

${CLASSIFICATION_RESPONSE_FORMAT}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CLASSIFICATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  let text = content.text.trim()
  // Strip markdown code blocks if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error('Expected JSON array from Claude classification')
  return parsed as ClassificationResult[]
}

async function scoreKBHealth(conversations: Conversation[]): Promise<{
  kbHealthScore: number
  kbCoverageScore: number
  kbFreshnessScore: number
  kbClarityScore: number
}> {
  const sample = conversations.slice(0, 20)
  const queryTypes = sample.map((c) => ({
    query: c.customerMessage.substring(0, 150),
    finResponse: c.finResponse.substring(0, 200),
    resolved: c.resolved,
  }))

  const prompt = `You are evaluating the health of an Intercom Fin AI agent's knowledge base based on a sample of conversations.

Conversations sample:
${JSON.stringify(queryTypes, null, 2)}

Based on the quality, accuracy, and completeness of Fin's responses, score the knowledge base on three dimensions (0-100):

1. Coverage: Does Fin have content covering the range of topics customers ask about?
2. Freshness: Do Fin's responses appear up-to-date and accurate (no outdated policies, broken links, wrong info)?
3. Clarity: Are Fin's responses clear, specific, and actionable — or vague and deflecting?

Respond ONLY with valid JSON in this exact format:
{
  "kbCoverageScore": number,
  "kbFreshnessScore": number,
  "kbClarityScore": number,
  "reasoning": "one sentence"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected KB health response')

  let text = content.text.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const scores = JSON.parse(text)
  const kbHealthScore = Math.round(
    (scores.kbCoverageScore + scores.kbFreshnessScore + scores.kbClarityScore) / 3
  )

  return {
    kbHealthScore,
    kbCoverageScore: scores.kbCoverageScore,
    kbFreshnessScore: scores.kbFreshnessScore,
    kbClarityScore: scores.kbClarityScore,
  }
}

async function generatePlaybook(
  failureBreakdown: Record<FailureCategory, number>,
  classified: ClassifiedConversation[]
): Promise<PlaybookItem[]> {
  const failures = classified.filter((c) => !c.genuinelyResolved)
  const failureSummary = failures.map((c) => ({
    category: c.failureCategory,
    customerQuery: c.customerMessage.substring(0, 120),
    explanation: c.explanation,
    suggestedFix: c.recommendedFix,
  }))

  const prompt = `You are a senior Intercom implementation consultant. Based on this analysis of a Fin AI agent deployment, generate a prioritised fix playbook.

Failure breakdown by category:
${JSON.stringify(failureBreakdown, null, 2)}

Sample failure details:
${JSON.stringify(failureSummary.slice(0, 10), null, 2)}

Generate 6-8 specific, prioritised actions. Each action should:
- Be concrete and specific (not "improve your KB" but "Create an article on X covering Y and Z")
- Have a realistic estimated resolution rate impact
- Be ranked by impact/effort ratio
- Reference "missing primitive" and "accelerate time to value" where genuinely applicable

Respond ONLY with valid JSON array:
[{
  "priority": 1, 2, or 3,
  "category": "one of: knowledge_gap, ambiguous_query, missing_primitive, instruction_conflict, out_of_scope, genuine_resolution",
  "action": "specific action title (max 120 chars)",
  "estimatedImpact": "+X% genuine resolution rate",
  "effort": "low, medium, or high",
  "detail": "2-3 sentence explanation of why this matters and how to implement it"
}]`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected playbook response')

  let text = content.text.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(text) as PlaybookItem[]
}

export async function analyseConversations(conversations: Conversation[]): Promise<AnalysisResult> {
  console.log(`[FRI] Starting analysis of ${conversations.length} conversations`)

  // Step 1: Classify conversations in batches
  const batches: Conversation[][] = []
  for (let i = 0; i < conversations.length; i += BATCH_SIZE) {
    batches.push(conversations.slice(i, i + BATCH_SIZE))
  }

  const classificationResults: ClassificationResult[] = []
  for (let i = 0; i < batches.length; i++) {
    console.log(`[FRI] Classifying batch ${i + 1}/${batches.length}`)
    const batchResults = await classifyBatch(batches[i])
    classificationResults.push(...batchResults)
  }

  // Merge classification results with original conversations
  const classifiedMap = new Map(classificationResults.map((r) => [r.id, r]))
  const classifiedConversations: ClassifiedConversation[] = conversations.map((conv) => {
    const result = classifiedMap.get(conv.id)
    if (!result) {
      return {
        ...conv,
        genuinelyResolved: conv.resolved,
        failureCategory: 'genuine_resolution' as FailureCategory,
        confidenceScore: 50,
        explanation: 'Classification unavailable for this conversation.',
        recommendedFix: 'Review manually.',
      }
    }
    return { ...conv, ...result }
  })

  // Step 2: Calculate metrics
  const genuineCount = classifiedConversations.filter((c) => c.genuinelyResolved).length
  const reportedResolvedCount = conversations.filter((c) => c.resolved).length
  const genuineResolutionRate = Math.round((genuineCount / conversations.length) * 100)
  const reportedResolutionRate = Math.round((reportedResolvedCount / conversations.length) * 100)
  const assumedResolutionCount = reportedResolvedCount - genuineCount

  const failureBreakdown: Record<FailureCategory, number> = {
    genuine_resolution: 0,
    knowledge_gap: 0,
    ambiguous_query: 0,
    missing_primitive: 0,
    instruction_conflict: 0,
    out_of_scope: 0,
  }
  for (const c of classifiedConversations) {
    failureBreakdown[c.failureCategory] = (failureBreakdown[c.failureCategory] || 0) + 1
  }

  // Step 3: KB health scoring
  console.log('[FRI] Scoring knowledge base health')
  const kbScores = await scoreKBHealth(conversations)

  // Step 4: Generate fix playbook
  console.log('[FRI] Generating fix playbook')
  const fixPlaybook = await generatePlaybook(failureBreakdown, classifiedConversations)

  // Step 5: ROI calculation
  const estimatedMonthlyCost = conversations.length * 0.99
  const estimatedWastedSpend = Math.max(0, assumedResolutionCount) * 0.99

  console.log('[FRI] Analysis complete')

  return {
    totalConversations: conversations.length,
    reportedResolutionRate,
    genuineResolutionRate,
    assumedResolutionCount: Math.max(0, assumedResolutionCount),
    failureBreakdown,
    classifiedConversations,
    ...kbScores,
    estimatedMonthlyCost,
    estimatedWastedSpend,
    fixPlaybook,
  }
}
