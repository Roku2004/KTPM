'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type LoaderSize = 'small' | 'medium' | 'large'

interface LoaderProps {
    size?: LoaderSize
    text?: string | null
    centered?: boolean
    className?: string
}

const Loader = ({
    size = 'medium',
    text = 'Đang tải...',
    centered = true,
    className
}: LoaderProps) => {
    const sizeMap = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    }

    return (
        <div
            className={cn(
                'flex items-center gap-2 my-3',
                centered && 'justify-center',
                className
            )}
        >
            <Loader2
                className={cn(
                    sizeMap[size],
                    'animate-spin'
                )}
            />
            {text && (
                <span className="text-sm text-muted-foreground">{text}</span>
            )}
        </div>
    )
}

export default Loader 