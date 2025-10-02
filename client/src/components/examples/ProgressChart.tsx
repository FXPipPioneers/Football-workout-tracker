import ProgressChart from '../ProgressChart'

export default function ProgressChartExample() {
  const data = [
    { date: "Dec 15", value: 65 },
    { date: "Dec 18", value: 72 },
    { date: "Dec 21", value: 78 },
    { date: "Dec 24", value: 75 },
    { date: "Dec 27", value: 85 },
    { date: "Dec 30", value: 92 }
  ]

  return <ProgressChart title="Weekly Completion Rate" data={data} />
}
