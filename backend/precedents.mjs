
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(__dirname, 'data', 'precedents.json')

fs.mkdirSync(path.dirname(file), { recursive: true })

const stopWords = new Set([
  'about', 'after', 'again', 'against', 'being',
  'between', 'could', 'every', 'first', 'found',
  'given', 'having', 'other', 'their', 'there',
  'these', 'those', 'under', 'until', 'where',
  'which', 'while', 'would', 'should', 'because',
  'petitioner', 'respondent', 'california',
  'statement', 'evidence', 'claims'
])

function tokens(text) {
  return new Set(
    (String(text).toLowerCase().match(/[a-z]{4,}/g) || [])
      .filter(word => !stopWords.has(word))
  )
}

function normalizeCitation(citation) {
  return String(citation || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function getPrecedents() {
  if (!fs.existsSync(file)) return []

  const data = JSON.parse(fs.readFileSync(file, 'utf8'))

  if (!Array.isArray(data)) {
    throw new Error('precedents.json must contain a JSON array')
  }

  return data
}

export function savePrecedent(record) {
  const records = getPrecedents()

  if (!record || typeof record !== 'object') {
    throw new Error('Invalid precedent record')
  }

  if (typeof record.text !== 'string' ||
      record.text.trim().length < 100) {
    throw new Error('Precedent opinion text must contain at least 100 characters')
  }

  if (!record.citation || !record.title || !record.url) {
    throw new Error('Precedent requires title, citation and URL')
  }

  if (records.some(existing =>
    normalizeCitation(existing.citation) ===
    normalizeCitation(record.citation)
  )) {
    throw new Error(`Duplicate precedent citation: ${record.citation}`)
  }

  records.push(record)

  fs.writeFileSync(
    file,
    JSON.stringify(records, null, 2),
    'utf8'
  )

  return record
}

export function searchPrecedents(query, limit = 5) {
  const queryTerms = tokens(query)
  const normalizedQuery = String(query).toLowerCase()

  const safeLimit = Math.min(
    20,
    Math.max(1, Number(limit) || 5)
  )

  if (queryTerms.size === 0) return []

  return getPrecedents()
    .flatMap(record => {
      if (typeof record.text !== 'string') return []

      const passages = record.text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 50)

      return passages.map((passage, index) => {
        const passageTerms = tokens(passage)

        const matches = [...queryTerms]
          .filter(word => passageTerms.has(word))

        let score = matches.length

        // Additional weight for relevant legal concepts.
        const legalConcepts = [
          'security deposit',
          'ordinary wear and tear',
          'cleaning',
          'repainting',
          'repair',
          'deduction',
          'itemized',
          'landlord',
          'tenant',
          'bad faith',
          'setoff'
        ]

        for (const concept of legalConcepts) {
          if (
            normalizedQuery.includes(concept) &&
            passage.toLowerCase().includes(concept)
          ) {
            score += 3
          }
        }

        return {
          id: record.id,
          title: record.title,
          citation: record.citation,
          court: record.court,
          date: record.date,
          url: record.url,
          publicationStatus: record.publicationStatus,
          passageIndex: index,
          passage,
          score,
          matchedTerms: matches,
          sourceReviewed: record.sourceReviewed === true
        }
      })
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, safeLimit)
}
