var root = document.querySelector('#pageWrap');
// Объект router выполняет обработчик при добавлении блока с соответствующим id
var router = {
    'auth': (target) => {
        const signIn = target.querySelector('button'),
            cancel = target.querySelector('.cancel'),
            authForm = target.querySelector('form');

        signIn.addEventListener('click', () => {
            var login = target.querySelector('#nik').value || target.querySelector('#name').value;

            if (login !== '') {
                root.innerHTML = render('chat', { name: login });
            }
        });
        cancel.addEventListener('click', () => {
            authForm.reset();
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

    if (node) {
        var route = node.id;

        if (route) {
            if (router[route]) {
                router[route](node);
            } else {
                console.error('отсутствует обработчик для блока ' + route);
            }
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
    var list = target.querySelector('.contactList'),
        chatList = target.querySelector('.chatList'),
        currentUserId = target.dataset.id,
        messageForm = target.querySelector('.newMessageForm'),
        messageInput = target.querySelector('.messageInput'),
        userCounter = target.querySelector('.counter');
    const ws = new WebSocket('ws://localhost:3000');

    // Массив обработчиков событий пришедших с сервера
    const handlers = {
        'newUser': (data) => {
            console.log('newUser', data);
            if (!currentUserId) {
                target.setAttribute('data-id', data.id);
                currentUserId = target.dataset.id;
                data.class = 'myImg';
            }
            list.innerHTML += render('user', data);
            userCounter.innerHTML = GetCount(list);
        },
        'getUsers': (data) => {
            console.log('getUsers', data);
            data.forEach(item => {
                list.innerHTML += render('user', item);
            });
        },
        'leaveUser': (data) => {
            console.log('leaveUser', data);
            let currentUser = target.querySelector('[data-user="'+data+'"]');

            currentUser.parentElement.removeChild(currentUser);
        },
        'addPhoto': (data) => {
            console.log('addPhoto', data);
            let currentUser = target.querySelector('[data-user="'+data.id+'"]'),
                currentImg = currentUser.querySelector('.img');

            currentImg.src = data.img;
            let messages = chatList.querySelectorAll('[data-user="'+data.id+'"]');

            messages.forEach(message => {
                let img = message.querySelector('img');

                img.src = data.img;
            });
        },
        'sendMessage': (data) => {
            console.log('sendMessage', data);
            let lastMessage = chatList.lastElementChild,
                lastUserId;

            if (lastMessage) {
                lastUserId = lastMessage.getAttribute('data-user');
            }
            if (currentUserId === data.user.id) {
                data.user.class = 'myMessage';
            }
            if (data.user.id !== lastUserId) {
                let messageBlock = new DOMParser().parseFromString(render('message_wrap', data), 'text/html').body.firstChild;

                chatList.appendChild(messageBlock);
                lastMessage = chatList.lastElementChild;
            }

            let lastMessageSet = lastMessage.querySelector('.messageSet'),
                message = new DOMParser().parseFromString(render('message_text', data), 'text/html').body.firstChild;

            lastMessageSet.appendChild(message);

            let currentUser = list.querySelector('[data-user="'+data.user.id+'"]');

            currentUser.querySelector('.messText').innerHTML = data.message.text;
        }
    };

    console.log(ws);
    ws.onopen = () => {
        console.log(target, 'Клиент подключен', target.dataset.user);
        ws.send(JSON.stringify({
            payload: 'newUser',
            data: {
                user: {
                    name: target.dataset.user
                }
            }
        }));
    };

    // Событие, которое вызывается при получении любых данных с сервера. Выполняется обработчик из массива handlers
    ws.onmessage = function (e) {
        var dataParse = JSON.parse(e.data);

        handlers[dataParse.payload](dataParse.data);
    };

    ws.onclose = function () {
        console.log('Клиент отключен');
    };

    var logOut = target.querySelector('.logOut');

    logOut.addEventListener('click', () => {
        ws.send(JSON.stringify({
            payload: 'leaveUser',
            data: {
                user: {
                    id: currentUserId
                }
            }
        }));
        ws.close();
        root.innerHTML = render('auth');
    });

    const fileInp = target.querySelector('#fileInp'),
        fileReader = new FileReader();

    fileInp.addEventListener('change', e => {
        let file = e.target.files[0];

        fileReader.readAsDataURL(file);
    });
    target.addEventListener('click', e => {
        if (e.target.classList.contains('myImg')) {
            fileInp.click();
        }
    });
    fileReader.addEventListener('load', function () {
        ws.send(JSON.stringify({
            payload: 'addPhoto',
            data: {
                user: {
                    id: currentUserId,
                    img: fileReader.result
                }
            }
        }));
    });
    messageForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let messageText = messageInput.value;

        if (messageText && messageText !== '') {
            ws.send(JSON.stringify({
                payload: 'sendMessage',
                data: {
                    user: {
                        id: currentUserId
                    },
                    message: {
                        text: messageText,
                        time: GetTime()
                    }
                }
            }));
            messageInput.value = '';
        }
    });
}

function render(templateName, data = '') {
    return require(`./views/${templateName}.hbs`)(data);
}
function GetCount(list) {
    const declOfNum = function(number, titles) {
        let cases = [2, 0, 1, 1, 1, 2];

        return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
    };
    let count = list.querySelectorAll('.contactBox').length;

    count += ' ' + declOfNum(count, ['участник', 'участника', 'участников']);

    return count;
}
function GetTime() {
    const correctNum = function (num) {
        if (num < 10) {
            num = '0' + num;
        }

        return num;
    };
    let date = new Date(),
        hour = date.getHours(),
        minutes = date.getMinutes();

    hour = correctNum(hour);
    minutes = correctNum(minutes);

    return `${hour}:${minutes}`;
}