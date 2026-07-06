'use client'

import { ArrowUpRight, Clock, Link2 } from 'lucide-react'
import { RoadmapSignal as RoadmapSignalType } from '@/lib/types'

interface RoadmapSignalProps {
  signal: RoadmapSignalType
}

export default function RoadmapSignal({ signal }: RoadmapSignalProps) {
  return (
    <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-[15px]">Roadmap Signal</h3>
            <span className="px-2 py-0.5 rounded text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
              {signal.missingPrimitiveCount} missing primitive{signal.missingPrimitiveCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-white/35 text-sm">
            Structured product feedback — what an FDE would take to R&amp;D after this deployment analysis
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-green-400/80 font-semibold text-sm">{signal.estimatedResolutionRecovery}</p>
          <p className="text-white/20 text-xs">if primitives built natively</p>
        </div>
      </div>

      {/* Priority summary */}
      <div className="mb-6 p-4 rounded-lg bg-white/[0.03] border-l-2 border-violet-500/50">
        <p className="text-xs font-medium text-white/25 uppercase tracking-wide mb-1">FDE → R&amp;D Handoff Note</p>
        <p className="text-white/65 text-sm leading-relaxed">{signal.prioritySummary}</p>
      </div>

      {/* Primitive cards */}
      <div className="space-y-3">
        {signal.topPrimitives.map((primitive, index) => (
          <div
            key={index}
            className="rounded-xl bg-white/[0.02] border border-white/[0.07] overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/[0.025] border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-violet-400 text-[10px] font-bold">{index + 1}</span>
                </div>
                <span className="text-white/80 font-medium text-sm">{primitive.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-white/25 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{primitive.estimatedBuildDays}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/25 text-xs">
                  <Link2 className="w-3 h-3" />
                  <span>{primitive.apiDependency}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-white/[0.05] text-white/35">
                  {primitive.frequency} conversation{primitive.frequency !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-white/25 text-xs font-medium uppercase tracking-wide mb-1.5">Customer Experience</p>
                <p className="text-white/55 text-sm leading-relaxed">{primitive.customerImpact}</p>
              </div>
              <div>
                <p className="text-white/25 text-xs font-medium uppercase tracking-wide mb-1.5">Native Product Input</p>
                <p className="text-white/55 text-sm leading-relaxed">{primitive.productInput}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-5 flex items-start gap-2 text-white/20 text-xs">
        <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-400/50" />
        <span>
          These primitives represent the boundary between what can be solved with Fin configuration today and what requires product investment. Each one is a candidate for the FDE team&apos;s roadmap input process.
        </span>
      </div>
    </div>
  )
}
