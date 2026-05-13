import { grants } from '../../data/grants.js'
import GrantWorkbookClient from '../../components/GrantWorkbook.jsx'

const demoProperty = {
  id: 'demo',
  address: '50 Washington Ave',
  city: 'Point Richmond, CA 94801',
  propertyType: 'Historic Commercial',
  scope: 'Full rehabilitation of 1912 hotel building: structural seismic upgrade, facade restoration including Yesco neon sign, interior common area renovation, and conversion of upper floors to boutique lodging.',
  budget: '$2.2M–$2.8M',
  startDate: 'Q3 2026',
}

const demoGrants = grants.map(g => ({
  ...g,
  stateId: null,
  emailBody: g.draftEmail?.body ?? '',
  notes: '',
}))

export default function DemoPage() {
  return (
    <GrantWorkbookClient
      property={demoProperty}
      grants={demoGrants}
      workbookId={null}
      demo={true}
    />
  )
}
