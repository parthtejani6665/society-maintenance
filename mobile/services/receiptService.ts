import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

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

            if (Platform.OS === 'android') {
                try {
                    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                        const fileName = `Receipt_${data.month}_${data.year}.pdf`;
                        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                        const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
                        await FileSystem.writeAsStringAsync(createdUri, base64, { encoding: 'base64' });
                        Alert.alert('Success', 'Receipt downloaded to your selected folder!');
                    } else {
                        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
                    }
                } catch (e) {
                    console.error('Android SAF Error:', e);
                    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
                }
            } else {
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }
        } catch (error) {
            console.error('Download Receipt Error:', error);
            throw error;
        }
    }
};
