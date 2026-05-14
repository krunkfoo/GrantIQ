/**
 * Template rendering and geographic eligibility screening for grants.
 *
 * Template variables:
 *   {{ADDRESS}}       — property.address
 *   {{CITY}}          — property.city
 *   {{PROPERTY_TYPE}} — property.propertyType
 *   {{SCOPE}}         — property.scope
 *   {{BUDGET}}        — property.budget (human label)
 *   {{START_DATE}}    — property.startDate || "TBD"
 */

const BUDGET_LABELS = {
  unsure: 'an estimated budget (TBD)',
  '<250k': 'under $250K',
  '250k-500k': '$250K–$500K',
  '500k-1m': '$500K–$1M',
  '1m-3m': '$1M–$3M',
  '>3m': 'over $3M',
}

function vars(property) {
  return {
    '{{ADDRESS}}': property.address ?? 'the property',
    '{{CITY}}': property.city ?? '',
    '{{PROPERTY_TYPE}}': property.propertyType ?? 'historic property',
    '{{SCOPE}}': property.scope ?? 'full rehabilitation',
    '{{BUDGET}}': BUDGET_LABELS[property.budget] ?? property.budget ?? 'TBD',
    '{{START_DATE}}': property.startDate || 'TBD',
  }
}

function substitute(text, property) {
  if (!text) return text
  const map = vars(property)
  return Object.entries(map).reduce(
    (str, [key, val]) => str.replaceAll(key, val),
    text
  )
}

// ─── Geographic helpers ────────────────────────────────────────────────────

function cityContains(property, ...keywords) {
  const haystack = `${property.address ?? ''} ${property.city ?? ''}`.toLowerCase()
  return keywords.some(k => haystack.includes(k.toLowerCase()))
}

/**
 * Eligibility overrides keyed by grant id.
 * Return { status, ineligibleReason } to override, or null to keep as-is.
 */
const GEO_RULES = {
  // Richmond Historic Preservation Fund — City of Richmond ONLY
  'richmond-hpf': (property) => {
    const inRichmond = cityContains(property, 'richmond')
    if (!inRichmond) {
      return {
        status: 'ineligible',
        workflowStatus: 'Ineligible',
        ineligibleReason:
          'The Richmond Historic Preservation Fund is administered by the City of Richmond and is only available to properties within that jurisdiction. {{ADDRESS}}, {{CITY}} is outside Richmond city limits.',
      }
    }
    return null
  },

  // SF Shines — City & County of San Francisco ONLY
  'sf-shines': (property) => {
    const inSF =
      cityContains(property, 'san francisco') ||
      cityContains(property, ', SF,') ||
      cityContains(property, ' SF ') ||
      /\b(941\d\d)\b/.test(property.city ?? '') && cityContains(property, 'san francisco')

    // SF zip codes: 94102–94188
    const zipMatch = (property.city ?? '').match(/\b(94\d{3})\b/)
    const sfZip = zipMatch && parseInt(zipMatch[1]) >= 94102 && parseInt(zipMatch[1]) <= 94188

    if (inSF || sfZip) {
      return {
        status: 'eligible',
        workflowStatus: 'Not started',
        ineligibleReason: null,
        eligibilityChecks: [
          { label: 'Business located in City & County of San Francisco', pass: true },
          { label: 'Located on a qualifying SF commercial corridor', pass: null },
        ],
        draftEmail: {
          to: 'SF Shines Program <sfshines@sfgov.org>',
          subject: 'SF Shines Application — {{ADDRESS}}',
          body: `Hello,

I am reaching out about the SF Shines Façade Improvement Program for our property at {{ADDRESS}}, {{CITY}}.

We are planning: {{SCOPE}}

We believe our facade work qualifies for the program. Could you confirm eligibility and the current application process?

Thank you,
[Your name]
[Your organization]
[Your email]`,
        },
      }
    }
    return null
  },
}

// ─── Main export ───────────────────────────────────────────────────────────

/** Return a grant with template variables resolved and geo-eligibility applied. */
export function renderGrant(grant, property) {
  // Apply geographic eligibility override first
  const geoOverride = GEO_RULES[grant.id]?.(property) ?? null
  const base = geoOverride ? { ...grant, ...geoOverride } : grant

  // Substitute template variables in all text fields
  return {
    ...base,
    steps: base.steps?.map(s => substitute(s, property)) ?? [],
    ineligibleReason: substitute(base.ineligibleReason, property),
    hireRecommendation: base.hireRecommendation
      ? { ...base.hireRecommendation, reason: substitute(base.hireRecommendation.reason, property) }
      : base.hireRecommendation,
    draftEmail: base.draftEmail
      ? {
          ...base.draftEmail,
          subject: substitute(base.draftEmail.subject, property),
          body: substitute(base.draftEmail.body, property),
        }
      : null,
  }
}
