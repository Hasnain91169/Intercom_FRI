'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  ArrowLeft,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { AnalysisResult, ClassifiedConversation, FailureCategory } from '@/lib/types'
import ResolutionScoreCard from '@/components/ResolutionScoreCard'
import FailureClassifierChart from '@/components/FailureClassifierChart'
import KBHealthPanel from '@/components/KBHealthPanel'
import ROIDashboard from '@/components/ROIDashboard'
import FixPlaybook from '@/components/FixPlaybook'
import DeploymentScore from '@/components/DeploymentScore'
import MissingPrimitiveCallout from '@/components/MissingPrimitiveCallout'
import RoadmapSignal from '@/components/RoadmapSignal'

const FAILURE_LABELS: Record<FailureCategory, string> = {
  genuine_resolution: 'Genuine',
  knowledge_gap: 'KB Gap',
  missing_primitive: 'Missing Primitive',
  ambiguous_query: 'Ambiguous Query',
  instruction_conflict: 'Instruction Conflict',
  out_of_scope: 'Out of Scope',
}

const FAILURE_COLORS: Record<FailureCategory, string> = {
  genuine_resolution: 'bg-blue-500/20 text-blue-400',
  knowledge_gap: 'bg-red-500/20 text-red-400',
  missing_primitive: 'bg-purple-500/20 text-purple-400',
  ambiguous_query: 'bg-amber-500/20 text-amber-400',
  instruction_conflict: 'bg-orange-500/20 text-orange-400',
  out_of_scope: 'bg-slate-500/20 text-slate-400',
}

const PAGE_SIZE = 10

function MetricCard({
  label,
  value,
  suffix = '',
  subtext,
  variant = 'default',
}: {
  label: string
  value: string | number
  suffix?: string
  subtext?: string
  variant?: 'default' | 'blue' | 'amber' | 'red'
}) {
  const colors = {
    default: 'text-slate-300',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  }
  return (
    <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colors[variant]}`}>{value}</span>
        {suffix && <span className={`text-lg ${colors[variant]}`}>{suffix}</span>}
      </div>
      {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
    </div>
  )
}

function ConversationRow({ conv, index }: { conv: ClassifiedConversation; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr
        className={`border-b border-slate-700/50 hover:bg-slate-700/20 cursor-pointer transition-colors ${
          index % 2 === 0 ? '' : 'bg-slate-800/20'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <p className="text-white text-sm truncate max-w-xs">{conv.customerMessage}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-slate-400 text-sm truncate max-w-xs">{conv.finResponse}</p>
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              conv.genuinelyResolved
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {conv.genuinelyResolved ? 'Yes' : 'No'}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-0.5 rounded ${FAILURE_COLORS[conv.failureCategory]}`}>
            {FAILURE_LABELS[conv.failureCategory]}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-slate-300 text-sm">{conv.confidenceScore}%</span>
        </td>
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-700/50 bg-slate-800/40">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Customer Message</p>
                <p className="text-white leading-relaxed">{conv.customerMessage}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Fin Response</p>
                <p className="text-slate-300 leading-relaxed">{conv.finResponse}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">FRI Analysis</p>
                <p className="text-slate-300 leading-relaxed mb-2">{conv.explanation}</p>
                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-xs font-medium">Recommended fix</p>
                  <p className="text-slate-300 text-xs mt-0.5">{conv.recommendedFix}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [activeCategory, setActiveCategory] = useState<FailureCategory | null>(null)
  const [page, setPage] = useState(1)
  const roadmapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('fri_result')
    if (!stored) {
      router.replace('/')
      return
    }
    setResult(JSON.parse(stored))
    setIsDemo(sessionStorage.getItem('fri_demo') === 'true')
  }, [router])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const filteredConversations = activeCategory
    ? result.classifiedConversations.filter((c) => c.failureCategory === activeCategory)
    : result.classifiedConversations

  const totalPages = Math.ceil(filteredConversations.length / PAGE_SIZE)
  const paginatedConversations = filteredConversations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const handleCategoryFilter = (cat: FailureCategory | null) => {
    setActiveCategory(cat)
    setPage(1)
  }

  const scrollToRoadmap = () => {
    roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDownload = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      deploymentScore: result.deploymentScore,
      summary: {
        totalConversations: result.totalConversations,
        reportedResolutionRate: `${result.reportedResolutionRate}%`,
        genuineResolutionRate: `${result.genuineResolutionRate}%`,
        assumedResolutionCount: result.assumedResolutionCount,
        estimatedWastedSpend: `£${result.estimatedWastedSpend.toFixed(2)}`,
        kbHealthScore: result.kbHealthScore,
      },
      failureBreakdown: result.failureBreakdown,
      roadmapSignal: result.roadmapSignal,
      fixPlaybook: result.fixPlaybook,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fri-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wastedSpendFormatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(result.estimatedWastedSpend)

  const missingPrimitiveCount = result.failureBreakdown.missing_primitive ?? 0

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Top bar */}
      <header className="border-b border-slate-800 px-6 py-4 sticky top-0 bg-[#0F172A]/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              New analysis
            </button>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">FRI Analysis Report</span>
            </div>
            {isDemo && (
              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                DEMO MODE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">{result.totalConversations} conversations analysed</span>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download report
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Deployment Score — the single number at a glance */}
        <DeploymentScore
          score={result.deploymentScore}
          genuineResolutionRate={result.genuineResolutionRate}
          kbHealthScore={result.kbHealthScore}
        />

        {/* Hero metric row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Reported Resolution Rate"
            value={result.reportedResolutionRate}
            suffix="%"
            subtext="As claimed by Fin"
            variant="default"
          />
          <MetricCard
            label="Genuine Resolution Rate"
            value={result.genuineResolutionRate}
            suffix="%"
            subtext="As verified by FRI"
            variant="blue"
          />
          <MetricCard
            label="Assumed Resolutions"
            value={result.assumedResolutionCount}
            subtext="Paid for, not genuinely resolved"
            variant="amber"
          />
          <MetricCard
            label="Estimated Wasted Spend"
            value={wastedSpendFormatted}
            subtext="Cost of assumed resolutions this period"
            variant="red"
          />
        </div>

        {/* Missing Primitive callout — shown prominently when detected */}
        {missingPrimitiveCount > 0 && (
          <MissingPrimitiveCallout
            missingPrimitiveCount={missingPrimitiveCount}
            totalConversations={result.totalConversations}
            onViewDetails={scrollToRoadmap}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryFilter}
          />
        )}

        {/* Row 2: Resolution quality + KB health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResolutionScoreCard
            genuineResolutionRate={result.genuineResolutionRate}
            reportedResolutionRate={result.reportedResolutionRate}
            assumedResolutionCount={result.assumedResolutionCount}
            totalConversations={result.totalConversations}
          />
          <KBHealthPanel
            kbHealthScore={result.kbHealthScore}
            kbCoverageScore={result.kbCoverageScore}
            kbFreshnessScore={result.kbFreshnessScore}
            kbClarityScore={result.kbClarityScore}
          />
        </div>

        {/* Row 3: Failure chart + ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FailureClassifierChart
            failureBreakdown={result.failureBreakdown}
            totalConversations={result.totalConversations}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryFilter}
          />
          <ROIDashboard
            estimatedMonthlyCost={result.estimatedMonthlyCost}
            estimatedWastedSpend={result.estimatedWastedSpend}
            totalConversations={result.totalConversations}
            genuineResolutionRate={result.genuineResolutionRate}
          />
        </div>

        {/* Fix Playbook (with implementation sketches for missing_primitive items) */}
        <FixPlaybook items={result.fixPlaybook} />

        {/* Roadmap Signal — FDE → R&D product feedback */}
        {result.roadmapSignal && result.roadmapSignal.missingPrimitiveCount > 0 && (
          <div ref={roadmapRef}>
            <RoadmapSignal signal={result.roadmapSignal} />
          </div>
        )}

        {/* Conversation table */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Classified Conversations</h3>
              <p className="text-slate-400 text-sm mt-0.5">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                {activeCategory && ` filtered by: ${FAILURE_LABELS[activeCategory]}`}
              </p>
            </div>
            {activeCategory && (
              <button
                onClick={() => handleCategoryFilter(null)}
                className="text-xs text-slate-400 hover:text-white border border-slate-600 px-2 py-1 rounded transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-slate-400 text-xs font-medium uppercase tracking-wide">Customer Message</th>
                  <th className="px-4 py-3 text-left text-slate-400 text-xs font-medium uppercase tracking-wide">Fin Response</th>
                  <th className="px-4 py-3 text-center text-slate-400 text-xs font-medium uppercase tracking-wide">Genuine?</th>
                  <th className="px-4 py-3 text-left text-slate-400 text-xs font-medium uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-center text-slate-400 text-xs font-medium uppercase tracking-wide">Confidence</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {paginatedConversations.map((conv, i) => (
                  <ConversationRow key={conv.id} conv={conv} index={i} />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
              <p className="text-slate-400 text-sm">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-sm disabled:opacity-40 hover:text-white hover:border-slate-500 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-sm disabled:opacity-40 hover:text-white hover:border-slate-500 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 text-slate-600 text-xs">
          <span>FRI · Fin Resolution Intelligence</span>
          <div className="flex items-center gap-1">
            <span>0-to-1 deployment diagnostic tool</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
