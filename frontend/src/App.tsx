
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Scale,
  LayoutDashboard,
  FileText,
  Search,
  ShieldCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  BrainCircuit,
  ExternalLink,
  BookOpen,
  LoaderCircle
} from 'lucide-react'
import './App.css'

const API_URL = 'http://localhost:3001'

type Tab = 'dashboard' | 'intake' | 'analysis' | 'research' | 'briefing'
type Party = 'petitioner' | 'respondent'

type CaseData = {
  title: string
  jurisdiction: string
  facts: string
  evidence: string
}

type Petition = {
  party: Party
  petition: string
  evidence: string
}

type LegalSource = {
  id: string
  title: string
  type: string
  summary: string
  url: string
  status?: string
  score?: number
}

type PrecedentMatch = {
  id: string
  title: string
  citation: string
  court: string
  date: string
  url: string
  publicationStatus: string
  passage: string
  passageIndex: number
  score: number
  source?: string
  fullTextRetrieved?: boolean
  sourceReviewed?: boolean
  propositionVerified?: boolean
  textTruncated?: boolean
}

type JudicialAssessment = {
  caseSummary: string
  disputedIssues: Array<{
    issue: string
    petitionerPosition: string
    respondentPosition: string
    evidenceNeeded: string[]
  }>
  evidenceGaps: Array<{
    missingItem: string
    whyItMatters: string
    relatedIssue: string
  }>
  judicialQuestions: Array<{
    question: string
    directedTo: 'petitioner' | 'respondent' | 'both'
    purpose: string
  }>
  neutralityWarnings: string[]
  limitations: string[]
}

type JudicialReview = {
  overallAssessment: string
  reviewFindings: Array<{
    category: string
    concern: string
    suggestedCorrection: string
  }>
  strengths: string[]
  recommendedRevisions: string[]
}

type CitationResult = {
  citation: string
  exactTextMatch: boolean
  sourceReviewed: boolean
  publicationStatus: string
  propositionVerified: boolean
  status: string
  warning: string
}

const sampleCase: CaseData = {
  title: 'Security Deposit Dispute',
  jurisdiction: 'California, USA',
  facts:
    'A tenant paid a $2,000 security deposit. After moving out, the landlord returned $800 and withheld $1,200 for repainting and cleaning. The tenant disputes these charges.',
  evidence:
    'Tenant states the property was left in good condition. Landlord has not provided photographs or itemized receipts.'
}

const samplePetitions: Record<Party, Petition> = {
  petitioner: {
    party: 'petitioner',
    petition:
      'The tenant requests the return of the remaining $1,200 security deposit. The tenant alleges that the property was returned in good condition and that the landlord has not adequately justified the repainting and cleaning deductions.',
    evidence:
      'Tenant statement regarding property condition. Security deposit payment record. Partial refund of $800. Move-out photographs and correspondence should be requested if available.'
  },
  respondent: {
    party: 'respondent',
    petition:
      'The landlord argues that the $1,200 deduction was necessary to restore the property after the tenancy. The landlord claims that repainting and additional cleaning were required beyond ordinary use.',
    evidence:
      'Landlord statement describing cleaning and repainting. Itemized invoices, dated photographs, inspection reports, and payment records have not yet been supplied in this demonstration.'
  }
}

async function postJSON<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed: ${response.status}`
    )
  }

  return data as T
}


function JudicialIntelligenceResults({
  assessment,
  review
}: {
  assessment: JudicialAssessment
  review: JudicialReview | null
}) {
  const boxStyle = {
    border: '1px solid #d9e1ea',
    borderRadius: 12,
    padding: 18,
    marginTop: 14
  }

  return (
    <div className="judicial-intelligence-results" style={{ marginTop: 24 }}>
      <div className="section-header">
        <div>
          <h3>Muse Judicial Intelligence</h3>
          <p>Structured reasoning and a separate neutrality audit · Human review required</p>
        </div>
        <span className="tag">Muse Spark 1.3</span>
      </div>
      <div className="stats" style={{ marginTop: 16 }}>
        <div className="stat-card"><span>Disputed Issues</span><strong>{assessment.disputedIssues.length}</strong></div>
        <div className="stat-card"><span>Evidence Gaps</span><strong>{assessment.evidenceGaps.length}</strong></div>
        <div className="stat-card"><span>Judicial Questions</span><strong>{assessment.judicialQuestions.length}</strong></div>
        <div className="stat-card"><span>Audit Findings</span><strong>{review ? review.reviewFindings.length : '—'}</strong></div>
      </div>
      <div style={boxStyle}>
        <h4>Case Summary</h4>
        <p>{assessment.caseSummary}</p>
      </div>
      <div style={boxStyle}>
        <h4>1. Material Disputed Issues</h4>
        {assessment.disputedIssues.map((item, i) => (
          <details key={i} open={i === 0} style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{item.issue}</summary>
            <p><strong>Petitioner:</strong> {item.petitionerPosition}</p>
            <p><strong>Respondent:</strong> {item.respondentPosition}</p>
            <p><strong>Evidence needed:</strong> {item.evidenceNeeded.join('; ') || 'Not specified'}</p>
          </details>
        ))}
      </div>
      <div style={boxStyle}>
        <h4>2. Evidence Gaps</h4>
        {assessment.evidenceGaps.map((gap, i) => (
          <div key={i} style={{ marginTop: 12 }}>
            <strong>{gap.missingItem}</strong>
            <p>{gap.whyItMatters}</p>
            <small>Related issue: {gap.relatedIssue}</small>
          </div>
        ))}
      </div>
      <div style={boxStyle}>
        <h4>3. Neutral Judicial Questions</h4>
        {assessment.judicialQuestions.map((item, i) => (
          <div key={i} style={{ marginTop: 12 }}>
            <strong>{i + 1}. {item.question}</strong>
            <p>Directed to: {item.directedTo} · {item.purpose}</p>
          </div>
        ))}
      </div>
      <div style={boxStyle}>
        <h4>4. Muse Neutrality Audit</h4>
        {review ? (
          <>
            <p>{review.overallAssessment}</p>
            {review.reviewFindings.length === 0 ? (
              <p>No concerns flagged in this review. This is not independent verification.</p>
            ) : review.reviewFindings.map((finding, i) => (
              <div key={i} style={{ marginTop: 12 }}>
                <strong>{finding.category.replace(/_/g, ' ')}: {finding.concern}</strong>
                <p>Suggested correction: {finding.suggestedCorrection}</p>
              </div>
            ))}
            {review.strengths.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary>Review strengths ({review.strengths.length})</summary>
                <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                  {review.strengths.map((item, i) => (
                    <p key={i} style={{ color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, margin: 0, lineHeight: 1.6 }}>
                      <strong>{i + 1}.</strong> {item}
                    </p>
                  ))}
                </div>
              </details>
            )}
            {review.recommendedRevisions.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary>Recommended revisions</summary>
                <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                  {review.recommendedRevisions.map((item, i) => (
                    <p key={i} style={{ color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, margin: 0, lineHeight: 1.6 }}>
                      <strong>{i + 1}.</strong> {item}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </>
        ) : <p>Neutrality review has not completed.</p>}
      </div>
      {(assessment.neutralityWarnings.length > 0 || assessment.limitations.length > 0) && (
        <div style={boxStyle}>
          <h4>Warnings and Limitations</h4>
          <ul>
            {[...assessment.neutralityWarnings, ...assessment.limitations].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="source-warning" style={{ marginTop: 14 }}>
        AI-generated research assistance only. No findings of fact, legal advice,
        automated ruling, or independently verified authorities. Human review required.
      </p>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [caseData, setCaseData] = useState<CaseData>(sampleCase)
  const [petitions, setPetitions] =
    useState<Record<Party, Petition>>(samplePetitions)

  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [analysisPrecedents, setAnalysisPrecedents] = useState<PrecedentMatch[]>([])
  const [liveResearch, setLiveResearch] = useState<{
    attempted?: boolean
    retrieved?: number
    suppliedToMuse?: number
    error?: string | null
  } | null>(null)
  const [error, setError] = useState('')

  const [judicialLoading, setJudicialLoading] = useState(false)
  const [judicialStage, setJudicialStage] = useState('')
  const [judicialError, setJudicialError] = useState('')
  const [judicialAssessment, setJudicialAssessment] = useState<JudicialAssessment | null>(null)
  const [judicialReview, setJudicialReview] = useState<JudicialReview | null>(null)

  const [researchLoading, setResearchLoading] = useState(false)
  const [researchError, setResearchError] = useState('')
  const [researchSources, setResearchSources] =
    useState<LegalSource[]>([])

  const [precedentLoading, setPrecedentLoading] = useState(false)
  const [precedentMatches, setPrecedentMatches] =
    useState<PrecedentMatch[]>([])
  const [totalIndexed, setTotalIndexed] = useState(0)
  const [precedentsSearched, setPrecedentsSearched] = useState(false)

  const [citationResults, setCitationResults] =
    useState<Record<string, CitationResult>>({})
  const [checkingCitation, setCheckingCitation] = useState('')

  const navigation = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake' as Tab, label: 'Case Intake', icon: FileText },
    { id: 'analysis' as Tab, label: 'AI Analysis', icon: BrainCircuit },
    { id: 'research' as Tab, label: 'Legal Research', icon: Search },
    { id: 'briefing' as Tab, label: 'Judicial Briefing', icon: ShieldCheck }
  ]

  const researchQuery = [
    caseData.title,
    caseData.facts,
    caseData.evidence,
    petitions.petitioner.petition,
    petitions.petitioner.evidence,
    petitions.respondent.petition,
    petitions.respondent.evidence
  ].join('\n')

  const supportedJurisdiction = caseData.jurisdiction === 'California, USA'
  const validationIssues = [
    ...(!supportedJurisdiction ? ['Only California, USA is supported in this demo.'] : []),
    ...(caseData.title.trim().length < 3 || caseData.title.trim().length > 200 ? ['Case title must be 3–200 characters.'] : []),
    ...(caseData.facts.trim().length < 20 || caseData.facts.trim().length > 30000 ? ['Case facts must be 20–30,000 characters.'] : []),
    ...(['petitioner', 'respondent'] as const).flatMap(party => {
      const p = petitions[party]
      return [
        ...(p.petition.trim().length < 20 || p.petition.trim().length > 30000 ? [`${party} petition must be 20–30,000 characters.`] : []),
        ...(p.evidence.trim().length > 30000 ? [`${party} evidence must be at most 30,000 characters.`] : [])
      ]
    }),
    ...(caseData.evidence.trim().length + caseData.facts.trim().length + 30 > 30000 ? ['Combined case facts and additional evidence exceed the 30,000-character API limit.'] : [])
  ]

  const canAnalyze = validationIssues.length === 0

  const invalidateResults = () => {
    setAnalysis('')
    setAnalysisPrecedents([])
    setLiveResearch(null)
    setError('')
    setJudicialAssessment(null)
    setJudicialReview(null)
    setJudicialError('')
    setJudicialStage('')
    setResearchSources([])
    setPrecedentMatches([])
    setPrecedentsSearched(false)
    setCitationResults({})
  }

  const updateField = (field: keyof CaseData, value: string) => {
    setCaseData(prev => ({ ...prev, [field]: value }))
    invalidateResults()
  }

  const updatePetition = (
    party: Party,
    field: 'petition' | 'evidence',
    value: string
  ) => {
    setPetitions(prev => ({
      ...prev,
      [party]: { ...prev[party], [field]: value }
    }))
    invalidateResults()
  }

  const runMuseAnalysis = async () => {
    if (!canAnalyze || loading || judicialLoading) return

    setLoading(true)
    setError('')
    setAnalysis('')
    setAnalysisPrecedents([])
    setLiveResearch(null)

    try {
      const data = await postJSON<{
        analysis: string
        precedentMatches?: PrecedentMatch[]
        liveResearch?: {
          attempted?: boolean
          retrieved?: number
          suppliedToMuse?: number
          error?: string | null
        }
      }>(
        '/api/analyze',
        {
          title: caseData.title,
          jurisdiction: caseData.jurisdiction,
          facts: [
            caseData.facts,
            `Additional intake evidence: ${caseData.evidence}`
          ].join('\n'),
          petitioner: petitions.petitioner,
          respondent: petitions.respondent
        }
      )

      setAnalysis(data.analysis)
      setAnalysisPrecedents(data.precedentMatches || [])
      setLiveResearch(data.liveResearch || null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Muse analysis failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const runJudicialIntelligence = async () => {
    if (!canAnalyze || judicialLoading || loading) return

    setJudicialLoading(true)
    setJudicialError('')
    setJudicialAssessment(null)
    setJudicialReview(null)
    setJudicialStage('Muse Pass 1: analyzing disputed issues and evidence...')

    const payload = {
      title: caseData.title,
      jurisdiction: caseData.jurisdiction,
      facts: [caseData.facts, `Additional intake evidence: ${caseData.evidence}`].join('\n'),
      petitioner: petitions.petitioner,
      respondent: petitions.respondent
    }

    try {
      const first = await postJSON<{
        success: boolean
        assessment: JudicialAssessment
      }>('/api/judicial-assessment', payload)

      if (!first.success || !first.assessment) {
        throw new Error('Muse did not return an assessment')
      }
      setJudicialAssessment(first.assessment)
      setJudicialStage('Muse Pass 2: auditing neutrality and factual support...')

      try {
        const second = await postJSON<{
          success: boolean
          review: JudicialReview
        }>('/api/judicial-review', {
          caseData: payload,
          assessment: first.assessment
        })
        if (!second.success || !second.review) {
          throw new Error('Muse did not return a neutrality review')
        }
        setJudicialReview(second.review)
        setJudicialStage('Both Muse stages completed')
      } catch (reviewError) {
        setJudicialError(
          'Assessment succeeded, but neutrality review failed: ' +
          (reviewError instanceof Error ? reviewError.message : 'Unknown error')
        )
        setJudicialStage('Assessment completed; review unavailable')
      }
    } catch (err) {
      setJudicialError(
        err instanceof Error ? err.message : 'Judicial Intelligence failed'
      )
      setJudicialStage('')
    } finally {
      setJudicialLoading(false)
    }
  }

  const runLegalResearch = async () => {
    if (!supportedJurisdiction || researchLoading || precedentLoading) return
  
    if (researchQuery.trim().length < 5) {
      setResearchError('Enter at least 5 characters to search.')
      return
    }
  
    setResearchLoading(true)
    setResearchError('')
    setResearchSources([])

    try {
      const data = await postJSON<{
        sources: LegalSource[]
      }>('/api/legal-research', {
        jurisdiction: caseData.jurisdiction,
        query: researchQuery
      })

      setResearchSources(data.sources || [])
    } catch (err) {
      setResearchError(
        err instanceof Error ? err.message : 'Legal research failed'
      )
    } finally {
      setResearchLoading(false)
    }
  }

  const findPrecedents = async () => {
    if (!supportedJurisdiction || precedentLoading || researchLoading) return
  
    if (researchQuery.trim().length < 5) {
      setResearchError('Enter at least 5 characters to search.')
      return
    }
  
    setPrecedentLoading(true)
    setResearchError('')
    setPrecedentMatches([])
    setCitationResults({})
    setPrecedentsSearched(false)

    try {
      const data = await postJSON<{
        matches: PrecedentMatch[]
        totalIndexed: number
      }>('/api/precedents/search', {
        jurisdiction: caseData.jurisdiction,
        query: researchQuery
      })

      setPrecedentMatches(data.matches || [])
      setTotalIndexed(data.totalIndexed || 0)
      setPrecedentsSearched(true)
    } catch (err) {
      setResearchError(
        err instanceof Error ? err.message : 'Precedent search failed'
      )
    } finally {
      setPrecedentLoading(false)
    }
  }

  const checkCitation = async (match: PrecedentMatch) => {
    if (!supportedJurisdiction) {
      setResearchError('Only California, USA is supported.')
      return
    }
  
    if (match.source === 'CourtListener') {
      setResearchError(
        'Live CourtListener opinions require independent source verification. Local citation checking is unavailable.'
      )
      return
    }
  
    const key = `${match.id}-${match.passageIndex}`
    setCheckingCitation(key)
    setResearchError('')

    try {
      const quotation = match.passage.slice(0, 120).trim()

      const data = await postJSON<CitationResult>(
        '/api/citations/check',
        {
          precedentId: match.id,
          passageIndex: match.passageIndex,
          quotation
        }
      )

      setCitationResults(prev => ({
        ...prev,
        [key]: data
      }))
    } catch (err) {
      setResearchError(
        err instanceof Error ? err.message : 'Citation check failed'
      )
    } finally {
      setCheckingCitation('')
    }
  }

  const displayedPrecedents = Array.from(
    new Map(
      [...analysisPrecedents, ...precedentMatches].map(match => [match.url || match.id, match])
    ).values()
  )

  const renderMarkdown = (value: string) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
  )

  const exportJudicialBriefing = () => {
    if (!analysis && !judicialAssessment) return
    window.print()
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Scale size={25} />
          </div>
          <div>
            <strong>CaseReady</strong>
            <small>Judicial Intelligence</small>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav>
          {navigation.map(item => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activeTab === item.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={19} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <ShieldCheck size={19} />
          <span>Human-in-the-loop AI</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              CASE MANAGEMENT PLATFORM
            </span>
            <h1>
              {activeTab === 'dashboard'
                ? 'Judicial Workspace'
                : navigation.find(n => n.id === activeTab)?.label}
            </h1>
          </div>

          <span className="status">
            <span className="status-dot" />
            Demo Environment
          </span>
        </header>

        {/* DASHBOARD */}

        {activeTab === 'dashboard' && (
          <>
            <section className="welcome">
              <div>
                <span className="eyebrow">
                  AI-POWERED LEGAL INTELLIGENCE
                </span>
                <h2>From case complexity to clarity.</h2>
                <p>
                  Analyze evidence, identify legal issues and
                  prepare structured judicial briefings with
                  human oversight.
                </p>
                <button
                  className="primary"
                  onClick={() => setActiveTab('intake')}
                >
                  <Plus size={18} />
                  Prepare a Case
                </button>
              </div>
              <Scale size={115} className="welcome-icon" />
            </section>

            <div className="stats">
              <div className="stat-card">
                <span>Demo Cases</span>
                <strong>01</strong>
                <small>Fictional sample case</small>
              </div>
              <div className="stat-card">
                <span>AI Analysis</span>
                <strong>{analysis ? 'Ready' : 'Muse'}</strong>
                <small>
                  {analysis
                    ? 'Latest analysis available'
                    : 'Two-party evidence comparison'}
                </small>
              </div>
              <div className="stat-card">
                <span>Human Review</span>
                <strong>100%</strong>
                <small>Required for conclusions</small>
              </div>
            </div>

            <section className="panel">
              <div className="section-header">
                <div>
                  <h3>Featured Case</h3>
                  <p>
                    Explore the fictional California
                    security deposit dispute.
                  </p>
                </div>
              </div>

              <div className="case-row">
                <div className="case-avatar">
                  <FileText />
                </div>

                <div className="case-info">
                  <strong>{caseData.title || 'Untitled Case'}</strong>
                  <span>{caseData.jurisdiction}</span>
                </div>

                <span className="tag">Demo</span>

                <button
                  className="secondary"
                  onClick={() => setActiveTab('intake')}
                >
                  Open <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </>
        )}

        {/* CASE INTAKE */}

        {activeTab === 'intake' && (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>Case Intake</h3>
                <p>
                  Enter case information for structured review.
                </p>
              </div>
            </div>

            {validationIssues.length > 0 && (
              <div className="notice" role="alert"><AlertTriangle size={20} />
                <span>{validationIssues.join(' ')}</span>
              </div>
            )}
            <div className="form-grid">
              <label>
                Case Title
                <input
                  value={caseData.title}
                  onChange={e =>
                    updateField('title', e.target.value)
                  }
                />
              </label>

              <label>
                Jurisdiction
                <select
                  value={caseData.jurisdiction}
                  onChange={e => updateField('jurisdiction', e.target.value)}
                >
                  <option value="California, USA">California, USA (supported demo jurisdiction)</option>
                </select>
                <small>Other jurisdictions, including India, are not yet supported.</small>
              </label>
            </div>

            <label>
              Case Facts
              <textarea
                rows={7}
                value={caseData.facts}
                onChange={e =>
                  updateField('facts', e.target.value)
                }
              />
            </label>

            <label>
              Available Evidence
              <textarea
                rows={5}
                value={caseData.evidence}
                onChange={e =>
                  updateField('evidence', e.target.value)
                }
              />
            </label>

            <button
              className="primary"
              onClick={() => setActiveTab('analysis')}
            >
              Continue to Analysis
              <ArrowRight size={17} />
            </button>
          </section>
        )}

        {/* AI ANALYSIS */}

        {activeTab === 'analysis' && (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>Multi-Stage AI Analysis</h3>
                <p>
                  Neutral comparison of petitions,
                  evidence and legal issues.
                </p>
              </div>
              <span className="tag">Muse AI</span>
            </div>

            {validationIssues.length > 0 && (
              <div className="notice" role="alert"><AlertTriangle size={20} />
                <span>{validationIssues.join(' ')}</span>
              </div>
            )}
            <div className="agents">
              {[
                [
                  '01',
                  'Evidence Assessment',
                  'Identify claims and missing evidence'
                ],
                [
                  '02',
                  'Legal Research',
                  'Identify relevant legal sources'
                ],
                [
                  '03',
                  'Argument Comparison',
                  'Examine both parties fairly'
                ],
                [
                  '04',
                  'Verification',
                  'Flag unsupported legal claims'
                ]
              ].map(agent => (
                <div className="agent" key={agent[0]}>
                  <span className="agent-number">
                    {agent[0]}
                  </span>
                  <div>
                    <strong>{agent[1]}</strong>
                    <p>{agent[2]}</p>
                  </div>
                  <CheckCircle2
                    size={18}
                    color="#9ca3af"
                  />
                </div>
              ))}
            </div>

            <div className="petition-grid">
              {(['petitioner', 'respondent'] as const)
                .map(party => (
                  <div className="petition-card" key={party}>
                    <h3>
                      {party === 'petitioner'
                        ? 'Lawyer A — Petitioner'
                        : 'Lawyer B — Respondent'}
                    </h3>

                    <label>
                      Petition / Legal Arguments
                      <textarea
                        rows={7}
                        value={petitions[party].petition}
                        onChange={e =>
                          updatePetition(
                            party,
                            'petition',
                            e.target.value
                          )
                        }
                        placeholder="Enter the petition..."
                      />
                    </label>

                    <label>
                      Evidence and Supporting Documents
                      <textarea
                        rows={5}
                        value={petitions[party].evidence}
                        onChange={e =>
                          updatePetition(
                            party,
                            'evidence',
                            e.target.value
                          )
                        }
                        placeholder="Describe the evidence..."
                      />
                    </label>
                  </div>
                ))}
            </div>

            <div className="action-row">
              <button
                className="primary"
                onClick={runMuseAnalysis}
                disabled={loading || judicialLoading || !canAnalyze}
              >
                {loading ? (
                  <LoaderCircle size={18} />
                ) : (
                  <BrainCircuit size={18} />
                )}
                {loading
                  ? 'Muse is analyzing...'
                  : 'Analyze Both Petitions'}
              </button>

              <button
                className="primary"
                onClick={runJudicialIntelligence}
                disabled={judicialLoading || loading || !canAnalyze}
              >
                {judicialLoading ? <LoaderCircle size={18} /> : <ShieldCheck size={18} />}
                {judicialLoading ? 'Muse Intelligence Running...' : 'Run Judicial Intelligence'}
              </button>

              <button
                className="secondary"
                onClick={() => setActiveTab('research')}
              >
                <Search size={18} />
                Legal Research
              </button>

              <button
                className="secondary"
                onClick={() => setActiveTab('briefing')}
              >
                <FileText size={18} />
                Judicial Briefing
              </button>
            </div>

            {error && (
              <div className="notice">
                <AlertTriangle size={20} />
                <strong>{error}</strong>
              </div>
            )}

            {judicialStage && (
              <div className="notice" role="status">
                <BrainCircuit size={20} />
                <span>{judicialStage}</span>
              </div>
            )}

            {judicialError && (
              <div className="notice" role="alert">
                <AlertTriangle size={20} />
                <span>{judicialError}</span>
              </div>
            )}

            {judicialAssessment && (
              <JudicialIntelligenceResults
                assessment={judicialAssessment}
                review={judicialReview}
              />
            )}

            {analysis && (
              <div className="analysis-output">
                <h3>Muse Judicial Analysis</h3>
                <p className="analysis-disclaimer">
                  AI-generated research draft. Legal authorities
                  and conclusions require independent review.
                </p>

                {liveResearch && (
                  <div className="notice">
                    <BookOpen size={20} />
                    <span>
                      CourtListener research: {liveResearch.retrieved ?? 0} live opinions retrieved;
                      {' '}{liveResearch.suppliedToMuse ?? 0} supplied to Muse.
                      {liveResearch.error ? ` Retrieval warning: ${liveResearch.error}` : ''}
                      {' '}All authorities require human review.
                    </span>
                  </div>
                )}

                <div className="analysis-text markdown-content">
                  {renderMarkdown(analysis)}
                </div>

                {analysisPrecedents.length > 0 && (
                  <div className="precedent-section">
                    <h3>Opinions used as research leads</h3>
                    {analysisPrecedents.map(match => (
                      <div className="research-source" key={match.id}>
                        <strong>{match.title}</strong>
                        <p>{match.citation || 'Citation not supplied'} · {match.court}</p>
                        <p>{match.source === 'CourtListener' ? 'Live CourtListener excerpt' : 'Locally imported opinion'}</p>
                        <a href={match.url} target="_blank" rel="noopener noreferrer">
                          Open opinion source <ExternalLink size={14} />
                        </a>
                        <p className="source-warning">Unverified research lead; not a finding of precedential validity.</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="action-row">
                  <button
                    className="primary"
                    onClick={() => setActiveTab('briefing')}
                  >
                    Prepare Judicial Brief
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* LEGAL RESEARCH */}

        {activeTab === 'research' && (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>California Legal Research</h3>
                <p>
                  Research curated statutory sources and
                  imported court opinion passages.
                </p>
              </div>
            </div>

            {!supportedJurisdiction && <div className="notice" role="alert">Legal research is available only for California, USA.</div>}
            <div className="action-row">
              <button
                className="primary"
                onClick={runLegalResearch}
                disabled={researchLoading || precedentLoading || !supportedJurisdiction}
              >
                <Search size={18} />
                {researchLoading
                  ? 'Searching sources...'
                  : 'Find Relevant Legal Sources'}
              </button>

              <button
                className="secondary"
                onClick={findPrecedents}
                disabled={precedentLoading || researchLoading || !supportedJurisdiction}
              >
                <BookOpen size={18} />
                {precedentLoading
                  ? 'Searching opinions...'
                  : 'Find Similar Court Decisions'}
              </button>
            </div>

            {researchError && (
              <div className="notice">
                <AlertTriangle size={20} />
                <span>{researchError}</span>
              </div>
            )}

            {researchSources.length > 0 && (
              <div className="research-results">
                <h3>Retrieved Legal Sources</h3>

                {researchSources.map(source => (
                  <div
                    className="research-source"
                    key={source.id}
                  >
                    <div className="section-header">
                      <strong>{source.title}</strong>
                      <span className="tag">
                        {source.type}
                      </span>
                    </div>

                    <p>{source.summary}</p>
                    <small>Reference: {source.id}</small>

                    <div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open official source
                        {' '}<ExternalLink size={14} />
                      </a>
                    </div>

                    <p className="source-warning">
                      Source identified — legal proposition
                      not independently verified.
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="precedent-section">
              <h3>Comparable Judicial Precedents</h3>
              <p>
                Keyword search across passages of
                locally imported court opinions.
              </p>

              {precedentsSearched && (
                <p>
                  <strong>{totalIndexed}</strong>
                  {' '}local opinions indexed ·
                  {' '}<strong>{precedentMatches.length}</strong>
                  {' '}opinion matches returned
                </p>
              )}

              {precedentsSearched &&
                precedentMatches.length === 0 && (
                  <div className="notice">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>No matching passages</strong>
                      <p>
                        {totalIndexed === 0
                          ? 'The local precedent library is empty. Import a genuine published opinion through the backend first.'
                          : 'No keyword matches were found in the imported opinions. This does not mean relevant precedent does not exist.'}
                      </p>
                    </div>
                  </div>
                )}

              {precedentMatches.map(match => {
                const key =
                  `${match.id}-${match.passageIndex}`
                const verification = citationResults[key]

                return (
                  <div
                    className="research-source"
                    key={key}
                  >
                    <div className="section-header">
                      <strong>{match.title}</strong>
                      <span className="tag">
                        {match.source === 'CourtListener' ? 'Live · ' : 'Local · '}
                        {match.publicationStatus}
                      </span>
                    </div>

                    <p>
                      {match.citation || 'Citation not supplied'} · {match.court}
                      {' '}· {match.date}
                    </p>

                    <blockquote>
                      {match.passage}
                    </blockquote>

                    <small>
                      Passage #{match.passageIndex + 1}
                      {' '}· Relevance score: {match.score} (not comparable across sources)
                    </small>

                    <div className="action-row">
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open opinion source
                        {' '}<ExternalLink size={14} />
                      </a>

                      {match.source !== 'CourtListener' && (
                        <button
                          className="secondary"
                          disabled={checkingCitation === key}
                          onClick={() => checkCitation(match)}
                        >
                          <ShieldCheck size={16} />
                          {checkingCitation === key
                            ? 'Checking...'
                            : 'Check Quotation'}
                        </button>
                      )}
                    </div>

                    {verification && (
                      <div className="citation-result">
                        <strong>
                          {verification.exactTextMatch
                            ? 'Quotation matched imported text'
                            : 'Quotation not found'}
                        </strong>
                        <p>{verification.warning}</p>
                        <small>
                          Source manually reviewed:
                          {' '}
                          {verification.sourceReviewed
                            ? 'Yes'
                            : 'No'}
                        </small>
                      </div>
                    )}

                    <p className="source-warning">
                      Passage retrieval does not establish
                      authenticity, current legal validity,
                      or applicability.
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="notice">
              <ShieldCheck size={20} />
              <div>
                <strong>Human verification required</strong>
                <p>
                  Quotation checking is available only for locally imported opinions.
                  Live CourtListener excerpts have not been quotation-verified.
                  This prototype does not verify
                  whether a judgment is still good law or
                  whether the court's reasoning applies.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* JUDICIAL BRIEFING */}

        {activeTab === 'briefing' && (
          <section className="panel judicial-report">
            <div className="section-header">
              <div>
                <h3>Judicial Case Briefing</h3>
                <p>
                  Structured AI-assisted briefing for
                  independent judicial review.
                </p>
              </div>

              <button
                className="primary no-print"
                onClick={exportJudicialBriefing}
                disabled={!analysis && !judicialAssessment}
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>

            <div className="report-heading">
              <Scale size={32} />
              <h2>CaseReady Judicial Brief</h2>
              <p>AI-Assisted Research Draft</p>
              <strong>Human Review Required</strong>
            </div>

            <div className="report-section">
              <h3>1. Case Information</h3>
              <p>
                <strong>Case:</strong>
                {' '}{caseData.title}
              </p>
              <p>
                <strong>Jurisdiction:</strong>
                {' '}{caseData.jurisdiction}
              </p>
              <p>
                <strong>Case Facts:</strong>
              </p>
              <p>{caseData.facts}</p>

              <h4>Available Intake Evidence</h4>
              <p>{caseData.evidence || 'Not provided'}</p>
            </div>

            <div className="report-section">
              <h3>2. Petitioner Submission</h3>
              <p>
                {petitions.petitioner.petition ||
                  'No petition submitted'}
              </p>
              <h4>Reported Evidence</h4>
              <p>
                {petitions.petitioner.evidence ||
                  'No evidence description provided'}
              </p>
            </div>

            <div className="report-section">
              <h3>3. Respondent Submission</h3>
              <p>
                {petitions.respondent.petition ||
                  'No response submitted'}
              </p>
              <h4>Reported Evidence</h4>
              <p>
                {petitions.respondent.evidence ||
                  'No evidence description provided'}
              </p>
            </div>

            <div className="report-section">
              <h3>4. Muse Judicial Analysis</h3>

              {analysis ? (
                <div className="analysis-text markdown-content">
                  {renderMarkdown(analysis)}
                </div>
              ) : (
                <div className="notice no-print">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>No analysis available</strong>
                    <p>
                      Run Analyze Both Petitions before
                      generating the judicial briefing.
                    </p>
                    <button
                      className="secondary"
                      onClick={() => setActiveTab('analysis')}
                    >
                      Go to AI Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>

            {judicialAssessment && (
              <div className="report-section">
                <h3>Structured Muse Judicial Intelligence and Neutrality Audit</h3>
                <JudicialIntelligenceResults
                  assessment={judicialAssessment}
                  review={judicialReview}
                />
              </div>
            )}

            <div className="report-section">
              <h3>5. Legal Sources</h3>

              {researchSources.length === 0 ? (
                <p>
                  No legal source search results loaded
                  in this session.
                </p>
              ) : (
                researchSources.map(source => (
                  <div key={source.id}>
                    <strong>{source.title}</strong>
                    <p>{source.summary}</p>
                    <p>Source: {source.url}</p>
                  </div>
                ))
              )}
            </div>

            <div className="report-section">
              <h3>6. Retrieved Court Opinion Passages</h3>

              {displayedPrecedents.length === 0 ? (
                <p>
                  No comparable court opinion passages
                  retrieved in this session.
                </p>
              ) : (
                displayedPrecedents.map(match => {
                  const key =
                    `${match.id}-${match.passageIndex}`
                  const check = citationResults[key]

                  return (
                    <div
                      className="brief-precedent"
                      key={key}
                    >
                      <strong>{match.title}</strong>
                      <p>
                        {match.citation || 'Citation not supplied'} · {match.court}
                      </p>
                      <blockquote>
                        {match.passage}
                      </blockquote>
                      <p>Source: {match.url}</p>
                      <small>
                        Quotation check:
                        {' '}
                        {match.source === 'CourtListener'
                          ? 'Live excerpt — not checked against full source'
                          : check
                            ? check.status
                            : 'Not performed'}
                      </small>
                    </div>
                  )
                })
              )}
            </div>

            <div className="report-section">
              <h3>7. Verification Status</h3>
              <p>
                Statutory interpretation:
                {' '}<strong>Not independently verified</strong>
              </p>
              <p>
                Precedent validity:
                {' '}<strong>Not independently verified</strong>
              </p>
              <p>
                Evidence authenticity:
                {' '}<strong>Not independently verified</strong>
              </p>
              <p>
                Final judicial determination:
                {' '}<strong>Reserved for a human judge</strong>
              </p>
            </div>

            <div className="report-disclaimer">
              <strong>Human Review Required</strong>
              <p>
                This report is an AI-generated research draft
                based on supplied case information and
                locally retrieved sources. It is not a
                judicial decision or legal advice.
                All factual claims, legal authorities,
                quotations, and interpretations require
                independent verification by a qualified
                human reviewer.
              </p>
            </div>
          </section>
        )}

        <footer>
          CaseReady · AI-assisted research only ·
          No automated judicial decisions
        </footer>
      </main>
    </div>
  )
}

export default App
