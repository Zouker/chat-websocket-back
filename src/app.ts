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
        message: 'Hello, ZheSha', id: 1,
        user: {id: '11', name: 'Denis'}
    },
    {
        message: 'Hello, Denis', id: 2,
        user: {id: '22', name: 'ZheSha'}
    },
    {
        message: 'Yo, guys', id: 3,
        user: {id: '33', name: 'Bender'}
    }
]

const usersState = new Map()

socket.on('connection', (socketChannel) => {

    usersState.set(socketChannel, {
        id: new Date().getTime().toString(),
        name: 'anonymous'
    })

    socket.on('disconnect', () => {
        usersState.delete(socketChannel)
    });

    socketChannel.on('client-name-sent', (name: string) => {
        if (typeof name !== 'string') {
            return
        }
        const user = usersState.get(socketChannel)
        user.name = name
    })

    socketChannel.on('client-typed', () => {
        socket.emit('user-typing', usersState.get(socketChannel))
    })

    socketChannel.on('client-message-sent', (message: string) => {
        if (typeof message !== 'string') {
            return
        }

        const user = usersState.get(socketChannel)

        let messageItem = {
            message: message, id: new Date().getTime(),
            user: {id: user.id + new Date(), name: user.name}
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