'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { FailureCategory } from '@/lib/types'

interface FailureClassifierChartProps {
  failureBreakdown: Record<FailureCategory, number>
  totalConversations: number
  activeCategory: FailureCategory | null
  onCategoryClick: (cat: FailureCategory | null) => void
}

const CATEGORY_CONFIG: Record<FailureCategory, { label: string; color: string; description: string }> = {
  genuine_resolution: {
    label: 'Genuine Resolution',
    color: '#3B82F6',
    description: 'Customer issue was actually resolved',
  },
  knowledge_gap: {
    label: 'Knowledge Gap',
    color: '#EF4444',
    description: "Fin couldn't find relevant info in the KB",
  },
  missing_primitive: {
    label: 'Missing Primitive',
    color: '#A855F7',
    description: 'Task requires a capability Fin doesn\'t have yet',
  },
  ambiguous_query: {
    label: 'Ambiguous Query',
    color: '#F59E0B',
    description: "Customer's question was unclear; Fin guessed",
  },
  instruction_conflict: {
    label: 'Instruction Conflict',
    color: '#F97316',
    description: "Fin's instructions contradicted each other",
  },
  out_of_scope: {
    label: 'Out of Scope',
    color: '#6B7280',
    description: "Query was outside Fin's defined remit",
  },
}

export default function FailureClassifierChart({
  failureBreakdown,
  totalConversations,
  activeCategory,
  onCategoryClick,
}: FailureClassifierChartProps) {
  const chartData = Object.entries(failureBreakdown)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({
      category: category as FailureCategory,
      count,
      label: CATEGORY_CONFIG[category as FailureCategory]?.label ?? category,
      color: CATEGORY_CONFIG[category as FailureCategory]?.color ?? '#6B7280',
      pct: Math.round((count / totalConversations) * 100),
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    const category = data?.category as FailureCategory | undefined
    if (!category || category === 'genuine_resolution') return
    onCategoryClick(activeCategory === category ? null : category)
  }

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-white mb-1">Failure Category Breakdown</h3>
          <p className="text-slate-400 text-sm">Click a bar to filter the conversation table below</p>
        </div>
        {activeCategory && (
          <button
            onClick={() => onCategoryClick(null)}
            className="text-xs text-slate-400 hover:text-white transition-colors border border-slate-600 px-2 py-1 rounded"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
            <XAxis
              type="number"
              hide
              domain={[0, Math.max(...chartData.map((d) => d.count)) + 1]}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={150}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, _name, props) => [
                `${value} conversations (${(props.payload as { pct: number }).pct}%)`,
                '',
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} onClick={handleClick} cursor="pointer">
              {chartData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={entry.color}
                  opacity={
                    activeCategory === null || activeCategory === entry.category ? 1 : 0.3
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with descriptions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {chartData
          .filter((d) => d.category !== 'genuine_resolution')
          .map((item) => (
            <button
              key={item.category}
              onClick={() => handleClick(item)}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                activeCategory === item.category
                  ? 'bg-slate-700/80 border border-slate-600'
                  : 'hover:bg-slate-700/40'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-xs font-medium">{item.label}</span>
                  {item.category === 'missing_primitive' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 font-medium border border-purple-500/30">
                      KEY
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  {CATEGORY_CONFIG[item.category].description}
                </p>
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}
