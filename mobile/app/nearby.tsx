import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Hospital, Landmark } from 'lucide-react-native'; // Landmark for Police/Gov
import { getNearbyServices } from '../services/mapService';
import { MapMarker } from '../components/MapMarker';
import { Theme } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'atm', label: 'ATM', icon: 'credit-card' }, // using string for now, implementing logic later
    { id: 'hospital', label: 'Hospital', icon: 'activity' },
    { id: 'police', label: 'Police', icon: 'shield' },
    { id: 'restaurant', label: 'Food', icon: 'coffee' },
];

export default function NearbyServices() {
    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('atm');
    const [places, setPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            fetchPlaces(location.coords.latitude, location.coords.longitude, selectedCategory);
        })();
    }, []);

    const fetchPlaces = async (lat: number, lng: number, type: string) => {
        setLoading(true);
        try {
            const results = await getNearbyServices(lat, lng, type);
            setPlaces(results);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch nearby places');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        if (location) {
            fetchPlaces(location.coords.latitude, location.coords.longitude, category);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-12 pb-4 px-4 bg-white z-10 shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-slate-100 rounded-full">
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Nearby Services</Text>
            </View>

            {/* Map */}
            {location ? (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {places.map((place, index) => (
                        <MapMarker
                            key={index}
                            coordinate={{
                                latitude: place.geometry.location.lat,
                                longitude: place.geometry.location.lng,
                            }}
                            title={place.name}
                            description={place.vicinity}
                        />
                    ))}
                </MapView>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                    <Text className="mt-4 text-slate-500">Getting location...</Text>
                </View>
            )}

            {/* Category Filter Chips */}
            <View className="absolute bottom-10 left-0 right-0">
                <View className="flex-row justify-center flex-wrap gap-2 px-4">
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => handleCategoryChange(cat.id)}
                            className={`px-4 py-2 rounded-full shadow-md ${selectedCategory === cat.id ? 'bg-blue-600' : 'bg-white'
                                }`}
                        >
                            <Text
                                className={`font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-700'
                                    }`}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading && (
                <View className="absolute top-32 left-0 right-0 items-center">
                    <View className="bg-white/90 px-4 py-2 rounded-full shadow-md">
                        <ActivityIndicator size="small" color={Theme.colors.primary} />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
        width: width,
        height: height,
    },
});
