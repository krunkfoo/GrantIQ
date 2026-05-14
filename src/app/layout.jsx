import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import '../index.css'

export const metadata = {
  title: 'GrantIQ — Grant intelligence for historic properties',
  description: 'Screen every federal, state, and local incentive for your historic property.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
