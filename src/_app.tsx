import { FC } from 'react';
import RootNavigator from '@/navigation/RootNavigator';
import {
  INativebaseConfig,
  NativeBaseProvider,
  StatusBar,
  extendTheme,
} from 'native-base';

const config: INativebaseConfig = {
  strictMode: 'warn',
};

const colors = {
  primary: {
    50: '#C69EA7',
    100: '#C08391',
    200: '#BF677B',
    300: '#C44864',
    400: '#C72C4F',
    500: '#C7163F',
    600: '#C9002E',
    700: '#A31233',
    800: '#861D35',
    900: '#6F2435',
  },
};

const theme = extendTheme({
  colors,
});

const App: FC = () => {
  return (
    <NativeBaseProvider config={config} theme={theme}>
      <RootNavigator></RootNavigator>
      <StatusBar animated hidden={false} />
    </NativeBaseProvider>
  );
};

export default App;
