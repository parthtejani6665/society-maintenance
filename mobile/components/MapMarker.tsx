import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface MapMarkerProps {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    description?: string;
    type?: string;
}

export const MapMarker = ({ coordinate, title, description }: MapMarkerProps) => {
    return (
        <Marker coordinate={coordinate}>
            <View className="bg-white p-1 rounded-full border border-blue-500 shadow-sm">
                <MapPin size={24} color="#2563eb" fill="#eff6ff" />
            </View>
            <Callout tooltip>
                <View className="bg-white p-3 rounded-xl border border-slate-200 shadow-md w-48 mb-2">
                    <Text className="font-bold text-slate-800 mb-1">{title}</Text>
                    {description && (
                        <Text className="text-xs text-slate-500" numberOfLines={2}>
                            {description}
                        </Text>
                    )}
                </View>
            </Callout>
        </Marker>
    );
};
