import WorkoutHistory from '../WorkoutHistory'

export default function WorkoutHistoryExample() {
  const items = [
    {
      id: "1",
      date: "Dec 28",
      day: "MONDAY",
      title: "Passing + Lower Strength + Plyo",
      completion: 100,
      completed: true
    },
    {
      id: "2",
      date: "Dec 27",
      day: "SUNDAY",
      title: "Skill Moves & Ball Mastery",
      completion: 85,
      completed: true
    },
    {
      id: "3",
      date: "Dec 26",
      day: "SATURDAY",
      title: "Expanded Technical Day",
      completion: 60,
      completed: false
    }
  ]

  return <WorkoutHistory items={items} />
}
