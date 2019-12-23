const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({ port: 3000 });
var allUsers = [];

console.log('сервер запущен');

const handlers = {
    'newUser': (data, ws) => {
        // wss.clients.forEach((client) => {
        //     if (client.user) {
        //         allUsers.push(client.user);
        //     }
        // });

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
        allUsers.push(user);
        broadcast({
            payload: 'newUser',
            data: user
        });
    },
    'leaveUser': (data, ws) => {
        console.log('выход пользователя', allUsers);
        allUsers = allUsers.filter(x => x.id != data.user.id);
        broadcast({
            payload: 'leaveUser',
            data: data.user.id
        });
    },
    'addPhoto': (data, ws) => {
        console.log('пришла картинка');
        allUsers.forEach((user) => {
            if (user.id === data.user.id) {
                user.img = data.user.img;
            }
        });

        console.log(allUsers);
        broadcast({
            payload: 'addPhoto',
            data: data.user
        });
    }
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
    });

    ws.on('message', (data) => {
        var dataParse = JSON.parse(data);
        console.log('пришло сообщение', dataParse);

        handlers[dataParse.payload](dataParse.data, ws);
    })
});