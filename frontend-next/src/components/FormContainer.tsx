'use client'

import { cn } from '@/lib/utils'

interface FormContainerProps {
    children: React.ReactNode
    className?: string
}

const FormContainer = ({ children, className }: FormContainerProps) => {
    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-center">
                <div className={cn(
                    'w-full max-w-2xl',
                    className
                )}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default FormContainer 