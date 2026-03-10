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
    <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07] h-full">
      <h3 className="font-semibold text-white text-[15px] mb-1">ROI Impact</h3>
      <p className="text-white/40 text-sm mb-6">
        Based on {totalConversations} conversations · assumes same volume scales monthly
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.07]">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white/30 text-xs">Monthly spend</span>
          </div>
          <div className="text-2xl font-bold text-white/80">{formatCurrency(estimatedMonthlyCost)}</div>
          <div className="text-white/20 text-xs mt-0.5">{totalConversations} × £0.99</div>
        </div>

        <div className="p-4 rounded-lg bg-red-500/[0.07] border border-red-500/15">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400/80 text-xs">Wasted spend</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{formatCurrency(estimatedWastedSpend)}</div>
          <div className="text-red-400/40 text-xs mt-0.5">{wastePercentage}% of total spend</div>
        </div>

        <div className="p-4 rounded-lg bg-green-500/[0.07] border border-green-500/15">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400/80 text-xs">Recoverable savings</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(potentialSavings)}</div>
          <div className="text-green-400/40 text-xs mt-0.5">~70% of wasted spend</div>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/[0.07] border border-blue-500/15">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400/80 text-xs">Projected after fixes</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(projectedCost)}</div>
          <div className="text-blue-400/40 text-xs mt-0.5">same resolutions, less waste</div>
        </div>
      </div>

      {/* Payback period */}
      {paybackMonths > 0 && (
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Payback period</p>
              <p className="text-white/30 text-xs mt-0.5">
                Assumes ~40hrs implementation effort @ £100/hr
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white/80">{paybackMonths}</span>
              <span className="text-white/30 text-sm ml-1">month{paybackMonths !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Current genuine resolution */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-white/30">Current genuine resolution rate</span>
        <span className="text-blue-400 font-semibold">{genuineResolutionRate}%</span>
      </div>
      <div className="mt-1.5 h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${genuineResolutionRate}%` }}
        />
      </div>
    </div>
  )
}
