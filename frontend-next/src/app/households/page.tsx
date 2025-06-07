'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Grid, List, Eye, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Household {
    _id: string
    apartmentNumber: string
    address: string
    householdHead?: {
        fullName: string
    }
    active: boolean
    createdAt: string
    notes?: string
}

export default function HouseholdsPage() {
    const [households, setHouseholds] = useState<Household[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const router = useRouter()
    const { user, token } = useAuth()

    useEffect(() => {
        if (!user || !token) {
            router.push('/login')
            return
        }
        fetchHouseholds()
    }, [user, token])

    const fetchHouseholds = async () => {
        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, config)
            setHouseholds(data)
            setLoading(false)
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải danh sách hộ gia đình'
            )
            setLoading(false)
        }
    }

    const deleteHandler = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hộ gia đình này không?')) {
            try {
                setLoading(true)
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/households/${id}`, config)
                fetchHouseholds()
            } catch (error: any) {
                setError(
                    error.response?.data?.message || 'Không thể xóa hộ gia đình'
                )
                setLoading(false)
            }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const filteredHouseholds = households.filter(
        (household) =>
            household.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            household.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 h-screen">
                <Sidebar />
            </div>
            <div className="flex-1 ml-64 p-8">
                                <div className="mb-8">
                    {/* Header với hiệu ứng shadow nhẹ và nền trắng */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="mr-5">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                    <i className="fas fa-home text-xl"></i>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push('/dashboard')}
                                        className="hover:bg-blue-50 text-blue-600 rounded-full p-2 h-9 w-9"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <h1 className="text-2xl font-bold text-gray-900">Danh Sách Hộ Gia Đình</h1>
                                </div>
                                <p className="text-gray-500 mt-1">Quản lý thông tin tất cả các hộ gia đình trong khu vực</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Chuyển chế độ xem */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-md px-3 py-2 transition-all ${
                                        viewMode === 'grid' 
                                            ? 'bg-white text-blue-700 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Grid className="h-4 w-4 mr-2" />
                                    Lưới
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-md px-3 py-2 transition-all ${
                                        viewMode === 'list' 
                                            ? 'bg-white text-blue-700 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <List className="h-4 w-4 mr-2" />
                                    Danh sách
                                </Button>
                            </div>
                            
                            {/* Nút thêm mới */}
                            <Button
                                onClick={() => router.push('/households/edit')}
                                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                            >
                                <i className="fas fa-plus-circle mr-2"></i>
                                Thêm Hộ Gia Đình
                            </Button>
                        </div>
                    </div>
                    
                    {/* Phần tìm kiếm và lọc */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mt-4 flex justify-between items-center">
                        <div className="relative w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo số căn hộ hoặc địa chỉ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                Hiển thị {filteredHouseholds.length} hộ gia đình
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchHouseholds()}
                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                <i className="fas fa-sync-alt mr-2 text-xs"></i>
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </div>

                {/* <div className="mb-6">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo số căn hộ hoặc địa chỉ"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div> */}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                ) : viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHouseholds.map((household) => (
                            <Card 
                                key={household._id} 
                                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 group"
                            >
                                <div className={`h-2 w-full ${household.active ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}></div>
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-4 shadow-sm">
                                                <i className="fas fa-home text-lg"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Căn hộ {household.apartmentNumber}
                                                </h3>
                                                <p className="text-sm text-gray-500">{household.address}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
                                                <span className={`text-sm font-medium rounded-full px-3 py-1 ${
                                                    household.active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {household.active ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Ngày tạo:</span>
                                                <span className="text-sm text-gray-600">
                                                    <i className="far fa-calendar-alt mr-1 text-gray-400"></i>
                                                    {formatDate(household.createdAt)}
                                                </span>
                                            </div>
                                            {household.householdHead && (
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm font-medium text-gray-700">Chủ hộ:</span>
                                                    <span className="text-sm text-gray-600">
                                                        <i className="fas fa-user mr-1 text-gray-400"></i>
                                                        {household.householdHead.fullName}
                                                    </span>
                                                </div>
                                            )}
                                            {household.notes && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <p className="font-medium text-gray-700">Ghi chú:</p>
                                                    <p className="italic text-gray-500 mt-1 line-clamp-2">{household.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 flex items-center justify-between border-t border-gray-100">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/households/detail?id=${household._id}`)}
                                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center"
                                        >
                                            <Eye className="h-4 w-4 mr-1" /> 
                                            Chi tiết
                                        </Button>
                                        
                                        {(user?.role === 'admin' || user?.role === 'accountant') && (
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/households/edit?id=${household._id}`)}
                                                    className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                >
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deleteHandler(household._id)}
                                                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Xóa
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                                       <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                        <th className="py-4 px-6 text-left text-sm font-medium">Số căn hộ</th>
                                        <th className="py-4 px-6 text-left text-sm font-medium">Địa chỉ</th>
                                        <th className="py-4 px-6 text-left text-sm font-medium">Trạng thái</th>
                                        <th className="py-4 px-6 text-left text-sm font-medium">Ngày tạo</th>
                                        <th className="py-4 px-6 text-center text-sm font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {filteredHouseholds.map((household, index) => (
                                        <tr 
                                            key={household._id} 
                                            className={`hover:bg-blue-50 border-b border-gray-100 transition-colors duration-150 ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                            }`}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                                                        <i className="fas fa-home"></i>
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{household.apartmentNumber}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="text-gray-700">{household.address}</p>
                                                    {household.householdHead && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Chủ hộ: {household.householdHead.fullName}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {household.active ? (
                                                    <div className="flex items-center">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
                                                        <span className="text-sm text-green-600 font-medium">Hoạt động</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
                                                        <span className="text-sm text-red-600 font-medium">Không hoạt động</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-600">
                                                    <i className="far fa-calendar-alt mr-2 text-gray-400"></i>
                                                    {formatDate(household.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => router.push(`/households/detail?id=${household._id}`)}
                                                        className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
                                                        title="Chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    
                                                    {(user?.role === 'admin' || user?.role === 'accountant') && (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/households/edit?id=${household._id}`)}
                                                                className="bg-amber-500 text-white hover:bg-amber-600 rounded-lg p-2 transition-colors"
                                                                title="Sửa"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteHandler(household._id)}
                                                                className="bg-red-500 text-white hover:bg-red-600 rounded-lg p-2 transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination hoặc thông tin bổ sung */}
                        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100">
                            <span className="text-sm text-gray-600">
                                Tổng số: <span className="font-semibold text-gray-800">{filteredHouseholds.length}</span> hộ gia đình
                            </span>
                            <div className="flex items-center space-x-2 text-sm">
                                <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-600">
                                    Trước
                                </button>
                                <span className="px-3 py-1 rounded bg-blue-600 text-white">1</span>
                                <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-600">
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && filteredHouseholds.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        Không tìm thấy hộ gia đình nào
                    </div>
                )}
            </div>
        </div>
    )
}