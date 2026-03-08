'use client'

interface KBHealthPanelProps {
  kbHealthScore: number
  kbCoverageScore: number
  kbFreshnessScore: number
  kbClarityScore: number
}

function ScoreGauge({ score, label, description }: { score: number; label: string; description: string }) {
  const color =
    score >= 75 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'

  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#334155"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function getRating(score: number) {
  if (score >= 80) return { label: 'Healthy', color: 'text-green-400' }
  if (score >= 60) return { label: 'Needs Work', color: 'text-amber-400' }
  if (score >= 40) return { label: 'At Risk', color: 'text-orange-400' }
  return { label: 'Critical', color: 'text-red-400' }
}

export default function KBHealthPanel({
  kbHealthScore,
  kbCoverageScore,
  kbFreshnessScore,
  kbClarityScore,
}: KBHealthPanelProps) {
  const rating = getRating(kbHealthScore)

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-white mb-1">Knowledge Base Health</h3>
          <p className="text-slate-400 text-sm">
            Product shape assessment — based on Fin&apos;s response quality
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{kbHealthScore}</div>
          <div className={`text-sm font-medium ${rating.color}`}>{rating.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <ScoreGauge
          score={kbCoverageScore}
          label="Coverage"
          description="Topic breadth"
        />
        <ScoreGauge
          score={kbFreshnessScore}
          label="Freshness"
          description="Up-to-date info"
        />
        <ScoreGauge
          score={kbClarityScore}
          label="Clarity"
          description="Specific answers"
        />
      </div>

      {/* Health bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Overall KB Health Score</span>
          <span>{kbHealthScore}/100</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${kbHealthScore}%`,
              backgroundColor:
                kbHealthScore >= 75 ? '#22C55E' : kbHealthScore >= 50 ? '#F59E0B' : '#EF4444',
            }}
          />
        </div>
      </div>

      {kbHealthScore < 70 && (
        <div className="mt-4 p-3 rounded-lg bg-slate-700/50 border border-slate-600/50">
          <p className="text-slate-300 text-xs">
            <span className="text-amber-400 font-medium">Incomplete product shape detected.</span>{' '}
            Your KB has gaps that are causing Fin to deflect or give vague answers. The fix playbook below identifies the highest-impact improvements.
          </p>
        </div>
      )}
    </div>
  )
}
