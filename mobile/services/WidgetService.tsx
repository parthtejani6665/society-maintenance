import { requestWidgetUpdate } from 'react-native-android-widget';
import { HomeWidget, HomeWidgetProps } from '../components/HomeWidget';

export const WidgetService = {
    updateHomeWidget: async (data: HomeWidgetProps) => {
        try {
            await requestWidgetUpdate({
                widgetName: 'HomeWidget',
                renderWidget: () => <HomeWidget { ...data } />,
                widgetNotFound: () => {
                    // Widget not added by user yet
                    console.log('HomeWidget not found on home screen');
                }
            });
            console.log('Widget update requested with data:', data);
        } catch (error) {
            console.error('Failed to update widget:', error);
        }
    }
};
