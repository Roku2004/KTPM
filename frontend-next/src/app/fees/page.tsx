'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { toast } from 'sonner';
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
    feeCode: string;
    name: string;
    feeType: string;
    amount: number;
    startDate: string;
    endDate: string;
    active: boolean;
}

export default function FeesPage() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message');
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        fetchFees();
    }, [user, token]);

    useEffect(() => {
        if (message === 'update_success') {
            toast.success('Cập nhật phí thành công', {
                description: 'Thông tin phí đã được cập nhật',
                duration: 3000,
            });
            // Xóa message parameter khỏi URL
            router.replace('/fees');
        } else if (message === 'create_success') {
            toast.success('Tạo phí mới thành công', {
                description: 'Phí mới đã được thêm vào hệ thống',
                duration: 3000,
            });
            // Xóa message parameter khỏi URL
            router.replace('/fees');
        }
    }, [message]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/fees', config);
            setFees(data);
            setLoading(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải danh sách phí'
            );
            setLoading(false);
        }
    };

    const deleteFeeHandler = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoản phí này không?')) {
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                await axios.delete(`/api/fees/${id}`, config);
                toast.success('Xóa phí thành công');
                fetchFees();
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || 'Không thể xóa khoản phí'
                );
                setLoading(false);
            }
        }
    };

    const translateFeeType = (feeType: string) => {
        const translations: { [key: string]: string } = {
            'mandatory': 'Bắt buộc',
            'service': 'Dịch vụ',
            'maintenance': 'Bảo trì',
            'voluntary': 'Tự nguyện',
            'contribution': 'Đóng góp',
            'parking': 'Đỗ xe',
            'utilities': 'Tiện ích'
        };

        return translations[feeType] || feeType;
    };

    const filteredFees = fees.filter(
        (fee) =>
            fee.feeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 h-screen">
                <Sidebar />
            </div>
            <div className="flex-1 ml-64 p-8">
                                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex items-center gap-3 mb-4 sm:mb-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/dashboard')}
                                className="h-9 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>
                            <h1 className="text-2xl font-bold text-slate-800">Danh Sách Phí</h1>
                        </div>
                        <Button
                            onClick={() => router.push('/fees/edit')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm Phí Mới
                        </Button>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo mã phí hoặc tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md"
                            />
                        </div>
                        <div className="text-sm text-slate-500 hidden sm:block">
                            {filteredFees.length > 0 ? (
                                <span>Hiển thị <span className="font-medium text-slate-700">{filteredFees.length}</span> khoản phí</span>
                            ) : (
                                <span>Không tìm thấy kết quả</span>
                            )}
                        </div>
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
                    <Card>
                                                <CardContent className="p-6">
                            <div className="rounded-md border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="border-b border-slate-200 hover:bg-transparent">
                                            <TableHead className="py-3 font-semibold text-slate-700">Mã Phí</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Tên</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Loại</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Số Tiền</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Ngày Bắt Đầu</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Ngày Kết Thúc</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700">Trạng Thái</TableHead>
                                            <TableHead className="py-3 font-semibold text-slate-700 text-center">Thao Tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFees.map((fee, index) => (
                                            <TableRow 
                                                key={fee._id} 
                                                className={`border-b border-slate-100 hover:bg-slate-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                            >
                                                <TableCell className="font-medium text-indigo-700 py-3">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-xs">
                                                        {fee.feeCode}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3">{fee.name}</TableCell>
                                                <TableCell className="py-3">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                                                        {translateFeeType(fee.feeType)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3 font-medium">
                                                    {fee.amount.toLocaleString()} <span className="text-slate-500 text-xs ml-1">VND</span>
                                                </TableCell>
                                                <TableCell className="py-3 text-slate-600">
                                                    {fee.startDate
                                                        ? new Date(fee.startDate).toLocaleDateString('vi-VN')
                                                        : <span className="text-slate-400">N/A</span>}
                                                </TableCell>
                                                <TableCell className="py-3 text-slate-600">
                                                    {fee.endDate
                                                        ? new Date(fee.endDate).toLocaleDateString('vi-VN')
                                                        : <span className="text-slate-400">N/A</span>}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    {fee.active ? (
                                                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full w-fit">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-medium">Đang kích hoạt</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full w-fit">
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-medium">Vô hiệu hóa</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/fees/edit?id=${fee._id}`)}
                                                            className="h-8 border-slate-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-yellow-600" />
                                                        </Button>
                                                        {user?.role === 'admin' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => deleteFeeHandler(fee._id)}
                                                                className="h-8 border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {filteredFees.length === 0 && (
                                <div className="text-center py-12 px-4">
                                    <div className="bg-slate-50 rounded-lg p-8 max-w-md mx-auto border border-slate-200">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-4 text-lg font-medium text-slate-700">Không tìm thấy khoản phí</h3>
                                        <p className="mt-2 text-sm text-slate-500">Không có khoản phí nào phù hợp với tìm kiếm của bạn.</p>
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