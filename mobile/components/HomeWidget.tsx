import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface HomeWidgetProps {
    noticeTitle?: string;
    noticeContent?: string;
    maintenanceAmount?: string;
}

export function HomeWidget({ noticeTitle, noticeContent, maintenanceAmount }: HomeWidgetProps) {
    const isMaintenanceDue = maintenanceAmount && maintenanceAmount !== '₹ 0' && maintenanceAmount !== '₹ 0.00';

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#f8fafc', // slate-50
                borderRadius: 16,
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <FlexWidget
                style={{
                    backgroundColor: '#1e40af', // blue-800
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <TextWidget
                    text="Digital Dwell"
                    style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#ffffff',
                    }}
                />
                <TextWidget
                    text="Society App"
                    style={{
                        fontSize: 10,
                        color: '#93c5fd', // blue-300
                    }}
                />
            </FlexWidget>

            {/* Content Container */}
            <FlexWidget
                style={{
                    padding: 12,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: 'match_parent',
                }}
            >
                {/* Notice Section */}
                <FlexWidget
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: 'column',
                        marginBottom: 8,
                    }}
                >
                    <TextWidget
                        text="LATEST NOTICE"
                        style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#64748b', // slate-500
                            marginBottom: 4,
                            letterSpacing: 1,
                        }}
                    />
                    <TextWidget
                        text={noticeTitle || "No New Notices"}
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#0f172a', // slate-900
                            marginBottom: 2,
                        }}
                        maxLines={1}
                    />
                    <TextWidget
                        text={noticeContent || "Check the app for recent updates and announcements."}
                        style={{
                            fontSize: 12,
                            color: '#475569', // slate-600
                        }}
                        maxLines={2}
                    />
                </FlexWidget>

                {/* Maintenance Section */}
                <FlexWidget
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: isMaintenanceDue ? '#fee2e2' : '#dcfce7', // red-100 : emerald-100
                    }}
                >
                    <FlexWidget style={{ flexDirection: 'column' }}>
                        <TextWidget
                            text="MAINTENANCE DUE"
                            style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                color: '#64748b', // slate-500
                            }}
                        />
                        <TextWidget
                            text={isMaintenanceDue ? "Actions Required" : "All Paid"}
                            style={{
                                fontSize: 10,
                                color: isMaintenanceDue ? '#e11d48' : '#059669', // rose-600 : emerald-600
                                marginTop: 2,
                            }}
                        />
                    </FlexWidget>

                    <TextWidget
                        text={maintenanceAmount || "₹ 0"}
                        style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: isMaintenanceDue ? '#dc2626' : '#059669', // red-600 : emerald-600
                        }}
                    />
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}
