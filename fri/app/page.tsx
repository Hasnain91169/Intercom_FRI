'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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
      <header className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-[15px] tracking-tight">
            FRI{' '}
            <span className="text-white/25 font-normal">· Fin Resolution Intelligence</span>
          </span>
          <a
            href="/sample_conversations.csv"
            download
            className="text-white/30 hover:text-white/60 text-sm transition-colors duration-150"
          >
            Sample CSV
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="pt-16 pb-12 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4 text-white">
            Fin closed the ticket.<br />Was the problem actually solved?
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Fin marks conversations resolved. FRI reads them and checks — using reopens, CSAT signals, and Claude — to separate genuine resolutions from assumed ones.
          </p>
        </div>

        {/* G2 signal — raw, not cards */}
        <div className="border-l-2 border-white/[0.08] pl-5 mb-14 space-y-4">
          <p className="text-white/35 text-xs uppercase tracking-widest mb-5">What customers are saying on G2</p>
          <p className="text-white/60 text-sm leading-relaxed">
            &ldquo;The most conversations that are &lsquo;resolved&rsquo; are actually &lsquo;assumed resolved&rsquo; — and they cost $0.99 too.&rdquo;
            <span className="text-white/20 ml-2">— Mid-market customer</span>
          </p>
          <p className="text-white/40 text-sm leading-relaxed">
            &ldquo;It is hard to know where to change something in order to make Fin respond better for future conversations.&rdquo;
            <span className="text-white/20 ml-2">— SMB customer</span>
          </p>
          <p className="text-white/40 text-sm leading-relaxed">
            &ldquo;Fin&rsquo;s responses may come across as generic or may lack the necessary context when handling more complex queries.&rdquo;
            <span className="text-white/20 ml-2">— Enterprise customer</span>
          </p>
        </div>

        {/* What it does */}
        <div className="mb-14 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 text-sm">
          <div>
            <p className="text-white/70 font-medium mb-1">Failure classification</p>
            <p className="text-white/35 leading-relaxed">Each conversation is tagged: KB gap, missing primitive, ambiguous query, instruction conflict, or out-of-scope.</p>
          </div>
          <div>
            <p className="text-white/70 font-medium mb-1">Resolution rate audit</p>
            <p className="text-white/35 leading-relaxed">Splits your reported resolution rate into genuine vs. assumed. Shows what you&rsquo;re actually paying for.</p>
          </div>
          <div>
            <p className="text-white/70 font-medium mb-1">Prioritised fix playbook</p>
            <p className="text-white/35 leading-relaxed">Actions ranked by resolution rate impact against implementation effort. Built per-dataset, not generic advice.</p>
          </div>
        </div>

        {/* Upload */}
        <div className="max-w-lg mb-8">
          <div className="border border-white/[0.07] rounded-xl bg-white/[0.02] p-6">
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

                <div className="mt-4 text-center">
                  <button
                    onClick={handleLoadSample}
                    className="text-white/30 hover:text-white/60 text-sm transition-colors"
                  >
                    or load sample dataset (20 conversations)
                  </button>
                </div>

                {conversations && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white/80 text-sm">{filename}</p>
                          {isDemo && (
                            <span className="px-1.5 py-0.5 rounded text-[11px] bg-white/[0.06] text-white/40 border border-white/10 font-medium">
                              demo
                            </span>
                          )}
                        </div>
                        <p className="text-white/30 text-xs mt-0.5">
                          {conversations.length} conversations ready
                        </p>
                      </div>
                      <span className="text-green-500 text-sm">✓</span>
                    </div>

                    <button
                      onClick={handleAnalyse}
                      className="w-full py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors duration-150"
                    >
                      Analyse {conversations.length} conversations →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1">
                    {PROGRESS_MESSAGES[progressIndex]}
                  </p>
                  <p className="text-white/25 text-xs">
                    {conversations?.length} conversations
                  </p>
                </div>
                <div className="w-40 bg-white/[0.06] rounded-full h-px mt-1">
                  <div
                    className="bg-white/30 h-px rounded-full transition-all duration-700"
                    style={{
                      width: `${((progressIndex + 1) / PROGRESS_MESSAGES.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-white/15 text-xs pb-16">
          No data stored. Conversations are analysed in-memory and discarded after the session.
        </p>
      </div>
    </main>
  )
}
