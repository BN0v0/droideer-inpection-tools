import AndroidDevice from '../../../../lib/android-device.js';

export async function POST(request) {
    try {
        const device = new AndroidDevice();
        const screenshotPath = await device.takeScreenshot();
        
        return Response.json({ 
            success: true, 
            screenshotPath,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Screenshot API error:', error);
        return Response.json({ 
            error: 'Failed to take screenshot',
            details: error.message 
        }, { status: 500 });
    }
}
