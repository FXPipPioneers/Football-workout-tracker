import WorkoutCard from '../WorkoutCard'

export default function WorkoutCardExample() {
  return (
    <WorkoutCard
      day="MONDAY"
      title="Passing + Lower Strength + Plyo"
      duration="~1h45min"
      location="Pitch → Gym"
      equipment="Ball, cones, wall, barbell/dumbbells, plyo box, mat"
      blocks={[
        {
          title: "Warm-up",
          duration: "10m",
          exercises: [
            { name: "Dynamic stretching", notes: "Light jogging, leg swings, hip circles" }
          ]
        },
        {
          title: "Passing Block",
          duration: "20m",
          exercises: [
            { name: "Wall passes 5m", sets: "2", reps: "25 L | 25 R", rest: "30-60s" },
            { name: "Driven passes 20m", sets: "3", reps: "8 L | 8 R", rest: "30-60s" },
            { name: "Cone dribble → pass", sets: "3", reps: "10 L | 10 R", rest: "30-60s" }
          ]
        },
        {
          title: "Gym Lower Strength",
          duration: "50m",
          exercises: [
            { name: "Squat", sets: "4", reps: "6", rest: "3m", notes: "@ 75-80%" },
            { name: "Bulgarian Split Squat", sets: "3", reps: "8/leg", rest: "90s" },
            { name: "RDL", sets: "3", reps: "8", rest: "90s" },
            { name: "Calf Raise", sets: "3", reps: "15", rest: "60s" },
            { name: "Nordic Curl", sets: "2", reps: "6-8", rest: "90s" }
          ]
        }
      ]}
    />
  )
}
