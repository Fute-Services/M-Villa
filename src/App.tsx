import { useReducer, useState } from 'react'
import { Dialog } from './components/Dialog'
import { EnquiryDialog } from './components/EnquiryDialog'
import { IntroOverlay } from './components/IntroOverlay'
import { SceneViewport } from './components/SceneViewport'
import { SideMenu } from './components/SideMenu'
import { usePersistentState } from './hooks/usePersistentState'
import { INITIAL_PAN, PanContext, type Pan } from './lib/pan'
import { initialTourState, sceneBackground, tourReducer, type SceneId, type TimeOfDay } from './scenes'
import { AmenitiesView } from './views/AmenitiesView'
import { BrochureView } from './views/BrochureView'
import { HomeView } from './views/HomeView'
import { LocationView } from './views/LocationView'
import { InventoryView } from './views/InventoryView'
import { StreetView } from './views/StreetView'

const isWideViewport = () => window.matchMedia('(min-width: 769px)').matches

type DialogName = 'enquiry' | 'guide' | null

export default function App() {
  const [savedTime, setSavedTime] = usePersistentState<TimeOfDay>('greenz.timeOfDay', 'day')
  const [state, dispatch] = useReducer(tourReducer, initialTourState, (s) => ({
    ...s,
    timeOfDay: (savedTime === 'night' ? 'night' : 'day') as TimeOfDay,
    menuOpen: isWideViewport(),
  }))
  const [dialog, setDialog] = useState<DialogName>(null)
  const [pan, setPan] = useState<Pan>(INITIAL_PAN)
  const { scene, timeOfDay, menuOpen } = state

  const [navTick, setNavTick] = useState(0)

  const goto = (next: SceneId) => {
    setPan(INITIAL_PAN)
    if (next === scene) setNavTick((t) => t + 1) // choosing the scene you are already in resets it (e.g. back to the street aerial)
    dispatch({
      type: 'goto',
      scene: next,
      // Observed: the menu collapses after choosing Amenities. On narrow screens it always collapses (inferred).
      menuOpen: next === 'amenities' || !isWideViewport() ? false : true,
    })
  }

  const setTime = (t: TimeOfDay) => {
    dispatch({ type: 'setTimeOfDay', timeOfDay: t })
    setSavedTime(t)
  }

  return (
    <PanContext.Provider value={pan}>
      <SceneViewport
        src={sceneBackground(scene, timeOfDay)}
        label={`Greenz by Danube, ${scene}`}
        scene={scene === 'intro' ? 'home' : scene}
        pan={pan}
        onPanChange={setPan}
      />

      {scene === 'intro' ? (
        <IntroOverlay onExplore={() => goto('home')} onConnect={() => setDialog('guide')} />
      ) : (
        <>
          <SideMenu
            scene={scene}
            open={menuOpen}
            onOpenChange={(open) => dispatch({ type: 'setMenuOpen', open })}
            onNavigate={goto}
            onToggleTimeOfDay={() => setTime(timeOfDay === 'day' ? 'night' : 'day')}
            onGuide={() => setDialog('guide')}
          />
          {scene === 'home' && <HomeView timeOfDay={timeOfDay} onTimeOfDayChange={setTime} />}
          {scene === 'location' && <LocationView onClose={() => goto('home')} />}
          {scene === 'amenities' && <AmenitiesView />}
          {scene === 'street-view' && <StreetView onBack={() => goto('home')} resetSignal={navTick} />}
          {scene === 'inventory' && (
            <InventoryView onOpenType={() => dispatch({ type: 'setMenuOpen', open: false })} resetSignal={navTick} />
          )}
          {scene === 'brochure' && <BrochureView onClose={() => goto('home')} />}
        </>
      )}

      {dialog === 'enquiry' && <EnquiryDialog onClose={() => setDialog(null)} />}
      {dialog === 'guide' && (
        <Dialog
          title="Live guided session"
          onClose={() => setDialog(null)}
          actions={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setDialog(null)}>
                Close
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setDialog('enquiry')}>
                Enquire now
              </button>
            </>
          }
        >
          <p>
            Live guided sessions need a video-call service, which this offline demo does not include. To speak to
            the sales team, call +971 800 57 57 or use Enquire now.
          </p>
        </Dialog>
      )}
    </PanContext.Provider>
  )
}
