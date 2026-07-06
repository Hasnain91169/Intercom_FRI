'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface ResolutionScoreCardProps {
  genuineResolutionRate: number
  reportedResolutionRate: number
  assumedResolutionCount: number
  totalConversations: number
}

export default function ResolutionScoreCard({
  genuineResolutionRate,
  reportedResolutionRate,
  assumedResolutionCount,
  totalConversations,
}: ResolutionScoreCardProps) {
  const genuineCount = Math.round((genuineResolutionRate / 100) * totalConversations)
  const assumedCount = assumedResolutionCount
  const failedCount = totalConversations - genuineCount - assumedCount

  const data = [
    { name: 'Genuinely Resolved', value: genuineCount, color: '#3B82F6' },
    { name: 'Assumed Resolved', value: Math.max(0, assumedCount), color: '#F59E0B' },
    { name: 'Not Resolved', value: Math.max(0, failedCount), color: '#EF4444' },
  ].filter((d) => d.value > 0)

  return (
    <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07] h-full">
      <h3 className="font-semibold text-white text-[15px] mb-1">Resolution Quality Split</h3>
      <p className="text-white/40 text-sm mb-6">
        Fin reported <span className="text-white/80 font-medium">{reportedResolutionRate}%</span> resolved.
        Claude assessed <span className="text-blue-400 font-medium">{genuineResolutionRate}%</span> as genuinely resolved.
      </p>

      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1117',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${value} conversations`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-blue-400">{genuineResolutionRate}%</span>
            <span className="text-white/30 text-xs">genuine</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-white/50 text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-white/80 font-medium text-sm">{item.value}</span>
                <span className="text-white/25 text-xs ml-1">
                  ({Math.round((item.value / totalConversations) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/15">
        <p className="text-amber-400 text-xs font-medium">
          {assumedResolutionCount} assumed resolution{assumedResolutionCount !== 1 ? 's' : ''} detected
        </p>
        <p className="text-white/35 text-xs mt-0.5">
          Conversations closed without customer confirmation — you paid $0.99 for each.
        </p>
      </div>
    </div>
  )
}
