import StatCard from '../StatCard'
import { TrendingUp, Target, Flame, Calendar } from 'lucide-react'

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Completion"
        value="85%"
        subtitle="This week"
        icon={TrendingUp}
        trend={{ value: "12%", positive: true }}
      />
      <StatCard
        title="Streak"
        value="12"
        subtitle="days"
        icon={Flame}
      />
      <StatCard
        title="L/R Balance"
        value="78%"
        subtitle="Right accuracy"
        icon={Target}
      />
      <StatCard
        title="Workouts"
        value="24"
        subtitle="This month"
        icon={Calendar}
      />
    </div>
  )
}
