import React from 'react';
import { LucideProps } from 'lucide-react-native';

interface IconProps extends LucideProps {
    icon: any;
    color?: string;
    size?: number;
}

export const Icon = ({ icon: LucideIcon, color = '#64748b', size = 24, ...props }: IconProps) => {
    return <LucideIcon color={color} size={size} {...props} />;
};
