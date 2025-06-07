'use client';

import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { Loader2, Pencil, Plus, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
    _id: string;
    username: string;
    fullName: string;
    role: string;
    email: string;
    phone: string;
    active: boolean;
}

export default function UserListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const router = useRouter();
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user || !token || user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchUsers();
    }, [user, token, router]);

    useEffect(() => {
        const handleRouteChange = () => {
            fetchUsers();
        };

        window.addEventListener('popstate', handleRouteChange);
        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetchApi('/api/users');
            if (response.success) {
                setUsers(response.data);
            } else {
                toast.error(response.message || 'Không thể tải danh sách người dùng');
            }
            setLoading(false);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể tải danh sách người dùng'
            );
            setLoading(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (user._id === user?._id) {
            toast.error('Không thể xóa tài khoản của chính mình');
            return;
        }
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetchApi(`/api/users/${userToDelete._id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                toast.success(response.message || 'Xóa người dùng thành công');
                fetchUsers();
            } else {
                toast.error(response.message || 'Không thể xóa người dùng');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể xóa người dùng'
            );
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleStatusChange = async (userId: string, currentStatus: boolean) => {
        try {
            setUpdatingStatus(userId);
            const response = await fetchApi(`/api/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    active: !currentStatus
                })
            });

            if (response.success) {
                toast.success(response.message || 'Cập nhật trạng thái thành công');
                fetchUsers();
            } else {
                toast.error(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể cập nhật trạng thái'
            );
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.username?.toLowerCase().includes(searchLower) ||
            user.fullName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone?.toLowerCase().includes(searchLower) ||
            user.role?.toLowerCase().includes(searchLower)
        );
    });

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên';
            case 'manager':
                return 'Quản lý';
            case 'accountant':
                return 'Kế toán';
            default:
                return role;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
                        <div className="flex-1 p-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-indigo-900">Quản Lý Người Dùng</h1>
                        <Button
                            onClick={() => router.push('/user/create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm Người Dùng
                        </Button>
                    </div>
                </div>
            
                <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                        <CardTitle className="text-lg font-semibold text-indigo-900">Danh sách người dùng</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm kiếm theo tên, email, số điện thoại, vai trò..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-white border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                                {searchTerm && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSearchTerm('')}
                                        className="h-10 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
            
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium text-slate-600">Mã</TableHead>
                                            <TableHead className="font-medium text-slate-600">Tên đăng nhập</TableHead>
                                            <TableHead className="font-medium text-slate-600">Họ và tên</TableHead>
                                            <TableHead className="font-medium text-slate-600">Vai trò</TableHead>
                                            <TableHead className="font-medium text-slate-600">Email</TableHead>
                                            <TableHead className="font-medium text-slate-600">Số điện thoại</TableHead>
                                            <TableHead className="font-medium text-slate-600">Trạng thái</TableHead>
                                            <TableHead className="text-right font-medium text-slate-600">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    <div className="flex flex-col items-center">
                                                        <Search className="h-8 w-8 mb-2 text-slate-300" />
                                                        <span>Không tìm thấy người dùng nào</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                    <TableCell className="font-mono text-xs text-slate-600">{user._id}</TableCell>
                                                    <TableCell className="font-medium text-slate-800">{user.username}</TableCell>
                                                    <TableCell>{user.fullName}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                            {getRoleLabel(user.role)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{user.email || 'Chưa cung cấp'}</TableCell>
                                                    <TableCell className="text-slate-600">{user.phone || 'Chưa cung cấp'}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStatusChange(user._id, user.active)}
                                                            disabled={updatingStatus === user._id || user._id === user?._id}
                                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                                }`}
                                                        >
                                                            {updatingStatus === user._id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <div className={`h-1.5 w-1.5 rounded-full mr-1.5 inline-block ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                    {user.active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.push(`/user/${user._id}/edit`)}
                                                                className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 