'use client'

interface DeploymentScoreProps {
  score: number
  genuineResolutionRate: number
  kbHealthScore: number
}

function getGrade(score: number): { letter: string; label: string; color: string; ring: string } {
  if (score >= 80) return { letter: 'A', label: 'Healthy deployment', color: 'text-green-400', ring: '#22C55E' }
  if (score >= 65) return { letter: 'B', label: 'Performing well', color: 'text-blue-400', ring: '#3B82F6' }
  if (score >= 50) return { letter: 'C', label: 'Needs attention', color: 'text-amber-400', ring: '#F59E0B' }
  if (score >= 35) return { letter: 'D', label: 'Significant gaps', color: 'text-orange-400', ring: '#F97316' }
  return { letter: 'F', label: 'Critical issues', color: 'text-red-400', ring: '#EF4444' }
}

export default function DeploymentScore({ score, genuineResolutionRate, kbHealthScore }: DeploymentScoreProps) {
  const grade = getGrade(score)
  const circumference = 2 * Math.PI * 52
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-8">
      {/* Score ring */}
      <div className="relative w-32 h-32 shrink-0">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={grade.ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${grade.color}`}>{score}</span>
          <span className="text-slate-500 text-xs">/100</span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1">
        <div className="flex items-baseline gap-3 mb-1">
          <span className={`text-5xl font-black ${grade.color}`}>{grade.letter}</span>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">Fin Deployment Score</p>
            <p className={`text-sm font-medium ${grade.color}`}>{grade.label}</p>
          </div>
        </div>

        <p className="text-white/40 text-sm mt-3 leading-relaxed">
          A composite of resolution quality, KB health, and primitive coverage. This is the number an FDE would use to benchmark a deployment at onboarding.
        </p>

        {/* Sub-scores */}
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-white/25 text-xs">Genuine resolution</p>
            <p className="text-white/80 font-semibold">{genuineResolutionRate}%</p>
          </div>
          <div>
            <p className="text-white/25 text-xs">KB health</p>
            <p className="text-white/80 font-semibold">{kbHealthScore}/100</p>
          </div>
          <div>
            <p className="text-white/25 text-xs">Score trend</p>
            <p className="text-white/30 font-semibold">Baseline</p>
          </div>
        </div>
      </div>
    </div>
  )
}
