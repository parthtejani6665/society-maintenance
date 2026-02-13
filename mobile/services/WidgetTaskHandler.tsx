import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { MaintenanceSmallWidget } from '../components/MaintenanceSmallWidget';
import { MaintenanceMediumWidget } from '../components/MaintenanceMediumWidget';
import { MaintenanceLargeWidget } from '../components/MaintenanceLargeWidget';

import { WidgetService } from './WidgetService';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED':
            const data = await WidgetService.getMaintenanceWidgetData();

            switch (widgetInfo.widgetName) {
                case 'MaintenanceSmall':
                    props.renderWidget(
                        <MaintenanceSmallWidget
                            month={data.month}
                            amount={data.amount}
                            status={data.status}
                        />
                    );
                    break;
                case 'MaintenanceMedium':
                    props.renderWidget(
                        <MaintenanceMediumWidget
                            month={data.month}
                            amount={data.amount}
                            dueDate={data.dueDate}
                            status={data.status}
                            collectionProgress={data.collectionProgress}
                        />
                    );
                    break;
                case 'MaintenanceLarge':
                    props.renderWidget(
                        <MaintenanceLargeWidget
                            month={data.month}
                            amount={data.amount}
                            dueDate={data.dueDate}
                            status={data.status}
                            collectionProgress={data.collectionProgress}
                            lastPaymentDate={data.lastPaymentDate}
                            lastPaymentAmount={data.lastPaymentAmount}
                        />
                    );
                    break;
            }
            break;

        case 'WIDGET_DELETED':
            // Cleanup if needed
            break;

        case 'WIDGET_CLICK':
            // Handle clicks (e.g. open app)
            break;

        default:
            break;
    }
}
