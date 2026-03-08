'use client'

import { DollarSign, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'

interface ROIDashboardProps {
  estimatedMonthlyCost: number
  estimatedWastedSpend: number
  totalConversations: number
  genuineResolutionRate: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ROIDashboard({
  estimatedMonthlyCost,
  estimatedWastedSpend,
  totalConversations,
  genuineResolutionRate,
}: ROIDashboardProps) {
  const potentialSavings = estimatedWastedSpend * 0.7
  const projectedCost = estimatedMonthlyCost - potentialSavings
  const wastePercentage = Math.round((estimatedWastedSpend / estimatedMonthlyCost) * 100)

  // Payback period: assume fixes take 40 hrs @ £100/hr = £4,000
  const implementationCost = 4000
  const paybackMonths = potentialSavings > 0 ? Math.ceil(implementationCost / potentialSavings) : 0

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 h-full">
      <h3 className="font-semibold text-white mb-1">ROI Impact</h3>
      <p className="text-slate-400 text-sm mb-6">
        Based on {totalConversations} conversations · assumes same volume scales monthly
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-xs">Monthly spend</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(estimatedMonthlyCost)}</div>
          <div className="text-slate-500 text-xs mt-0.5">{totalConversations} × £0.99</div>
        </div>

        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs">Wasted spend</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{formatCurrency(estimatedWastedSpend)}</div>
          <div className="text-red-500/70 text-xs mt-0.5">{wastePercentage}% of total spend</div>
        </div>

        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-xs">Recoverable savings</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(potentialSavings)}</div>
          <div className="text-green-500/70 text-xs mt-0.5">~70% of wasted spend</div>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs">Projected after fixes</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(projectedCost)}</div>
          <div className="text-blue-500/70 text-xs mt-0.5">same resolutions, less waste</div>
        </div>
      </div>

      {/* Payback period */}
      {paybackMonths > 0 && (
        <div className="p-4 rounded-lg bg-slate-700/40 border border-slate-600/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Payback period</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Assumes ~40hrs implementation effort @ £100/hr
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{paybackMonths}</span>
              <span className="text-slate-400 text-sm ml-1">month{paybackMonths !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Current genuine resolution */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">Current genuine resolution rate</span>
        <span className="text-blue-400 font-semibold">{genuineResolutionRate}%</span>
      </div>
      <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${genuineResolutionRate}%` }}
        />
      </div>
    </div>
  )
}
