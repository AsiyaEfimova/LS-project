var root = document.querySelector('#pageWrap');
// Объект router выполняет обработчик при добавлении блока с соответствующим id
var router = {
    'auth': (target) => {
        const signIn = target.querySelector('button'),
            cancel = target.querySelector('.cancel'),
            authForm = target.querySelector('form');

        signIn.addEventListener('click', () => {
            var login = target.querySelector('#nik').value || target.querySelector('#name').value;

            root.innerHTML = render('chat', { name: login });
        });
        cancel.addEventListener('click', () => {
            authForm.reset();
        });
    },
    'chat': (target) => {
        initSockets(target);
        // const fileInp = target.querySelector('#fileInp'),
        //     fileReader = new FileReader();
        // let currentImg;
        //
        // fileInp.addEventListener('change', e => {
        //     let file = e.target.files[0];
        //
        //     fileReader.readAsDataURL(file);
        //
        //     console.log(1);
        // });
        // target.addEventListener('click', e => {
        //     if (e.target.classList.contains('img')) {
        //         fileInp.click();
        //         currentImg = e.target;
        //     }
        // });
        // fileReader.addEventListener('load', function () {
        //     currentImg.src = fileReader.result;
        // });
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
        currentUserId = target.dataset.id;
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
}

function render(templateName, data = '') {
    console.log(data);
    return require(`./views/${templateName}.hbs`)(data);
}