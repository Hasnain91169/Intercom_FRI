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

    // Demo mode: use pre-classified results directly
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

    // Real analysis via Claude API
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
    <main className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">FRI</span>
            <span className="text-slate-600 text-sm hidden sm:block">/ Fin Resolution Intelligence</span>
          </div>
          <a
            href="/sample_conversations.csv"
            download
            className="text-slate-400 hover:text-slate-300 text-sm flex items-center gap-1.5 transition-colors"
          >
            Download sample CSV
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Fin Resolution Intelligence
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Find out what your{' '}
            <span className="text-white font-medium">$0.99 resolutions</span>{' '}
            are actually worth
          </p>
        </div>

        {/* Problem validation — real customer signal */}
        <div className="mb-14 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-5 justify-center">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-slate-500 text-xs uppercase tracking-widest">Real customer feedback that built this tool</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "The most conversations that are 'resolved' are actually 'assumed resolved' — and they cost $0.99 too.",
                source: "Mid-market customer, G2 review",
                highlight: true,
              },
              {
                quote: "It is hard to know where to change something in order to make Fin respond better for future conversations.",
                source: "SMB customer, G2 review",
                highlight: false,
              },
              {
                quote: "Fin's responses may come across as generic or may lack the necessary context when handling more complex queries.",
                source: "Enterprise customer, G2 review",
                highlight: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border relative ${
                  item.highlight
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <Quote className={`w-4 h-4 mb-2 ${item.highlight ? 'text-blue-400' : 'text-slate-600'}`} />
                <p className={`text-sm leading-relaxed mb-3 ${item.highlight ? 'text-slate-200' : 'text-slate-400'}`}>
                  {item.quote}
                </p>
                <p className="text-slate-600 text-xs">{item.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Three-column explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
              title: 'Assumed vs. Genuine',
              description:
                'Fin marks conversations resolved. FRI checks if they actually were — using reopens, CSAT, follow-ups, and AI classification.',
            },
            {
              icon: <Layers className="w-5 h-5 text-purple-400" />,
              title: '5 Failure Categories',
              description:
                'KB gaps, missing primitives, ambiguous queries, instruction conflicts, and out-of-scope requests — each with a specific fix.',
            },
            {
              icon: <Zap className="w-5 h-5 text-amber-400" />,
              title: 'Fix Playbook',
              description:
                'Prioritised actions ranked by resolution rate impact vs. implementation effort — concrete steps, not generic advice.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-700/80 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Upload section */}
        <div className="max-w-2xl mx-auto">
          <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50">
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

                {/* Sample data button */}
                <div className="mt-6 text-center">
                  <p className="text-slate-500 text-sm mb-3">— or —</p>
                  <button
                    onClick={handleLoadSample}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors underline underline-offset-2"
                  >
                    Load sample dataset (20 conversations)
                  </button>
                </div>

                {/* Loaded state */}
                {conversations && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white text-sm">{filename}</p>
                          {isDemo && (
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                              DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {conversations.length} conversations ready to analyse
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400 text-lg">✓</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAnalyse}
                      className="w-full py-3.5 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors flex items-center justify-center gap-2 group"
                    >
                      Analyse {conversations.length} conversations
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Loading state */
              <div className="flex flex-col items-center py-12 gap-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-lg mb-1">
                    {PROGRESS_MESSAGES[progressIndex]}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Analysing {conversations?.length} conversations with Claude
                  </p>
                </div>
                <div className="w-full max-w-xs bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${((progressIndex + 1) / PROGRESS_MESSAGES.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex gap-1.5">
                  {PROGRESS_MESSAGES.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        i <= progressIndex ? 'bg-blue-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-10">
          No data is stored. Conversations are analysed in-memory and discarded after the session.
        </p>
      </div>
    </main>
  )
}
