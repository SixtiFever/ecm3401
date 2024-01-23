import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Login from './components/Login';
import CafeSignup from './components/cafe_onboarding/CafeSignup';
import CreatePromotion from './components/cafe_general/CreatePromotion';
import CafeSettings from './components/cafe_general/CafeSettings';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import CafeDashboard from './components/cafe_general/CafeDashboard';

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

            <Stack.Screen name='Cafe Login' component={Login} options={{ headerBackTitleVisible: false }} />
            <Stack.Screen name='Cafe Signup' component={CafeSignup} options={{ headerBackTitleVisible: false }} />
            <Stack.Screen name='Dashboard' component={CafeScreenStack} options={{ headerShown: false, headerLeft: false}} />

        </Stack.Navigator>
    )
}

const CafeScreenStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Your Cafe' component={CafeDashboard} options={{ headerRight: () => <Button title='Settings' onPress={null} /> }} />
            <Stack.Screen name='Create Promotion' component={CreatePromotion}  />
            <Stack.Screen name='Settings' component={CafeSettings} />
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
