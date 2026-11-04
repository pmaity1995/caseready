
export const legalSources = [
    {
      id: 'CA-CIV-1950-5',
      title: 'California Civil Code § 1950.5',
      type: 'statute',
      jurisdiction: 'California',
      url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1950.5.&lawCode=CIV',
      topics: [
        'security deposit', 'landlord', 'tenant',
        'rental', 'cleaning', 'repainting',
        'painting', 'damage', 'deduction',
        'receipt', 'itemized', 'wear and tear',
        'inspection', 'photographs', 'refund',
        'bad faith', 'move out', 'lease'
      ],
      summary:
        'Primary California statute governing residential rental security deposits. Research permitted deductions, ordinary wear and tear, inspections, accounting, documentation, return deadlines and potential remedies. Verify the statutory version applicable to the tenancy.',
      status: 'source-identified'
    },
    {
      id: 'CA-COURTS-SECURITY-DEPOSITS',
      title: 'California Courts — Guide to Security Deposits',
      type: 'judicial-guidance',
      jurisdiction: 'California',
      url: 'https://selfhelp.courts.ca.gov/guide-security-deposits-california',
      topics: [
        'security deposit', 'landlord', 'tenant',
        'rental', 'refund', 'cleaning',
        'repair', 'damage', 'deduction',
        'receipt', 'itemized', 'wear and tear',
        'small claims', 'inspection', 'move out'
      ],
      summary:
        'Official California Courts self-help guidance about security deposit returns, permitted deductions, supporting receipts, disputes and small-claims procedures. Explanatory guidance, not an independent source of binding law.',
      status: 'source-identified'
    },
    {
      id: 'CA-DRE-MOVING-OUT',
      title: 'California Department of Real Estate — Moving Out',
      type: 'government-guidance',
      jurisdiction: 'California',
      url: 'https://www.dre.ca.gov/Publications/ResourceGuidebook/gb10_movingout.html',
      topics: [
        'landlord', 'tenant', 'rental',
        'security deposit', 'move out',
        'inspection', 'photographs',
        'cleaning', 'repair', 'damage',
        'deduction', 'refund', 'lease'
      ],
      summary:
        'California Department of Real Estate guidance on moving out, inspections, property condition and security deposit disputes. Verify current requirements against applicable statutes.',
      status: 'source-identified'
    },
    {
      id: 'CA-COURTS-OPINIONS',
      title: 'California Published and Citable Opinions',
      type: 'research-directory',
      jurisdiction: 'California',
      url: 'https://courts.ca.gov/opinions/publishedcitable-opinions',
      topics: [
        'precedent', 'appeal', 'judgment',
        'published', 'opinion', 'court',
        'case law', 'judicial decision',
        'appellate'
      ],
      summary:
        'Official California Judicial Branch directory for published and citable appellate opinions. This directory is not an individual judgment. Specific opinions must be separately retrieved and verified.',
      status: 'source-identified'
    },
    {
      id: 'CA-COURTS-UNPUBLISHED',
      title: 'California Unpublished and Non-Citable Opinions',
      type: 'research-directory',
      jurisdiction: 'California',
      url: 'https://courts.ca.gov/opinions/unpublishednon-citable-opinions',
      topics: [
        'unpublished', 'non citable',
        'opinion', 'appeal', 'judgment',
        'case law', 'precedent'
      ],
      summary:
        'Official directory of unpublished California appellate opinions. These generally must not be cited or relied upon as precedent, subject to limited exceptions under California Rules of Court, rule 8.1115.',
      status: 'source-identified'
    },
    {
      id: 'CA-CRC-8-1115',
      title: 'California Rules of Court — Rule 8.1115',
      type: 'court-rule',
      jurisdiction: 'California',
      url: 'https://courts.ca.gov/cms/rules/index/eight/rule8_1115',
      topics: [
        'precedent', 'opinion', 'citation',
        'published', 'unpublished',
        'appeal', 'appellate',
        'judicial decision', 'case law'
      ],
      summary:
        'California court rule governing citation of unpublished opinions and the treatment of published opinions, including those under Supreme Court review. Verify publication status and subsequent history.',
      status: 'source-identified'
    },
    {
      id: 'CA-CRC-8-1105',
      title: 'California Rules of Court — Rule 8.1105',
      type: 'court-rule',
      jurisdiction: 'California',
      url: 'https://courts.ca.gov/cms/rules/index/eight/rule8_1105',
      topics: [
        'publication', 'published',
        'opinion', 'precedent',
        'appellate', 'appeal',
        'judicial decision', 'case law'
      ],
      summary:
        'California court rule addressing publication of appellate opinions and standards for publication. Relevant when determining whether a retrieved judicial opinion is published.',
      status: 'source-identified'
    },
    {
      id: 'CA-CODE-CIVIL-PROCEDURE',
      title: 'California Code of Civil Procedure',
      type: 'statutory-directory',
      jurisdiction: 'California',
      url: 'https://leginfo.legislature.ca.gov/faces/codes.xhtml',
      topics: [
        'civil procedure', 'small claims',
        'lawsuit', 'filing', 'hearing',
        'judgment', 'civil court',
        'jurisdiction', 'procedure'
      ],
      summary:
        'Official California legislation portal. Use it to locate and verify specific Code of Civil Procedure provisions governing civil and small-claims proceedings. This entry does not identify a particular section.',
      status: 'research-directory'
    },
    {
      id: 'CA-EVIDENCE-CODE',
      title: 'California Evidence Code',
      type: 'statutory-directory',
      jurisdiction: 'California',
      url: 'https://leginfo.legislature.ca.gov/faces/codes.xhtml',
      topics: [
        'evidence', 'authentication',
        'admissibility', 'witness',
        'testimony', 'document',
        'photographs', 'burden of proof',
        'hearsay'
      ],
      summary:
        'Official California legislation portal for researching the Evidence Code, including authentication, admissibility and evidentiary questions. Specific provisions must be identified and checked separately.',
      status: 'research-directory'
    }
  ]
  
  // Common words that do not establish legal relevance.
  const stopWords = new Set([
    'about', 'after', 'again', 'against', 'also',
    'because', 'before', 'between', 'both',
    'could', 'does', 'each', 'from', 'have',
    'into', 'more', 'other', 'over', 'same',
    'should', 'their', 'there', 'these',
    'those', 'under', 'upon', 'were',
    'what', 'when', 'where', 'which',
    'while', 'with', 'would', 'this',
    'that', 'than', 'they', 'them',
    'will', 'your', 'california'
  ])
  
  function tokenize(text) {
    return new Set(
      (String(text).toLowerCase().match(/[a-z]{4,}/g) || [])
        .filter(word => !stopWords.has(word))
    )
  }
  
  function scoreSource(source, query, queryWords) {
    const normalizedQuery = String(query)
      .toLowerCase()
      .replace(/\s+/g, ' ')
  
    let score = 0
  
    for (const topic of source.topics) {
      const normalizedTopic = topic.toLowerCase()
  
      if (normalizedTopic.includes(' ')) {
        // Give multi-word legal concepts greater weight.
        if (normalizedQuery.includes(normalizedTopic)) {
          score += 4
        }
      } else if (queryWords.has(normalizedTopic)) {
        score += 2
      }
    }
  
    return score
  }
  
  export function retrieveLegalSources(query, limit = 8) {
    const queryWords = tokenize(query)
  
    const safeLimit = Math.min(
      20,
      Math.max(1, Number(limit) || 8)
    )
  
    return legalSources
      .map(source => ({
        ...source,
        score: scoreSource(source, query, queryWords)
      }))
      .filter(source => source.score > 0)
      .sort((a, b) =>
        b.score - a.score ||
        a.title.localeCompare(b.title)
      )
      .slice(0, safeLimit)
  }
  