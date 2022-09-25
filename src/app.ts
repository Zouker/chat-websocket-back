import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors'

const app = express();
app.use(cors())
const server = http.createServer(app);
const socket = new Server(server);

app.get('/', (req, res) => {
    res.send('Hello, it\'s WS server')
});

const messages = [
    {
        message: 'Hello, ZheSha', id: '1',
        user: {id: '11', name: 'Denis'}
    },
    {
        message: 'Hello, Denis', id: '2',
        user: {id: '22', name: 'ZheSha'}
    },
    {
        message: 'Yo, guys', id: '3',
        user: {id: '33', name: 'Bender'}
    }
]

socket.on('connection', (socketChannel) => {
    socketChannel.on('client-message-sent', (message: string) => {
        if (typeof message !== 'string') {
            return
        }
        let messageItem = {
            message: message, id: '4',
            user: {id: '44' + new Date(), name: 'Denis'}
        }
        messages.push(messageItem)

        socket.emit('new-message-sent', messageItem)
    });

    socketChannel.emit('init-messages-published', messages)

    console.log('a user connected');
});

const PORT = process.env.PORT || 3009

server.listen(PORT, () => {
    console.log('listening on *:3009');
});