import CheckinForm from '../CheckinForm'

export default function CheckinFormExample() {
  return (
    <CheckinForm
      onSubmit={(data) => console.log('Check-in submitted:', data)}
    />
  )
}
