import { useState, useEffect } from 'react';

export default function PerformanceMonitor() {
    const [stats, setStats] = useState({
        screenshotTime: 0,
        uiDumpTime: 0,
        lastUpdate: null
    });

    const updateStats = (newStats) => {
        setStats(prev => ({
            ...prev,
            ...newStats,
            lastUpdate: new Date().toLocaleTimeString()
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
            
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Screenshot:</span>
                    <span className="font-mono">{stats.screenshotTime}ms</span>
                </div>
                
                <div className="flex justify-between">
                    <span className="text-gray-600">UI Dump:</span>
                    <span className="font-mono">{stats.uiDumpTime}ms</span>
                </div>
                
                {stats.lastUpdate && (
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Last update:</span>
                        <span>{stats.lastUpdate}</span>
                    </div>
                )}
            </div>
        </div>
    );
}