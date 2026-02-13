import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface MaintenanceMediumWidgetProps {
    month: string;
    amount: string;
    dueDate: string;
    status: 'paid' | 'due' | 'overdue';
    collectionProgress: number; // 0-100
}

export function MaintenanceMediumWidget({ month, amount, dueDate, status, collectionProgress }: MaintenanceMediumWidgetProps) {
    const isPaid = status === 'paid';
    const isOverdue = status === 'overdue';

    const primaryColor = '#1e3a8a'; // Blue-900
    const successColor = '#059669'; // Emerald-600
    const errorColor = '#dc2626'; // Red-600
    const warningColor = '#d97706'; // Amber-600

    const statusColor = isPaid ? successColor : (isOverdue ? errorColor : warningColor);
    const statusText = isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'DUE');

    // Progress Bar Calculation
    const progressWidth = `${collectionProgress}%`;

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}
        >
            {/* Left Column: Details */}
            <FlexWidget
                style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                }}
            >
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget
                        text="Monthly Maintenance"
                        style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: '#64748b',
                            letterSpacing: 0.5,
                            marginBottom: 4,
                        }}
                    />
                    <TextWidget
                        text={month}
                        style={{
                            fontSize: 14,
                            color: '#0f172a',
                            fontWeight: 'bold',
                        }}
                    />
                </FlexWidget>

                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget
                        text={amount}
                        style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: '#0f172a',
                        }}
                    />
                    <TextWidget
                        text={`Due: ${dueDate}`}
                        style={{
                            fontSize: 11,
                            color: isOverdue ? errorColor : '#64748b',
                            marginTop: 2,
                            fontWeight: isOverdue ? 'bold' : 'normal',
                        }}
                    />
                </FlexWidget>
            </FlexWidget>

            {/* Right Column: Status & Action */}
            <FlexWidget
                style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginLeft: 16,
                }}
            >
                <FlexWidget
                    style={{
                        backgroundColor: isPaid ? '#d1fae5' : (isOverdue ? '#fee2e2' : '#fef3c7'),
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

                {/* Society Collection Progress */}
                <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <TextWidget
                        text="Society Collection"
                        style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}
                    />
                    <FlexWidget
                        style={{
                            width: 80,
                            height: 6,
                            backgroundColor: '#f1f5f9',
                            borderRadius: 3,
                            marginBottom: 4,
                            flexDirection: 'row',
                        }}
                    >
                        <FlexWidget
                            style={{
                                width: (collectionProgress || 0) * 0.8, // 80dp * (percent/100) * 100? No, percent is 0-100. So (p/100)*80 = p*0.8
                                height: 6,
                                backgroundColor: '#3b82f6',
                                borderRadius: 3,
                            }}
                        />
                    </FlexWidget>
                    <TextWidget
                        text={`${collectionProgress}%`}
                        style={{ fontSize: 10, fontWeight: 'bold', color: '#3b82f6' }}
                    />
                </FlexWidget>

                {!isPaid && (
                    <FlexWidget
                        style={{
                            backgroundColor: '#1e40af',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                        clickAction="OPEN_APP"
                    >
                        <TextWidget
                            text="PAY NOW"
                            style={{
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: '#ffffff',
                            }}
                        />
                    </FlexWidget>
                )}
            </FlexWidget>
        </FlexWidget>
    );
}
