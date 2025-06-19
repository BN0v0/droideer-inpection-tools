import AndroidDevice from '../../../../lib/android-device.js';

export async function POST(request) {
    try {
        const device = new AndroidDevice();
        
        // Try to get UI hierarchy
        let uiHierarchy;
        try {
            uiHierarchy = await device.getUIHierarchy();
        } catch (error) {
            console.warn('UI dump failed, returning mock hierarchy:', error.message);
            
            // Return a mock hierarchy when UI dump fails
            uiHierarchy = {
                id: 0,
                tag: 'hierarchy',
                attributes: { class: 'hierarchy' },
                children: [{
                    id: 1,
                    tag: 'node',
                    attributes: {
                        class: 'android.widget.TextView',
                        text: 'UI Dump Unavailable - Try taking a screenshot instead',
                        bounds: '[0,100][1080,200]',
                        'resource-id': 'mock_element',
                        clickable: 'false'
                    },
                    children: []
                }],
                bounds: '[0,0][1080,1920]',
                text: '',
                resourceId: '',
                contentDesc: 'Mock hierarchy',
                clickable: false
            };
        }
        
        return Response.json({ 
            success: true, 
            uiHierarchy,
            timestamp: Date.now(),
            warning: uiHierarchy.id === 0 && uiHierarchy.tag === 'hierarchy' ? 'UI dump failed, showing mock data' : null
        });
    } catch (error) {
        console.error('UI dump API error:', error);
        return Response.json({ 
            error: 'Failed to get UI hierarchy',
            details: error.message 
        }, { status: 500 });
    }
}
