export const grants = [
  {
    id: 'federal-htc',
    name: 'Federal Historic Tax Credit (HTC)',
    type: 'Federal',
    estValue: '$440,000–$560,000',
    estValueNum: 500000,
    useFor: 'Qualified rehabilitation expenditures — structural, facade, mechanical, interior finishes',
    status: 'eligible',
    workflowStatus: 'Not started',
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
      { label: 'Obtain NR listing documentation from NRHP database', done: false },
      { label: 'Hire a preservation architect (Standards-compliant scope)', done: false },
      { label: 'Submit Part 1 application to CA SHPO', done: false },
      { label: 'Get Part 2 pre-approval before construction begins', done: false },
      { label: 'Track all QREs separately in accounting', done: false },
      { label: 'File IRS Form 3468 with tax return', done: false },
    ],
    steps: [
      'Confirm National Register listing status for {{ADDRESS}}, {{CITY}}.',
      'Engage a preservation architect to certify that your rehab scope meets the Secretary of the Interior\'s Standards for Rehabilitation.',
      'File Part 1 (Historic Character) with CA SHPO before work begins — typically 4–6 weeks for review.',
      'Get Part 2 (Rehab Description) pre-approved. This locks in credit eligibility before you break ground.',
      'Complete rehabilitation. The 20% credit applies to Qualified Rehab Expenditures (QREs) — based on your project budget of {{BUDGET}}.',
      'File Part 3 (Request for Certification) when work is complete.',
      'Claim the credit on IRS Form 3468 in the year the building is placed back in service.',
    ],
    draftEmail: {
      to: 'NPS Western Region <nps_tax@nps.gov>',
      subject: '{{ADDRESS}} Rehabilitation — Federal HTC Feasibility',
      body: `Hello,

I'm reaching out about the Federal Historic Tax Credit for a rehabilitation project at {{ADDRESS}}, {{CITY}}.

We are planning: {{SCOPE}}

Estimated budget: {{BUDGET}}
Target start: {{START_DATE}}

We believe the property may qualify for the 20% Federal Historic Tax Credit and would like to confirm eligibility and next steps for the Part 1/2/3 certification process.

Could you point us to the right contact at the Western Region office to discuss this project?

Thank you,
[Your name]
[Your organization]
[Your email]`,
    },
    hireRecommendation: {
      needed: true,
      reason: 'The Federal HTC requires a preservation architect to certify that your rehab scope at {{ADDRESS}} meets the Secretary of the Interior\'s Standards for Rehabilitation.',
    },
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
      { label: 'Confirm property on CA Register (auto if NR listed)', done: false },
      { label: 'File Federal Part 1 first (CA stacks on federal)', done: false },
      { label: 'Reserve credit allocation in Jan–Mar window', done: false },
      { label: 'Coordinate with CA SHPO during construction', done: false },
    ],
    steps: [
      'The CA State HTC is a 20% credit on top of the Federal 20% — effectively you can stack both for 40% total on QREs.',
      'File your CA SHPO credit reservation during the January–March application window before starting construction at {{ADDRESS}}.',
      'The same Secretary of Interior Standards apply — one preservation architect covers both federal and state.',
      'CA credit can be sold or transferred if you can\'t use the full amount in one tax year.',
    ],
    draftEmail: {
      to: 'CA Office of Historic Preservation <calshpo@parks.ca.gov>',
      subject: '{{ADDRESS}} — CA State HTC Credit Reservation Inquiry',
      body: `Hello,

I'm reaching out about the California State Historic Tax Credit for a rehabilitation project at {{ADDRESS}}, {{CITY}}.

We are planning: {{SCOPE}}

Estimated budget: {{BUDGET}}
Target start: {{START_DATE}}

We intend to pursue both the Federal 20% HTC and the California 20% State HTC concurrently. Could you confirm the next application window and whether we need to file the Federal Part 1 before submitting the CA credit reservation?

Thank you,
[Your name]
[Your organization]
[Your email]`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'The same preservation architect handling the Federal HTC covers the CA State process — no separate firm needed.',
    },
  },
  {
    id: 'mills-act',
    name: 'Mills Act Property Tax Reduction',
    type: 'Local',
    estValue: '$18,000–$26,000/yr',
    estValueNum: 22000,
    useFor: 'Annual property tax savings — assessed value recalculated on income approach, not market value',
    status: 'eligible',
    workflowStatus: 'Not started',
    deadline: 'Applications accepted year-round; savings begin next tax year',
    link: 'https://www.ci.richmond.ca.us/1359/Historic-Preservation',
    contact: {
      name: 'Local Historic Preservation Office',
      title: 'Historic Preservation Planner',
      email: '',
      phone: '',
    },
    eligibilityChecks: [
      { label: 'Property in a participating municipality', pass: true },
      { label: 'Designated local, state, or NR historic landmark', pass: true },
      { label: 'Owner agrees to maintain historic character per contract', pass: null },
      { label: 'No delinquent property taxes', pass: true },
    ],
    checklist: [
      { label: 'Contact local Historic Preservation office for application', done: false },
      { label: 'Prepare rehabilitation/maintenance plan (10-year scope)', done: false },
      { label: 'City Council approval required — plan for 60–90 day process', done: false },
      { label: 'Sign Mills Act contract (renewable every year, 10-year term)', done: false },
    ],
    steps: [
      'Contact your local city Historic Preservation office — they administer the Mills Act program for {{CITY}}.',
      'Prepare a 10-year maintenance and rehabilitation plan that commits to preserving the historic character of {{ADDRESS}}.',
      'The City Council votes to approve your Mills Act contract — typically a 60–90 day process.',
      'Once approved, the county assessor recalculates your property tax using an income approach rather than market value.',
      'Expect a 40–60% reduction in annual property taxes depending on your jurisdiction and property income.',
    ],
    draftEmail: {
      to: 'Local Historic Preservation Office',
      subject: 'Mills Act Application — {{ADDRESS}}',
      body: `Hello,

I am reaching out about the Mills Act Property Tax Reduction for our property at {{ADDRESS}}, {{CITY}}.

We are planning: {{SCOPE}}

Target start: {{START_DATE}}

We would like to pursue a Mills Act contract to support our long-term commitment to maintaining the building's historic character. Could you send over the current application materials and let us know about timing for the next City Council review cycle?

Thank you,
[Your name]
[Your organization]
[Your email]`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'Mills Act is a direct contract with the City — your local Historic Preservation planner will walk you through the application.',
    },
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
      name: 'Local Building Department',
      title: 'Historic Building Permit Coordinator',
      email: '',
      phone: '',
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
      'For seismic retrofit at {{ADDRESS}}: the CHBC allows "acceptable risk" instead of full code compliance — typically 30–50% cost reduction.',
      'Flag CHBC applicability on your permit application at the local Building Department.',
      'Your structural engineer should be familiar with CHBC — it\'s meaningfully different from standard Title 24.',
    ],
    draftEmail: {
      to: 'Local Building Department',
      subject: 'CHBC Compliance Request — {{ADDRESS}}',
      body: `Hello,

We are planning a rehabilitation of the historic property at {{ADDRESS}}, {{CITY}}.

Scope: {{SCOPE}}

We intend to request compliance under the California Historical Building Code (CHBC) for this project, including alternative compliance for the seismic upgrade scope. Could you confirm the process for requesting CHBC treatment on our permit application and whether a pre-application meeting is available?

Thank you,
[Your name]
[Your organization]
[Your email]`,
    },
    hireRecommendation: {
      needed: true,
      reason: 'CHBC seismic alternatives for {{ADDRESS}} require a structural engineer with historic building experience — the cost savings are real but you need someone who knows how to write the alternative compliance narrative.',
    },
  },
  {
    id: 'richmond-hpf',
    name: 'Richmond Historic Preservation Fund',
    type: 'Local',
    estValue: '$5,000–$25,000',
    estValueNum: 15000,
    useFor: 'Facade restoration, signage preservation — covers character-defining exterior feature restoration',
    status: 'eligible',
    workflowStatus: 'Not started',
    deadline: 'Grants awarded quarterly',
    link: 'https://www.ci.richmond.ca.us/1359/Historic-Preservation',
    contact: {
      name: 'City of Richmond Historic Preservation',
      title: 'Historic Preservation Planner',
      email: 'planning@ci.richmond.ca.us',
      phone: '(510) 621-1279',
    },
    eligibilityChecks: [
      { label: 'Property in City of Richmond', pass: true },
      { label: 'Designated or contributing historic structure', pass: true },
      { label: 'Project restores or preserves historic character-defining features', pass: true },
      { label: 'Owner match typically required (50%)', pass: null },
    ],
    checklist: [
      { label: 'Contact Richmond Historic Preservation for current grant round dates', done: false },
      { label: 'Document character-defining facade features', done: false },
      { label: 'Get facade restoration estimate', done: false },
      { label: 'Prepare grant narrative (2–3 pages + photos)', done: false },
    ],
    steps: [
      'The Richmond Historic Preservation Fund covers facade and character-defining feature restoration — specifically for properties in the City of Richmond.',
      'Contact the Richmond Historic Preservation office to confirm the next grant round and application requirements.',
      'Grants are typically 50/50 match. For a $30,000 facade restoration, expect up to $15,000 from the fund.',
      'Document the historic character-defining features of {{ADDRESS}} in your application.',
    ],
    draftEmail: {
      to: 'City of Richmond Historic Preservation <planning@ci.richmond.ca.us>',
      subject: 'Historic Preservation Fund — {{ADDRESS}} Facade Restoration',
      body: `Hello,

I am reaching out about the Richmond Historic Preservation Fund for our property at {{ADDRESS}}, {{CITY}}.

We are planning: {{SCOPE}}

We believe our facade restoration scope qualifies for the fund. Could you let us know when the next grant round opens and what documentation is required? We are prepared to provide the 50% match.

Thank you,
[Your name]
[Your organization]
[Your email]`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'The Richmond Historic Preservation office manages this fund directly — no consultant needed for the application.',
    },
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
      { label: 'For-profit business entity', pass: true },
      { label: 'Net worth < $15M / net income < $5M (avg 2 yrs)', pass: null },
      { label: 'Owner-occupied commercial real estate', pass: true },
      { label: 'Job creation or community development goal', pass: true },
    ],
    checklist: [
      { label: 'Confirm business entity net worth eligibility', done: false },
      { label: 'Identify a Certified Development Company (CDC) in your area', done: false },
      { label: 'Prepare 3 years of business financials', done: false },
      { label: 'Provide construction cost breakdown and contractor bids', done: false },
    ],
    steps: [
      'SBA 504 provides long-term, fixed-rate financing at below-market rates for owner-occupied commercial real estate rehab.',
      'Structure: ~50% conventional bank loan, 40% SBA 504 debenture (fixed rate), 10% owner equity.',
      'Contact Bay Area Development Company (BADC) — they\'re the local CDC and handle the SBA side of the transaction.',
      'Historic properties often qualify for the Community Development goal, which gives access to higher loan limits.',
      'For {{ADDRESS}} with a budget of {{BUDGET}}, SBA 504 could cover a significant portion of the rehab cost at fixed rates.',
    ],
    draftEmail: {
      to: 'Bay Area Development Company <info@badc.org>',
      subject: 'SBA 504 Financing — {{ADDRESS}} Rehabilitation',
      body: `Hello,

I'm reaching out about SBA 504 financing for a historic rehabilitation project at {{ADDRESS}}, {{CITY}}.

Project scope: {{SCOPE}}
Estimated budget: {{BUDGET}}
Target start: {{START_DATE}}

The property is a historic structure and we believe it may qualify as a Community Development project under SBA 504 guidelines. Could someone reach out to discuss whether 504 financing makes sense for this project and what documentation you'd need?

Thank you,
[Your name]
[Your organization]
[Your email]`,
    },
    hireRecommendation: {
      needed: false,
      reason: 'Bay Area Development Company (BADC) is the local CDC and walks you through the SBA side. Your regular bank handles the 50% conventional piece.',
    },
  },
  {
    id: 'neh',
    name: 'NEH Preservation Assistance Grant',
    type: 'Federal',
    estValue: '$10,000–$75,000',
    estValueNum: 0,
    useFor: 'Preservation planning for collections, archives, humanities materials',
    status: 'ineligible',
    ineligibleReason: 'NEH Preservation Assistance Grants are for libraries, archives, museums, and cultural institutions preserving humanities collections — not for building rehabilitation. {{ADDRESS}} does not hold a qualifying collection.',
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
  },
  {
    id: 'sf-shines',
    name: 'SF Shines Façade Improvement Program',
    type: 'Local',
    estValue: '$2,000–$20,000',
    estValueNum: 0,
    useFor: 'Facade improvements for small businesses in San Francisco commercial corridors',
    status: 'ineligible',
    ineligibleReason: 'SF Shines is a City of San Francisco program exclusively for businesses located within San Francisco city limits. Verify whether {{CITY}} is within San Francisco jurisdiction.',
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
  },
]

export const loadingSteps = [
  'Geocoding {{ADDRESS}}, {{CITY}}…',
  'Checking historic district boundaries…',
  'Confirming National Register listing status…',
  'Looking up federal Historic Tax Credit eligibility…',
  'Searching California State Historic Tax Credit programs…',
  'Reviewing Mills Act participation…',
  'Checking California Historical Building Code applicability…',
  'Scanning local historic preservation funds…',
  'Looking up SBA small business financing programs…',
  'Checking NEH and cultural institution grants…',
  'Screening Bay Area local grant programs…',
  'Building your grant workbook…',
]
