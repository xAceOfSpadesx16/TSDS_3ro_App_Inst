import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CameraScreen from '../screens/CameraScreen';
import SubjectListScreen from '../screens/SubjectListScreen';

export type RootStackParamList = {
  Login: undefined;
  Camera: undefined;
  SubjectList: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? 'Camera' : 'Login'}
      >
        <Stack.Screen name="Login">
          {({ navigation }) => (
            <LoginScreen onLoginSuccess={() => navigation.replace('Camera')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="SubjectList" component={SubjectListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
