const { exec } = require('child_process');

class DeviceManager {
    static async getConnectedDevices() {
        return new Promise((resolve, reject) => {
            exec('adb devices', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                const lines = stdout.split('\n');
                const devices = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line && line.includes('\tdevice')) {
                        const deviceId = line.split('\t')[0];
                        devices.push({ id: deviceId, status: 'connected' });
                    }
                }

                resolve(devices);
            });
        });
    }

    static async getDeviceInfo(deviceId) {
        return new Promise((resolve, reject) => {
            const commands = [
                `adb -s ${deviceId} shell getprop ro.product.model`,
                `adb -s ${deviceId} shell getprop ro.build.version.release`,
                `adb -s ${deviceId} shell wm size`
            ];

            Promise.all(commands.map(cmd => {
                return new Promise((res, rej) => {
                    exec(cmd, (error, stdout) => {
                        if (error) rej(error);
                        else res(stdout.trim());
                    });
                });
            })).then(results => {
                resolve({
                    model: results[0],
                    androidVersion: results[1],
                    screenSize: results[2]
                });
            }).catch(reject);
        });
    }
}

module.exports = DeviceManager;