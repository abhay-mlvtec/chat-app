import express from "express";
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const audioStreamPort = 8668; // Example port where audio is streamed

app.use(express.static('public')); // Serve client-side files
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Adjust accordingly to your security requirements
    next();
});
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);
        io.emit('chat message', msg);

        // Notify client to play audio from the audio streaming port
        try{
            socket.emit('play audio', { url: `http://localhost:${audioStreamPort}/?text=${msg}` });
        }catch (error) {
            console.error(error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
