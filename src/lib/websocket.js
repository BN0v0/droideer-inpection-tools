import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing');
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on('connection', socket => {
            console.log('Client connected');

            socket.on('start-live-mode', (data) => {
                console.log('Starting live mode for device:', data.deviceId);
                // Start live screen updates
            });

            socket.on('stop-live-mode', () => {
                console.log('Stopping live mode');
                // Stop live updates
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
    res.end();
};

export default SocketHandler;