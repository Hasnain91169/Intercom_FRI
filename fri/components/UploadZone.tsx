'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { parseCSVFile } from '@/lib/parseCSV'
import { Conversation } from '@/lib/types'

interface UploadZoneProps {
  onConversationsLoaded: (conversations: Conversation[], filename: string) => void
  onError: (error: string) => void
}

export default function UploadZone({ onConversationsLoaded, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        onError('Please upload a CSV file.')
        return
      }
      setIsProcessing(true)
      const result = await parseCSVFile(file)
      setIsProcessing(false)
      if (result.error) {
        onError(result.error)
      } else {
        onConversationsLoaded(result.conversations, file.name)
      }
    },
    [onConversationsLoaded, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-52 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Parsing CSV...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <Upload className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-white font-medium">Drop your CSV here, or click to browse</p>
              <p className="text-slate-400 text-sm mt-1">Max 5MB · Up to 100 conversations</p>
            </div>
          </div>
        )}
      </label>

      {/* Expected columns */}
      <div className="mt-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Expected CSV columns</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'id', required: true },
            { name: 'customer_message', required: true },
            { name: 'fin_response', required: true },
            { name: 'resolved', required: true },
            { name: 'csat_score', required: false },
            { name: 'reopened', required: false },
            { name: 'follow_up_within_7_days', required: false },
          ].map((col) => (
            <span
              key={col.name}
              className={`text-xs px-2 py-1 rounded font-mono ${
                col.required
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
              }`}
            >
              {col.name}
              {col.required && <span className="ml-1 text-blue-400">*</span>}
            </span>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-2">* Required columns</p>
      </div>

      <div className="mt-3 flex items-start gap-2 text-slate-500 text-xs">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Don&apos;t have Fin data yet? Use the sample dataset below to see a full demo.</span>
      </div>
    </div>
  )
}
