'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { login as apiLogin, fetchApi } from '@/lib/api'

interface User {
    _id: string
    username: string
    fullName: string
    role: string
    email: string
    phone: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    loading: boolean
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const login = async (username: string, password: string) => {
        try {
            setLoading(true)
            console.log('Attempting login with:', { username })

            const response = await apiLogin(username, password)
            console.log('Login response:', response)

            if (!response || typeof response !== 'object') {
                throw new Error('Response không hợp lệ')
            }

            if (!response.success) {
                throw new Error(response.message || 'Đăng nhập thất bại')
            }

            if (!response.data) {
                throw new Error('Không có dữ liệu đăng nhập')
            }

            const { token, user } = response.data
            if (!token || !user) {
                throw new Error('Dữ liệu đăng nhập không hợp lệ')
            }

            const userInfo = {
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                    email: user.email,
                    phone: user.phone
                }
            }

            localStorage.setItem('userInfo', JSON.stringify(userInfo))
            setUser(userInfo.user)
            setToken(token)
            setIsAuthenticated(true)

            return { success: true }
        } catch (error: any) {
            console.error('Login error:', error)
            return {
                success: false,
                message: error.message || 'Đăng nhập thất bại'
            }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('userInfo')
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export { AuthContext }