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
  Loader2,
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
    default: 'text-white/80',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  }
  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] transition-colors">
      <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colors[variant]}`}>{value}</span>
        {suffix && <span className={`text-lg ${colors[variant]}`}>{suffix}</span>}
      </div>
      {subtext && <p className="text-white/25 text-xs mt-1">{subtext}</p>}
    </div>
  )
}

function ConversationRow({ conv, index }: { conv: ClassifiedConversation; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr
        className={`border-b border-white/[0.05] hover:bg-white/[0.03] cursor-pointer transition-colors ${
          index % 2 === 0 ? '' : 'bg-white/[0.015]'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <p className="text-white/80 text-sm truncate max-w-xs">{conv.customerMessage}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-white/35 text-sm truncate max-w-xs">{conv.finResponse}</p>
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              conv.genuinelyResolved
                ? 'bg-green-500/15 text-green-400'
                : 'bg-red-500/15 text-red-400'
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
          <span className="text-white/50 text-sm">{conv.confidenceScore}%</span>
        </td>
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/25" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/25" />
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-white/[0.05] bg-white/[0.025]">
          <td colSpan={6} className="px-4 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-sm">
              <div>
                <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-2">Customer Message</p>
                <p className="text-white/80 leading-relaxed">{conv.customerMessage}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-2">Fin Response</p>
                <p className="text-white/50 leading-relaxed">{conv.finResponse}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-2">FRI Analysis</p>
                <p className="text-white/60 leading-relaxed mb-3">{conv.explanation}</p>
                <div className="p-3 rounded-lg bg-blue-500/[0.08] border border-blue-500/15">
                  <p className="text-blue-400 text-xs font-medium mb-1">Recommended fix</p>
                  <p className="text-white/50 text-xs leading-relaxed">{conv.recommendedFix}</p>
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const roadmapRef = useRef<HTMLDivElement>(null)
  const reportContentRef = useRef<HTMLDivElement>(null)

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
      <div className="min-h-screen bg-[#06090E] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
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

  const handleDownload = async () => {
    if (!reportContentRef.current || isGeneratingPDF) return
    setIsGeneratingPDF(true)

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      const content = reportContentRef.current

      // Expand all collapsed conversation rows by temporarily showing full content
      const canvas = await html2canvas(content, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#06090E',
        logging: false,
        windowWidth: 1280,
        scrollX: 0,
        scrollY: 0,
      })

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      const imgW = canvas.width
      const imgH = canvas.height
      const ratio = pageW / imgW

      // Slice tall canvas into A4 pages
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = imgW
      const sliceH = Math.floor(pageH / ratio) // pixels per page slice

      let offsetY = 0
      let pageNum = 0

      while (offsetY < imgH) {
        const sliceActual = Math.min(sliceH, imgH - offsetY)
        pageCanvas.height = sliceActual

        const ctx = pageCanvas.getContext('2d')!
        ctx.drawImage(canvas, 0, offsetY, imgW, sliceActual, 0, 0, imgW, sliceActual)

        const sliceData = pageCanvas.toDataURL('image/jpeg', 0.92)
        const sliceScaledH = sliceActual * ratio

        if (pageNum > 0) pdf.addPage()
        pdf.addImage(sliceData, 'JPEG', 0, 0, pageW, sliceScaledH)

        offsetY += sliceActual
        pageNum++
      }

      // Add a clean cover header on page 1
      pdf.setPage(1)
      pdf.save(`fri-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const wastedSpendFormatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(result.estimatedWastedSpend)

  const missingPrimitiveCount = result.failureBreakdown.missing_primitive ?? 0

  return (
    <div className="min-h-screen bg-[#06090E] text-white">
      {/* Top bar — Intercom-style sticky nav */}
      <header className="border-b border-white/[0.06] px-6 sticky top-0 bg-[#06090E]/90 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              New analysis
            </button>
            <div className="w-px h-4 bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <BarChart3 className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-semibold text-[15px]">FRI Analysis Report</span>
            </div>
            {isDemo && (
              <span className="px-1.5 py-0.5 rounded text-[11px] bg-blue-500/15 text-blue-400 border border-blue-500/25 font-medium">
                DEMO
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-sm">{result.totalConversations} conversations</span>
            <button
              onClick={handleDownload}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 border border-white/[0.08] hover:border-white/[0.14] px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div ref={reportContentRef} className="max-w-7xl mx-auto px-6 py-8 space-y-6">

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
            subtext="Claude-graded — no labelled ground truth"
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
        <div className="rounded-xl bg-white/[0.025] border border-white/[0.07] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-[15px]">Classified Conversations</h3>
              <p className="text-white/35 text-sm mt-0.5">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                {activeCategory && ` · filtered by ${FAILURE_LABELS[activeCategory]}`}
              </p>
            </div>
            {activeCategory && (
              <button
                onClick={() => handleCategoryFilter(null)}
                className="text-xs text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/[0.14] px-2.5 py-1 rounded-lg transition-all duration-150"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wide">Customer Message</th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wide">Fin Response</th>
                  <th className="px-4 py-3 text-center text-white/30 text-xs font-medium uppercase tracking-wide">Genuine?</th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-center text-white/30 text-xs font-medium uppercase tracking-wide">Confidence</th>
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
            <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-white/30 text-sm">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40 text-sm disabled:opacity-30 hover:text-white/70 hover:border-white/[0.14] transition-all duration-150"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40 text-sm disabled:opacity-30 hover:text-white/70 hover:border-white/[0.14] transition-all duration-150"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 text-white/15 text-xs">
          <span>FRI · Fin Resolution Intelligence</span>
          <div className="flex items-center gap-1">
            <span>0-to-1 deployment diagnostic</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
