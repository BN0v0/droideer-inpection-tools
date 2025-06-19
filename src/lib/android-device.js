import { exec } from 'child_process';
import fs from 'fs';
import xml2js from 'xml2js';
import path from 'path';

class AndroidDevice {
    constructor(deviceId = null) {
        this.deviceId = deviceId;
        this.adbPrefix = deviceId ? `adb -s ${deviceId}` : 'adb';
    }

    async runCommand(command, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const child = exec(`${this.adbPrefix} ${command}`, { timeout }, (error, stdout, stderr) => {
                if (error) {
                    // Provide more specific error information
                    console.error(`ADB Command failed: ${this.adbPrefix} ${command}`);
                    console.error(`Error code: ${error.code}, Signal: ${error.signal}`);
                    console.error(`stderr: ${stderr}`);
                    reject(new Error(`ADB command failed: ${error.message} (Code: ${error.code})`));
                } else {
                    resolve(stdout.trim());
                }
            });

            // Handle timeout
            child.on('exit', (code, signal) => {
                if (code === 137) {
                    reject(new Error('Command was killed (possibly due to timeout or permissions)'));
                }
            });
        });
    }

    async takeScreenshot() {
        const timestamp = Date.now();
        const filename = `screenshot_${timestamp}.png`;
        const filepath = path.join(process.cwd(), 'public', 'screenshots', filename);
        
        // Ensure screenshots directory exists
        const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        try {
            // Use exec-out which is more reliable for binary data
            await this.runCommand(`exec-out screencap -p > "${filepath}"`);
            return `/screenshots/${filename}`;
        } catch (error) {
            console.error('Screenshot failed:', error);
            throw new Error(`Screenshot failed: ${error.message}`);
        }
    }

    async getUIHierarchy() {
        try {
            // Try multiple approaches for UI dump
            
            // Method 1: Try standard uiautomator dump
            try {
                await this.runCommand('shell uiautomator dump /sdcard/ui.xml', 15000);
                const xmlContent = await this.runCommand('shell cat /sdcard/ui.xml');
                
                if (xmlContent && xmlContent.includes('<hierarchy')) {
                    return this.processUIHierarchy(await this.parseXML(xmlContent));
                }
            } catch (error) {
                console.warn('Standard UI dump failed, trying alternative method:', error.message);
            }

            // Method 2: Try with compressed output
            try {
                await this.runCommand('shell uiautomator dump --compressed /sdcard/ui.xml', 15000);
                const xmlContent = await this.runCommand('shell cat /sdcard/ui.xml');
                
                if (xmlContent && xmlContent.includes('<hierarchy')) {
                    return this.processUIHierarchy(await this.parseXML(xmlContent));
                }
            } catch (error) {
                console.warn('Compressed UI dump failed:', error.message);
            }

            // Method 3: Try dumping to stdout directly
            try {
                const xmlContent = await this.runCommand('shell uiautomator dump /dev/tty', 20000);
                
                if (xmlContent && xmlContent.includes('<hierarchy')) {
                    return this.processUIHierarchy(await this.parseXML(xmlContent));
                }
            } catch (error) {
                console.warn('Direct stdout UI dump failed:', error.message);
            }

            // Method 4: Try with different file location
            try {
                await this.runCommand('shell uiautomator dump /data/local/tmp/ui.xml', 15000);
                const xmlContent = await this.runCommand('shell cat /data/local/tmp/ui.xml');
                
                if (xmlContent && xmlContent.includes('<hierarchy')) {
                    return this.processUIHierarchy(await this.parseXML(xmlContent));
                }
            } catch (error) {
                console.warn('Alternative location UI dump failed:', error.message);
            }

            // If all methods fail, return a minimal hierarchy
            console.error('All UI dump methods failed, returning minimal hierarchy');
            return {
                id: 0,
                tag: 'hierarchy',
                attributes: { class: 'hierarchy' },
                children: [{
                    id: 1,
                    tag: 'node',
                    attributes: {
                        class: 'android.widget.FrameLayout',
                        text: 'UI Dump Failed - Please try refresh',
                        bounds: '[0,0][1080,1920]',
                        'resource-id': '',
                        'content-desc': 'UI dump failed',
                        clickable: 'false'
                    },
                    children: []
                }],
                bounds: '[0,0][1080,1920]',
                text: 'UI Dump Failed',
                resourceId: '',
                contentDesc: 'UI hierarchy could not be retrieved',
                clickable: false
            };

        } catch (error) {
            console.error('UI hierarchy retrieval failed completely:', error);
            throw new Error(`Failed to get UI hierarchy: ${error.message}`);
        }
    }

    async parseXML(xmlString) {
        return new Promise((resolve, reject) => {
            const parser = new xml2js.Parser();
            parser.parseString(xmlString, (err, result) => {
                if (err) {
                    reject(new Error(`XML parsing failed: ${err.message}`));
                } else {
                    resolve(result);
                }
            });
        });
    }

    processUIHierarchy(result, id = 0) {
        try {
            if (!result || !result.hierarchy || !result.hierarchy.node) {
                throw new Error('Invalid XML structure: missing hierarchy or node');
            }

            const rootNode = result.hierarchy.node[0];
            return this.processNode(rootNode, id);
        } catch (error) {
            console.error('Error processing UI hierarchy:', error);
            // Return a basic structure if processing fails
            return {
                id: 0,
                tag: 'node',
                attributes: { class: 'android.widget.FrameLayout', bounds: '[0,0][1080,1920]' },
                children: [],
                bounds: '[0,0][1080,1920]',
                text: '',
                resourceId: '',
                contentDesc: '',
                clickable: false
            };
        }
    }

    processNode(node, id = 0) {
        // Ensure all original attributes are preserved in the attributes object
        const attributes = {
            ...node.$,
            // Add any missing required attributes with defaults
            'bounds': node.$.bounds || '[0,0][1080,1920]',
            'class': node.$.class || 'node',
            'resource-id': node.$['resource-id'] || '',
            'text': node.$.text || '',
            'content-desc': node.$['content-desc'] || '',
            'clickable': node.$.clickable || 'false',
            'checkable': node.$.checkable || 'false',
            'checked': node.$.checked || 'false',
            'enabled': node.$.enabled || 'true',
            'focusable': node.$.focusable || 'false',
            'focused': node.$.focused || 'false',
            'scrollable': node.$.scrollable || 'false',
            'long-clickable': node.$['long-clickable'] || 'false',
            'password': node.$.password || 'false',
            'selected': node.$.selected || 'false',
            'visible-to-user': node.$['visible-to-user'] || 'true',
            'package': node.$.package || '',
            'index': node.$.index || '0'
        };

        // Generate a unique selector for this element
        let selector = `${attributes.class}`;
        if (attributes['resource-id']) {
            selector += `[@resource-id="${attributes['resource-id']}"]`;
        } else if (attributes.text) {
            selector += `[@text="${attributes.text}"]`;
        } else if (attributes['content-desc']) {
            selector += `[@content-desc="${attributes['content-desc']}"]`;
        }
        if (attributes.index !== '0') {
            selector += `[${attributes.index}]`;
        }

        const processed = {
            id: id,
            tag: attributes.class,
            attributes,  // Store all attributes
            children: [],
            // Keep these for backward compatibility
            bounds: attributes.bounds,
            text: attributes.text,
            resourceId: attributes['resource-id'],
            contentDesc: attributes['content-desc'],
            clickable: attributes.clickable === 'true',
            // Add selector
            selector: selector
        };

        let childId = id * 1000 + 1;
        if (node.node && Array.isArray(node.node)) {
            for (const child of node.node) {
                processed.children.push(this.processNode(child, childId++));
            }
        }

        return processed;
    }

    async tap(x, y) {
        try {
            await this.runCommand(`shell input tap ${x} ${y}`);
            return true;
        } catch (error) {
            console.error('Tap failed:', error);
            return false;
        }
    }

    async findElementAtCoordinates(x, y, uiHierarchy) {
        let smallestElement = null;
        let smallestArea = Infinity;

        const findElement = (node) => {
            if (node.bounds) {
                const boundsMatch = node.bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);                
                if (boundsMatch) {
                    const [, x1, y1, x2, y2] = boundsMatch.map(Number);
                    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                        const area = (x2 - x1) * (y2 - y1);
                        if (area < smallestArea) {
                            smallestArea = area;
                            smallestElement = node;
                        }
                    }
                }
            }

            if (node.children) {
                for (const child of node.children) {
                    findElement(child);
                }
            }
        };

        findElement(uiHierarchy);
        return smallestElement;
    }

    parseCoordinatesFromBounds(bounds) {
        if (!bounds) return null;
        
        const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
        if (match) {
            const [, x1, y1, x2, y2] = match.map(Number);
            return {
                x1, y1, x2, y2,
                centerX: Math.floor((x1 + x2) / 2),
                centerY: Math.floor((y1 + y2) / 2),
                width: x2 - x1,
                height: y2 - y1
            };
        }
        return null;
    }
}

module.exports = AndroidDevice;