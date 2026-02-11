import React from 'react';
import { View, ViewProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card = ({ children, className, noPadding, ...props }: CardProps) => {
    return (
        <View
            className={cn(
                "bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50",
                !noPadding && "p-6",
                className
            )}
            {...props}
        >
            {children}
        </View>
    );
};
