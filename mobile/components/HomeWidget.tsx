import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface HomeWidgetProps {
    noticeTitle?: string;
    noticeContent?: string;
    maintenanceAmount?: string;
}

export function HomeWidget({ noticeTitle, noticeContent, maintenanceAmount }: HomeWidgetProps) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <TextWidget
                text="Digital Dwell"
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333333',
                }}
            />

            <FlexWidget style={{ flexDirection: 'column' }}>
                <TextWidget
                    text={noticeTitle || "Latest Notice"}
                    style={{
                        fontSize: 12,
                        color: '#888888',
                        marginBottom: 4,
                    }}
                />
                <TextWidget
                    text={noticeContent || "No new notices"}
                    style={{
                        fontSize: 14,
                        color: '#000000',
                    }}
                />
            </FlexWidget>

            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8,
                }}
            >
                <TextWidget
                    text="Maintenance Due"
                    style={{ fontSize: 12, color: '#888888' }}
                />
                <TextWidget
                    text={maintenanceAmount || "₹ 0"}
                    style={{ fontSize: 14, fontWeight: 'bold', color: '#ef4444' }}
                />
            </FlexWidget>
        </FlexWidget>
    );
}
