
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = 'https://www.courtlistener.com'
const SEARCH_API = `${BASE}/api/rest/v4/search/`
const COURTS = ['cal', 'calctapp']
const CACHE_VERSION = 2
const CACHE_DURATION = 24 * 60 * 60 * 1000
const RATE_LIMIT_COOLDOWN = 5 * 60 * 1000
const MAX_SEARCH_RESULTS = 5
const MAX_OPINION_FETCHES = 3
const MAX_PASSAGE_LENGTH = 5000
const MAX_CACHE_ENTRIES = 80
const CACHE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'courtlistener-cache.json')
const cache = new Map()
let rateLimitedUntil = 0
let pendingSearches = new Map()

fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
try {
  const saved = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  for (const [key, value] of Object.entries(saved)) {
    if (value && Array.isArray(value.results) && typeof value.timestamp === 'number') {
      cache.set(key, value)
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') console.warn('CourtListener cache load:', error.message)
}

function saveCache() {
  try {
    while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
    const temp = `${CACHE_FILE}.${process.pid}.tmp`
    fs.writeFileSync(temp, JSON.stringify(Object.fromEntries(cache)), 'utf8')
    fs.renameSync(temp, CACHE_FILE)
  } catch (error) {
    console.warn('CourtListener cache save:', error.message)
  }
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote|br)>/gi, '\n\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildResearchQuery(caseText) {
  const text = String(caseText || '').toLowerCase()
  if (/security deposit|deposit refund|deposit deduction|1950\.5/.test(text)) return '"security deposit"'
  if (/landlord|tenant|rental/.test(text)) return 'landlord tenant'
  if (/eviction|unlawful detainer/.test(text)) return 'unlawful detainer'
  if (/negligence/.test(text)) return 'negligence'
  if (/contract/.test(text)) return '"breach of contract"'
  return ''
}

function topicProfile(caseText) {
  const text = String(caseText || '').toLowerCase()
  return {
    deposit: /security deposit|deposit refund|deposit deduction|1950\.5/.test(text),
    cleaning: /clean|paint|wear|repair|deduct|refund|itemiz|withhold|return/.test(text),
    residential: /residential|apartment|landlord|tenant|rental|lease|security deposit/.test(text)
  }
}

const DEPOSIT_TERMS = [
  [/\b1950\.5\b/gi, 12],
  [/\bsecurity deposits?\b/gi, 8],
  [/\bitemiz(?:ed|ation|ing)?\b/gi, 7],
  [/\bordinary wear(?: and tear)?\b/gi, 9],
  [/\b(?:cleaning|repainting|painting)\b/gi, 5],
  [/\b(?:deductions?|withheld|withholding|refund|return of (?:the )?deposit)\b/gi, 5],
  [/\b(?:landlord|tenant|residential|apartment)\b/gi, 3]
]

function termScore(text, profile) {
  if (!profile.deposit) return 0
  return DEPOSIT_TERMS.reduce((score, [pattern, weight]) => {
    pattern.lastIndex = 0
    return score + (pattern.test(text) ? weight : 0)
  }, 0)
}

function relevanceScore(text, title, profile) {
  const content = String(text || '').toLowerCase()
  const heading = String(title || '').toLowerCase()
  if (!profile.deposit) return 1
  let score = termScore(content, profile)
  if (/security deposit|1950\.5/.test(heading)) score += 7
  if (/\b1950\.5\b/.test(content) && /\b(?:tenant|landlord|residential)\b/.test(content)) score += 10
  if (/\b(?:itemiz|ordinary wear|cleaning|repainting)\b/.test(content) && /\bsecurity deposit\b/.test(content)) score += 6
  if (/\b(?:commercial lease|commercial tenancy|vendor permit|swap meet|consignment|beauty salon)\b/.test(content)) score -= 18
  if (/\b(?:class certification|unlawful detainer|increased security deposit)\b/.test(content) && !/\b(?:itemiz|ordinary wear|repainting)\b/.test(content)) score -= 9
  return score
}

// Select context around relevant terms, not merely the opening of the opinion.
function extractRelevantPassage(text, profile) {
  const original = String(text || '').trim()
  if (original.length <= MAX_PASSAGE_LENGTH) return original
  const paragraphs = original.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
  const chunks = paragraphs.length > 3
    ? paragraphs
    : original.match(/.{1,850}(?:\s|$)/gs) || [original]
  const ranked = chunks.map((chunk, index) => ({
    index,
    score: termScore(chunk.toLowerCase(), profile),
    chunk
  })).sort((a, b) => b.score - a.score || a.index - b.index)
  const selected = []
  let remaining = MAX_PASSAGE_LENGTH
  for (const item of ranked) {
    if (item.score <= 0 && selected.length) break
    if (remaining < 150) break
    const excerpt = item.chunk.slice(0, Math.min(remaining, 1500))
    selected.push({ index: item.index, text: excerpt })
    remaining -= excerpt.length + 6
    if (selected.length >= 5) break
  }
  if (!selected.length) return original.slice(0, MAX_PASSAGE_LENGTH)
  return selected.sort((a, b) => a.index - b.index).map(item => item.text).join('\n\n[…]\n\n')
}

async function apiGet(url, token) {
  if (Date.now() < rateLimitedUntil) throw new Error('CourtListener rate-limit cooldown active')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Token ${token}`, Accept: 'application/json' },
      signal: controller.signal
    })
    if (response.status === 429) {
      const retry = response.headers.get('retry-after')
      const seconds = Number(retry)
      const dateMs = retry && !Number.isFinite(seconds) ? Date.parse(retry) : NaN
      const wait = Number.isFinite(seconds) && seconds > 0
        ? seconds * 1000
        : Number.isFinite(dateMs)
          ? Math.max(RATE_LIMIT_COOLDOWN, dateMs - Date.now())
          : RATE_LIMIT_COOLDOWN
      rateLimitedUntil = Date.now() + wait
      throw new Error('CourtListener HTTP 429: rate limited')
    }
    if (!response.ok) throw new Error(`CourtListener HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

async function getOpinionText(opinionId, token) {
  if (!Number.isSafeInteger(Number(opinionId)) || Number(opinionId) <= 0) return ''
  const opinion = await apiGet(`${BASE}/api/rest/v4/opinions/${opinionId}/`, token)
  const candidates = [
    opinion.plain_text, opinion.html_with_citations, opinion.html_columbia,
    opinion.html_lawbox, opinion.html, opinion.html_anon_2020, opinion.xml_harvard
  ]
  return candidates.map(cleanText).find(text => text.length > 100) || ''
}

function cachedResults(key, allowStale = false) {
  const entry = cache.get(key)
  if (!entry) return null
  if (!allowStale && Date.now() - entry.timestamp >= CACHE_DURATION) return null
  return entry.results
}

async function performSearch(query, profile, cacheKey) {
  const token = process.env.COURTLISTENER_API_TOKEN
  if (!token) {
    const stale = cachedResults(cacheKey, true)
    if (stale) return stale
    throw new Error('COURTLISTENER_API_TOKEN missing')
  }
  try {
    const url = new URL(SEARCH_API)
    url.searchParams.set('q', query)
    url.searchParams.set('type', 'o')
    for (const court of COURTS) url.searchParams.append('court', court)
    const data = await apiGet(url, token)
    const candidates = (Array.isArray(data.results) ? data.results : [])
      .filter(item => COURTS.includes(String(item.court_id || '').toLowerCase()))
      .map(item => {
        const opinions = Array.isArray(item.opinions) ? item.opinions : []
        const snippet = opinions.map(o => cleanText(o.snippet)).filter(Boolean).join(' ')
        return { item, snippet, preliminary: relevanceScore(snippet, item.caseName, profile) }
      })
      .sort((a, b) => b.preliminary - a.preliminary)
      .slice(0, MAX_OPINION_FETCHES)

    const enriched = []
    let hitRateLimit = false
    for (const { item, snippet } of candidates) {
      const opinionId = Array.isArray(item.opinions) ? item.opinions[0]?.id : undefined
      const clusterId = item.cluster_id
      let fullText = ''
      if (opinionId && !hitRateLimit) {
        try {
          fullText = await getOpinionText(opinionId, token)
        } catch (error) {
          console.warn(`CourtListener opinion ${opinionId}: ${error.message}`)
          if (/429|rate.limit/i.test(error.message)) hitRateLimit = true
        }
      }
      const sourceText = fullText || snippet
      const relativePath = item.absolute_url
      if (typeof relativePath !== 'string' || !relativePath.startsWith('/') || relativePath.startsWith('//')) continue
      const citations = Array.isArray(item.citation) ? item.citation : item.citation ? [item.citation] : []
      const score = relevanceScore(sourceText, item.caseName, profile)
      if (score <= 0 || !sourceText) continue
      enriched.push({
        id: `courtlistener-${clusterId || opinionId}`,
        title: item.caseName || 'Untitled opinion',
        citation: citations.join('; '),
        court: item.court || item.court_id || '',
        date: item.dateFiled || '',
        url: new URL(relativePath, BASE).href,
        publicationStatus: 'unknown',
        passageIndex: 0,
        passage: extractRelevantPassage(sourceText, profile),
        score,
        source: 'CourtListener',
        sourceReviewed: false,
        fullTextRetrieved: fullText.length > 0,
        propositionVerified: false,
        clusterId,
        opinionId,
        textTruncated: sourceText.length > MAX_PASSAGE_LENGTH
      })
    }
    const matches = enriched.sort((a, b) => b.score - a.score).slice(0, MAX_SEARCH_RESULTS)
    // Do not replace a previously good cache with partial results after a 429.
    if (!hitRateLimit && matches.length) {
      cache.set(cacheKey, { timestamp: Date.now(), results: matches, version: CACHE_VERSION })
      saveCache()
    }
    return matches.length ? matches : (cachedResults(cacheKey, true) || [])
  } catch (error) {
    const stale = cachedResults(cacheKey, true)
    if (stale) {
      console.warn('Using cached CourtListener opinions:', error.message)
      return stale
    }
    throw error
  }
}

export async function searchCourtListener(caseText) {
  const query = buildResearchQuery(caseText)
  if (!query) return []
  const profile = topicProfile(caseText)
  const cacheKey = `${CACHE_VERSION}:${query.toLowerCase()}:${profile.deposit ? 'deposit' : 'general'}`
  const cached = cachedResults(cacheKey)
  if (cached) return cached
  // Reuse cache from the previous version when the API is rate-limited.
  if (Date.now() < rateLimitedUntil) {
    const stale = cachedResults(cacheKey, true) || cachedResults(query.toLowerCase(), true)
    if (stale) return stale
    throw new Error('CourtListener rate-limit cooldown active')
  }
  if (pendingSearches.has(cacheKey)) return pendingSearches.get(cacheKey)
  const promise = performSearch(query, profile, cacheKey)
    .finally(() => pendingSearches.delete(cacheKey))
  pendingSearches.set(cacheKey, promise)
  return promise
}
