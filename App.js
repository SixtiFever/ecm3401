import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import CafeLogin from './components/cafe_onboarding/CafeLogin';
import CafeSignup from './components/cafe_onboarding/CafeSignup';
import CreatePromotion from './components/cafe_general/CreatePromotion';
import CafeSettings from './components/cafe_general/CafeSettings';
import OnboardingRoot from './components/OnboardingRoot';
import UserLogin from './components/user_onboarding/UserLogin';
import UserSignup from './components/user_onboarding/UserSignup';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import CafeDashboard from './components/cafe_general/CafeDashboard';
import UserCards from './components/user_general/UserCards';
import Scanner from './components/user_general/Scanner';
import Map from './components/user_general/Map';

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
        <ComponentStack />
    </NavigationContainer>
  );
}

const ComponentStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Onboarding' component={OnboardingRoot} options={{ headerShown: false }} />
            <Stack.Screen name='Login' component={UserLogin} options={{ headerBackTitleVisible: false }} />
            <Stack.Screen name='Signup' component={UserSignup} options={{ headerBackTitle: 'Login' }} />
            <Stack.Screen name='User Cards' component={UserScreenStack} options={{ headerShown: false }} />
            <Stack.Screen name='Cafe Login' component={CafeLogin} options={{ headerBackTitleVisible: false }} />
            <Stack.Screen name='Cafe Signup' component={CafeSignup} options={{ headerBackTitleVisible: false }} />
            <Stack.Screen name='Dashboard' component={CafeScreenStack} options={{ headerShown: false, headerLeft: false}} />
        </Stack.Navigator>
    )
}

const CafeScreenStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name='Your Cafe' 
                component={CafeDashboard} 
                options={{ 
                    headerRight: () => <Button title='Settings' onPress={null} />, 
                    headerLeft: () => null }} />
            <Stack.Screen name='Create Promotion' component={CreatePromotion}  />
            <Stack.Screen name='Settings' component={CafeSettings} />
        </Stack.Navigator>
    )
}

const UserScreenStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Your loyalty cards' component={UserCards} />
            <Stack.Screen name='Map' component={Map} />
            <Stack.Screen name='Scanner' component={Scanner} />
        </Stack.Navigator>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
