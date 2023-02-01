import { FC } from 'react';
import HomeScreen from '@/screens/dashboard/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const DashboardStack: FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ title: 'Home' }}
          component={HomeScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default DashboardStack;
