const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({ port: 3000 });

console.log('сервер запущен');

const handlers = {
    'newUser': (data, ws) => {
        const allUsers = [];

        wss.clients.forEach((client) => {
            if (client.user) {
                allUsers.push(client.user);
            }
        });

        ws.send(JSON.stringify({
            payload: 'getUsers',
            data: allUsers
        }));

        var user = {
            id: uuidv1(),
            name: data.user.name
        };

        ws.user = user;
        console.log('добавлен новый пользователь', user);
        broadcast({
            payload: 'newUser',
            data: user
        });
    },
};

function broadcast(message) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify({
            payload: message.payload,
            data: message.data
        }))
    });
}

wss.on('connection', function connection(ws) {
    console.log('установлено соединение');
    ws.on('close', (e) => {
        console.log('пользователь вышел', ws.user);
        broadcast({
            payload: 'leaveUser',
            data: ws.user
        })
    });

    ws.on('message', (data) => {
        var dataParse = JSON.parse(data);
        console.log('пришло сообщение', dataParse);

        handlers[dataParse.payload](dataParse.data, ws);
    })
});