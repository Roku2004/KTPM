import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/api'

interface User {
    _id: string
    username: string
    role: string
    fullName: string
    email: string
    phone: string
}

interface RequestWithUser extends NextRequest {
    user?: User
}

// Protect routes - sử dụng token từ header Authorization
export async function protect(req: RequestWithUser) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authorized, no token' },
                { status: 401 }
            )
        }

        try {
            // Gọi API để verify token
            const response = await fetchApi('/users/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.success) {
                return NextResponse.json(
                    { success: false, message: 'Not authorized, invalid token' },
                    { status: 401 }
                )
            }

            // Lưu thông tin user vào request
            req.user = response.data
            return NextResponse.next()
        } catch (error) {
            console.error('Token verification error:', error)
            return NextResponse.json(
                { success: false, message: 'Not authorized, invalid token' },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Auth middleware error:', error)
        return NextResponse.json(
            { success: false, message: 'Server error in authentication' },
            { status: 500 }
        )
    }
}

// Grant access to specific roles
export function authorize(...roles: string[]) {
    return async (req: RequestWithUser) => {
        if (!req.user) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            )
        }

        if (!roles.includes(req.user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Role ${req.user.role} is not authorized to access this resource`
                },
                { status: 403 }
            )
        }

        return NextResponse.next()
    }
} 