'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Save, Plus, Home } from 'lucide-react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'

interface FormData {
    apartmentNumber: string
    address: string
    note: string
    active: boolean
}

interface ValidationErrors {
    apartmentNumber?: string
    address?: string
}

export default function HouseholdEditPage() {
    const [formData, setFormData] = useState<FormData>({
        apartmentNumber: '',
        address: '',
        note: '',
        active: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

    const router = useRouter()
    const searchParams = useSearchParams()
    const householdId = searchParams.get('id')
    const isEditMode = !!householdId
    const { user, token } = useAuth()

    useEffect(() => {
        if (!user || !token) {
            router.push('/login')
            return
        }

        if (isEditMode) {
            fetchHouseholdDetails()
        }
    }, [user, token, householdId, isEditMode])

    const fetchHouseholdDetails = async () => {
        try {
            setLoading(true)
            setError('')

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}`, config)

            setFormData({
                apartmentNumber: data.apartmentNumber,
                address: data.address,
                note: data.note || '',
                active: data.active
            })

            setLoading(false)
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải thông tin hộ gia đình'
            )
            setLoading(false)
        }
    }

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {}

        if (!formData.apartmentNumber.trim()) {
            errors.apartmentNumber = 'Số căn hộ là bắt buộc'
        }

        if (!formData.address.trim()) {
            errors.address = 'Địa chỉ là bắt buộc'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear validation error when user starts typing
        if (validationErrors[field as keyof ValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }))
        }
    }

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)
            setError('')

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }

            const householdData = {
                apartmentNumber: formData.apartmentNumber,
                address: formData.address,
                note: formData.note,
                active: formData.active
            }

            if (isEditMode) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}`, householdData, config)
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, householdData, config)
            }

            setLoading(false)
            setSuccess(true)

            setTimeout(() => {
                router.push('/households')
            }, 2000)

        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} hộ gia đình`
            )
            setLoading(false)
        }
    }

    if (loading && isEditMode && !formData.apartmentNumber) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
                        <div className="flex-1 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/households')}
                        className="border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div className="flex items-center gap-2">
                        <Home className="h-6 w-6 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-indigo-900">
                            {isEditMode ? 'Chỉnh Sửa Hộ Gia Đình' : 'Thêm Hộ Gia Đình Mới'}
                        </h1>
                    </div>
                </div>
            
                {/* Alert Messages */}
                {error && (
                    <Alert className="mb-6 border-rose-200 bg-rose-50">
                        <AlertDescription className="text-rose-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
            
                {success && (
                    <Alert className="mb-6 border-emerald-200 bg-emerald-50">
                        <AlertDescription className="text-emerald-800">
                            Hộ gia đình đã được {isEditMode ? 'cập nhật' : 'tạo'} thành công!
                        </AlertDescription>
                    </Alert>
                )}
            
                {/* Main Form Card */}
                <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                        <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                            {isEditMode ? (
                                <>
                                    <Home className="h-5 w-5 mr-2 text-indigo-600" />
                                    Cập nhật thông tin hộ gia đình
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5 mr-2 text-indigo-600" />
                                    Thêm hộ gia đình mới
                                </>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submitHandler} className="space-y-6">
                            {/* Apartment Number */}
                            <div className="space-y-2">
                                <Label htmlFor="apartmentNumber" className="flex items-center text-sm font-medium text-slate-700">
                                    <Home className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                                    Số Căn Hộ <span className="text-rose-500 ml-1">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="apartmentNumber"
                                        type="text"
                                        placeholder="Nhập số căn hộ (ví dụ: A101, B205)"
                                        value={formData.apartmentNumber}
                                        onChange={(e) => handleInputChange('apartmentNumber', e.target.value)}
                                        className={`transition-all ${
                                            validationErrors.apartmentNumber
                                                ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300 focus-visible:border-rose-500'
                                                : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                        }`}
                                        disabled={loading}
                                    />
                                </div>
                                {validationErrors.apartmentNumber && (
                                    <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>{validationErrors.apartmentNumber}</span>
                                    </div>
                                )}
                            </div>
                    
                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="flex items-center text-sm font-medium text-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Địa Chỉ <span className="text-rose-500 ml-1">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="address"
                                        type="text"
                                        placeholder="Nhập địa chỉ đầy đủ"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className={`transition-all ${
                                            validationErrors.address
                                                ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300 focus-visible:border-rose-500'
                                                : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                        }`}
                                        disabled={loading}
                                    />
                                </div>
                                {validationErrors.address && (
                                    <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>{validationErrors.address}</span>
                                    </div>
                                )}
                            </div>
                    
                            {/* Note */}
                            <div className="space-y-2">
                                <Label htmlFor="note" className="flex items-center text-sm font-medium text-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Ghi Chú
                                </Label>
                                <Textarea
                                    id="note"
                                    placeholder="Nhập ghi chú (không bắt buộc)"
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    rows={4}
                                    className="resize-none border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500 transition-all"
                                    disabled={loading}
                                />
                                <div className="flex items-start space-x-2 mt-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-slate-500">
                                        Có thể thêm thông tin bổ sung về hộ gia đình như số thành viên, đặc điểm nhận dạng,...
                                    </p>
                                </div>
                            </div>
                    
                            {/* Active Status - Only show in edit mode */}
                            {isEditMode && (
                                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 overflow-hidden transition-all hover:bg-indigo-50">
                                    <div className="flex items-center justify-between p-4">
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <Label htmlFor="active" className="text-sm font-medium text-slate-700">
                                                    Trạng thái hoạt động
                                                </Label>
                                            </div>
                                            <p className="text-xs text-slate-600 ml-5">
                                                {formData.active 
                                                    ? "Hộ gia đình đang hoạt động bình thường" 
                                                    : "Hộ gia đình hiện đã ngừng hoạt động"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${
                                                formData.active ? 'text-emerald-600' : 'text-slate-500'
                                            }`}>
                                                {formData.active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                            </span>
                                            <Switch
                                                id="active"
                                                checked={formData.active}
                                                onCheckedChange={(checked) => handleInputChange('active', checked)}
                                                disabled={loading}
                                                className={`${formData.active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                    
                            {/* Form Actions */}
                            <div className="flex gap-4 pt-6 border-t border-slate-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/households')}
                                    disabled={loading}
                                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 shadow-sm transition-all bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                    d={isEditMode 
                                                        ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    } 
                                                />
                                            </svg>
                                            {isEditMode ? 'Cập Nhật Hộ Gia Đình' : 'Tạo Hộ Gia Đình Mới'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            
                {/* Help Section */}
                <Card className="mt-6 bg-indigo-50 border border-indigo-100 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-5">
                        <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Hướng dẫn
                        </h3>
                        <ul className="text-sm text-indigo-800 space-y-1.5 pl-5">
                            <li className="flex items-center">
                                <span className="h-1 w-1 rounded-full bg-indigo-500 mr-2 inline-block"></span>
                                Số căn hộ và địa chỉ là các trường bắt buộc
                            </li>
                            <li className="flex items-center">
                                <span className="h-1 w-1 rounded-full bg-indigo-500 mr-2 inline-block"></span>
                                Số căn hộ nên theo định dạng: P001, P002, .etc
                            </li>
                            <li className="flex items-center">
                                <span className="h-1 w-1 rounded-full bg-indigo-500 mr-2 inline-block"></span>
                                Ghi chú có thể bỏ trống hoặc thêm thông tin bổ sung
                            </li>
                            {isEditMode && (
                                <li className="flex items-center">
                                    <span className="h-1 w-1 rounded-full bg-indigo-500 mr-2 inline-block"></span>
                                    Có thể bật/tắt trạng thái hoạt động của hộ gia đình
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
