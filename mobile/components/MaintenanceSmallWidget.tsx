import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface MaintenanceSmallWidgetProps {
    month: string;
    amount: string;
    status: 'paid' | 'due' | 'overdue';
}

export function MaintenanceSmallWidget({ month, amount, status }: MaintenanceSmallWidgetProps) {
    const isPaid = status === 'paid';
    const isOverdue = status === 'overdue';

    // Calm financial palette
    const primaryColor = '#1e3a8a'; // Blue-900
    const successColor = '#059669'; // Emerald-600
    const errorColor = '#dc2626'; // Red-600
    const warningColor = '#d97706'; // Amber-600

    const statusColor = isPaid ? successColor : (isOverdue ? warningColor : errorColor);
    const statusBg = isPaid ? '#d1fae5' : (isOverdue ? '#fef3c7' : '#fee2e2');
    const statusText = isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'DUE');

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 16,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <TextWidget
                    text="Maintenance"
                    style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#64748b',
                        letterSpacing: 0.5,
                    }}
                />
            </FlexWidget>

            <FlexWidget style={{ flexDirection: 'column' }}>
                <TextWidget
                    text={month || '--'}
                    style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        marginBottom: 4,
                        fontWeight: '500',
                    }}
                />
                <TextWidget
                    text={amount || '₹ 0'}
                    style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#0f172a',
                    }}
                />
            </FlexWidget>

            <FlexWidget style={{ flexDirection: 'row' }}>
                <FlexWidget
                    style={{
                        backgroundColor: statusBg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                    }}
                >
                    <TextWidget
                        text={statusText}
                        style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: statusColor,
                            letterSpacing: 1,
                        }}
                    />
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}
