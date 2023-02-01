import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator></RootNavigator>
    </SafeAreaProvider>
  );
}
