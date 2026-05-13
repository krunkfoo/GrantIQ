import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="font-mono text-lg font-medium text-ink">Grant<span className="text-clay">IQ</span></span>
      </div>
      <SignUp />
    </div>
  )
}
