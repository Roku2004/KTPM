'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from "@/components/ui/checkbox";
import { use } from 'react';

interface ValidationErrors {
    username?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    role?: string;
}

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isEditMode = true;

    // Form fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('accountant');
    const [active, setActive] = useState(true);

    // States
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const router = useRouter();
    const { user, token } = useAuth();

    useEffect(() => {
        // Chỉ admin mới được truy cập trang này
        if (!user || !token || user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchUserDetails();
    }, [user, token, id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await fetchApi(`/api/users/${id}`);

            if (response.success) {
                const userData = response.data;
                setUsername(userData.username);
                setFullName(userData.fullName);
                setEmail(userData.email || '');
                setPhone(userData.phone || '');
                setRole(userData.role);
                setActive(userData.active);
            } else {
                toast.error(response.message || 'Không thể tải thông tin người dùng');
            }
            setLoading(false);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Không thể tải thông tin người dùng'
            );
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        if (!username.trim()) errors.username = 'Tên đăng nhập là bắt buộc';
        if (password && password.trim().length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (password && password !== confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        if (!fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
        if (!role) errors.role = 'Vai trò là bắt buộc';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Chuẩn bị dữ liệu
            const userData: {
                username: string;
                fullName: string;
                role: string;
                email?: string;
                phone?: string;
                active: boolean;
                password?: string;
            } = {
                username,
                fullName,
                role,
                active
            };

            // Chỉ thêm các trường có giá trị
            if (email.trim()) userData.email = email.trim();
            if (phone.trim()) userData.phone = phone.trim();
            if (password.trim()) userData.password = password.trim();

            console.log('Sending update data:', userData);

            const response = await fetchApi(`/api/users/${id}`, {
                method: 'PUT',
                body: userData
            });

            console.log('Update response:', response);

            if (response.success) {
                toast.success(response.message || 'Cập nhật người dùng thành công');
                // Chuyển hướng ngay lập tức về trang danh sách
                router.push('/user');
            } else {
                toast.error(response.message || 'Không thể cập nhật người dùng');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error(
                error.response?.data?.message || 'Không thể cập nhật người dùng'
            );
        } finally {
            setLoading(false);
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
                        onClick={() => router.push('/user')}
                        className="border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold text-indigo-900">
                        Chỉnh Sửa Người Dùng
                    </h1>
                </div>
            
                <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                        <CardTitle className="text-lg font-semibold text-indigo-900">Thông tin người dùng</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-700 font-medium">Tên đăng nhập</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={true}
                                    className="bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed"
                                />
                            </div>
            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-700 font-medium">
                                        Mật khẩu mới (để trống nếu không đổi)
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`bg-white border ${validationErrors.password 
                                            ? "border-rose-500 focus:border-rose-500 focus:ring focus:ring-rose-200" 
                                            : "border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"}`}
                                    />
                                    {validationErrors.password && (
                                        <p className="text-sm text-rose-500 flex items-center mt-1">
                                            <span className="h-1 w-1 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                                            {validationErrors.password}
                                        </p>
                                    )}
                                </div>
            
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Xác nhận mật khẩu</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`bg-white border ${validationErrors.confirmPassword 
                                            ? "border-rose-500 focus:border-rose-500 focus:ring focus:ring-rose-200" 
                                            : "border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"}`}
                                    />
                                    {validationErrors.confirmPassword && (
                                        <p className="text-sm text-rose-500 flex items-center mt-1">
                                            <span className="h-1 w-1 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                                            {validationErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>
            
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-slate-700 font-medium">Họ và Tên</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={`bg-white border ${validationErrors.fullName 
                                        ? "border-rose-500 focus:border-rose-500 focus:ring focus:ring-rose-200" 
                                        : "border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"}`}
                                />
                                {validationErrors.fullName && (
                                    <p className="text-sm text-rose-500 flex items-center mt-1">
                                        <span className="h-1 w-1 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                                        {validationErrors.fullName}
                                    </p>
                                )}
                            </div>
            
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-slate-700 font-medium">Vai trò</Label>
                                <Select
                                    value={role}
                                    onValueChange={setRole}
                                >
                                    <SelectTrigger className={`bg-white border ${validationErrors.role 
                                        ? "border-rose-500 focus:border-rose-500 focus:ring focus:ring-rose-200" 
                                        : "border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"}`}>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="accountant" className="hover:bg-indigo-50 hover:text-indigo-700">
                                            Kế toán
                                        </SelectItem>
                                        <SelectItem value="manager" className="hover:bg-indigo-50 hover:text-indigo-700">
                                            Quản lý
                                        </SelectItem>
                                        <SelectItem value="admin" className="hover:bg-indigo-50 hover:text-indigo-700">
                                            Quản trị viên
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {validationErrors.role && (
                                    <p className="text-sm text-rose-500 flex items-center mt-1">
                                        <span className="h-1 w-1 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                                        {validationErrors.role}
                                    </p>
                                )}
                            </div>
            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
            
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-700 font-medium">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-white border border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100"
                                    />
                                </div>
                            </div>
            
                            <div className="pt-2">
                                <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-md py-3 px-4">
                                    <Checkbox
                                        id="active"
                                        checked={active}
                                        onCheckedChange={(checked) => setActive(checked as boolean)}
                                        className="text-indigo-600 border-indigo-300 focus:ring-indigo-100"
                                    />
                                    <Label htmlFor="active" className="text-slate-700 font-medium">Người dùng đang hoạt động</Label>
                                </div>
                            </div>
            
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 