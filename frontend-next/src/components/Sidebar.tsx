'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Home,
    Users,
    Receipt,
    DollarSign,
    User,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
    { href: '/dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { href: '/households', label: 'Hộ Gia Đình', icon: Home },
    { href: '/residents', label: 'Cư Dân', icon: Users },
    { href: '/fees', label: 'Loại Phí', icon: Receipt },
    { href: '/payments', label: 'Thanh Toán', icon: DollarSign },
    { href: '/user', label: 'Cài Đặt', icon: User },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-white border-r w-64">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold text-gray-900">Quản Lý Chung Cư</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-2',
                                isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-50'
                            )}
                            onClick={() => router.push(item.href)}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Button>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Đăng Xuất
                </Button>
            </div>
        </div>
    );
} 