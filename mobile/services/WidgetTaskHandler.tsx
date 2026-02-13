import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { HomeWidget } from '../components/HomeWidget';

const nameToWidget = {
    // Hello is the name of the widget
    HomeWidget: HomeWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED':
            props.renderWidget(<Widget />);
            break;

        case 'WIDGET_DELETED':
            // cleanup if needed
            break;

        case 'WIDGET_CLICK':
            // handle click
            break;

        default:
            break;
    }
}
