import { Tabs } from 'expo-router';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Dumbbell, Bell, Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable } from 'react-native';
import { colors } from '@/theme/colors';

function HapticTabButton(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...(props as React.ComponentProps<typeof Pressable>)}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        (props.onPress as React.ComponentProps<typeof Pressable>['onPress'])?.(e);
      }}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          borderTopWidth: 1,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 10,
          marginTop: 4,
        },
        tabBarButton: HapticTabButton,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="alarms"
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color, size }) => (
            <Bell size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size }) => (
            <Activity size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
