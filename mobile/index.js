import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './services/WidgetTaskHandler';
import 'expo-router/entry';

registerWidgetTaskHandler(widgetTaskHandler);
