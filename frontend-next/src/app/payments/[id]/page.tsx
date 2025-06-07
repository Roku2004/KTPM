'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
    createdAt: string;
    updatedAt: string;
}

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const router = useRouter();
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        fetchPayment();
    }, [user, token]);

    const fetchPayment = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/payments/${params.id}`, config);
            setPayment(data);
            setLoading(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải thông tin thanh toán'
            );
            setLoading(false);
            toast.error('Không thể tải thông tin thanh toán');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800">Chưa thanh toán</Badge>;
        }
    };

    const getMethodText = (method: string) => {
        switch (method) {
            case 'cash':
                return 'Tiền mặt';
            case 'bank_transfer':
                return 'Chuyển khoản';
            case 'card':
                return 'Thẻ';
            default:
                return 'Khác';
        }
    };

    return (
                <div className="flex min-h-screen bg-slate-50">
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
                    <h1 className="text-2xl font-bold text-indigo-900">Chi Tiết Thanh Toán</h1>
                </div>
        
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-lg mb-6 flex items-center">
                        <div className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                        </div>
                        {error}
                    </div>
                ) : payment ? (
                                        <div className="grid grid-cols-1 gap-6">
                        <Card className="w-full border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                                <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
                                    <div className="h-5 w-5 mr-2 text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    Thông Tin Cơ Bản
                                </h2>
                            </div>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">ID</p>
                                            <p className="font-mono text-sm bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">{payment._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Tên Phí</p>
                                            <p className="text-sm font-medium text-slate-800">{payment.fee?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Căn Hộ</p>
                                            <p className="text-sm font-medium text-slate-800">{payment.household?.apartmentNumber}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Số Tiền</p>
                                            <p className="text-base font-semibold text-indigo-700">
                                                {payment.amount?.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Phương Thức</p>
                                            <div className="flex items-center">
                                                <div className="h-4 w-4 text-slate-400 mr-1.5">
                                                    {payment.method === 'cash' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : payment.method === 'bank_transfer' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v4a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM5 12a2 2 0 012-2h6a2 2 0 012 2v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm1 0a1 1 0 011-1h7a1 1 0 011 1v2H6v-2z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v13a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" />
                                                            <path d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h1a1 1 0 100-2H5zm0 3a1 1 0 100 2h1a1 1 0 100-2H5zm0 3a1 1 0 100 2h1a1 1 0 100-2H5zm5-9a1 1 0 100 2h1a1 1 0 100-2h-1zm0 3a1 1 0 100 2h1a1 1 0 100-2h-1zm0 3a1 1 0 100 2h1a1 1 0 100-2h-1zm0 3a1 1 0 100 2h1a1 1 0 100-2h-1zm5-9a1 1 0 100 2h1a1 1 0 100-2h-1zm0 3a1 1 0 100 2h1a1 1 0 100-2h-1z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">{getMethodText(payment.method)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Trạng Thái</p>
                                            <div className="mt-1">
                                                {payment.status === 'paid' ? (
                                                    <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full text-xs">
                                                        <div className="h-2 w-2 bg-emerald-500 rounded-full mr-1 inline-block"></div>
                                                        Đã thanh toán
                                                    </Badge>
                                                ) : payment.status === 'overdue' ? (
                                                    <Badge className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium px-2.5 py-0.5 rounded-full text-xs">
                                                        <div className="h-2 w-2 bg-rose-500 rounded-full mr-1 inline-block"></div>
                                                        Quá hạn
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium px-2.5 py-0.5 rounded-full text-xs">
                                                        <div className="h-2 w-2 bg-amber-500 rounded-full mr-1 inline-block"></div>
                                                        Chưa thanh toán
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Ngày Thanh Toán</p>
                                            <p className="text-sm text-slate-800">
                                                {payment.paymentDate
                                                    ? new Date(payment.paymentDate).toLocaleDateString('vi-VN')
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Ngày Tạo</p>
                                            <p className="text-sm text-slate-800">
                                                {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Cập Nhật Lần Cuối</p>
                                            <p className="text-sm text-slate-800">
                                                {new Date(payment.updatedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {payment.note && (
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <p className="text-sm font-medium text-slate-500 mb-2">Ghi Chú</p>
                                        <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded border border-slate-200">{payment.note}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <div className="h-8 w-8 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-slate-700 mb-1">Không tìm thấy thông tin thanh toán</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Thanh toán này không tồn tại hoặc đã bị xóa khỏi hệ thống.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 