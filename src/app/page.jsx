export const dynamic = 'force-dynamic'

import { auth } from '../auth.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: '#faf9f7', color: '#1a1917', minHeight: '100vh' }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
        borderBottom: '1px solid #e7e5e4', background: '#faf9f7',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>
          <div style={{
            width: 24, height: 24, borderRadius: 5, background: '#1a1917',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em',
          }}>iQ</div>
          GrantIQ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/demo" style={{ fontSize: 13, color: '#6b6966', textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
            Demo
          </Link>
          <Link href="/sign-in" style={{ fontSize: 13, color: '#6b6966', textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{
            fontSize: 13, fontWeight: 500, color: '#fff',
            background: '#1a1917', textDecoration: 'none',
            padding: '7px 14px', borderRadius: 7,
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '96px 32px 80px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#ede4d8', border: '1px solid #d4c0a8',
          borderRadius: 20, padding: '5px 12px', marginBottom: 32,
          fontSize: 12, fontWeight: 500, color: '#8a6e52',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b89878', display: 'inline-block' }} />
          Historic buildings · Commercial rehab · Small business
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 600,
          lineHeight: 1.08, letterSpacing: '-0.03em',
          color: '#1a1917', margin: '0 0 24px',
        }}>
          Every grant your property<br />qualifies for — researched<br />
          <span style={{ color: '#b89878' }}>and ready to send.</span>
        </h1>

        <p style={{
          fontSize: 17, color: '#6b6966', lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 40px',
        }}>
          Enter your address and project scope. GrantIQ screens every federal, state,
          and local incentive program and returns a workbook with eligible grants,
          estimated values, and pre-drafted outreach emails — in under two minutes.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/sign-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#1a1917', color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 500, padding: '11px 22px', borderRadius: 8,
          }}>
            Screen my property →
          </Link>
          <Link href="/demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#fff', color: '#6b6966', textDecoration: 'none',
            fontSize: 14, padding: '11px 22px', borderRadius: 8,
            border: '1px solid #e7e5e4',
          }}>
            See a live example
          </Link>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: '#a09e9b' }}>
          Free to start · No credit card
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4', background: '#fff' }}>
        <div style={{
          maxWidth: 760, margin: '0 auto', padding: '28px 32px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          textAlign: 'center',
        }}>
          {[
            { num: '40+', label: 'programs screened per property' },
            { num: '$320K', label: 'median eligible value found' },
            { num: '< 2 min', label: 'from address to workbook' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '0 24px',
              borderRight: i < 2 ? '1px solid #e7e5e4' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600, color: '#b89878', letterSpacing: '-0.02em' }}>
                {s.num}
              </div>
              <div style={{ fontSize: 12.5, color: '#a09e9b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a09e9b', marginBottom: 12 }}>
            How it works
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            From address to funded in three steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              n: '01',
              title: 'Describe your property',
              body: 'Enter your address, property type, and what you\'re planning to do. The more detail you give, the more programs we can match.',
            },
            {
              n: '02',
              title: 'AI screens every program',
              body: 'GrantIQ checks federal, state, and local incentives against your exact address, jurisdiction, and project scope — and explains why ineligible programs don\'t apply.',
            },
            {
              n: '03',
              title: 'Send the first email today',
              body: 'Each eligible grant comes with a pre-written outreach email to the right program contact, using your actual address and scope. Edit and send in minutes.',
            },
          ].map(step => (
            <div key={step.n} style={{
              background: '#fff', border: '1px solid #e7e5e4',
              borderRadius: 12, padding: '24px 20px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: '#b89878', marginBottom: 14,
              }}>
                {step.n}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {step.title}
              </div>
              <div style={{ fontSize: 13.5, color: '#6b6966', lineHeight: 1.65 }}>
                {step.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's in the workbook ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a09e9b', marginBottom: 12 }}>
              What you get
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              A complete grant workbook
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              {
                title: 'Eligibility screening',
                body: 'Every program checked against your actual address, property type, and project scope. Ineligible programs are shown with exact reasons.',
              },
              {
                title: 'Estimated values',
                body: 'Dollar ranges for every eligible program. Sorted highest to lowest so you know where to focus first.',
              },
              {
                title: 'Pre-drafted outreach emails',
                body: 'Each grant comes with a ready-to-send email to the right program contact, written using your address and project scope.',
              },
              {
                title: 'Step-by-step guidance',
                body: 'Click any application step for specific, actionable instructions on how to complete it for your property.',
              },
              {
                title: 'Consultant recommendations',
                body: 'For grants that need professional help — tax credit consultants, engineers, grant writers — GrantIQ surfaces the right firms.',
              },
              {
                title: 'Pre-application checklist',
                body: 'Track what you\'ve gathered for each grant. Check items off as you go and see what\'s still blocking you.',
              },
            ].map(f => (
              <div key={f.title} style={{
                padding: '18px 20px',
                border: '1px solid #e7e5e4', borderRadius: 10,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 5, background: '#ede4d8',
                  display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="#8a6e52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4, letterSpacing: '-0.01em' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b6966', lineHeight: 1.6 }}>
                    {f.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a09e9b', marginBottom: 12 }}>
            Built for
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            Who GrantIQ helps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            {
              icon: '🏛️',
              title: 'Historic property owners',
              body: 'Hotels, theaters, storefronts, warehouses. Federal and state historic tax credits can cover 20–45% of qualified rehabilitation costs.',
            },
            {
              icon: '🏗️',
              title: 'Commercial rehab projects',
              body: 'Seismic upgrades, facade restoration, ADA compliance, mixed-use conversion. Dozens of programs exist specifically for these scopes.',
            },
            {
              icon: '🏪',
              title: 'Small business owners',
              body: 'SBA 504 loans, CDFI programs, local façade grants, Main Street incentives. Most small business owners leave significant funding on the table.',
            },
          ].map(c => (
            <div key={c.title} style={{
              background: '#fff', border: '1px solid #e7e5e4',
              borderRadius: 12, padding: '28px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {c.title}
              </div>
              <div style={{ fontSize: 13, color: '#6b6966', lineHeight: 1.65 }}>
                {c.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo callout ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{
          background: '#fff', border: '1px solid #e7e5e4', borderRadius: 14,
          padding: '36px 40px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a09e9b', marginBottom: 8 }}>
              Live demo
            </div>
            <div style={{ fontWeight: 600, fontSize: 19, letterSpacing: '-0.015em', marginBottom: 6 }}>
              Hotel Mac · Point Richmond, CA
            </div>
            <div style={{ fontSize: 13.5, color: '#6b6966', lineHeight: 1.6, maxWidth: 400 }}>
              A real 1912 historic hotel — seismic upgrade, facade restoration, boutique
              lodging conversion. See the full grant workbook with eligible programs,
              estimated values, and ready-to-send emails.
            </div>
          </div>
          <Link href="/demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#1a1917', color: '#fff', textDecoration: 'none',
            fontSize: 13, fontWeight: 500, padding: '10px 20px', borderRadius: 8,
            flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            Open demo workbook →
          </Link>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{
        background: '#1a1917', color: '#fff',
        textAlign: 'center', padding: '80px 32px',
      }}>
        <h2 style={{
          fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600,
          letterSpacing: '-0.025em', margin: '0 0 14px', color: '#fff',
        }}>
          Start with your property address.
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px', lineHeight: 1.6 }}>
          Free to use. Results in under two minutes.
        </p>
        <Link href="/sign-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#b89878', color: '#fff', textDecoration: 'none',
          fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 8,
          letterSpacing: '-0.01em',
        }}>
          Screen my property →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#1a1917', color: 'rgba(255,255,255,0.3)',
        padding: '22px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
          GrantIQ
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/demo" style={{ color: 'inherit', textDecoration: 'none' }}>Demo</Link>
          <Link href="/sign-in" style={{ color: 'inherit', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/sign-up" style={{ color: 'inherit', textDecoration: 'none' }}>Sign up</Link>
        </div>
      </footer>

    </div>
  )
}
