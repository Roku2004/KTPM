'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2, Eye, X } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Household {
    _id: string;
    apartmentNumber: string;
    active: boolean;
}

interface Resident {
    _id: string;
    fullName: string;
    idCard: string;
    dateOfBirth: string;
    gender: 'male' | 'female';
    phone: string;
    household?: {
        _id: string;
        apartmentNumber: string;
    };
    active: boolean;
    idCardDate?: string;
    idCardPlace?: string;
    placeOfBirth?: string;
    nationality?: string;
    ethnicity?: string;
    religion?: string;
    occupation?: string;
    workplace?: string;
    note?: string;
}

export default function ResidentPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Resident>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<Partial<Resident>>({
        fullName: '',
        gender: undefined,
        dateOfBirth: '',
        idCard: '',
        idCardDate: '',
        idCardPlace: '',
        placeOfBirth: '',
        nationality: 'Việt Nam',
        ethnicity: 'Kinh',
        religion: 'Không',
        occupation: '',
        workplace: '',
        phone: '',
        note: '',
        active: true
    });
    const router = useRouter();
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        fetchResidents();
        fetchHouseholds();
    }, [user, token]);

    const fetchResidents = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/residents', config);
            setResidents(data);
            setLoading(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tải danh sách cư dân'
            );
            setLoading(false);
        }
    };

    const fetchHouseholds = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/households', config);
            setHouseholds(data.filter((h: Household) => h.active));
        } catch (error) {
            console.error('Lỗi khi tải danh sách hộ gia đình:', error);
        }
    };

    const deleteHandler = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cư dân này không?')) {
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                await axios.delete(`/api/residents/${id}`, config);
                toast.success('Xóa cư dân thành công');
                fetchResidents();
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || 'Không thể xóa cư dân'
                );
                setLoading(false);
            }
        }
    };

    const handleViewDetails = async (id: string) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/residents/${id}`, config);
            setSelectedResident(data);
            setIsDetailModalOpen(true);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể tải thông tin cư dân'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id: string) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/residents/${id}`, config);
            setEditFormData(data);
            setIsEditModalOpen(true);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể tải thông tin cư dân'
            );
        } finally {
            setLoading(false);
        }
    };

    const validateEditForm = () => {
        const errors: Record<string, string> = {};

        if (!editFormData.fullName) errors.fullName = 'Họ tên là bắt buộc';
        if (!editFormData.gender) errors.gender = 'Giới tính là bắt buộc';

        if (editFormData.idCard && !/^\d+$/.test(editFormData.idCard)) {
            errors.idCard = 'CMND/CCCD chỉ được chứa số';
        }

        if (editFormData.phone && !/^\d+$/.test(editFormData.phone)) {
            errors.phone = 'Số điện thoại chỉ được chứa số';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEditForm()) return;

        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.put(`/api/residents/${editFormData._id}`, editFormData, config);
            toast.success('Cập nhật cư dân thành công');
            setIsEditModalOpen(false);
            fetchResidents();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể cập nhật cư dân'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setCreateFormData({
            fullName: '',
            gender: undefined,
            dateOfBirth: '',
            idCard: '',
            idCardDate: '',
            idCardPlace: '',
            placeOfBirth: '',
            nationality: 'Việt Nam',
            ethnicity: 'Kinh',
            religion: 'Không',
            occupation: '',
            workplace: '',
            phone: '',
            note: '',
            active: true
        });
        setIsCreateModalOpen(true);
    };

    const validateCreateForm = () => {
        const errors: Record<string, string> = {};

        if (!createFormData.fullName) errors.fullName = 'Họ tên là bắt buộc';
        if (!createFormData.gender) errors.gender = 'Giới tính là bắt buộc';

        if (createFormData.idCard && !/^\d+$/.test(createFormData.idCard)) {
            errors.idCard = 'CMND/CCCD chỉ được chứa số';
        }

        if (createFormData.phone && !/^\d+$/.test(createFormData.phone)) {
            errors.phone = 'Số điện thoại chỉ được chứa số';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCreateForm()) return;

        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post('/api/residents', createFormData, config);
            toast.success('Thêm cư dân mới thành công');
            setIsCreateModalOpen(false);
            fetchResidents();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể thêm cư dân mới'
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredResidents = residents.filter((resident) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            resident.fullName?.toLowerCase().includes(searchLower) ||
            resident.idCard?.toLowerCase().includes(searchLower) ||
            resident.phone?.toLowerCase().includes(searchLower) ||
            resident.household?.apartmentNumber?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 h-screen">
                <Sidebar />
            </div>
            <div className="flex-1 ml-64 p-8">
                                <div className="space-y-6 mb-8">
                    {/* Header with title and actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/dashboard')}
                                className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full h-9 w-9 p-0 mr-2"
                                title="Quay lại Dashboard"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Quay lại Dashboard</span>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                                    Danh Sách Cư Dân
                                    <span className="ml-3 text-sm font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                                        {filteredResidents.length} cư dân
                                    </span>
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">Quản lý thông tin chi tiết cư dân trong khu vực</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                onClick={() => fetchResidents()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Làm mới
                            </Button>
                            <Button
                                onClick={handleCreate}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm Cư Dân
                            </Button>
                        </div>
                    </div>
                
                    {/* Search and filter bar */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <Input
                                type="text"
                                placeholder="Tìm theo tên, CMND/CCCD, số điện thoại hoặc số căn hộ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border-slate-300 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                            />
                            {searchTerm && (
                                <button 
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                                    onClick={() => setSearchTerm('')}
                                    title="Xóa tìm kiếm"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            
                        </div>
                    </div>
                    
                    {/* Results count and sorting options */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-slate-600">
                        <div>
                            {searchTerm ? (
                                <p>Tìm thấy <span className="font-semibold">{filteredResidents.length}</span> cư dân phù hợp với từ khóa "<span className="font-semibold">{searchTerm}</span>"</p>
                            ) : (
                                <p>Hiển thị <span className="font-semibold">{filteredResidents.length}</span> cư dân</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-indigo-900 font-medium">Họ Tên</TableHead>
                                        <TableHead className="text-indigo-900 font-medium">CMND/CCCD</TableHead>
                                        <TableHead className="text-indigo-900 font-medium">Ngày Sinh</TableHead>
                                        <TableHead className="text-indigo-900 font-medium">Giới Tính</TableHead>
                                        <TableHead className="text-indigo-900 font-medium">Điện Thoại</TableHead>
                                        <TableHead className="text-indigo-900 font-medium">Hộ Gia Đình</TableHead>
                                        <TableHead className="text-indigo-900 font-medium">Trạng Thái</TableHead>
                                        <TableHead className="text-indigo-900 font-medium text-center">Thao Tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResidents.map((resident) => (
                                        <TableRow 
                                            key={resident._id} 
                                            className="hover:bg-slate-50 border-b border-slate-200 transition-colors"
                                        >
                                            <TableCell className="font-medium text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${resident.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    {resident.fullName}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-700 font-mono text-sm">
                                                {resident.idCard || <span className="text-slate-400 italic">N/A</span>}
                                            </TableCell>
                                            <TableCell className="text-slate-700">
                                                {resident.dateOfBirth
                                                    ? new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')
                                                    : <span className="text-slate-400 italic">N/A</span>}
                                            </TableCell>
                                            <TableCell>
                                                {resident.gender === 'male' ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Nam
                                                    </span>
                                                ) : resident.gender === 'female' ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Nữ
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-700">
                                                {resident.phone || <span className="text-slate-400 italic">N/A</span>}
                                            </TableCell>
                                            <TableCell>
                                                {resident.household ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 001 1h-3" />
                                                        </svg>
                                                        {resident.household.apartmentNumber}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                        </svg>
                                                        Chưa gán
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {resident.active ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Không hoạt động
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(resident._id)}
                                                        className="h-8 w-8 p-0 rounded-full text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-1 focus:ring-indigo-200 transition-all"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(resident._id)}
                                                        className="h-8 w-8 p-0 rounded-full text-slate-700 hover:bg-amber-50 hover:text-amber-600 focus:ring-1 focus:ring-amber-200 transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {user?.role === 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteHandler(resident._id)}
                                                            className="h-8 w-8 p-0 rounded-full text-slate-700 hover:bg-rose-50 hover:text-rose-600 focus:ring-1 focus:ring-rose-200 transition-all"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredResidents.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-300 rounded-lg mt-6 bg-slate-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-slate-600 font-medium">Không tìm thấy cư dân nào</p>
                                    <p className="text-slate-500 text-sm mt-1">Vui lòng thử tìm kiếm với từ khóa khác hoặc thêm cư dân mới</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

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
                                        <p><span className="font-medium">Số điện thoại:</span> {selectedResident.phone || 'N/A'}</p>
                                        <p><span className="font-medium">Hộ gia đình:</span> {selectedResident.household?.apartmentNumber || 'N/A'}</p>
                                        <p><span className="font-medium">Nghề nghiệp:</span> {selectedResident.occupation || 'N/A'}</p>
                                        <p><span className="font-medium">Nơi làm việc:</span> {selectedResident.workplace || 'N/A'}</p>
                                    </div>
                                </div>
                                {selectedResident.note && (
                                    <div className="col-span-2">
                                        <h3 className="font-semibold mb-2">Ghi Chú</h3>
                                        <p className="text-gray-600">{selectedResident.note}</p>
                                    </div>
                                )}
                                <div className="col-span-2 flex justify-end gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailModalOpen(false)}
                                    >
                                        Đóng
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsDetailModalOpen(false);
                                            handleEdit(selectedResident._id);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Chỉnh Sửa
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Chỉnh Sửa Thông Tin Cư Dân
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ và Tên</Label>
                                    <Input
                                        id="fullName"
                                        value={editFormData.fullName || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                        className={validationErrors.fullName ? "border-red-500" : ""}
                                    />
                                    {validationErrors.fullName && (
                                        <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Giới Tính</Label>
                                    <Select
                                        value={editFormData.gender || ''}
                                        onValueChange={(value) => setEditFormData({ ...editFormData, gender: value as 'male' | 'female' })}
                                    >
                                        <SelectTrigger className={validationErrors.gender ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Nam</SelectItem>
                                            <SelectItem value="female">Nữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.gender && (
                                        <p className="text-sm text-red-500">{validationErrors.gender}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày Sinh</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="idCard">CMND/CCCD</Label>
                                    <Input
                                        id="idCard"
                                        value={editFormData.idCard || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, idCard: e.target.value })}
                                        className={validationErrors.idCard ? "border-red-500" : ""}
                                    />
                                    {validationErrors.idCard && (
                                        <p className="text-sm text-red-500">{validationErrors.idCard}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số Điện Thoại</Label>
                                    <Input
                                        id="phone"
                                        value={editFormData.phone || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className={validationErrors.phone ? "border-red-500" : ""}
                                    />
                                    {validationErrors.phone && (
                                        <p className="text-sm text-red-500">{validationErrors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="household">Hộ Gia Đình</Label>
                                    <Select
                                        value={editFormData.household?._id || 'none'}
                                        onValueChange={(value) => setEditFormData({
                                            ...editFormData,
                                            household: value === 'none' ? undefined : { _id: value, apartmentNumber: '' }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn hộ gia đình" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không thuộc hộ nào</SelectItem>
                                            {households.map((household: Household) => (
                                                <SelectItem key={household._id} value={household._id}>
                                                    {household.apartmentNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="active"
                                    checked={editFormData.active}
                                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, active: checked as boolean })}
                                />
                                <Label htmlFor="active">Đang hoạt động</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Cập Nhật'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader className="border-b pb-4 mb-4">
                                <DialogTitle className="text-xl font-bold text-indigo-900 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Thêm Cư Dân Mới
                                </DialogTitle>
                                <p className="text-slate-500 text-sm mt-1">Nhập thông tin đầy đủ của cư dân mới</p>
                            </DialogHeader>
                            
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                {/* Form grid container */}
                                <div className="flex flex-col space-y-6">
                                    {/* Thông tin cá nhân - Hàng 1 */}
                                    <div className="w-full">
                                        <div className="mb-3 flex items-center border-b border-slate-200 pb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <h3 className="text-sm font-medium text-slate-700">Thông Tin Cá Nhân</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="flex items-center text-sm">
                                                    Họ và Tên <span className="text-rose-500 ml-1">*</span>
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    value={createFormData.fullName}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                                                    className={`transition-all ${
                                                        validationErrors.fullName
                                                            ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                            : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                                    }`}
                                                    placeholder="Nhập họ tên đầy đủ"
                                                />
                                                {validationErrors.fullName && (
                                                    <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{validationErrors.fullName}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="gender" className="flex items-center text-sm">
                                                    Giới Tính <span className="text-rose-500 ml-1">*</span>
                                                </Label>
                                                <Select
                                                    value={createFormData.gender}
                                                    onValueChange={(value) => setCreateFormData({ ...createFormData, gender: value as 'male' | 'female' })}
                                                >
                                                    <SelectTrigger className={`transition-all ${
                                                        validationErrors.gender
                                                            ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                            : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                                    }`}>
                                                        <SelectValue placeholder="Chọn giới tính" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Nam</SelectItem>
                                                        <SelectItem value="female">Nữ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {validationErrors.gender && (
                                                    <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{validationErrors.gender}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="dateOfBirth" className="text-sm">Ngày Sinh</Label>
                                                <Input
                                                    id="dateOfBirth"
                                                    type="date"
                                                    value={createFormData.dateOfBirth}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, dateOfBirth: e.target.value })}
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="placeOfBirth" className="text-sm">Nơi Sinh</Label>
                                                <Input
                                                    id="placeOfBirth"
                                                    value={createFormData.placeOfBirth}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, placeOfBirth: e.target.value })}
                                                    placeholder="Nhập nơi sinh"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Thông tin cá nhân - Hàng 2 */}
                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nationality" className="text-sm">Quốc Tịch</Label>
                                                <Input
                                                    id="nationality"
                                                    value={createFormData.nationality}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, nationality: e.target.value })}
                                                    placeholder="Nhập quốc tịch"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="ethnicity" className="text-sm">Dân Tộc</Label>
                                                <Input
                                                    id="ethnicity"
                                                    value={createFormData.ethnicity}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, ethnicity: e.target.value })}
                                                    placeholder="Nhập dân tộc"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="religion" className="text-sm">Tôn Giáo</Label>
                                                <Input
                                                    id="religion"
                                                    value={createFormData.religion}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, religion: e.target.value })}
                                                    placeholder="Nhập tôn giáo"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="household" className="text-sm">Hộ Gia Đình</Label>
                                                <Select
                                                    value={createFormData.household?._id || 'none'}
                                                    onValueChange={(value) => setCreateFormData({
                                                        ...createFormData,
                                                        household: value === 'none' ? undefined : { _id: value, apartmentNumber: '' }
                                                    })}
                                                >
                                                    <SelectTrigger className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500">
                                                        <SelectValue placeholder="Chọn hộ gia đình" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Không thuộc hộ nào</SelectItem>
                                                        {households.map((household: Household) => (
                                                            <SelectItem key={household._id} value={household._id}>
                                                                {household.apartmentNumber}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        {/* Thông tin cá nhân - Hàng 3 */}
                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="occupation" className="text-sm">Nghề Nghiệp</Label>
                                                <Input
                                                    id="occupation"
                                                    value={createFormData.occupation}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, occupation: e.target.value })}
                                                    placeholder="Nhập nghề nghiệp"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="workplace" className="text-sm">Nơi Làm Việc</Label>
                                                <Input
                                                    id="workplace"
                                                    value={createFormData.workplace}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, workplace: e.target.value })}
                                                    placeholder="Nhập nơi làm việc"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Thông tin giấy tờ và liên hệ */}
                                    <div className="w-full pt-4 border-t border-slate-200">
                                        <div className="mb-3 flex items-center border-b border-slate-200 pb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                            </svg>
                                            <h3 className="text-sm font-medium text-slate-700">Thông Tin Giấy Tờ & Liên Hệ</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="idCard" className="text-sm flex items-center">
                                                    CMND/CCCD <span className="text-rose-500 ml-1">*</span>
                                                </Label>
                                                <Input
                                                    id="idCard"
                                                    value={createFormData.idCard}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, idCard: e.target.value })}
                                                    className={`transition-all ${
                                                        validationErrors.idCard
                                                            ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                            : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                                    }`}
                                                    placeholder="Nhập số CMND/CCCD"
                                                />
                                                {validationErrors.idCard && (
                                                    <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{validationErrors.idCard}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="idCardDate" className="text-sm">Ngày Cấp</Label>
                                                <Input
                                                    id="idCardDate"
                                                    type="date"
                                                    value={createFormData.idCardDate}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, idCardDate: e.target.value })}
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="idCardPlace" className="text-sm">Nơi Cấp</Label>
                                                <Input
                                                    id="idCardPlace"
                                                    value={createFormData.idCardPlace}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, idCardPlace: e.target.value })}
                                                    placeholder="Nhập nơi cấp CMND/CCCD"
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm flex items-center">
                                                    Số Điện Thoại <span className="text-rose-500 ml-1">*</span>
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    value={createFormData.phone}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                                                    className={`transition-all ${
                                                        validationErrors.phone
                                                            ? 'border-rose-500 ring-1 ring-rose-200 focus-visible:ring-rose-300'
                                                            : 'border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500'
                                                    }`}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                                {validationErrors.phone && (
                                                    <div className="flex items-center space-x-1 text-sm text-rose-600 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{validationErrors.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Thông tin bổ sung */}
                                    <div className="w-full pt-4 border-t border-slate-200">
                                        <div className="mb-3 flex items-center border-b border-slate-200 pb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            <h3 className="text-sm font-medium text-slate-700">Thông Tin Bổ Sung</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="note" className="text-sm">Ghi Chú</Label>
                                                <Textarea
                                                    id="note"
                                                    value={createFormData.note}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, note: e.target.value })}
                                                    placeholder="Nhập thông tin bổ sung về cư dân (không bắt buộc)"
                                                    rows={3}
                                                    className="border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500 resize-none"
                                                />
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                                                <div className="flex items-center">
                                                    <Checkbox
                                                        id="active"
                                                        checked={createFormData.active}
                                                        onCheckedChange={(checked) => setCreateFormData({ ...createFormData, active: checked as boolean })}
                                                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                    />
                                                    <Label htmlFor="active" className="text-sm ml-2">
                                                        Đang hoạt động
                                                    </Label>
                                                </div>
                                                <div>
                                                    {createFormData.active ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Hoạt động
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Không hoạt động
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Footer Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Hủy bỏ
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
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Thêm Cư Dân
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </Dialog>
            </div>
        </div>
    );
}
