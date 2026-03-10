'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Layers, Zap, ArrowRight, Loader2, Quote } from 'lucide-react'
import UploadZone from '@/components/UploadZone'
import { Conversation } from '@/lib/types'
import { sampleConversations, sampleAnalysisResult } from '@/lib/sampleData'

const PROGRESS_MESSAGES = [
  'Classifying conversations with Claude...',
  'Identifying failure patterns...',
  'Scoring knowledge base health...',
  'Calculating ROI impact...',
  'Building fix playbook...',
  'Finalising report...',
]

export default function HomePage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [filename, setFilename] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [isDemo, setIsDemo] = useState(false)

  const handleConversationsLoaded = (convs: Conversation[], name: string) => {
    setConversations(convs)
    setFilename(name)
    setError(null)
    setIsDemo(false)
  }

  const handleLoadSample = () => {
    setConversations(sampleConversations)
    setFilename('sample_conversations.csv')
    setError(null)
    setIsDemo(true)
  }

  const handleAnalyse = async () => {
    if (!conversations) return
    setIsAnalysing(true)
    setProgressIndex(0)

    if (isDemo) {
      let i = 0
      const interval = setInterval(() => {
        i++
        setProgressIndex(i)
        if (i >= PROGRESS_MESSAGES.length - 1) clearInterval(interval)
      }, 600)

      setTimeout(() => {
        clearInterval(interval)
        sessionStorage.setItem('fri_result', JSON.stringify(sampleAnalysisResult))
        sessionStorage.setItem('fri_demo', 'true')
        router.push('/results')
      }, PROGRESS_MESSAGES.length * 600 + 200)
      return
    }

    const progressInterval = setInterval(() => {
      setProgressIndex((i) => Math.min(i + 1, PROGRESS_MESSAGES.length - 2))
    }, 8000)

    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversations }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const result = await response.json()
      sessionStorage.setItem('fri_result', JSON.stringify(result))
      sessionStorage.removeItem('fri_demo')
      setProgressIndex(PROGRESS_MESSAGES.length - 1)
      setTimeout(() => router.push('/results'), 500)
    } catch (err) {
      clearInterval(progressInterval)
      setIsAnalysing(false)
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-[#06090E] text-white overflow-x-hidden">
      {/* Nav — Intercom-style: minimal, dark, sticky */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06090E]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* FRI logomark — mimicking Intercom's icon style */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">FRI</span>
            <span className="text-white/20 text-sm hidden sm:block">·</span>
            <span className="text-white/35 text-sm hidden sm:block">Fin Resolution Intelligence</span>
          </div>
          <a
            href="/sample_conversations.csv"
            download
            className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150"
          >
            Sample CSV
          </a>
        </div>
      </header>

      {/* Hero — with Intercom-style ambient glow behind the title */}
      <div className="relative">
        {/* Ambient glow — like Intercom's sphere */}
        <div
          className="absolute inset-x-0 top-0 h-[480px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99, 102, 241, 0.18) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/8 text-blue-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Powered by Claude AI
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-5">
            <h1 className="text-[52px] leading-[1.08] font-bold tracking-tight mb-5 text-white">
              What are your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                $0.99 resolutions
              </span>
              <br />
              actually worth?
            </h1>
            <p className="text-white/50 text-xl max-w-xl mx-auto leading-relaxed">
              FRI diagnoses Fin AI agent failures — so you know which resolutions are genuine and which are costing you money.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* G2 validation — Intercom-style: subtle, clean */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-white/25 text-xs uppercase tracking-widest font-medium">Real customer signal that built this</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                quote: "The most conversations that are 'resolved' are actually 'assumed resolved' — and they cost $0.99 too.",
                source: 'Mid-market customer, G2 review',
                highlight: true,
              },
              {
                quote: 'It is hard to know where to change something in order to make Fin respond better for future conversations.',
                source: 'SMB customer, G2 review',
                highlight: false,
              },
              {
                quote: "Fin's responses may come across as generic or may lack the necessary context when handling more complex queries.",
                source: 'Enterprise customer, G2 review',
                highlight: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border relative transition-colors ${
                  item.highlight
                    ? 'bg-blue-500/[0.06] border-blue-500/20'
                    : 'bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.04]'
                }`}
              >
                <Quote className={`w-3.5 h-3.5 mb-3 ${item.highlight ? 'text-blue-400' : 'text-white/20'}`} />
                <p className={`text-sm leading-relaxed mb-4 ${item.highlight ? 'text-white/80' : 'text-white/40'}`}>
                  {item.quote}
                </p>
                <p className="text-white/20 text-xs">{item.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pillars — Intercom-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[
            {
              icon: <BarChart3 className="w-4 h-4 text-blue-400" />,
              iconBg: 'bg-blue-500/10',
              title: 'Assumed vs. Genuine',
              description:
                'Fin marks conversations resolved. FRI checks if they actually were — using reopens, CSAT, follow-ups, and AI classification.',
            },
            {
              icon: <Layers className="w-4 h-4 text-violet-400" />,
              iconBg: 'bg-violet-500/10',
              title: '5 Failure Categories',
              description:
                'KB gaps, missing primitives, ambiguous queries, instruction conflicts, and out-of-scope — each with a specific fix.',
            },
            {
              icon: <Zap className="w-4 h-4 text-amber-400" />,
              iconBg: 'bg-amber-500/10',
              title: 'Fix Playbook',
              description:
                'Prioritised actions ranked by resolution rate impact vs. implementation effort — concrete steps, not generic advice.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-xl bg-white/[0.025] border border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-[15px] mb-2 text-white">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Upload — centred, clean */}
        <div className="max-w-xl mx-auto">
          <div className="p-7 rounded-2xl bg-white/[0.025] border border-white/[0.07]">
            {!isAnalysing ? (
              <>
                <UploadZone
                  onConversationsLoaded={handleConversationsLoaded}
                  onError={(e) => setError(e)}
                />

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-5 text-center">
                  <p className="text-white/20 text-xs mb-3">— or —</p>
                  <button
                    onClick={handleLoadSample}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Load sample dataset (20 conversations)
                  </button>
                </div>

                {conversations && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white text-sm">{filename}</p>
                          {isDemo && (
                            <span className="px-1.5 py-0.5 rounded text-[11px] bg-blue-500/15 text-blue-400 border border-blue-500/25 font-medium">
                              DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-white/35 text-sm mt-0.5">
                          {conversations.length} conversations ready
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center">
                        <span className="text-green-400 text-sm">✓</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAnalyse}
                      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                    >
                      Analyse {conversations.length} conversations
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-12 gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-[15px] mb-1">
                    {PROGRESS_MESSAGES[progressIndex]}
                  </p>
                  <p className="text-white/35 text-sm">
                    {conversations?.length} conversations · Claude AI
                  </p>
                </div>
                <div className="w-full max-w-[200px] bg-white/[0.08] rounded-full h-[3px]">
                  <div
                    className="bg-blue-500 h-[3px] rounded-full transition-all duration-700"
                    style={{
                      width: `${((progressIndex + 1) / PROGRESS_MESSAGES.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-8">
          No data is stored. Conversations are analysed in-memory and discarded after the session.
        </p>
      </div>
    </main>
  )
}
