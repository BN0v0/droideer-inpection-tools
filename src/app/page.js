'use client';

import { useState, useEffect } from 'react';
import DeviceScreen from '../components/DeviceScreen';
import ElementTree from '../components/ElementTree';
import ElementDetails from '../components/ElementDetails';

export default function Home() {
    const [screenshotPath, setScreenshotPath] = useState(null);
    const [uiHierarchy, setUIHierarchy] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    const refreshScreen = async () => {
        setLoading(true);
        try {
            // Take screenshot
            const screenshotResponse = await fetch('/api/device/screenshot', {
                method: 'POST'
            });
            const screenshotData = await screenshotResponse.json();
            
            if (screenshotData.success) {
                setScreenshotPath(screenshotData.screenshotPath);
            }

            // Get UI hierarchy
            const uiResponse = await fetch('/api/device/ui-dump', {
                method: 'POST'
            });
            const uiData = await uiResponse.json();
            
            if (uiData.success) {
                setUIHierarchy(uiData.uiHierarchy);
            }

        } catch (error) {
            console.error('Failed to refresh screen:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleElementClick = async (x, y) => {
        if (!uiHierarchy) return;
    
        try {
            const response = await fetch('/api/device/find-element', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x, y, uiHierarchy })
            });
            
            const data = await response.json();
            if (data.success && data.element) {
                setSelectedElement(data.element);
                generateCodeForElement(data.element);
                
                // Only tap if the element is clickable
                if (data.element.clickable === 'true' || data.element.clickable === true) {
                    await fetch('/api/device/tap', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ x, y })
                    });
                }
            }
        } catch (error) {
            console.error('Failed to find element:', error);
        }
    };

    const generateCodeForElement = (element) => {
        let code = '# Generated automation code\n';
        code += 'device = AndroidDevice()\n\n';

        if (element.resourceId) {
            code += `# Find by resource ID\n`;
            code += `element = device.find_element(resource_id="${element.resourceId}")\n`;
        } else if (element.text) {
            code += `# Find by text\n`;
            code += `element = device.find_element(text="${element.text}")\n`;
        } else if (element.contentDesc) {
            code += `# Find by content description\n`;
            code += `element = device.find_element(content_desc="${element.contentDesc}")\n`;
        } else {
            const coords = parseCoordinates(element.bounds);
            if (coords) {
                code += `# Find by coordinates\n`;
                code += `device.tap(${coords.centerX}, ${coords.centerY})\n`;
            }
        }

        if (element.clickable) {
            code += `element.tap()\n`;
        }

        setGeneratedCode(code);
    };

    const parseCoordinates = (bounds) => {
        if (!bounds) return null;
        const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
        if (match) {
            const [, x1, y1, x2, y2] = match.map(Number);
            return {
                x1, y1, x2, y2,
                centerX: Math.floor((x1 + x2) / 2),
                centerY: Math.floor((y1 + y2) / 2)
            };
        }
        return null;
    };

    useEffect(() => {
        refreshScreen();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Android UI Inspector</h1>
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={refreshScreen}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh Screen'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device Screen */}
                    <div className="lg:col-span-2">
                        <DeviceScreen
                            screenshotPath={screenshotPath}
                            selectedElement={selectedElement}
                            onElementClick={handleElementClick}
                        />
                    </div>

                    {/* Controls and Details */}
                    <div className="space-y-6">
                        <ElementTree
                            uiHierarchy={uiHierarchy}
                            selectedElement={selectedElement}
                            onElementSelect={setSelectedElement}
                        />
                        
                        <ElementDetails
                            element={selectedElement}
                            generatedCode={generatedCode}
                        />
                        
                    </div>
                </div>
            </main>
        </div>
    );
}