'use client'

import { ArrowUpRight, Clock, Link2 } from 'lucide-react'
import { RoadmapSignal as RoadmapSignalType } from '@/lib/types'

interface RoadmapSignalProps {
  signal: RoadmapSignalType
}

export default function RoadmapSignal({ signal }: RoadmapSignalProps) {
  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">Roadmap Signal</h3>
            <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
              {signal.missingPrimitiveCount} missing primitive{signal.missingPrimitiveCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Structured product feedback — what an FDE would take to R&amp;D after this deployment analysis
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-green-400 font-semibold text-sm">{signal.estimatedResolutionRecovery}</p>
          <p className="text-slate-500 text-xs">if primitives built natively</p>
        </div>
      </div>

      {/* Priority summary */}
      <div className="mb-6 p-4 rounded-lg bg-slate-700/40 border-l-4 border-purple-500">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">FDE → R&amp;D Handoff Note</p>
        <p className="text-slate-200 text-sm leading-relaxed">{signal.prioritySummary}</p>
      </div>

      {/* Primitive cards */}
      <div className="space-y-4">
        {signal.topPrimitives.map((primitive, index) => (
          <div
            key={index}
            className="rounded-xl bg-slate-700/30 border border-slate-600/50 overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-700/40 border-b border-slate-600/40">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center">
                  <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                </div>
                <span className="text-white font-medium text-sm">{primitive.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{primitive.estimatedBuildDays}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{primitive.apiDependency}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-slate-600/50 text-slate-300">
                  {primitive.frequency} conversation{primitive.frequency !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Customer Experience</p>
                <p className="text-slate-300 text-sm leading-relaxed">{primitive.customerImpact}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Native Product Input</p>
                <p className="text-slate-300 text-sm leading-relaxed">{primitive.productInput}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-5 flex items-start gap-2 text-slate-500 text-xs">
        <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />
        <span>
          These primitives represent the boundary between what can be solved with Fin configuration today and what requires product investment. Each one is a candidate for the FDE team&apos;s roadmap input process.
        </span>
      </div>
    </div>
  )
}
