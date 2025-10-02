import ProgressRing from '../ProgressRing'

export default function ProgressRingExample() {
  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <ProgressRing progress={75} label="Complete" />
      <ProgressRing progress={92} size={100} strokeWidth={6} value="92%" />
    </div>
  )
}
