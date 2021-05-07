/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import NotificationSound from './src/NotificationSound';

AppRegistry.registerComponent(appName, () => App);

NotificationSound.initialize();
