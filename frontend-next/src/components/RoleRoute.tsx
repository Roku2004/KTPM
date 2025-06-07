'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface RoleRouteProps {
    children: React.ReactNode
    allowedRoles: string[]
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
    const { userInfo, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !userInfo) {
            router.push('/login')
        }
    }, [userInfo, loading, router])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!userInfo) {
        return null
    }

    // Check if user has required role
    const hasRequiredRole = allowedRoles.includes(userInfo.role)

    if (!hasRequiredRole) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Bạn không có quyền truy cập trang này. Khu vực này chỉ dành cho người dùng có vai trò: {allowedRoles.join(', ')}.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return <>{children}</>
}

export default RoleRoute 