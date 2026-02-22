import { Request, Response } from 'express';

export const getNearbyServices = async (req: Request, res: Response) => {
    try {
        const { lat, lng, type } = req.query;

        if (!lat || !lng || !type) {
            return res.status(400).json({ message: 'Missing required parameters: lat, lng, type' });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_MAPS_API_KEY is not defined');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const radius = 1500; // 1.5km radius
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places API Error:', JSON.stringify(data, null, 2));
            return res.status(500).json({ message: 'Failed to fetch nearby services', error: data.status, details: data.error_message });
        }

        console.log(`Fetched ${data.results.length} places for type ${type}`);

        return res.json({ results: data.results });
    } catch (error) {
        console.error('Error fetching nearby services:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
