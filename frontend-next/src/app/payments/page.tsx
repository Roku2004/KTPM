'use client';

import { Sidebar } from '@/components/Sidebar';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Eye, Loader2, Plus, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Fee {
    _id: string;
    name: string;
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
    dueDate?: string;
    collector?: {
        _id: string;
        name: string;
    };
    note?: string;
    receiptNumber?: string;
    payerName?: string;
}

export default function PaymentPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        // Lấy tham số từ URL
        const searchFromUrl = searchParams.get('search');
        const householdFromUrl = searchParams.get('household');

        // Nếu có tham số search, cập nhật ô tìm kiếm
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }

        // Nếu có tham số household, lọc theo ID hộ gia đình
        if (householdFromUrl) {
            fetchPaymentsByHousehold(householdFromUrl);
        } else {
            fetchPayments();
        }
    }, [user, token, searchParams]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/payments', config);
            setPayments(data);
            setLoading(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải danh sách thanh toán'
            );
            setLoading(false);
            toast.error('Không thể tải danh sách thanh toán');
        }
    };

    const fetchPaymentsByHousehold = async (householdId: string) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/payments/household/${householdId}`, config);
            setPayments(data);
            setLoading(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải danh sách thanh toán'
            );
            setLoading(false);
            toast.error('Không thể tải danh sách thanh toán');
        }
    };

    const handleRefund = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn hoàn tiền khoản thanh toán này? Hành động này không thể hoàn tác.')) {
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                await axios.put(`/api/payments/${id}/refund`, {}, config);
                toast.success('Hoàn tiền thành công');
                fetchPayments();
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || 'Không thể hoàn tiền khoản thanh toán'
                );
                setLoading(false);
            }
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            payment.household?.apartmentNumber?.toLowerCase().includes(searchLower) ||
            payment.fee?.name?.toLowerCase().includes(searchLower) ||
            payment.receiptNumber?.toLowerCase().includes(searchLower) ||
            (payment.payerName && payment.payerName.toLowerCase().includes(searchLower))
        );

        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
            <div className="fixed top-0 left-0 h-screen">
                <Sidebar />
            </div>
            <div className="flex-1 ml-64 p-8">
                                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                            className="border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại Dashboard
                        </Button>
                        <h1 className="text-2xl font-bold text-indigo-900">Danh Sách Thanh Toán</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => router.push('/payments/create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo Thanh Toán
                        </Button>
                    </div>
                </div>
                
                <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[260px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm thanh toán..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md"
                                />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[180px] border-slate-200 focus:ring-indigo-200 focus:border-indigo-300">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="paid">Đã thanh toán</SelectItem>
                                <SelectItem value="pending">Chưa thanh toán</SelectItem>
                                <SelectItem value="overdue">Quá hạn</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600"
                        >
                            Xóa bộ lọc
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/payments/search')}
                            className="border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Tìm Kiếm Theo Form
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                ) : (
                                        <Card className="shadow-md border border-slate-200">
                        <CardContent className="p-6">
                            <div className="rounded-md border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="border-b border-slate-200 hover:bg-transparent">
                                            <TableHead className="py-3 font-semibold text-slate-700">Loại Phí</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Căn Hộ</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Số Tiền</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Phương Thức</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Trạng Thái</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Ngày Thanh Toán</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Ghi Chú</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700 text-center">Thao Tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayments.map((payment, index) => (
                                            <TableRow 
                                                key={payment._id}
                                                className={`border-b border-slate-100 hover:bg-slate-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                            >
                                                <TableCell className="font-medium text-indigo-700 py-3">
                                                    {payment.fee?.name || 
                                                        <span className="text-slate-400 italic">N/A</span>
                                                    }
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                                                        {payment.household?.apartmentNumber || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3 font-medium">
                                                    {payment.amount?.toLocaleString('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    })}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <span className="inline-flex items-center">
                                                        {payment.method === 'cash' ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                                <span className="text-emerald-700">Tiền mặt</span>
                                                            </>
                                                        ) : payment.method === 'bank_transfer' ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                                <span className="text-blue-700">Chuyển khoản</span>
                                                            </>
                                                        ) : payment.method === 'card' ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                                <span className="text-indigo-700">Thẻ</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="text-slate-600">Khác</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    {payment.status === 'paid' ? (
                                                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full w-fit">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-xs font-medium">Đã thanh toán</span>
                                                        </div>
                                                    ) : payment.status === 'overdue' ? (
                                                        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full w-fit">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-xs font-medium">Quá hạn</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full w-fit">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-xs font-medium">Chưa thanh toán</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3 text-slate-600">
                                                    {payment.paymentDate ? (
                                                        <span className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3 max-w-[150px] truncate" title={payment.note || 'Không có ghi chú'}>
                                                    {payment.note || <span className="text-slate-400 italic">Không có</span>}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/payments/${payment._id}`)}
                                                            className="h-8 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {filteredPayments.length === 0 && (
                                <div className="text-center py-12 px-4">
                                    <div className="bg-slate-50 rounded-lg p-8 max-w-md mx-auto border border-slate-200">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-4 text-lg font-medium text-slate-700">Không tìm thấy khoản thanh toán</h3>
                                        <p className="mt-2 text-sm text-slate-500">Không có khoản thanh toán nào phù hợp với bộ lọc hiện tại.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
