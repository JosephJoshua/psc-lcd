import { FC } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import onAdd from '@/events/onAdd';
import useUser from '@/hooks/useUser';
import AccountsScreen from '@/screens/dashboard/AccountsScreen';
import HomeScreen from '@/screens/dashboard/HomeScreen';
import { ScreenNameValues } from '@/types/screenNames';
import { Feather } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon, IconButton, Pressable, useToken } from 'native-base';

const Stack = createNativeStackNavigator();

const screenNames = Object.freeze({
  home: 'Home',
  accounts: 'Accounts',
});

type ScreenNames = typeof screenNames;

const getIcon = (
  screen: ScreenNames[keyof ScreenNames],
): string | undefined => {
  switch (screen) {
    case screenNames.home:
      return 'home';

    case screenNames.accounts:
      return 'user';

    default:
      return undefined;
  }
};

const DashboardStack: FC = () => {
  const [gray50, gray300] = useToken('colors', [
    'gray.50',
    'gray.300',
  ]) as string[];

  const user = useUser();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: gray50 },
      }}
    >
      {user?.role !== 'admin' ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Group>
            <Stack.Screen
              name={screenNames.home}
              options={{ title: 'Home' }}
              component={HomeScreen}
            />
          </Stack.Group>
        </Stack.Navigator>
      ) : (
        <CurvedBottomBar.Navigator
          screenOptions={{ headerShown: false }}
          defaultScreenOptions={undefined}
          strokeWidth={0.5}
          strokeColor={gray300}
          height={70}
          circleWidth={55}
          bgColor="white"
          initialRouteName="Home"
          borderTopLeftRight
          renderCircle={({ selectedTab }) => (
            <Animated.View style={styles.btnCircle}>
              {user?.role === 'admin' && (
                <IconButton
                  icon={
                    <Icon as={Feather} name="plus" size="xl" color="white" />
                  }
                  onPress={() => onAdd.trigger(selectedTab as ScreenNameValues)}
                  size="16"
                  backgroundColor="primary.500"
                  rounded="full"
                  shadow="3"
                />
              )}
            </Animated.View>
          )}
          tabBar={({ routeName, selectedTab, navigate }) => {
            return (
              <Pressable
                onPress={() => navigate(routeName)}
                justifyContent="center"
                alignItems="center"
                display="flex"
                flex={1}
              >
                <Icon
                  as={Feather}
                  name={getIcon(routeName as ScreenNames[keyof ScreenNames])}
                  color={routeName === selectedTab ? 'black' : 'gray.200'}
                  size="md"
                />
              </Pressable>
            );
          }}
        >
          <CurvedBottomBar.Screen
            name={screenNames.home}
            position="LEFT"
            component={HomeScreen}
          />

          <CurvedBottomBar.Screen
            name="Accounts"
            position="RIGHT"
            component={AccountsScreen}
          />
        </CurvedBottomBar.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
    bottom: 30,
  },
});

export default DashboardStack;
