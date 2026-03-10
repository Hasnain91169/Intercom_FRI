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
      className={`rounded-xl border p-5 transition-all duration-200 ${
        activeCategory === 'missing_primitive'
          ? 'border-violet-400/30 bg-violet-500/[0.1]'
          : 'border-violet-500/20 bg-violet-500/[0.06] hover:border-violet-400/25'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-[15px]">Missing Primitives Detected</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
                {missingPrimitiveCount} conversation{missingPrimitiveCount !== 1 ? 's' : ''} · {pct}% of failures
              </span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-2xl">
              A <strong className="text-violet-300/80">missing primitive</strong> is a task Fin attempted but couldn&apos;t complete — not because of a knowledge gap, but because the required <em>action capability</em> doesn&apos;t exist yet. These are the highest-signal product gaps: each one is a feature request backed by a real customer failure.
            </p>
            <p className="text-white/35 text-sm mt-2">
              In the FDE model, missing primitives are the first thing to prototype — they represent concrete 0-to-1 opportunities where a 2–5 day build can unlock resolution rate improvement that no KB update can deliver.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onCategoryClick('missing_primitive')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              activeCategory === 'missing_primitive'
                ? 'bg-violet-500/20 border-violet-400/40 text-violet-300'
                : 'border-violet-500/25 text-violet-400 hover:bg-violet-500/15'
            }`}
          >
            {activeCategory === 'missing_primitive' ? 'Filtered' : 'Filter table'}
          </button>
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Roadmap signal <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
