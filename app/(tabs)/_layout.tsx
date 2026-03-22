import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === '#7C3AED' ? 1 : 0.5 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === '#7C3AED' ? 1 : 0.5 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="pickup"
        options={{
          title: 'Pickup',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === '#7C3AED' ? 1 : 0.5 }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === '#7C3AED' ? 1 : 0.5 }}>👤</Text>,
        }}
      />
      {/* Hidden tabs — accessible via navigation, not shown in tab bar */}
      <Tabs.Screen name="bio" options={{ href: null }} />
      <Tabs.Screen name="optimise" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
