import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    loading?: boolean;
    className?: string;
    textClassName?: string;
    icon?: React.ReactNode;
}

export const Button = ({
    title,
    variant = 'primary',
    loading,
    className,
    textClassName,
    icon,
    disabled,
    ...props
}: ButtonProps) => {
    const variantStyles = {
        primary: 'bg-blue-800 shadow-blue-800/20 shadow-lg',
        secondary: 'bg-blue-50 border border-blue-100',
        danger: 'bg-rose-50 border border-rose-100',
        ghost: '',
        outline: 'bg-transparent border border-slate-200',
    };

    const textStyles = {
        primary: 'text-white',
        secondary: 'text-blue-700',
        danger: 'text-rose-600',
        ghost: 'text-slate-600',
        outline: 'text-slate-700',
    };

    return (
        <TouchableOpacity
            className={cn(
                "flex-row items-center justify-center rounded-2xl py-4 px-6 active:scale-[0.98]",
                variantStyles[variant],
                (disabled || loading) && "opacity-60",
                className
            )}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#1e40af'} />
            ) : (
                <>
                    {icon && <Text className="mr-2">{icon}</Text>}
                    <Text className={cn("text-base font-bold", textStyles[variant], textClassName)}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};
