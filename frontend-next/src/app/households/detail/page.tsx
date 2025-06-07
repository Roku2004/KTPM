'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { fetchApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Users, CreditCard, Plus, Eye, Edit, History } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from 'sonner'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Household {
    _id: string
    apartmentNumber: string
    address: string
    householdHead?: {
        _id: string
        fullName: string
    }
    active: boolean
    creationDate: string
    note?: string
}

interface Resident {
    _id: string
    fullName: string
    dateOfBirth: string
    gender: string
    relationship: string
    phoneNumber?: string
    active: boolean
    idCard?: string
    idCardDate?: string
    idCardPlace?: string
    placeOfBirth?: string
    nationality?: string
    ethnicity?: string
    religion?: string
    occupation?: string
    workplace?: string
    household?: {
        _id: string
        apartmentNumber: string
    }
}

interface FeeStatus {
    _id: string
    name: string
    amount: number
    currentMonthStatus: 'paid' | 'pending' | 'overdue'
    lastMonthStatus?: 'paid' | 'pending' | 'overdue'
}

export default function HouseholdDetailPage() {
    const [household, setHousehold] = useState<Household | null>(null)
    const [residents, setResidents] = useState<Resident[]>([])
    const [feeStatus, setFeeStatus] = useState<FeeStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const householdId = searchParams.get('id')
    const { user, token } = useAuth()

    useEffect(() => {
        if (!user || !token) {
            router.push('/login')
            return
        }
        if (!householdId) {
            router.push('/households')
            return
        }
        fetchHouseholdData()
    }, [user, token, householdId])

    const fetchHouseholdData = async () => {
        try {
            setLoading(true)

            // Gọi các API song song để tối ưu thời gian tải
            const [householdData, residentsData, feeStatusData] = await Promise.all([
                fetchApi(`/api/households/${householdId}`),
                fetchApi(`/api/households/${householdId}/residents`),
                fetchApi(`/api/payments/household/${householdId}/fee-status`)
            ])

            setHousehold(householdData)
            setResidents(residentsData)
            setFeeStatus(feeStatusData.feeStatus)

        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể tải dữ liệu hộ gia đình'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleAddResident = () => {
        router.push(`/residents/create?household=${household?._id}`)
    }

    const handleCreatePayment = (feeId: string, isDebt: boolean = false) => {
        router.push(`/payments/create?household=${household?._id}&fee=${feeId}&isDebt=${isDebt}`)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Chưa thanh toán</Badge>
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-800">Không áp dụng</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const handleViewResidentDetails = async (id: string) => {
        try {
            setLoading(true)
            const { data } = await fetchApi(`/api/residents/${id}`)
            setSelectedResident(data)
            setIsDetailModalOpen(true)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể tải thông tin cư dân'
            )
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="fixed top-0 left-0 h-screen">
                    <Sidebar />
                </div>
                <div className="flex-1 ml-64 p-8">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                </div>
            </div>
        )
    }

    if (!household) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="fixed top-0 left-0 h-screen">
                    <Sidebar />
                </div>
                <div className="flex-1 ml-64 p-8">
                    <div className="text-center text-gray-500">
                        Không tìm thấy thông tin hộ gia đình
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 h-screen">
                <Sidebar />
            </div>
                        <div className="flex-1 ml-64 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/households')}
                        className="border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại Danh sách Hộ dân
                    </Button>
                    <h1 className="text-2xl font-bold text-indigo-900">Chi tiết Hộ gia đình</h1>
                </div>
            
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Household Information */}
                    <div className="lg:col-span-1">
                        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                                <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                                    Thông tin Hộ gia đình
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Số căn hộ</p>
                                    <p className="text-lg font-semibold text-slate-800">{household.apartmentNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Địa chỉ</p>
                                    <p className="text-sm text-slate-700">{household.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Chủ hộ</p>
                                    <p className="text-sm font-medium text-slate-700">{household.householdHead?.fullName || 'Chưa có thông tin'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Trạng thái</p>
                                    <Badge className={household.active 
                                        ? 'bg-emerald-100 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full' 
                                        : 'bg-rose-100 text-rose-700 font-medium px-2.5 py-0.5 rounded-full'
                                    }>
                                        <div className={`h-1.5 w-1.5 rounded-full mr-1.5 inline-block ${household.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                        {household.active ? 'Hoạt động' : 'Không hoạt động'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Ngày tạo</p>
                                    <p className="text-sm text-slate-700">{formatDate(household.creationDate)}</p>
                                </div>
                                {household.note && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Ghi chú</p>
                                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">{household.note}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="px-6 py-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/households/edit?id=${household._id}`)}
                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
            
                    {/* Residents and Fees */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Residents Section */}
                        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-indigo-600" />
                                        Thành viên ({residents.length})
                                    </CardTitle>
                                    <Button
                                        onClick={handleAddResident}
                                        size="sm"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm cư dân
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {residents.length === 0 ? (
                                    <div className="text-center text-slate-500 py-12 bg-slate-50 border border-slate-100 rounded-lg">
                                        <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                                        <p>Không có cư dân trong hộ gia đình này.</p>
                                        <p className="text-sm mt-1">Hãy thêm cư dân để bắt đầu.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="font-medium text-slate-600">Họ tên</TableHead>
                                                    <TableHead className="font-medium text-slate-600">CCCD/CMND</TableHead>
                                                    <TableHead className="font-medium text-slate-600">Giới tính</TableHead>
                                                    <TableHead className="font-medium text-slate-600">Trạng thái</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {residents.map((resident) => (
                                                    <TableRow key={resident._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                        <TableCell className="font-medium text-slate-800">
                                                            {resident._id === household.householdHead?._id && (
                                                                <span className="text-emerald-500 mr-2">✓</span>
                                                            )}
                                                            {resident.fullName}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{resident.idCard || 'N/A'}</TableCell>
                                                        <TableCell className="text-slate-600">{resident.gender === 'male' ? 'Nam' : 'Nữ'}</TableCell>
                                                        <TableCell>
                                                            <Badge className={resident.active 
                                                                ? 'bg-emerald-100 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full text-xs' 
                                                                : 'bg-rose-100 text-rose-700 font-medium px-2.5 py-0.5 rounded-full text-xs'
                                                            }>
                                                                <div className={`h-1.5 w-1.5 rounded-full mr-1.5 inline-block ${resident.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                {resident.active ? 'Hoạt động' : 'Không hoạt động'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
            
                        {/* Fee Status Section */}
                        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
                                        Lịch sử thanh toán
                                    </CardTitle>
                                    <Button
                                        onClick={() => router.push(`/payments?household=${household._id}&search=${household.apartmentNumber}`)}
                                        size="sm"
                                        variant="outline"
                                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
                                    >
                                        <History className="h-4 w-4 mr-2" />
                                        Xem lịch sử thanh toán
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center text-slate-500 py-10 bg-slate-50 border border-slate-100 rounded-lg">
                                    <CreditCard className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                                    <p>Xem chi tiết các khoản thanh toán của căn hộ</p>
                                    <p className="text-sm mt-1">Nhấn vào nút "Xem lịch sử thanh toán" để xem chi tiết</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            Thông Tin Chi Tiết Cư Dân
                        </DialogTitle>
                    </DialogHeader>
                    {selectedResident && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <h3 className="font-semibold mb-2">Thông Tin Cá Nhân</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Họ và tên:</span> {selectedResident.fullName}</p>
                                    <p><span className="font-medium">Ngày sinh:</span> {selectedResident.dateOfBirth ? new Date(selectedResident.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                    <p><span className="font-medium">Giới tính:</span> {selectedResident.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                                    <p><span className="font-medium">Nơi sinh:</span> {selectedResident.placeOfBirth || 'N/A'}</p>
                                    <p><span className="font-medium">Quốc tịch:</span> {selectedResident.nationality || 'N/A'}</p>
                                    <p><span className="font-medium">Dân tộc:</span> {selectedResident.ethnicity || 'N/A'}</p>
                                    <p><span className="font-medium">Tôn giáo:</span> {selectedResident.religion || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Thông Tin Liên Hệ</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">CMND/CCCD:</span> {selectedResident.idCard || 'N/A'}</p>
                                    <p><span className="font-medium">Ngày cấp:</span> {selectedResident.idCardDate ? new Date(selectedResident.idCardDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                    <p><span className="font-medium">Nơi cấp:</span> {selectedResident.idCardPlace || 'N/A'}</p>
                                    <p><span className="font-medium">Số điện thoại:</span> {selectedResident.phoneNumber || 'N/A'}</p>
                                    <p><span className="font-medium">Hộ gia đình:</span> {selectedResident.household?.apartmentNumber || 'N/A'}</p>
                                    <p><span className="font-medium">Nghề nghiệp:</span> {selectedResident.occupation || 'N/A'}</p>
                                    <p><span className="font-medium">Nơi làm việc:</span> {selectedResident.workplace || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDetailModalOpen(false)}
                                >
                                    Đóng
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsDetailModalOpen(false)
                                        router.push(`/residents/${selectedResident._id}`)
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem Chi Tiết
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
