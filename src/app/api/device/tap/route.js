import AndroidDevice from '../../../../lib/android-device.js';

export async function POST(request) {
    try {
        const { x, y } = await request.json();

        if (typeof x !== 'number' || typeof y !== 'number') {
            return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
        }

        const device = new AndroidDevice();
        const success = await device.tap(x, y);
        
        return Response.json({ 
            success,
            coordinates: { x, y },
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Tap API error:', error);
        return Response.json({ 
            error: 'Failed to perform tap',
            details: error.message 
        }, { status: 500 });
    }
}
