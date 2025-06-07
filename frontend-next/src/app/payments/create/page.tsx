'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Fee {
    _id: string;
    name: string;
    amount: number;
    active: boolean;
}

interface Household {
    _id: string;
    apartmentNumber: string;
}

interface Resident {
    _id: string;
    fullName: string;
    idCard: string;
    phone: string;
    isHouseholdHead: boolean;
}

export default function PaymentCreatePage() {
    const searchParams = useSearchParams();
    const householdParam = searchParams.get('household');
    const feeParam = searchParams.get('fee');
    const isDebtPayment = searchParams.get('isDebt') === 'true';

    const [households, setHouseholds] = useState<Household[]>([]);
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Form fields
    const [householdId, setHouseholdId] = useState(householdParam || '');
    const [feeId, setFeeId] = useState(feeParam || '');
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [payerName, setPayerName] = useState('');
    const [payerId, setPayerId] = useState('');
    const [payerPhone, setPayerPhone] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [note, setNote] = useState('');
    const [period, setPeriod] = useState('');

    const router = useRouter();
    const { user, token } = useAuth();

    const fetchHouseholdHead = useCallback(async () => {
        try {
            if (!householdId || !token) return;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/households/${householdId}/residents`, config);
            const householdHead = data.find((resident: Resident) => resident.isHouseholdHead) || data[0];

            if (householdHead) {
                setPayerName(householdHead.fullName || '');
                setPayerId(householdHead.idCard || '');
                setPayerPhone(householdHead.phone || '');
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin chủ hộ:', error);
        }
    }, [householdId, token]);

    const fetchHouseholds = useCallback(async () => {
        try {
            if (!token) return;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/households', config);
            setHouseholds(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách hộ gia đình:', error);
        }
    }, [token]);

    const fetchFees = useCallback(async () => {
        try {
            if (!token) return;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/fees', config);
            setFees(data.filter((fee: Fee) => fee.active));
        } catch (error) {
            console.error('Lỗi khi tải danh sách phí:', error);
        }
    }, [token]);

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        fetchHouseholds();
        fetchFees();
    }, [user, token, fetchHouseholds, fetchFees]);

    useEffect(() => {
        if (feeId) {
            const fee = fees.find(f => f._id === feeId);
            if (fee) {
                setAmount(fee.amount.toString());
            }
        }
    }, [feeId, fees]);

    useEffect(() => {
        if (householdId) {
            fetchHouseholdHead();
        }
    }, [householdId, fetchHouseholdHead]);

    useEffect(() => {
        if (isDebtPayment) {
            // Set to previous month by default
            const today = new Date();
            const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
            const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
            const lastMonthDate = new Date(lastMonthYear, lastMonth, 1);
            setPeriod(lastMonthDate.toISOString().split('T')[0]);
            setNote('Thanh toán nợ tháng trước');
        } else {
            // Set to current month for regular payments
            const today = new Date();
            const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
            setPeriod(currentMonthDate.toISOString().split('T')[0]);
        }
    }, [isDebtPayment]);

    useEffect(() => {
        const generateReceiptNumber = () => {
            const date = new Date();
            const year = date.getFullYear().toString().substr(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `PM${year}${month}${day}${random}`;
        };
        setReceiptNumber(generateReceiptNumber());
    }, []);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!householdId) errors.householdId = 'Hộ gia đình là bắt buộc';
        if (!feeId) errors.feeId = 'Loại phí là bắt buộc';
        if (!amount || parseFloat(amount) <= 0) errors.amount = 'Số tiền phải lớn hơn 0';
        if (!paymentDate) errors.paymentDate = 'Ngày thanh toán là bắt buộc';
        if (!period) errors.period = 'Kỳ thanh toán là bắt buộc';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            // Ensure period is a proper date string
            let periodDate = period;
            if (period && period.length === 7) {
                periodDate = `${period}-01`;
            }

            const paymentData = {
                household: householdId,
                fee: feeId,
                amount: parseFloat(amount),
                paymentDate,
                payerName,
                payerId,
                payerPhone,
                receiptNumber,
                note,
                period: periodDate
            };

            await axios.post('/api/payments', paymentData, config);
            setSuccess(true);
            toast.success('Tạo thanh toán thành công');
            setTimeout(() => {
                router.push('/payments');
            }, 1500);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tạo thanh toán'
            );
            toast.error('Không thể tạo thanh toán');
        } finally {
            setLoading(false);
        }
    };

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
                        onClick={() => router.push('/payments')}
                        className="border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại Thanh Toán
                    </Button>
                    <h1 className="text-2xl font-bold text-indigo-900">Tạo Thanh Toán Mới</h1>
                </div>
                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-500 p-4 rounded-lg mb-6">
                        Thanh toán đã được tạo thành công
                    </div>
                )}

                                <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-8">
                        <form onSubmit={submitHandler} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="household" className="text-indigo-900 font-medium">
                                        Hộ Gia Đình <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={householdId}
                                        onValueChange={setHouseholdId}
                                    >
                                        <SelectTrigger 
                                            className={`bg-white border ${validationErrors.householdId 
                                                ? 'border-rose-500 focus:ring-rose-200' 
                                                : 'border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100'}`}
                                        >
                                            <SelectValue placeholder="Chọn Hộ Gia Đình" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {households.map((household) => (
                                                <SelectItem key={household._id} value={household._id}>
                                                    {household.apartmentNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.householdId && (
                                        <p className="text-sm text-rose-500 mt-1">{validationErrors.householdId}</p>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="fee" className="text-indigo-900 font-medium">
                                        Loại Phí <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={feeId}
                                        onValueChange={setFeeId}
                                    >
                                        <SelectTrigger 
                                            className={`bg-white border ${validationErrors.feeId 
                                                ? 'border-rose-500 focus:ring-rose-200' 
                                                : 'border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100'}`}
                                        >
                                            <SelectValue placeholder="Chọn Loại Phí" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {fees.map((fee) => (
                                                <SelectItem key={fee._id} value={fee._id}>
                                                    {fee.name} ({fee.amount.toLocaleString()} VND)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.feeId && (
                                        <p className="text-sm text-rose-500 mt-1">{validationErrors.feeId}</p>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-indigo-900 font-medium">
                                        Số Tiền <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className={`pl-10 bg-white border ${validationErrors.amount 
                                                ? 'border-rose-500 focus:ring-rose-200' 
                                                : 'border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100'}`}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            ₫
                                        </div>
                                    </div>
                                    {validationErrors.amount && (
                                        <p className="text-sm text-rose-500 mt-1">{validationErrors.amount}</p>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate" className="text-indigo-900 font-medium">
                                        Ngày Thanh Toán <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        id="paymentDate"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className={`bg-white border ${validationErrors.paymentDate 
                                            ? 'border-rose-500 focus:ring-rose-200' 
                                            : 'border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100'}`}
                                    />
                                    {validationErrors.paymentDate && (
                                        <p className="text-sm text-rose-500 mt-1">{validationErrors.paymentDate}</p>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="period" className="text-indigo-900 font-medium">
                                        {isDebtPayment ? 'Kỳ Thanh Toán (Nợ)' : 'Kỳ Thanh Toán'} <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        type="month"
                                        id="period"
                                        value={period.substring(0, 7)}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className={`bg-white border ${validationErrors.period 
                                            ? 'border-rose-500 focus:ring-rose-200' 
                                            : 'border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100'}`}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {isDebtPayment ? 'Chọn tháng cần thanh toán nợ' : 'Chọn tháng áp dụng khoản thanh toán này'}
                                    </p>
                                    {validationErrors.period && (
                                        <p className="text-sm text-rose-500 mt-1">{validationErrors.period}</p>
                                    )}
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="payerName" className="text-indigo-900 font-medium">
                                        Tên Người Thanh Toán
                                    </Label>
                                    <Input
                                        type="text"
                                        id="payerName"
                                        value={payerName}
                                        onChange={(e) => setPayerName(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="payerPhone" className="text-indigo-900 font-medium">
                                        Số Điện Thoại
                                    </Label>
                                    <Input
                                        type="text"
                                        id="payerPhone"
                                        value={payerPhone}
                                        onChange={(e) => setPayerPhone(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="payerId" className="text-indigo-900 font-medium">
                                        CMND/CCCD
                                    </Label>
                                    <Input
                                        type="text"
                                        id="payerId"
                                        value={payerId}
                                        onChange={(e) => setPayerId(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="receiptNumber" className="text-indigo-900 font-medium">
                                        Mã Biên Lai
                                    </Label>
                                    <Input
                                        type="text"
                                        id="receiptNumber"
                                        value={receiptNumber}
                                        onChange={(e) => setReceiptNumber(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 font-mono"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Tự động tạo, nhưng có thể thay đổi
                                    </p>
                                </div>
                            </div>
                
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="note" className="text-indigo-900 font-medium">
                                    Ghi Chú
                                </Label>
                                <Textarea
                                    id="note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Nhập ghi chú (không bắt buộc)"
                                    rows={3}
                                    className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 resize-none"
                                />
                            </div>
                
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/payments')}
                                        className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Tạo Thanh Toán'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 