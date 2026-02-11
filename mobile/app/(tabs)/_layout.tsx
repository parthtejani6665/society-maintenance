import { Tabs } from 'expo-router';
import { Home, FileText, User, IndianRupee, Megaphone } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

function TabBarIcon(props: { icon: any; color: string; size?: number }) {
    const { icon: Icon, color, size = 24 } = props;
    return <Icon size={size} color={color} />;
}

export default function TabLayout() {
    const { user } = useAuth();

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={Home} color={color} />,
                }}
            />
            <Tabs.Screen
                name="complaints"
                options={{
                    title: 'Complaints',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={FileText} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notices"
                options={{
                    title: 'Notices',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={Megaphone} color={color} />,
                }}
            />
            <Tabs.Screen
                name="maintenance"
                options={{
                    title: 'Maintenance',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={IndianRupee} color={color} />,
                    href: user?.role === 'staff' ? null : '/maintenance',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <TabBarIcon icon={User} color={color} />,
                }}
            />
        </Tabs>
    );
}


