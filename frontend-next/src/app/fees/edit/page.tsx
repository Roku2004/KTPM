'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sidebar } from '@/components/Sidebar';

interface ValidationErrors {
    feeCode?: string;
    name?: string;
    amount?: string;
    startDate?: string;
    endDate?: string;
}

export default function FeeEditPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isEditMode = !!id;

    const [feeCode, setFeeCode] = useState('');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [feeType, setFeeType] = useState('mandatory');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const router = useRouter();
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        if (isEditMode) {
            fetchFeeDetails();
        }
    }, [user, token, id]);

    const fetchFeeDetails = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/fees/${id}`, config);

            setFeeCode(data.feeCode);
            setName(data.name);
            setAmount(data.amount?.toString() || '');
            setFeeType(data.feeType || 'mandatory');
            setDescription(data.description || '');

            if (data.startDate) {
                const startDateObj = new Date(data.startDate);
                setStartDate(startDateObj.toISOString().split('T')[0]);
            }

            if (data.endDate) {
                const endDateObj = new Date(data.endDate);
                setEndDate(endDateObj.toISOString().split('T')[0]);
            }

            setActive(data.active);
            setLoading(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải thông tin phí');
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        if (!feeCode.trim()) {
            errors.feeCode = 'Mã phí là bắt buộc';
        }

        if (!name.trim()) {
            errors.name = 'Tên phí là bắt buộc';
        }

        if (!amount || parseFloat(amount) <= 0) {
            errors.amount = 'Số tiền phải lớn hơn 0';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const feeData = {
                feeCode: feeCode.trim(),
                name: name.trim(),
                amount: parseFloat(amount),
                feeType,
                description: description.trim() || '',
                startDate: startDate || null,
                endDate: endDate || null,
                active: isEditMode ? active : true
            };

            console.log('Sending data:', feeData);

            if (isEditMode) {
                await axios.put(`/api/fees/${id}`, feeData, config);
                toast.success('Cập nhật phí thành công');
                router.push('/fees?message=update_success');
            } else {
                await axios.post('/api/fees', feeData, config);
                toast.success('Tạo phí mới thành công');
                router.push('/fees?message=create_success');
            }
        } catch (error: any) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            const errorMessage = error.response?.data?.message ||
                `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} phí`;

            toast.error(errorMessage, {
                description: 'Vui lòng kiểm tra lại thông tin và thử lại',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/fees')}
                            className="h-9 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEditMode ? (
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Chỉnh Sửa Phí
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tạo Phí Mới
                                </div>
                            )}
                        </h1>
                    </div>
                    {isEditMode && (
                        <div className="mt-3 sm:mt-0">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ID: {id?.substring(0, 8)}...
                            </span>
                        </div>
                    )}
                </div>

                                <Card className="shadow-md border border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <CardTitle className="text-xl font-bold text-slate-800">Thông Tin Phí</CardTitle>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="feeCode" className="text-sm font-medium text-slate-700 flex items-center">
                                        Mã Phí <span className="text-rose-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="feeCode"
                                        value={feeCode}
                                        onChange={(e) => setFeeCode(e.target.value)}
                                        placeholder="Nhập mã phí"
                                        className={`transition-all ${
                                            validationErrors.feeCode
                                                ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                        }`}
                                    />
                                    {validationErrors.feeCode && (
                                        <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{validationErrors.feeCode}</span>
                                        </div>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center">
                                        Tên Phí <span className="text-rose-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nhập tên phí"
                                        className={`transition-all ${
                                            validationErrors.name
                                                ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                        }`}
                                    />
                                    {validationErrors.name && (
                                        <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{validationErrors.name}</span>
                                        </div>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-sm font-medium text-slate-700 flex items-center">
                                        Số Tiền <span className="text-rose-500 ml-1">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Nhập số tiền"
                                            min="0"
                                            step="1000"
                                            className={`transition-all pr-16 ${
                                                validationErrors.amount
                                                    ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                    : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                            }`}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none bg-slate-50 border-l border-slate-200 rounded-r-md text-slate-500 text-sm">
                                            VND
                                        </div>
                                    </div>
                                    {validationErrors.amount && (
                                        <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{validationErrors.amount}</span>
                                        </div>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="feeType" className="text-sm font-medium text-slate-700">Loại Phí</Label>
                                    <Select value={feeType} onValueChange={setFeeType}>
                                        <SelectTrigger className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500">
                                            <SelectValue placeholder="Chọn loại phí" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mandatory">
                                                <div className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                                                    Bắt buộc
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="voluntary">
                                                <div className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                                                    Tự nguyện
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="contribution">
                                                <div className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                                                    Đóng góp
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="parking">
                                                <div className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                                    Đỗ xe
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">Ngày Bắt Đầu</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">Ngày Kết Thúc</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                    />
                                </div>
                            </div>
                
                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Mô Tả</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả chi tiết về khoản phí này (không bắt buộc)"
                                    rows={3}
                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500 resize-none"
                                />
                            </div>
                
                            {isEditMode && (
                                <div className="flex items-center p-3 mt-4 bg-slate-50 border border-slate-200 rounded-md">
                                    <div className="flex items-center flex-grow">
                                        <Checkbox
                                            id="active"
                                            checked={active}
                                            onCheckedChange={(checked) => setActive(checked as boolean)}
                                            className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                        />
                                        <Label htmlFor="active" className="text-sm ml-2">
                                            Trạng thái kích hoạt
                                        </Label>
                                    </div>
                                    <div className="ml-auto">
                                        {active ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Đang kích hoạt
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Vô hiệu hóa
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/fees')}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            {isEditMode ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            )}
                                            {isEditMode ? 'Cập Nhật' : 'Tạo Mới'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 