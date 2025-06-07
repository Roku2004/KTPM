'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { LogOut, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    // Hàm lấy chữ cái đầu của tên người dùng
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
    }

    // Hàm format vai trò người dùng
    const formatRole = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên'
            case 'manager':
                return 'Quản lý'
            default:
                return role
        }
    }

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-gray-900">Hệ Thống Quản Lý Chung Cư</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Đăng xuất</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                            {user?.fullName ? getInitials(user.fullName) : user?.username?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                                    {user?.fullName ? getInitials(user.fullName) : user?.username?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Shield className="h-3 w-3 text-blue-600" />
                                                    <p className="text-xs text-blue-600">
                                                        {formatRole(user?.role || '')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs leading-none text-muted-foreground mt-2">
                                            {user?.email || 'Chưa có email'}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}