import QuickLogModal from '../QuickLogModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function QuickLogModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)} data-testid="button-open-modal">
        Open Quick Log
      </Button>
      <QuickLogModal
        open={open}
        onOpenChange={setOpen}
        exerciseName="Squat 4×6 @ 75-80%"
        onSave={(data) => console.log('Logged:', data)}
      />
    </div>
  )
}
