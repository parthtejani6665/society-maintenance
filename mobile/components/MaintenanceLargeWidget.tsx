import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface MaintenanceLargeWidgetProps {
    month: string;
    amount: string;
    dueDate: string;
    status: 'paid' | 'due' | 'overdue';
    collectionProgress: number; // 0-100
    lastPaymentDate?: string;
    lastPaymentAmount?: string;
}

export function MaintenanceLargeWidget({
    month,
    amount,
    dueDate,
    status,
    collectionProgress,
    lastPaymentDate,
    lastPaymentAmount
}: MaintenanceLargeWidgetProps) {
    const isPaid = status === 'paid';
    const isOverdue = status === 'overdue';

    const primaryColor = '#1e3a8a';
    const successColor = '#059669';
    const errorColor = '#dc2626';
    const warningColor = '#d97706';

    // Status Logic
    const statusColor = isPaid ? successColor : (isOverdue ? errorColor : warningColor);
    const statusBg = isPaid ? '#ecfdf5' : (isOverdue ? '#fef2f2' : '#fffbeb');
    const statusText = isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'DUE');

    const progressWidth = `${collectionProgress}%`;

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#f8fafc',
                borderRadius: 24,
                padding: 16,
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget
                        text="Maintenance Details"
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#0f172a',
                        }}
                    />
                    <TextWidget
                        text={month || '--'}
                        style={{
                            fontSize: 12,
                            color: '#64748b',
                            marginTop: 2,
                        }}
                    />
                </FlexWidget>
                <FlexWidget
                    style={{
                        backgroundColor: '#e0f2fe',
                        borderRadius: 12,
                        padding: 8,
                    }}
                >
                    <TextWidget
                        text="DD"
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#0284c7'
                        }}
                    />
                </FlexWidget>
            </FlexWidget>

            {/* Main Card */}
            <FlexWidget
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: 'column',
                    marginBottom: 12,
                }}
            >
                <FlexWidget
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}
                >
                    <FlexWidget style={{ flexDirection: 'column' }}>
                        <TextWidget text="CURRENT DUE" style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }} />
                        <TextWidget text={amount || '₹ 0'} style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }} />
                    </FlexWidget>

                    <FlexWidget
                        style={{
                            backgroundColor: statusBg,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                        }}
                    >
                        <TextWidget
                            text={statusText}
                            style={{
                                fontSize: 11,
                                fontWeight: 'bold',
                                color: statusColor,
                            }}
                        />
                    </FlexWidget>
                </FlexWidget>

                <FlexWidget
                    style={{
                        height: 1,
                        backgroundColor: '#f1f5f9',
                        marginVertical: 12,
                        width: 'match_parent',
                    }}
                />

                <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FlexWidget style={{ flexDirection: 'column' }}>
                        <TextWidget text="Due Date" style={{ fontSize: 10, color: '#94a3b8' }} />
                        <TextWidget text={dueDate || '--'} style={{ fontSize: 12, color: '#334155', fontWeight: 'bold', marginTop: 2 }} />
                    </FlexWidget>
                    {lastPaymentDate ? (
                        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <TextWidget text="Last Paid" style={{ fontSize: 10, color: '#94a3b8' }} />
                            <TextWidget text={`${lastPaymentAmount || ''} on ${lastPaymentDate}`} style={{ fontSize: 12, color: '#334155', fontWeight: 'bold', marginTop: 2 }} />
                        </FlexWidget>
                    ) : null}
                </FlexWidget>
            </FlexWidget>

            {/* Collection Progress */}
            <FlexWidget
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: 'column',
                    marginBottom: 12,
                    flex: 1,
                    justifyContent: 'center',
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <TextWidget text="Society Collection Goal" style={{ fontSize: 11, color: '#475569', fontWeight: 'bold' }} />
                    <TextWidget text={`${collectionProgress || 0}%`} style={{ fontSize: 11, color: '#2563eb', fontWeight: 'bold' }} />
                </FlexWidget>

                <FlexWidget
                    style={{
                        height: 8,
                        backgroundColor: '#f1f5f9',
                        borderRadius: 4,
                        width: 'match_parent',
                        flexDirection: 'row',
                    }}
                >
                    <FlexWidget
                        style={{
                            height: 8,
                            backgroundColor: '#3b82f6',
                            borderRadius: 4,
                            flex: collectionProgress || 0,
                        }}
                    />
                    <FlexWidget
                        style={{
                            height: 8,
                            flex: 100 - (collectionProgress || 0),
                        }}
                    />
                </FlexWidget>
            </FlexWidget>

            {/* Action Button */}
            <FlexWidget
                style={{
                    backgroundColor: isPaid ? '#f8fafc' : '#1e40af', // Slate-50 or Blue-800
                    borderRadius: 16,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isPaid ? 1 : 0,
                    borderColor: '#cbd5e1',
                }}
                clickAction={isPaid ? 'OPEN_APP' : 'OPEN_APP'}
            >
                <TextWidget
                    text={isPaid ? "VIEW HISTORY" : "PAY NOW"}
                    style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: isPaid ? '#475569' : '#ffffff',
                        letterSpacing: 0.5,
                    }}
                />
            </FlexWidget>
        </FlexWidget>
    );
}
