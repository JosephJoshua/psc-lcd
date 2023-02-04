import { FC } from 'react';
import HomeScreen from '@/screens/dashboard/HomeScreen';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const DashboardStack: FC = () => {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: 'white' },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Group>
          <Stack.Screen
            name="Home"
            options={{ title: 'Home' }}
            component={HomeScreen}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default DashboardStack;
