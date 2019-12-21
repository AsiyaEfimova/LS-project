var root = document.querySelector('#pageWrap');
var router = {
    'auth': (target) => {
        const signIn = target.querySelector('button');
        signIn.addEventListener('click', () => {
            var login = target.querySelector('#name').value || 'anonim';

            root.innerHTML = render('chat', { name: login });
        });
    },
    'chat': (target) => {
        initSockets(target);
    }
};
// Конфигурация observer (за какими изменениями наблюдать)
const config = {
    attributes: true,
    childList: true,
    subtree: true
};

// Функция обратного вызова при срабатывании мутации
const callback = function (mutationsList, observer) {
    var node = mutationsList[0].addedNodes[0];
    var route = node.id;
    console.log(route,node);
    if (route) {
        if (router[route]) {
            router[route](node);
        } else {
            console.error('отсутствует обработчик для блока ' + route);
        }
    }
};

// Создаем экземпляр наблюдателя с указанной функцией обратного вызова
const observer = new MutationObserver(callback);
// Начинаем наблюдение за настроенными изменениями целевого элемента
observer.observe(root, config);

window.addEventListener('DOMContentLoaded', () => {
    root.innerHTML = render('auth');
});

function initSockets(target) {
    var list = target.querySelector('.contactList');
    const ws = new WebSocket('ws://localhost:3000');

    const handlers = {
        'newUser': (data) => {
            console.log('newUser', data);
            list.innerHTML += `<li data-id="${data.id}">${data.name}</li>`;
        },
        'getUsers': (data) => {
            console.log('getUsers', data);
            data.forEach(item => {
                // console.log(item);
                list.innerHTML += `<li data-id="${item.id}">${item.name}</li>`;
            });
        },
        'leaveUser': (data) => {
            console.log('leaveUser', data);
        },
    };

    console.log(ws);
    ws.onopen = () => {
        console.log('Клиент подключен');
        ws.send(JSON.stringify({
            payload: 'newUser',
            data: {
                user: {
                    name: target.dataset.user
                }
            }
        }));
    };

    ws.onmessage = function (e) {
        var dataParse = JSON.parse(e.data);

        handlers[dataParse.payload](dataParse.data);
    };

    ws.onclose = function () {
        console.log('Клиент отключен');
    };

    var logOut = target.querySelector('.logOut');

    logOut.addEventListener('click', () => {
        ws.close();
        root.innerHTML = render('auth');
    });
}

function render(templateName, data = '') {
    return require(`./views/${templateName}.hbs`)(data);
}
