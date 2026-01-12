import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { BucketsScreen } from '../screens/BucketsScreen';
import { BucketDetailScreen } from '../screens/BucketDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BucketsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          ...theme.typography.title,
          fontSize: 22,
          color: theme.colors.text,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="BucketsList"
        component={BucketsScreen}
        options={{
          title: 'Venture',
          headerLargeTitle: Platform.OS === 'ios',
          headerLargeTitleStyle: Platform.OS === 'ios'
            ? {
                ...theme.typography.title,
                fontSize: 30,
                color: theme.colors.text,
              }
            : undefined,
        }}
      />
      <Stack.Screen
        name="BucketDetail"
        component={BucketDetailScreen}
        options={{
          title: 'Bucket',
        }}
      />
    </Stack.Navigator>
  );
};

// Custom tab bar
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={0.85}
              style={styles.tabButton}
            >
              <View style={[styles.tabPill, isFocused && styles.tabPillActive]}>
                <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                  {options.tabBarIcon?.({
                    color: isFocused 
                      ? (route.name === 'Profile' ? theme.colors.primary : theme.colors.accent)
                      : '#9CA3AF', 
                    focused: isFocused
                  })}
                </Text>
                <Text style={[
                  styles.tabLabel, 
                  isFocused && styles.tabLabelActive,
                  isFocused && route.name === 'Profile' && { color: theme.colors.primary }
                ]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => {
  const { isAdmin } = useAuth();
  
  // Safety check: ensure isAdmin is a boolean
  const userIsAdmin = Boolean(isAdmin);
  
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="BucketsTab"
        component={BucketsStack}
        options={{
          title: 'Buckets',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>🔍</Text>
          ),
        }}
      />
      {userIsAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: 'Admin',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 24 }}>⚙️</Text>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Use user ID or 'guest' as key to force NavigationContainer to reset on auth change
  const navigationKey = user ? `authenticated-${user.id}` : 'guest';

  return (
    <NavigationContainer key={navigationKey}>
      {user ? (
        <Stack.Navigator 
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerShadowVisible: false,
            headerTitleAlign: 'left',
            headerTintColor: theme.colors.primary,
            headerTitleStyle: {
              ...theme.typography.title,
              fontSize: 22,
              color: theme.colors.text,
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen 
            name="HelpSupport" 
            component={HelpSupportScreen}
            options={{ title: 'Help & Support' }}
          />
          <Stack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
            options={{ title: 'Privacy Policy' }}
          />
          <Stack.Screen 
            name="TermsOfService" 
            component={TermsOfServiceScreen}
            options={{ title: 'Terms of Service' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Landing"
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarOuter: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 62,
    borderRadius: 999,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(15, 23, 42, 0.96)'
      : '#111827',
    paddingHorizontal: 8,
    ...theme.shadows.floating,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPill: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabIconActive: {
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  tabLabelActive: {
    color: '#E5E7EB',
  },
});
