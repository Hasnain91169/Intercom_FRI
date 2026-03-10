'use client'

import { useState } from 'react'
import { Copy, Check, Zap, Terminal } from 'lucide-react'
import { PlaybookItem, FailureCategory } from '@/lib/types'

interface FixPlaybookProps {
  items: PlaybookItem[]
}

const CATEGORY_LABELS: Record<FailureCategory, string> = {
  knowledge_gap: 'KB Gap',
  missing_primitive: 'Missing Primitive',
  ambiguous_query: 'Ambiguous Query',
  instruction_conflict: 'Instruction Conflict',
  out_of_scope: 'Out of Scope',
  genuine_resolution: 'Genuine Resolution',
}

const CATEGORY_COLORS: Record<FailureCategory, string> = {
  knowledge_gap: 'bg-red-500/[0.12] text-red-400 border-red-500/20',
  missing_primitive: 'bg-violet-500/[0.12] text-violet-400 border-violet-500/20',
  ambiguous_query: 'bg-amber-500/[0.12] text-amber-400 border-amber-500/20',
  instruction_conflict: 'bg-orange-500/[0.12] text-orange-400 border-orange-500/20',
  out_of_scope: 'bg-white/[0.06] text-white/40 border-white/10',
  genuine_resolution: 'bg-green-500/[0.12] text-green-400 border-green-500/20',
}

const EFFORT_COLORS = {
  low: 'bg-green-500/[0.1] text-green-400',
  medium: 'bg-amber-500/[0.1] text-amber-400',
  high: 'bg-red-500/[0.1] text-red-400',
}

export default function FixPlaybook({ items }: FixPlaybookProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const handleCopy = () => {
    const text = items
      .map(
        (item, i) =>
          `${i + 1}. [Priority ${item.priority}] [${CATEGORY_LABELS[item.category]}] ${item.action}\n   Impact: ${item.estimatedImpact} | Effort: ${item.effort}\n   ${item.detail}`
      )
      .join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white text-[15px] mb-1">Fix Playbook</h3>
          <p className="text-white/35 text-sm">
            Accelerate time to value — prioritised actions to improve genuine resolution rate
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/[0.08] hover:border-white/[0.14] px-3 py-1.5 rounded-lg shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy playbook
            </>
          )}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl border transition-all duration-200 ${
              expanded === index
                ? 'bg-white/[0.05] border-white/[0.12]'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
            }`}
          >
            <button
              className="w-full p-4 text-left"
              onClick={() => setExpanded(expanded === index ? null : index)}
            >
              <div className="flex items-start gap-3">
                {/* Priority number */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    item.priority === 1
                      ? 'bg-blue-500/80 text-white'
                      : item.priority === 2
                      ? 'bg-white/[0.08] text-white/50'
                      : 'bg-white/[0.05] text-white/30'
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${CATEGORY_COLORS[item.category]}`}
                    >
                      {CATEGORY_LABELS[item.category]}
                      {item.category === 'missing_primitive' && (
                        <Zap className="w-3 h-3 inline ml-1" />
                      )}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${EFFORT_COLORS[item.effort]}`}>
                      {item.effort.charAt(0).toUpperCase() + item.effort.slice(1)} effort
                    </span>
                  </div>

                  <p className="text-white/80 text-sm font-medium leading-snug">{item.action}</p>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-green-400/80 text-xs font-semibold">{item.estimatedImpact}</span>
                  </div>
                </div>
              </div>
            </button>

            {expanded === index && (
              <div className="px-4 pb-4 space-y-3">
                <div className="ml-9 p-3 rounded-lg bg-white/[0.03] border border-white/[0.07]">
                  <p className="text-white/55 text-sm leading-relaxed">{item.detail}</p>
                </div>
                {item.implementationSketch && (
                  <div className="ml-9 p-3 rounded-lg bg-black/30 border border-violet-500/15">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Terminal className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-violet-400/80 text-xs font-medium uppercase tracking-wide">Implementation sketch</span>
                      <span className="text-white/20 text-xs ml-1">· what I&apos;d prototype with the customer&apos;s team</span>
                    </div>
                    <p className="text-white/50 text-xs font-mono leading-relaxed whitespace-pre-wrap">{item.implementationSketch}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
