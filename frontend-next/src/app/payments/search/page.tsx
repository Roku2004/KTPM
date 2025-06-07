'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Search, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from '@/components/Sidebar';

interface Fee {
    _id: string;
    name: string;
    feeType: string;
}

interface Household {
    _id: string;
    apartmentNumber: string;
}

interface Payment {
    _id: string;
    fee: Fee;
    household: Household;
    amount: number;
    method: 'cash' | 'bank_transfer' | 'card' | 'other';
    status: 'paid' | 'pending' | 'overdue';
    paymentDate: string;
    payerName?: string;
    note?: string;
}

export default function PaymentSearchPage() {
    const [apartmentNumber, setApartmentNumber] = useState('');
    const [feeName, setFeeName] = useState('');
    const [feeType, setFeeType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [payerName, setPayerName] = useState('');

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const router = useRouter();
    const { user, token } = useAuth();

    const searchPayments = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const params = new URLSearchParams();
            if (apartmentNumber) params.append('apartmentNumber', apartmentNumber);
            if (feeName) params.append('feeName', feeName);
            if (feeType) params.append('feeType', feeType);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (minAmount) params.append('minAmount', minAmount);
            if (maxAmount) params.append('maxAmount', maxAmount);
            if (payerName) params.append('payerName', payerName);

            const { data } = await axios.get(`/api/payments/search?${params.toString()}`, config);
            setPayments(data);
            setSearched(true);
            setLoading(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Lỗi khi tìm kiếm thanh toán'
            );
            setLoading(false);
            toast.error('Lỗi khi tìm kiếm thanh toán');
        }
    };

    const clearForm = () => {
        setApartmentNumber('');
        setFeeName('');
        setFeeType('');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setPayerName('');
        setSearched(false);
        setPayments([]);
    };

    const translateFeeType = (feeType: string) => {
        const translations: { [key: string]: string } = {
            'service': 'Dịch vụ',
            'maintenance': 'Bảo trì',
            'water': 'Nước',
            'electricity': 'Điện',
            'parking': 'Đỗ xe',
            'internet': 'Internet',
            'security': 'An ninh',
            'cleaning': 'Vệ sinh',
            'contribution': 'Đóng góp',
            'mandatory': 'Bắt buộc',
            'other': 'Khác'
        };
        return translations[feeType] || 'Khác';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500">Đã thanh toán</Badge>;
            case 'overdue':
                return <Badge className="bg-red-500">Quá hạn</Badge>;
            default:
                return <Badge className="bg-yellow-500">Chưa thanh toán</Badge>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8">
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
                    <h1 className="text-2xl font-bold text-indigo-900">Tìm Kiếm Thanh Toán</h1>
                </div>
                
                <Card className="mb-8 border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-8">
                        <form onSubmit={searchPayments} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="apartmentNumber" className="text-indigo-900 font-medium">
                                        Số Căn Hộ
                                    </Label>
                                    <Input
                                        type="text"
                                        id="apartmentNumber"
                                        placeholder="Nhập số căn hộ"
                                        value={apartmentNumber}
                                        onChange={(e) => setApartmentNumber(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="payerName" className="text-indigo-900 font-medium">
                                        Tên Người Nộp
                                    </Label>
                                    <Input
                                        type="text"
                                        id="payerName"
                                        placeholder="Nhập tên người nộp"
                                        value={payerName}
                                        onChange={(e) => setPayerName(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="feeName" className="text-indigo-900 font-medium">
                                        Tên Phí
                                    </Label>
                                    <Input
                                        type="text"
                                        id="feeName"
                                        placeholder="Nhập tên phí"
                                        value={feeName}
                                        onChange={(e) => setFeeName(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="feeType" className="text-indigo-900 font-medium">
                                        Loại Phí
                                    </Label>
                                    <Select
                                        value={feeType}
                                        onValueChange={setFeeType}
                                    >
                                        <SelectTrigger className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100">
                                            <SelectValue placeholder="Chọn loại phí" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="all">Tất cả loại</SelectItem>
                                            <SelectItem value="mandatory">Bắt buộc</SelectItem>
                                            <SelectItem value="service">Dịch vụ</SelectItem>
                                            <SelectItem value="maintenance">Bảo trì</SelectItem>
                                            <SelectItem value="water">Nước</SelectItem>
                                            <SelectItem value="electricity">Điện</SelectItem>
                                            <SelectItem value="parking">Đỗ xe</SelectItem>
                                            <SelectItem value="internet">Internet</SelectItem>
                                            <SelectItem value="security">An ninh</SelectItem>
                                            <SelectItem value="cleaning">Vệ sinh</SelectItem>
                                            <SelectItem value="contribution">Đóng góp</SelectItem>
                                            <SelectItem value="other">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-indigo-900 font-medium">
                                        Từ Ngày
                                    </Label>
                                    <Input
                                        type="date"
                                        id="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-indigo-900 font-medium">
                                        Đến Ngày
                                    </Label>
                                    <Input
                                        type="date"
                                        id="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="minAmount" className="text-indigo-900 font-medium">
                                        Số Tiền Tối Thiểu
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            id="minAmount"
                                            placeholder="Nhập số tiền tối thiểu"
                                            value={minAmount}
                                            onChange={(e) => setMinAmount(e.target.value)}
                                            min="0"
                                            className="pl-10 bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            ₫
                                        </div>
                                    </div>
                                </div>
                
                                <div className="space-y-2">
                                    <Label htmlFor="maxAmount" className="text-indigo-900 font-medium">
                                        Số Tiền Tối Đa
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            id="maxAmount"
                                            placeholder="Nhập số tiền tối đa"
                                            value={maxAmount}
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            min="0"
                                            className="pl-10 bg-white border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            ₫
                                        </div>
                                    </div>
                                </div>
                            </div>
                
                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearForm}
                                    className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Xóa Bộ Lọc
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang tìm kiếm...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Tìm Kiếm
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-lg mb-6">
                        <p className="flex items-center">
                            <X className="h-4 w-4 mr-2" />
                            {error}
                        </p>
                    </div>
                ) : searched ? (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                            <h2 className="text-xl font-semibold text-indigo-900">Kết Quả Tìm Kiếm</h2>
                            {payments.length > 0 && (
                                <span className="bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full px-2 py-0.5 ml-2">
                                    {payments.length} kết quả
                                </span>
                            )}
                        </div>
                
                        {payments.length === 0 ? (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                                    <Search className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-700 mb-1">Không tìm thấy kết quả</h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Không tìm thấy thanh toán nào phù hợp với tiêu chí tìm kiếm. Vui lòng thử các bộ lọc khác.
                                </p>
                            </div>
                        ) : (
                            <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="py-3 font-semibold text-slate-700">Căn Hộ</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700">Loại Phí</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700">Số Tiền</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700">Ngày Thanh Toán</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700">Trạng Thái</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700">Người Nộp</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700">Ghi Chú</TableHead>
                                                <TableHead className="py-3 font-semibold text-slate-700 text-center">Thao Tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow 
                                                    key={payment._id}
                                                    className="border-b border-slate-100 hover:bg-slate-50/50"
                                                >
                                                    <TableCell className="font-medium">{payment.household?.apartmentNumber || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {payment.fee?.name}
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {translateFeeType(payment.fee?.feeType)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-800">
                                                        {payment.amount.toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            className={`${payment.status === 'paid' 
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                                : payment.status === 'overdue'
                                                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                                        >
                                                            {payment.status === 'paid' ? 'Đã thanh toán' : payment.status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{payment.payerName || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600">{payment.note || '-'}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/payments/${payment._id}`)}
                                                            className="hover:bg-indigo-50 hover:text-indigo-700"
                                                        >
                                                            <Search className="h-4 w-4 text-indigo-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
} 