'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface PrivateRouteProps {
    children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
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

    return <>{children}</>
}

export default PrivateRoute 