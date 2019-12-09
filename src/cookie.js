/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

filterNameInput.addEventListener('keyup', function() {
    RefreshTable(filterNameInput.value);
});

addButton.addEventListener('click', () => {
    if (addNameInput.value === '' || addValueInput.value === '') {
        return;
    }
    document.cookie = `${addNameInput.value}=${addValueInput.value}`;
    RefreshTable(filterNameInput.value);
});
listTable.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        return;
    }
    RemoveCokie(e.target);
});
function GetCookie() {
    const cookie = document.cookie;

    if (cookie) {
        return cookie.split('; ').reduce((prev, current) => {
            const [name, value] = current.split('=');

            prev[name] = value;

            return prev;
        }, {});
    }

    return {};
}
function RefreshTable(chunk) {
    let cookieObj = GetCookie(),
        rows = document.createDocumentFragment();

    for (let cookie in cookieObj) {
        if (isMatching(cookie, chunk) || isMatching(cookieObj[cookie], chunk)) {
            let tableRow = document.createElement('tr');

            tableRow.innerHTML = `<td>${cookie}</td><td>${cookieObj[cookie]}</td><td><button data-cookie="${cookie}">удалить</button></td>`;
            rows.appendChild(tableRow);
        }
    }
    listTable.innerHTML = '';
    listTable.appendChild(rows);
}
function RemoveCokie(btn) {
    let cookieName = btn.getAttribute('data-cookie');

    document.cookie = `${cookieName}=""; max-age=0`;
    RefreshTable(filterNameInput.value);
}
function isMatching(full, chunk) {
    if (chunk) {
        full = full.toLowerCase();
        chunk = chunk.toLowerCase();

        return full.indexOf(chunk) >= 0;
    }

    return true;
}
RefreshTable(filterNameInput.value);