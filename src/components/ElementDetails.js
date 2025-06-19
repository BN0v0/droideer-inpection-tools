export default function ElementDetails({ element }) {
    if (!element) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Element Details</h3>
                </div>
                <div className="p-4 text-gray-500 text-center">
                    Select an element to view details
                </div>
            </div>
        );
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Element Details</h3>
            </div>
            
            <div className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <div className="mt-1 text-sm text-gray-900 font-mono">{element.attributes?.class || element.tag}</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Element ID</label>
                    <div className="mt-1 text-sm text-gray-900 font-mono">{element.id}</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Selector</label>
                    <div className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        <div className="flex justify-between items-center">
                            <span className="break-all">{element.selector}</span>
                            <button
                                onClick={() => copyToClipboard(element.selector)}
                                className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                {element.attributes?.['resource-id'] && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                        <div className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                            <div className="flex justify-between items-center">
                                <span className="break-all">{element.attributes['resource-id']}</span>
                                <button
                                    onClick={() => copyToClipboard(element.attributes['resource-id'])}
                                    className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {element.attributes?.text && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Text</label>
                        <div className="mt-1 text-sm text-gray-900">&quot;{element.attributes.text}&quot;</div>
                    </div>
                )}

                {element.attributes?.['content-desc'] && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content Description</label>
                        <div className="mt-1 text-sm text-gray-900">&quot;{element.attributes['content-desc']}&quot;</div>
                    </div>
                )}

                {element.bounds && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bounds</label>
                        <div className="mt-1 text-sm text-gray-900 font-mono">{element.bounds}</div>
                    </div>
                )}

                <div className="flex space-x-4">
                    <div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded ${
                            element.attributes?.clickable === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {element.attributes?.clickable === 'true' ? 'Clickable' : 'Not Clickable'}
                        </span>
                    </div>
                </div>

                {/* Show all other attributes */}
                {element.attributes && Object.entries(element.attributes)
                    .filter(([key]) => !['class', 'resource-id', 'text', 'content-desc', 'clickable'].includes(key))
                    .map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700">{key}</label>
                            <div className="mt-1 text-sm text-gray-900 font-mono">{value}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
}