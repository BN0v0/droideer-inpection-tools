import AndroidDevice from '../../../../lib/android-device.js';

export async function POST(request) {
    try {
        const { x, y, uiHierarchy } = await request.json();

        const device = new AndroidDevice();
        const element = await device.findElementAtCoordinates(x, y, uiHierarchy);
        
        return Response.json({ 
            success: true,
            element,
            coordinates: { x, y }
        });
    } catch (error) {
        console.error('Find element API error:', error);
        return Response.json({ 
            error: 'Failed to find element',
            details: error.message 
        }, { status: 500 });
    }
}
