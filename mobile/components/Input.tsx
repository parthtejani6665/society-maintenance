import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
    icon?: React.ReactNode;
}

export const Input = ({
    label,
    error,
    containerClassName,
    icon,
    className,
    ...props
}: InputProps) => {
    return (
        <View className={cn("mb-4", containerClassName)}>
            {label && (
                <Text className="text-slate-700 font-semibold mb-2 text-sm ml-1">
                    {label}
                </Text>
            )}
            <View className={cn(
                "flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 min-h-[56px] focus:border-blue-500",
                error && "border-rose-300 bg-rose-50"
            )}>
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    className={cn("flex-1 text-slate-900 text-base py-3", className)}
                    placeholderTextColor="#94a3b8"
                    {...props}
                />
            </View>
            {error && (
                <Text className="text-rose-600 text-xs mt-1 ml-1 font-medium">
                    {error}
                </Text>
            )}
        </View>
    );
};
