'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { fetchApi } from '@/lib/api'
import { Loader2, ArrowUpRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import { useRouter } from 'next/navigation'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

interface Stats {
    counts: {
        households: number
        residents: number
        fees: number
        temporaryResidences: number
        temporaryAbsences: number
    }
    financials: {
        monthlyRevenue: number
        revenueByType: Record<string, number>
        displayMonthName?: string
        monthlyTrend?: {
            labels: string[]
            data: number[]
        }
    }
    recentPayments: Array<{
        _id: string
        household?: {
            apartmentNumber: string
        }
        fee?: {
            name: string
        }
        amount: number
        paymentDate: string
    }>
}

export default function DashboardPage() {
    const { token } = useAuth()
    const [stats, setStats] = useState<Stats>({
        counts: {
            households: 0,
            residents: 0,
            fees: 0,
            temporaryResidences: 0,
            temporaryAbsences: 0
        },
        financials: {
            monthlyRevenue: 0,
            revenueByType: {}
        },
        recentPayments: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!token) {
                    return
                }

                const data = await fetchApi('/api/statistics/dashboard')
                setStats(data)
            } catch (error: any) {
                setError('Không thể tải dữ liệu tổng quan')
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [token])

    // Generate monthly trend data
    const monthlyTrend = useMemo(() => {
        if (stats.financials.monthlyTrend) {
            return {
                labels: stats.financials.monthlyTrend.labels,
                datasets: [
                    {
                        label: 'Doanh Thu Hàng Tháng',
                        data: stats.financials.monthlyTrend.data,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.3,
                    },
                ],
            }
        }

        const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6']
        const baseValue = stats.financials.monthlyRevenue || 10000000
        const data = months.map((_, index) => {
            const factor = 0.8 + ((index % 3) * 0.15)
            return Math.floor(baseValue * factor)
        })

        return {
            labels: months,
            datasets: [
                {
                    label: 'Doanh Thu Hàng Tháng',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.3,
                },
            ],
        }
    }, [stats.financials.monthlyRevenue, stats.financials.monthlyTrend])

    // Prepare data for revenue by fee type chart
    const revenueByTypeData = useMemo(() => {
        const colors = {
            backgroundColor: [
                'rgba(16, 185, 129, 0.7)',  // Xanh emerald
                'rgba(245, 158, 11, 0.7)',  // Amber
                'rgba(99, 102, 241, 0.7)',  // Indigo
                'rgba(239, 68, 68, 0.7)',   // Red
                'rgba(168, 85, 247, 0.7)',  // Purple
                'rgba(14, 165, 233, 0.7)',  // Sky
                'rgba(251, 191, 36, 0.7)'   // Amber light
            ],
            borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(99, 102, 241, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(14, 165, 233, 1)',
                'rgba(251, 191, 36, 1)'
            ]
        }

        const revenueEntries = Object.entries(stats.financials.revenueByType)
            .filter(([_, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])

        const labels = revenueEntries.map(([label, value]) =>
            `${label}: ${value.toLocaleString()} VND`
        )
        const values = revenueEntries.map(([_, value]) => value)

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Doanh Thu Tháng Hiện Tại',
                    data: values,
                    backgroundColor: colors.backgroundColor.slice(0, labels.length),
                    borderColor: colors.borderColor.slice(0, labels.length),
                    borderWidth: 1,
                },
            ],
        }
    }, [stats.financials.revenueByType])

    // Prepare data for counts comparison chart
    const countsComparisonData = useMemo(() => ({
        labels: ['Hộ Gia Đình', 'Cư Dân'],
        datasets: [
            {
                label: 'Số Lượng',
                data: [
                    stats.counts.households,
                    stats.counts.residents
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 1,
            },
        ],
    }), [stats.counts.households, stats.counts.residents])

    // Chart options
    const pieChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: false,
                text: `Tỷ lệ doanh thu ${stats.financials.displayMonthName || 'tháng hiện tại'} theo loại phí`,
                font: {
                    size: 14,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const value = context.raw || 0
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                        const percentage = Math.round((value / total) * 100)
                        return `${value.toLocaleString()} VND (${percentage}%)`
                    },
                    title: function (context: any) {
                        const fullLabel = context[0].label
                        const feeTypeName = fullLabel.split(':')[0]
                        return feeTypeName
                    }
                }
            }
        }
    }), [stats.financials.displayMonthName])

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false,
                text: 'Số lượng đối tượng quản lý',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 6,
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        const value = context.raw || 0
                        return `${value.toLocaleString()} VND`
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    callback: (value: any) => `${Number(value).toLocaleString()} ₫`
                },
                beginAtZero: true
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải dữ liệu tổng quan...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển Quản Lý</h1>
                    <p className="text-gray-600 mt-1">Xem tổng quan về thông tin và số liệu thống kê của khu vực</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Thống kê nhanh - Thẻ Số Liệu */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Thẻ Hộ Gia Đình */}
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-5">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h5 className="text-lg font-semibold text-blue-100">Hộ Gia Đình</h5>
                                    <p className="text-3xl font-bold mt-1">{stats.counts.households}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-400/30 rounded-full flex items-center justify-center">
                                    <i className="fas fa-home text-2xl"></i>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/households')}
                                className="text-sm mt-2 py-1 px-2 bg-blue-600/40 hover:bg-blue-600/60 rounded-md inline-flex items-center transition-all"
                            >
                                Xem Chi Tiết
                                <i className="fas fa-arrow-right ml-1 text-xs"></i>
                            </button>
                        </div>
                    </Card>
                    
                    {/* Thẻ Cư Dân */}
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-5">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h5 className="text-lg font-semibold text-purple-100">Cư Dân</h5>
                                    <p className="text-3xl font-bold mt-1">{stats.counts.residents}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-400/30 rounded-full flex items-center justify-center">
                                    <i className="fas fa-users text-2xl"></i>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/residents')}
                                className="text-sm mt-2 py-1 px-2 bg-purple-600/40 hover:bg-purple-600/60 rounded-md inline-flex items-center transition-all"
                            >
                                Xem Chi Tiết
                                <i className="fas fa-arrow-right ml-1 text-xs"></i>
                            </button>
                        </div>
                    </Card>
                    
                    {/* Thẻ Loại Phí */}
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-5">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h5 className="text-lg font-semibold text-amber-100">Loại Phí</h5>
                                    <p className="text-3xl font-bold mt-1">{stats.counts.fees}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-400/30 rounded-full flex items-center justify-center">
                                    <i className="fas fa-file-invoice-dollar text-2xl"></i>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/fees')}
                                className="text-sm mt-2 py-1 px-2 bg-amber-600/40 hover:bg-amber-600/60 rounded-md inline-flex items-center transition-all"
                            >
                                Xem Chi Tiết
                                <i className="fas fa-arrow-right ml-1 text-xs"></i>
                            </button>
                        </div>
                    </Card>
                    
                    {/* Thẻ Doanh Thu */}
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h5 className="text-lg font-semibold text-emerald-100">Doanh Thu</h5>
                                    <p className="text-3xl font-bold mt-1">
                                        {stats.financials.monthlyRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-400/30 rounded-full flex items-center justify-center">
                                    <i className="fas fa-chart-line text-2xl"></i>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-white/80 bg-emerald-600/40 py-1 px-2 rounded-md">
                                    {stats.financials.displayMonthName || "Tháng hiện tại"}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Hàng 2 - Biểu đồ Thống kê */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Thẻ Biểu đồ cột - Số lượng hộ gia đình và cư dân */}
                    <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-blue-500">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h5 className="text-xl font-semibold text-gray-800">Thống kê dân cư</h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Số lượng hộ gia đình và cư dân trong khu vực
                                    </p>
                                </div>
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                                    <i className="fas fa-chart-bar text-xl"></i>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mt-2">
                                <div className="h-[300px]">
                                    <Bar data={{
                                        labels: ['Hộ Gia Đình', 'Cư Dân'],
                                        datasets: [
                                            {
                                                label: 'Số Lượng',
                                                data: [
                                                    stats.counts.households,
                                                    stats.counts.residents
                                                ],
                                                backgroundColor: [
                                                    'rgba(59, 130, 246, 0.7)', // Màu xanh dương đậm hơn cho hộ gia đình
                                                    'rgba(139, 92, 246, 0.7)'  // Màu tím phù hợp với thẻ cư dân
                                                ],
                                                borderColor: [
                                                    'rgba(59, 130, 246, 1)',
                                                    'rgba(139, 92, 246, 1)'
                                                ],
                                                borderWidth: 1,
                                            },
                                        ],
                                    }} options={barChartOptions} />
                                </div>
                            </div>
                            <div className="flex justify-between mt-4">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-[rgba(59,130,246,0.7)] rounded-full inline-block mr-1"></span>
                                    <span className="text-sm text-gray-600">Hộ gia đình: {stats.counts.households}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-[rgba(139,92,246,0.7)] rounded-full inline-block mr-1"></span>
                                    <span className="text-sm text-gray-600">Cư dân: {stats.counts.residents}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                
                    {/* Thẻ Biểu đồ tròn - Tỷ lệ doanh thu */}
                    <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-emerald-500">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h5 className="text-xl font-semibold text-gray-800">Tỷ lệ doanh thu</h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {stats.financials.displayMonthName || "Tháng hiện tại"} (theo loại phí)
                                    </p>
                                </div>
                                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                                    <i className="fas fa-chart-pie text-xl"></i>
                                </div>
                            </div>
                            {Object.keys(stats.financials.revenueByType).length === 0 ? (
                                <div className="bg-gray-50 rounded-lg p-8 mt-2 flex flex-col items-center justify-center h-[300px]">
                                    <i className="fas fa-chart-pie text-4xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500 text-center">Không có dữ liệu doanh thu tháng này</p>
                                    <p className="text-sm text-gray-400 text-center mt-2">Dữ liệu sẽ được hiển thị khi có phát sinh thanh toán</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                                    <div className="h-[300px]">
                                        <Pie data={{
                                            labels: revenueByTypeData.labels,
                                            datasets: [
                                                {
                                                    label: 'Doanh Thu Tháng Hiện Tại',
                                                    data: revenueByTypeData.datasets[0].data,
                                                    backgroundColor: [
                                                        'rgba(16, 185, 129, 0.7)',  // Xanh emerald
                                                        'rgba(245, 158, 11, 0.7)',  // Amber 
                                                        'rgba(99, 102, 241, 0.7)',  // Indigo
                                                        'rgba(239, 68, 68, 0.7)',   // Red
                                                        'rgba(168, 85, 247, 0.7)',  // Purple
                                                        'rgba(14, 165, 233, 0.7)',  // Sky
                                                        'rgba(251, 191, 36, 0.7)'   // Amber light
                                                    ],
                                                    borderColor: [
                                                        'rgba(16, 185, 129, 1)',
                                                        'rgba(245, 158, 11, 1)',
                                                        'rgba(99, 102, 241, 1)',
                                                        'rgba(239, 68, 68, 1)',
                                                        'rgba(168, 85, 247, 1)',
                                                        'rgba(14, 165, 233, 1)',
                                                        'rgba(251, 191, 36, 1)'
                                                    ],
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }} options={pieChartOptions} />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between mt-4 text-sm text-gray-600">
                                <div>Tổng doanh thu: <span className="font-medium">{stats.financials.monthlyRevenue.toLocaleString()} VND</span></div>
                                <button
                                    onClick={() => router.push('/payments')}
                                    className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center"
                                >
                                    Chi tiết
                                    <i className="fas fa-arrow-right ml-1 text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Hàng 3 - Biểu đồ doanh thu */}
                {/* <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-indigo-500 mb-8">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h5 className="text-xl font-semibold text-gray-800">Biểu Đồ Doanh Thu</h5>
                                <p className="text-sm text-gray-500 mt-1">Doanh thu 6 tháng gần nhất</p>
                            </div>
                            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                                <i className="fas fa-chart-line text-xl"></i>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mt-2">
                            <div className="h-[300px]">
                                <Line 
                                    data={{
                                        labels: monthlyTrend.labels,
                                        datasets: [{
                                            ...monthlyTrend.datasets[0],
                                            borderColor: 'rgb(79, 70, 229)',
                                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                            borderWidth: 2,
                                            pointBackgroundColor: 'rgb(79, 70, 229)',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 1,
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            fill: true,
                                            tension: 0.3,
                                        }]
                                    }} 
                                    options={lineChartOptions} 
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-4 items-center">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full inline-block mr-1"></span>
                                <span className="text-sm text-gray-600">Tổng doanh thu: <span className="font-medium">{monthlyTrend.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()} VND</span></span>
                            </div>
                            <button
                                onClick={() => router.push('/payments')}
                                className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center text-sm"
                            >
                                Xem chi tiết
                                <i className="fas fa-arrow-right ml-1 text-xs"></i>
                            </button>
                        </div>
                    </div>
                </Card> */}

                {/* Hàng 4 - Giao dịch gần đây */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-pink-500">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h5 className="text-xl font-semibold text-gray-800">Phí Đã Thanh Toán Gần Đây</h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Các giao dịch thanh toán đã xác nhận
                                    </p>
                                </div>
                                <div className="bg-pink-100 text-pink-600 p-2 rounded-full">
                                    <i className="fas fa-receipt text-xl"></i>
                                </div>
                            </div>
                    
                            {stats.recentPayments.length === 0 ? (
                                <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center h-[200px]">
                                    <i className="fas fa-file-invoice-dollar text-4xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500 text-center">Không tìm thấy thanh toán gần đây</p>
                                    <p className="text-sm text-gray-400 text-center mt-2">Các khoản thanh toán sẽ hiển thị ở đây khi phát sinh</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 border-b">
                                                        Hộ Gia Đình
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 border-b">
                                                        Loại Phí
                                                    </th>
                                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 border-b">
                                                        Số Tiền
                                                    </th>
                                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 border-b">
                                                        Ngày
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentPayments.map((payment) => (
                                                    <tr key={payment._id} className="border-b border-gray-100 hover:bg-white transition-colors">
                                                        <td className="py-3 px-4 text-sm">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 flex-shrink-0">
                                                                    <i className="fas fa-home text-xs"></i>
                                                                </div>
                                                                <span className="font-medium">{payment.household?.apartmentNumber || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            {payment.fee?.name || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                                                            {payment.amount.toLocaleString()} VND
                                                        </td>
                                                        <td className="py-3 px-4 text-xs text-center text-gray-500">
                                                            {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                    
                            <div className="flex justify-between mt-4 text-sm">
                                <span className="text-gray-500">
                                    Tổng: <span className="font-medium text-gray-700">{stats.recentPayments.length} giao dịch</span>
                                </span>
                                <button
                                    onClick={() => router.push('/payments')}
                                    className="text-pink-600 hover:text-pink-800 transition-colors flex items-center"
                                >
                                    Xem tất cả thanh toán
                                    <i className="fas fa-arrow-right ml-1 text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}