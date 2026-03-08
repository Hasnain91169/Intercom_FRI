'use client'

import { Zap, ArrowRight } from 'lucide-react'
import { FailureCategory } from '@/lib/types'

interface MissingPrimitiveCalloutProps {
  missingPrimitiveCount: number
  totalConversations: number
  onViewDetails: () => void
  activeCategory: FailureCategory | null
  onCategoryClick: (cat: FailureCategory) => void
}

export default function MissingPrimitiveCallout({
  missingPrimitiveCount,
  totalConversations,
  onViewDetails,
  activeCategory,
  onCategoryClick,
}: MissingPrimitiveCalloutProps) {
  if (missingPrimitiveCount === 0) return null

  const pct = Math.round((missingPrimitiveCount / totalConversations) * 100)

  return (
    <div
      className={`rounded-xl border-2 p-5 transition-all duration-200 ${
        activeCategory === 'missing_primitive'
          ? 'border-purple-400 bg-purple-500/15'
          : 'border-purple-500/40 bg-purple-500/10 hover:border-purple-400/60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold">Missing Primitives Detected</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
                {missingPrimitiveCount} conversation{missingPrimitiveCount !== 1 ? 's' : ''} · {pct}% of failures
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              A <strong className="text-purple-300">missing primitive</strong> is a task Fin attempted but couldn&apos;t complete — not because of a knowledge gap, but because the required <em>action capability</em> doesn&apos;t exist yet. These are the highest-signal product gaps: each one is a feature request backed by a real customer failure.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              In the FDE model, missing primitives are the first thing to prototype — they represent concrete 0-to-1 opportunities where a 2–5 day build can unlock resolution rate improvement that no KB update can deliver.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onCategoryClick('missing_primitive')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              activeCategory === 'missing_primitive'
                ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                : 'border-purple-500/40 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            {activeCategory === 'missing_primitive' ? 'Filtered' : 'Filter table'}
          </button>
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Roadmap signal <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
