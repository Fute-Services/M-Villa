import { useEffect } from 'react'
import type { TimeOfDay } from '../scenes'
import { FLAT_FILES } from '../data/panoramas'
import { SegmentedToggle } from '../components/Controls'
import { WeatherWidget } from '../components/WeatherWidget'
import './views.css'

interface Props {
  timeOfDay: TimeOfDay
  onTimeOfDayChange: (t: TimeOfDay) => void
}

export function HomeView({ timeOfDay, onTimeOfDayChange }: Props) {
  // Warm the cache with the other time of day so the blur dissolve starts instantly.
  useEffect(() => {
    const other = timeOfDay === 'day' ? FLAT_FILES.masterplanNight : FLAT_FILES.masterplanDay
    if (other) new Image().src = other
  }, [timeOfDay])

  return (
    <>
      <WeatherWidget />
      <div className="view-bottom-center">
        <SegmentedToggle
          label="Time of day"
          value={timeOfDay}
          onChange={onTimeOfDayChange}
          options={[
            { value: 'day', label: 'Day View', icon: 'sun' },
            { value: 'night', label: 'Night View', icon: 'moon' },
          ]}
        />
      </div>
    </>
  )
}
