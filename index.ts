import { createElement } from 'react';
import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import { createRoot } from 'react-dom/client';

import App from './src/_app';

/**
 * @see https://github.com/expo/expo/issues/18485
 */
if (Platform.OS === 'web') {
  let rootEl =
    document.getElementById('root') ?? document.getElementById('main');

  if (rootEl == null) {
    rootEl = document.createElement('root');
    document.body.appendChild(rootEl);
  }

  const rootTag = createRoot(rootEl);
  rootTag.render(createElement(App));
} else {
  /**
   * registerRootComponent calls AppRegistry.registerComponent('main', () => App);
   * It also ensures that whether you load the app in Expo Go or in a native build,
   * the environment is set up appropriately.
   * @see https://github.com/t3-oss/create-t3-turbo/blob/main/apps/expo/index.ts
   */

  registerRootComponent(App);
}
