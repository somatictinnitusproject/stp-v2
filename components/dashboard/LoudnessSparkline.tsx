'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

type LogPoint = { loudness: number; log_date: string }

export default function LoudnessSparkline({ logs }: { logs: LogPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={logs} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Line
          type="monotone"
          dataKey="loudness"
          stroke="#4A9B8E"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
