import { auth } from '../../auth.js'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = ['natu.raj@gmail.com']

export default async function AdminLayout({ children }) {
  const session = await auth()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect('/')
  }
  return (
    <div style={{ fontFamily: 'var(--font-sans)', minHeight: '100vh', background: '#faf9f7' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 24px', height: 48,
        background: '#1a1917', borderBottom: '1px solid #2a2927',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 4, background: '#b89878',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#fff',
        }}>iQ</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
          GrantIQ Admin
        </span>
        <div style={{
          marginLeft: 8, background: '#b89878', color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          ⚡ God mode
        </div>
        <div style={{ flex: 1 }} />
        <a href="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
          ← Back to app
        </a>
      </header>
      {children}
    </div>
  )
}
