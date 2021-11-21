import 'globalthis/auto';
import {ActivityIndicator, AppRegistry, LogBox, Platform} from 'react-native';
import 'react-native-url-polyfill/auto';
import App from './App';
import {name as appName} from './app.json';

LogBox.ignoreLogs([
  'Setting a timer',
  'Each child in a list',
  'Non-serializable values were found',
]);

if (Platform.OS === 'android') {
  if (!ActivityIndicator.defaultProps) ActivityIndicator.defaultProps = {};
  ActivityIndicator.defaultProps.color = 'white';
}

AppRegistry.registerComponent(appName, () => App);
