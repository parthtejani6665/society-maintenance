import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework, EncodingType } from 'expo-file-system';
import { Platform, Alert } from 'react-native';

export interface ReceiptData {
    id: string;
    month: string;
    year: number;
    amount: string;
    paidAt: string;
    residentName: string;
    flatNumber: string;
}

export const receiptService = {
    generateAndSave: async (data: ReceiptData) => {
        console.log('ReceiptService: Starting generation for', data.id);
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 40px;
            color: #1e293b;
            background-color: #ffffff;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 24px;
            font-weight: 900;
            color: #2563eb;
            letter-spacing: -1px;
        }
        .receipt-label {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #64748b;
        }
        .content {
            margin-bottom: 40px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        .label {
            font-weight: 600;
            color: #64748b;
        }
        .value {
            font-weight: 700;
            text-align: right;
        }
        .amount-card {
            background-color: #f8fafc;
            border-radius: 16px;
            padding: 30px;
            margin-top: 40px;
            text-align: center;
            border: 1px solid #f1f5f9;
        }
        .amount-label {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 8px;
        }
        .amount-value {
            font-size: 36px;
            font-weight: 900;
            color: #1e293b;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        .status-badge {
            background-color: #ecfdf5;
            color: #059669;
            padding: 6px 14px;
            border-radius: 99px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid #d1fae5;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">DIGITAL DWELL</div>
        <div class="status-badge">Payment Successful</div>
    </div>

    <div class="content">
        <div class="receipt-label" style="margin-bottom: 20px;">Maintenance Receipt</div>
        
        <div class="row">
            <span class="label">Transaction ID</span>
            <span class="value">#${data.id.substring(0, 12).toUpperCase()}</span>
        </div>
        <div class="row">
            <span class="label">Payment Date</span>
            <span class="value">${new Date(data.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
        <div class="row">
            <span class="label">Resident</span>
            <span class="value">${data.residentName}</span>
        </div>
        <div class="row">
            <span class="label">Flat Number</span>
            <span class="value">${data.flatNumber}</span>
        </div>
        <div class="row">
            <span class="label">Billing Period</span>
            <span class="value">${data.month} ${data.year}</span>
        </div>
    </div>

    <div class="amount-card">
        <div class="amount-label">Grand Total Paid</div>
        <div class="amount-value">₹${data.amount}</div>
    </div>

    <div class="footer">
        This is a digitally generated receipt and does not require a physical signature.<br/>
        &copy; 2026 Digital Dwell Society Management System.
    </div>
</body>
</html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            const fileName = `Receipt_${data.month}_${data.year}.pdf`;

            if (Platform.OS === 'android' && StorageAccessFramework) {
                console.log('ReceiptService: Requesting SAF permissions...');
                const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (permissions.granted) {
                    console.log('ReceiptService: Permissions granted. Reading file...');
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: EncodingType.Base64 });
                    console.log('ReceiptService: Creating file via SAF...');
                    await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf')
                        .then(async (safUri: string) => {
                            console.log('ReceiptService: Writing to SAF URI:', safUri);
                            await FileSystem.writeAsStringAsync(safUri, base64, { encoding: EncodingType.Base64 });
                            Alert.alert('Success', 'Receipt saved to your device!');
                        })
                        .catch((e) => {
                            console.error('File creation error:', e);
                            throw new Error('Failed to create file');
                        });
                } else {
                    // Fallback to sharing if permission denied
                    await Sharing.shareAsync(uri);
                }
            } else {
                // iOS: Use Share Sheet as it's the standard way to "Save to Files"
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }
        } catch (error) {
            console.error('Download Receipt Error:', error);
            throw error;
        }
    }
};
