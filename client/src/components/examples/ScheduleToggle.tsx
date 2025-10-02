import ScheduleToggle from '../ScheduleToggle'
import { useState } from 'react'

export default function ScheduleToggleExample() {
  const [mode, setMode] = useState<"solo" | "friend">("solo")

  return (
    <div className="p-8">
      <ScheduleToggle mode={mode} onChange={setMode} />
      <p className="mt-4 text-sm text-muted-foreground">
        Current mode: <span className="font-semibold">{mode}</span>
      </p>
    </div>
  )
}
