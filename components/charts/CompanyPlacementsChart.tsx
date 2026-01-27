'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CompanyPlacementsChartProps {
    data: Array<{ companyName: string; year: number; placedCount: number }>
    year: number
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function CompanyPlacementsChart({ data, year }: CompanyPlacementsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                No company data available for {year}
            </div>
        )
    }

    // Sort by placedCount descending and take top 10
    const chartData = [...data]
        .sort((a, b) => b.placedCount - a.placedCount)
        .slice(0, 10)

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="companyName"
                    type="category"
                    stroke="#6b7280"
                    width={100}
                    style={{ fontSize: '12px' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`${value} placements`, 'Placed Count']}
                />
                <Bar
                    dataKey="placedCount"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
