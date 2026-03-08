import Papa from 'papaparse'
import { Conversation } from './types'

const REQUIRED_COLUMNS = ['id', 'customer_message', 'fin_response', 'resolved']

export interface ParseResult {
  conversations: Conversation[]
  error?: string
}

function normaliseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  return false
}

function normaliseNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return isNaN(num) ? undefined : num
}

export function parseCSV(fileContent: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
  })

  if (result.errors.length > 0) {
    const fatalErrors = result.errors.filter((e) => e.type === 'Delimiter' || e.type === 'Quotes')
    if (fatalErrors.length > 0) {
      return { conversations: [], error: `CSV parse error: ${fatalErrors[0].message}` }
    }
  }

  if (!result.data || result.data.length === 0) {
    return { conversations: [], error: 'The CSV file appears to be empty.' }
  }

  const headers = Object.keys(result.data[0])
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col))
  if (missingColumns.length > 0) {
    return {
      conversations: [],
      error: `Missing required columns: ${missingColumns.join(', ')}. Please check your CSV format.`,
    }
  }

  const conversations: Conversation[] = result.data
    .filter((row) => row.id && row.customer_message && row.fin_response)
    .map((row) => ({
      id: String(row.id).trim(),
      customerMessage: String(row.customer_message).trim(),
      finResponse: String(row.fin_response).trim(),
      resolved: normaliseBoolean(row.resolved),
      csatScore: normaliseNumber(row.csat_score),
      reopened: row.reopened !== undefined ? normaliseBoolean(row.reopened) : undefined,
      followUpWithin7Days:
        row.follow_up_within_7_days !== undefined
          ? normaliseBoolean(row.follow_up_within_7_days)
          : undefined,
      timestamp: row.timestamp || undefined,
    }))

  if (conversations.length === 0) {
    return {
      conversations: [],
      error: 'No valid rows found. Ensure each row has an id, customer_message, and fin_response.',
    }
  }

  return { conversations }
}

export function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      resolve({ conversations: [], error: 'File exceeds the 5MB limit. Please reduce the file size.' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(parseCSV(content))
    }
    reader.onerror = () => {
      resolve({ conversations: [], error: 'Failed to read the file. Please try again.' })
    }
    reader.readAsText(file)
  })
}
