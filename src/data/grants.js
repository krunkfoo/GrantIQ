export const property = {
  name: 'Hotel Mac',
  address: '50 Washington Ave',
  city: 'Point Richmond, CA 94801',
  type: 'Historic Commercial',
  nrStatus: 'NR Contributing Structure',
  district: 'Point Richmond Historic District',
  scope: 'Full rehabilitation of 1912 hotel building: structural seismic upgrade, facade restoration including Yesco neon sign, interior common area renovation, and conversion of upper floors to boutique lodging.',
  budget: '$2.2M–$2.8M',
  startDate: 'Q3 2026',
};

export const grants = [
  {
    id: 'federal-htc',
    name: 'Federal Historic Tax Credit (HTC)',
    type: 'Federal',
    estValue: '$440,000–$560,000',
    estValueNum: 500000,
    useFor: 'Qualified rehabilitation expenditures — structural, facade, mechanical, interior finishes',
    status: 'eligible',
    workflowStatus: 'Draft email ready',
    deadline: 'Rolling — file with tax return',
    link: 'https://www.nps.gov/subjects/taxincentives/index.htm',
    contact: {
      name: 'NPS Western Region',
      title: 'Technical Preservation Services',
      email: 'nps_tax@nps.gov',
      phone: '(415) 623-2334',
    },
    eligibilityChecks: [
      { label: 'Listed on National Register of Historic Places', pass: true },
      { label: 'Building is income-producing (commercial use)', pass: true },
      { label: 'Rehabilitation meets Secretary of Interior Standards', pass: null },
      { label: 'QREs exceed adjusted basis (>$5,000)', pass: true },
      { label: 'Part II application submitted to SHPO', pass: false },
    ],
    checklist: [
      { label: 'Obtain NR listing documentation from NRHP database', done: true },
      { label: 'Hire a preservation architect (Standards-compliant scope)', done: false },
      { label: 'Submit Part 1 application to CA SHPO', done: false },
      { label: 'Get Part 2 pre-approval before construction begins', done: false },
      { label: 'Track all QREs separately in accounting', done: false },
      { label: 'File IRS Form 3468 with tax return', done: false },
    ],
    steps: [
      'Confirm NR listing status — Hotel Mac is already a contributing structure in the Point Richmond Historic District (NR #89002041).',
      'Engage a preservation architect to certify that your rehab scope meets the Secretary of the Interior\'s Standards for Rehabilitation.',
      'File Part 1 (Historic Character) with CA SHPO before work begins — typically 4–6 weeks for review.',
      'Get Part 2 (Rehab Description) pre-approved. This locks in credit eligibility before you break ground.',
      'Complete rehabilitation. The 20% credit applies to Qualified Rehab Expenditures (QREs) — generally $2.2M–$2.8M for your scope.',
      'File Part 3 (Request for Certification) when work is complete.',
      'Claim the credit on IRS Form 3468 in the year the building is placed back in service.',
    ],
    draftEmail: {
      to: 'Tom Butt <tombutt@interactiveresources.com>',
      subject: 'Hotel Mac Rehabilitation — Federal HTC Feasibility',
      body: `Hi Tom,

I'm Raj Natu, GP at Redstone Capital — we recently acquired the Hotel Mac at 50 Washington Ave in Point Richmond and are planning a full rehabilitation starting Q3 2026.

I understand you wrote the original National Register nomination for the Point Richmond Historic District, which means you know this building better than almost anyone. We're scoping a $2.2M–$2.8M rehabilitation and want to pursue the 20% Federal Historic Tax Credit.

I'd love to get 30 minutes on the calendar to talk through whether the scope is Standards-compliant and whether Interactive Resources would be the right firm to take us through the Part 1/2/3 process.

Would Tuesday the 20th or Thursday the 22nd work for a call?

Best,
Raj Natu
Redstone Capital
natu.raj@gmail.com`,
    },
    hireRecommendation: {
      needed: true,
      reason: 'HTC requires a preservation architect to certify your rehab scope meets Secretary of Interior Standards. Tom Butt at Interactive Resources wrote the original NR nomination for Point Richmond — he knows every brick on this block.',
      firm: 'Interactive Resources',
      contact: 'Tom Butt, Principal',
      email: 'tombutt@interactiveresources.com',
      phone: '(510) 620-7878',
    },
    statusHistory: [
      { date: '2026-05-12', event: 'Eligibility confirmed', note: 'Hotel Mac confirmed as contributing structure' },
    ],
  },
  {
    id: 'ca-state-htc',
    name: 'California State Historic Tax Credit',
    type: 'State',
    estValue: '$110,000–$140,000',
    estValueNum: 125000,
    useFor: 'Stacks on top of Federal HTC — same QREs, additional 20% state credit',
    status: 'eligible',
    workflowStatus: 'Not started',
    deadline: 'Applications open Jan–Mar annually',
    link: 'https://ohp.parks.ca.gov/ListedResources/Detail/569',
    contact: {
      name: 'CA Office of Historic Preservation',
      title: 'Tax Credit Program Manager',
      email: 'calshpo@parks.ca.gov',
      phone: '(916) 653-6624',
    },
    eligibilityChecks: [
      { label: 'Certified historic structure (NR or CA Register)', pass: true },
      { label: 'Income-producing property', pass: true },
      { label: 'Rehab meets OHP Standards', pass: null },
      { label: 'CA SHPO Part 2 approval required', pass: false },
      { label: 'Credit reservation filed during application window', pass: false },
    ],
    checklist: [
      { label: 'Confirm property on CA Register (auto if NR listed)', done: true },
      { label: 'File Federal Part 1 first (CA stacks on federal)', done: false },
      { label: 'Reserve credit allocation in Jan–Mar window', done: false },
      { label: 'Coordinate with CA SHPO during construction', done: false },
    ],
    steps: [
      'The CA State HTC is a 20% credit on top of the Federal 20% — effectively you can stack both for 40% total on QREs.',
      'File your CA SHPO credit reservation during the January–March application window before starting construction.',
      'The same Secretary of Interior Standards apply — one preservation architect covers both federal and state.',
      'CA credit can be sold or transferred if you can\'t use the full amount in one tax year.',
    ],
    draftEmail: {
      to: 'CA Office of Historic Preservation <calshpo@parks.ca.gov>',
      subject: 'Hotel Mac — CA State HTC Credit Reservation Inquiry',
      body: `Hello,

I'm reaching out about the California State Historic Tax Credit for a rehabilitation project at 50 Washington Ave, Point Richmond (Hotel Mac). The property is a contributing structure in the Point Richmond Historic District on the National Register.

We are planning a full rehabilitation beginning Q3 2026 with approximately $2.5M in qualified rehabilitation expenditures. We intend to pursue both the Federal 20% HTC and the California 20% State HTC concurrently.

Could you confirm the next application window and whether we need to file the Federal Part 1 before submitting the CA credit reservation?

Thank you,
Raj Natu
Redstone Capital
natu.raj@gmail.com
(510) 555-0192`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'The same preservation architect handling the Federal HTC covers the CA State process — no separate firm needed.',
    },
    statusHistory: [
      { date: '2026-05-12', event: 'Eligibility confirmed', note: 'NR status satisfies CA Register requirement' },
    ],
  },
  {
    id: 'mills-act',
    name: 'Mills Act Property Tax Reduction',
    type: 'Local',
    estValue: '$18,000–$26,000/yr',
    estValueNum: 22000,
    useFor: 'Annual property tax savings — assessed value recalculated on income approach, not market value',
    status: 'eligible',
    workflowStatus: 'Contact made',
    deadline: 'Applications accepted year-round; savings begin next tax year',
    link: 'https://www.ci.richmond.ca.us/1359/Historic-Preservation',
    contact: {
      name: 'Junne Garcia',
      title: 'Historic Preservation Planner, City of Richmond',
      email: 'junne_garcia@ci.richmond.ca.us',
      phone: '(510) 621-1279',
    },
    eligibilityChecks: [
      { label: 'Property in City of Richmond jurisdiction', pass: true },
      { label: 'Designated local, state, or NR historic landmark', pass: true },
      { label: 'Owner agrees to maintain historic character per contract', pass: null },
      { label: 'No delinquent property taxes', pass: true },
    ],
    checklist: [
      { label: 'Request application from Junne Garcia at City of Richmond', done: false },
      { label: 'Prepare rehabilitation/maintenance plan (10-year scope)', done: false },
      { label: 'City Council approval required — plan for 60–90 day process', done: false },
      { label: 'Sign Mills Act contract (renewable every year, 10-year term)', done: false },
    ],
    steps: [
      'Contact Junne Garcia at the City of Richmond Historic Preservation office — she administers the local Mills Act program.',
      'Prepare a 10-year maintenance and rehabilitation plan that commits to preserving the historic character of Hotel Mac.',
      'The City Council votes to approve your Mills Act contract — typically a 60–90 day process.',
      'Once approved, the county assessor recalculates your property tax using an income approach rather than market value.',
      'For Hotel Mac, expect 40–60% reduction in annual property taxes — roughly $18,000–$26,000 in annual savings.',
    ],
    draftEmail: {
      to: 'Junne Garcia <junne_garcia@ci.richmond.ca.us>',
      subject: 'Hotel Mac Mills Act Application — 50 Washington Ave',
      body: `Hi Junne,

I'm Raj Natu, GP at Redstone Capital. We recently acquired the Hotel Mac at 50 Washington Ave and are planning a full rehabilitation. We'd love to pursue a Mills Act contract to support our long-term commitment to maintaining the building's historic character.

Could you send over the current application materials and let me know about timing for the next City Council review cycle? We're planning to start rehabilitation work in Q3 2026 and want to have the contract in place beforehand if possible.

Happy to come by the office or jump on a call — whatever works best for you.

Thank you,
Raj Natu
Redstone Capital
natu.raj@gmail.com
(510) 555-0192`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'Mills Act is a direct contract with the City — Junne Garcia at Richmond Historic Preservation walks you through it.',
    },
    statusHistory: [
      { date: '2026-05-12', event: 'Eligibility confirmed', note: 'City of Richmond participates in Mills Act program' },
    ],
  },
  {
    id: 'chbc',
    name: 'CA Historical Building Code (CHBC)',
    type: 'State',
    estValue: '$80,000–$150,000',
    estValueNum: 115000,
    useFor: 'Construction cost savings — alternative compliance paths reduce seismic/fire retrofit costs for historic buildings',
    status: 'eligible',
    workflowStatus: 'Not started',
    deadline: 'Apply during permit process',
    link: 'https://www.dgs.ca.gov/BSC/CBSC/Resources/Page-Content/Board-and-Commission-Resources-List-Folder/California-Historical-Building-Code',
    contact: {
      name: 'Richmond Building Department',
      title: 'Historic Building Permit Coordinator',
      email: 'building@ci.richmond.ca.us',
      phone: '(510) 621-1269',
    },
    eligibilityChecks: [
      { label: 'Qualified historical building (NR or local landmark)', pass: true },
      { label: 'Project requires building permits', pass: true },
      { label: 'CHBC compliance requested during permit application', pass: null },
    ],
    checklist: [
      { label: 'Note CHBC applicability on permit application', done: false },
      { label: 'Engage structural engineer familiar with CHBC alternatives', done: false },
      { label: 'Request State Historical Building Safety Board consultation if needed', done: false },
    ],
    steps: [
      'The CHBC lets qualifying historic buildings use alternative code compliance paths that preserve historic fabric while meeting safety standards.',
      'Most importantly for Hotel Mac: the seismic retrofit can use "acceptable risk" instead of full code compliance — typically 30–50% cost reduction.',
      'Flag CHBC applicability on your permit application at the Richmond Building Department.',
      'Your structural engineer should be familiar with CHBC — it\'s meaningfully different from standard Title 24.',
    ],
    draftEmail: {
      to: 'Richmond Building Department <building@ci.richmond.ca.us>',
      subject: 'CHBC Compliance Request — 50 Washington Ave (Hotel Mac)',
      body: `Hello,

We are planning a full rehabilitation of the Hotel Mac at 50 Washington Ave, a contributing structure in the Point Richmond Historic District on the National Register.

We intend to request compliance under the California Historical Building Code (CHBC) for this project, including alternative compliance for the seismic upgrade scope. Could you confirm the process for requesting CHBC treatment on our permit application and whether a pre-application meeting is available?

Thank you,
Raj Natu
Redstone Capital
natu.raj@gmail.com`,
    },
    hireRecommendation: {
      needed: true,
      reason: 'CHBC seismic alternatives require a structural engineer with historic building experience — the cost savings are real but you need someone who knows how to write the alternative compliance narrative.',
      firm: 'ZFA Structural Engineers',
      contact: 'San Francisco office',
      email: 'info@zfastructural.com',
    },
    statusHistory: [
      { date: '2026-05-12', event: 'Eligibility confirmed', note: 'NR status qualifies Hotel Mac for CHBC' },
    ],
  },
  {
    id: 'richmond-hpf',
    name: 'Richmond Historic Preservation Fund',
    type: 'Local',
    estValue: '$5,000–$25,000',
    estValueNum: 15000,
    useFor: 'Facade restoration, signage preservation — specifically covers Yesco neon sign review and restoration planning',
    status: 'eligible',
    workflowStatus: 'Not started',
    deadline: 'Grants awarded quarterly',
    link: 'https://www.ci.richmond.ca.us/1359/Historic-Preservation',
    contact: {
      name: 'Junne Garcia',
      title: 'Historic Preservation Planner, City of Richmond',
      email: 'junne_garcia@ci.richmond.ca.us',
      phone: '(510) 621-1279',
    },
    eligibilityChecks: [
      { label: 'Property in City of Richmond', pass: true },
      { label: 'Designated or contributing historic structure', pass: true },
      { label: 'Project restores or preserves historic character-defining features', pass: true },
      { label: 'Owner match typically required (50%)', pass: null },
    ],
    checklist: [
      { label: 'Contact Junne Garcia for current grant round dates', done: false },
      { label: 'Document Yesco sign as character-defining feature', done: false },
      { label: 'Get signage restoration estimate from Yesco or equivalent', done: false },
      { label: 'Prepare grant narrative (2–3 pages + photos)', done: false },
    ],
    steps: [
      'The Richmond Historic Preservation Fund is specifically designed for facade and character-defining feature restoration — the Hotel Mac\'s Yesco neon sign is exactly the kind of project this covers.',
      'Contact Junne Garcia — she manages both the Mills Act and this fund, so you can address both in one conversation.',
      'Grants are typically 50/50 match. For a $30,000 sign restoration, expect up to $15,000 from the fund.',
      'Document the Yesco sign\'s history in your application — it strengthens the historic character argument.',
    ],
    draftEmail: {
      to: 'Junne Garcia <junne_garcia@ci.richmond.ca.us>',
      subject: 'Historic Preservation Fund — Hotel Mac Yesco Sign Restoration',
      body: `Hi Junne,

Following up on our Mills Act conversation — I also wanted to ask about the Richmond Historic Preservation Fund for our Yesco neon sign restoration.

The sign is a character-defining feature of the Hotel Mac facade and we're planning a full restoration as part of our Q3 2026 rehabilitation. I believe this is exactly the type of project the fund was designed for.

Could you let me know when the next grant round opens and what documentation you'd need from us? We're happy to do the 50% match.

Thank you,
Raj Natu
natu.raj@gmail.com`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'Junne Garcia at City of Richmond manages this fund directly — no consultant needed for the application.',
    },
    statusHistory: [
      { date: '2026-05-12', event: 'Eligibility confirmed', note: 'Yesco sign qualifies as character-defining feature' },
    ],
  },
  {
    id: 'sba-504',
    name: 'SBA 504 Loan Program',
    type: 'Federal',
    estValue: '$1,000,000–$2,000,000',
    estValueNum: 1500000,
    useFor: 'Below-market fixed-rate financing for rehab construction costs — not a grant but reduces financing cost by ~1.5–2% vs conventional',
    status: 'eligible',
    workflowStatus: 'Not started',
    deadline: 'Rolling — apply through a Certified Development Company (CDC)',
    link: 'https://www.sba.gov/funding-programs/loans/504-loans',
    contact: {
      name: 'Bay Area Development Company',
      title: 'SBA 504 Certified Development Company',
      email: 'info@badc.org',
      phone: '(510) 839-2140',
    },
    eligibilityChecks: [
      { label: 'For-profit business (hotel operations entity)', pass: true },
      { label: 'Net worth < $15M / net income < $5M (avg 2 yrs)', pass: null },
      { label: 'Owner-occupied commercial real estate', pass: true },
      { label: 'Job creation or community development goal', pass: true },
    ],
    checklist: [
      { label: 'Confirm business entity net worth eligibility', done: false },
      { label: 'Identify a Certified Development Company (CDC) in the Bay Area', done: false },
      { label: 'Prepare 3 years of business financials', done: false },
      { label: 'Provide construction cost breakdown and contractor bids', done: false },
    ],
    steps: [
      'SBA 504 provides long-term, fixed-rate financing at below-market rates for owner-occupied commercial real estate rehab.',
      'Structure: ~50% conventional bank loan, 40% SBA 504 debenture (fixed rate), 10% owner equity.',
      'Contact Bay Area Development Company (BADC) — they\'re the local CDC and handle the SBA side of the transaction.',
      'Historic properties often qualify for the Community Development goal, which gives you access to higher loan limits.',
    ],
    draftEmail: {
      to: 'Bay Area Development Company <info@badc.org>',
      subject: 'SBA 504 Financing — Hotel Mac Rehabilitation, Point Richmond',
      body: `Hello,

I'm Raj Natu, GP at Redstone Capital. We're planning a full rehabilitation of the Hotel Mac at 50 Washington Ave in Point Richmond — a $2.2M–$2.8M project starting Q3 2026.

The property is a contributing structure in the National Register Point Richmond Historic District, which we believe may qualify as a Community Development project under SBA 504 guidelines.

Could someone reach out to discuss whether 504 financing makes sense for this deal and what documentation you'd need to start the process?

Thank you,
Raj Natu
natu.raj@gmail.com
(510) 555-0192`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'Bay Area Development Company (BADC) is your CDC and walks you through the SBA side. Your regular bank handles the 50% conventional piece.',
    },
    statusHistory: [
      { date: '2026-05-12', event: 'Eligibility confirmed', note: 'Hotel operations entity likely qualifies; verify net worth' },
    ],
  },
  {
    id: 'neh',
    name: 'NEH Preservation Assistance Grant',
    type: 'Federal',
    estValue: '$10,000–$75,000',
    estValueNum: 0,
    useFor: 'Preservation planning for collections, archives, humanities materials',
    status: 'ineligible',
    ineligibleReason: 'NEH Preservation Assistance Grants are for libraries, archives, museums, and cultural institutions preserving humanities collections — not for building rehabilitation. Hotel Mac does not hold a qualifying collection.',
    workflowStatus: 'Ineligible',
    deadline: 'N/A',
    link: 'https://www.neh.gov/grants/preservation/preservation-assistance-grants',
    contact: null,
    eligibilityChecks: [
      { label: 'Institution holds humanities collection (archives, artifacts, media)', pass: false },
      { label: 'Applicant is a nonprofit or government entity', pass: false },
      { label: 'Project improves long-term care of collections', pass: false },
    ],
    checklist: [],
    steps: [],
    draftEmail: null,
    hireRecommendation: { needed: false },
    statusHistory: [
      { date: '2026-05-12', event: 'Screened ineligible', note: 'Not a collections/archives institution' },
    ],
  },
  {
    id: 'sf-shines',
    name: 'SF Shines Façade Improvement Program',
    type: 'Local',
    estValue: '$2,000–$20,000',
    estValueNum: 0,
    useFor: 'Facade improvements for small businesses in San Francisco commercial corridors',
    status: 'ineligible',
    ineligibleReason: 'SF Shines is a City of San Francisco program exclusively for businesses located within San Francisco. Hotel Mac is in Point Richmond, City of Richmond — a different jurisdiction entirely.',
    workflowStatus: 'Ineligible',
    deadline: 'N/A',
    link: 'https://oewd.org/sf-shines',
    contact: null,
    eligibilityChecks: [
      { label: 'Business located in City & County of San Francisco', pass: false },
      { label: 'Located on a qualifying SF commercial corridor', pass: false },
    ],
    checklist: [],
    steps: [],
    draftEmail: null,
    hireRecommendation: { needed: false },
    statusHistory: [
      { date: '2026-05-12', event: 'Screened ineligible', note: 'Geographic restriction — SF only' },
    ],
  },
]

export const summaryStats = {
  totalGrants: grants.filter(g => g.status === 'eligible').length,
  totalValue: grants.filter(g => g.status === 'eligible').reduce((sum, g) => sum + g.estValueNum, 0),
  emailsSent: 1,
  replies: 0,
}

export const loadingSteps = [
  'Geocoding 50 Washington Ave, Point Richmond CA 94801…',
  'Checking Point Richmond Historic District boundaries…',
  'Confirming National Register listing status…',
  'Looking up federal Historic Tax Credit eligibility…',
  'Searching California State Historic Tax Credit programs…',
  'Reviewing Mills Act participation — City of Richmond…',
  'Checking California Historical Building Code applicability…',
  'Scanning Richmond Historic Preservation Fund…',
  'Looking up SBA small business financing programs…',
  'Checking NEH and cultural institution grants…',
  'Screening SF Bay Area local grant programs…',
  'Matching consultant firms with NR nomination history…',
  'Building your grant workbook…',
]
