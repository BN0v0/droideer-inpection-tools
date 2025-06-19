import { useState } from 'react';

export default function ElementTree({ uiHierarchy, selectedElement, onElementSelect }) {
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const renderNode = (node, depth = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isSelected = selectedElement?.id === node.id;

        return (
            <div key={node.id}>
                <div
                    className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 ${
                        isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => onElementSelect(node)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="mr-1 w-4 h-4 flex items-center justify-center"
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                            {node.tag.split('.').pop()}
                        </div>
                        {node.text && (
                            <div className="text-xs text-gray-500 truncate">
                                &quot;{node.text}&quot;
                            </div>
                        )}
                        {node.resourceId && (
                            <div className="text-xs text-blue-600 truncate">
                                {node.resourceId.split('/').pop()}
                            </div>
                        )}
                    </div>
                    
                    {node.clickable && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">
                            clickable
                        </span>
                    )}
                </div>
                
                {hasChildren && isExpanded && (
                    <div>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!uiHierarchy) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900">UI Hierarchy</h3>
                </div>
                <div className="p-4 text-gray-500 text-center">
                    No UI hierarchy available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">UI Hierarchy</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {renderNode(uiHierarchy)}
            </div>
        </div>
    );
}