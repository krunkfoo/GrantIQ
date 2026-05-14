/**
 * Template rendering for grant content.
 * Replaces {{VARIABLE}} placeholders in grant text with actual property values.
 *
 * Variables available:
 *   {{ADDRESS}}      — property.address (e.g. "1220 Howard St")
 *   {{CITY}}         — property.city    (e.g. "San Francisco, CA 94103")
 *   {{PROPERTY_TYPE}} — property.propertyType
 *   {{SCOPE}}        — property.scope
 *   {{BUDGET}}       — property.budget (human label)
 *   {{START_DATE}}   — property.startDate || "TBD"
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

/** Return a grant with all template fields resolved to the given property. */
export function renderGrant(grant, property) {
  return {
    ...grant,
    steps: grant.steps?.map(s => substitute(s, property)) ?? [],
    ineligibleReason: substitute(grant.ineligibleReason, property),
    hireRecommendation: grant.hireRecommendation
      ? { ...grant.hireRecommendation, reason: substitute(grant.hireRecommendation.reason, property) }
      : grant.hireRecommendation,
    draftEmail: grant.draftEmail
      ? {
          ...grant.draftEmail,
          subject: substitute(grant.draftEmail.subject, property),
          body: substitute(grant.draftEmail.body, property),
        }
      : null,
  }
}
