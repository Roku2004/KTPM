'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type MessageVariant = 'default' | 'destructive'

interface MessageProps {
    variant?: MessageVariant
    children: React.ReactNode
    dismissible?: boolean
    className?: string
    type?: 'success' | 'warning' | 'info'
}

const Message = ({
    variant = 'default',
    children,
    dismissible = false,
    className,
    type
}: MessageProps) => {
    const [show, setShow] = useState(true)

    if (!show) return null

    const typeStyles = {
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    }

    return (
        <Alert
            variant={variant}
            className={cn(
                'relative',
                type && typeStyles[type],
                className
            )}
        >
            <AlertDescription>{children}</AlertDescription>
            {dismissible && (
                <button
                    onClick={() => setShow(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Đóng</span>
                </button>
            )}
        </Alert>
    )
}

export default Message 