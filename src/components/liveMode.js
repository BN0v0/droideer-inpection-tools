import { useState, useEffect, useRef } from 'react';

export default function LiveMode({ onScreenUpdate }) {
    const [isLive, setIsLive] = useState(false);
    const [interval, setInterval] = useState(2000);
    const intervalRef = useRef(null);

    const startLiveMode = () => {
        setIsLive(true);
        intervalRef.current = setInterval(() => {
            onScreenUpdate();
        }, interval);
    };

    const stopLiveMode = () => {
        setIsLive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isLive) {
            stopLiveMode();
            startLiveMode();
        }
    }, [interval]);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Live Mode</h3>
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Interval (ms)
                    </label>
                    <input
                        type="number"
                        min="500"
                        max="10000"
                        step="500"
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <button
                    onClick={isLive ? stopLiveMode : startLiveMode}
                    className={`w-full py-2 rounded ${
                        isLive 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {isLive ? 'Stop Live Mode' : 'Start Live Mode'}
                </button>
            </div>
        </div>
    );
}