import { useState } from 'react'
import PropertyIntake from './components/PropertyIntake'
import LoadingResearch from './components/LoadingResearch'
import GrantWorkbook from './components/GrantWorkbook'
import TweaksPanel from './components/TweaksPanel'

const SCREEN_ORDER = ['intake', 'loading', 'workbook']

export default function App() {
  const [screen, setScreen] = useState('intake')
  const [demoMode, setDemoMode] = useState(false)
  const [tweaks, setTweaks] = useState({
    density: 'normal',
    sidebarCounts: true,
    accent: '#b89878',
  })

  const goNext = () => {
    const idx = SCREEN_ORDER.indexOf(screen)
    if (idx < SCREEN_ORDER.length - 1) setScreen(SCREEN_ORDER[idx + 1])
  }

  const activateDemo = () => {
    setDemoMode(true)
    setScreen('loading')
  }

  return (
    <div style={{ '--clay': tweaks.accent }}>
      {screen === 'intake' && <PropertyIntake onSubmit={goNext} onDemo={activateDemo} />}
      {screen === 'loading' && <LoadingResearch onComplete={goNext} demo={demoMode} />}
      {screen === 'workbook' && <GrantWorkbook tweaks={tweaks} demo={demoMode} onReset={() => { setDemoMode(false); setScreen('intake') }} />}

      <TweaksPanel
        currentScreen={screen}
        onJumpTo={setScreen}
        tweaks={tweaks}
        onTweaksChange={setTweaks}
        demo={demoMode}
      />
    </div>
  )
}
