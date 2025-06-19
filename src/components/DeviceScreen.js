import { useState, useRef, useEffect } from 'react';

export default function DeviceScreen({ screenshotPath, selectedElement, onElementClick }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const handleImageLoad = () => {
        const img = imageRef.current;
        if (img) {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setImageLoaded(true);
        }
    };

    const handleCanvasClick = (event) => {
        if (!imageLoaded || !imageDimensions.width) return;
    
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Set canvas size to match display size
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Get click coordinates relative to canvas
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);
        
        // Scale to image coordinates
        const scaleX = imageDimensions.width / rect.width;
        const scaleY = imageDimensions.height / rect.height;
        
        const imageX = Math.round(x * scaleX);
        const imageY = Math.round(y * scaleY);
    
        onElementClick(imageX, imageY);
    };

    useEffect(() => {
        if (selectedElement && imageLoaded) {
            drawElementHighlight();
        }
    }, [selectedElement, imageLoaded]);

    const drawElementHighlight = () => {
        const canvas = canvasRef.current;
        if (!canvas || !selectedElement?.bounds) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Clear previous highlights
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Parse bounds
        const match = selectedElement.bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
        if (match) {
            const [, x1, y1, x2, y2] = match.map(Number);
            
            // Scale coordinates to canvas size
            const scaleX = rect.width / imageDimensions.width;
            const scaleY = rect.height / imageDimensions.height;
            
            const canvasX1 = x1 * scaleX;
            const canvasY1 = y1 * scaleY;
            const canvasX2 = x2 * scaleX;
            const canvasY2 = y2 * scaleY;

            // Draw highlight rectangle
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvasX1, canvasY1, canvasX2 - canvasX1, canvasY2 - canvasY1);
            
            // Draw semi-transparent overlay
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
            ctx.fillRect(canvasX1, canvasY1, canvasX2 - canvasX1, canvasY2 - canvasY1);
        }
    };

    if (!screenshotPath) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-500">No screenshot available</div>
                <div className="text-sm text-gray-400 mt-2">Click &quot;Refresh Screen&quot; to capture device screen</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Device Screen</h2>
                <p className="text-sm text-gray-600">Click on elements to inspect them</p>
            </div>
            
            <div className="relative">
                <img
                    ref={imageRef}
                    src={screenshotPath}
                    alt="Device screenshot"
                    className="w-full h-auto"
                    onLoad={handleImageLoad}
                />
                
                {imageLoaded && (
                    <canvas
                        ref={canvasRef}
                        width={imageDimensions.width}
                        height={imageDimensions.height}
                        className="absolute inset-0 w-full h-full cursor-pointer"
                        onClick={handleCanvasClick}
                        style={{ pointerEvents: 'auto' }}
                    />
                )}
            </div>
        </div>
    );
}