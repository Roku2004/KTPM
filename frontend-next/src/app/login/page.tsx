'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const router = useRouter()
    const { login, user, loading } = useAuth()

    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [router, user])

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const result = await login(username, password)

            if (!result || !result.success) {
                setError(result?.message || 'Đăng nhập thất bại')
            } else {
                router.push('/dashboard')
            }
        } catch (error: any) {
            console.error('Lỗi đăng nhập:', error)
            setError(error.message || 'Đã có lỗi xảy ra')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md p-6 shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">Blue Moon Apartment</h1>
                    <p className="text-gray-600 mt-2">Hệ thống quản lý chung cư</p>
                </div>

                <h2 className="text-center text-2xl font-bold mb-6">Đăng nhập</h2>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submitHandler} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>
                </form>

                <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                    <p><strong>Lưu ý:</strong> Tài khoản quản lý chỉ được cấp bởi quản trị viên hệ thống.</p>
                </div>
            </Card>
        </div>
    )
}