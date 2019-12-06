/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns-content.hbs

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
var townsArray = [];

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
function loadTowns(url) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.open('GET', url);
        request.responseType = 'json';
        request.send();
        request.addEventListener('load', function () {
            if (request.status >= 400) {
                reject();
            } else {
                let townsList = request.response;

                let towns = townsList.sort((a, b) => {
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();

                    let comparison = 0;

                    if (nameA > nameB) {
                        comparison = 1;
                    } else if (nameA < nameB) {
                        comparison = -1;
                    }

                    return comparison;
                });

                resolve(towns);
            }
        });
        request.addEventListener('error', reject);
        request.addEventListener('abort', reject);
    });
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
    if (chunk) {
        full = full.toLowerCase();
        chunk = chunk.toLowerCase();

        return full.indexOf(chunk) >= 0;
    }

    return false;
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');
/* Блок с ошибкой */
const errorBlock = homeworkContainer.querySelector('#error-block');
/* Кнопка повтора */
const loadBtn = homeworkContainer.querySelector('#load-towns');

filterInput.addEventListener('keyup', function() {
    let inpValue = this.value,
        filteredTowns = townsArray.filter(town => {
            return isMatching(town.name, inpValue);
        });

    AddTowns(filteredTowns);
});
loadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    GetTowns('https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json');
});

function AddTowns(towns) {
    let fragment = document.createDocumentFragment();

    for (const town of towns) {
        let div = document.createElement('div');

        div.innerText = town.name;
        fragment.appendChild(div);
    }
    filterResult.innerHTML = '';
    filterResult.appendChild(fragment);
}
function GetTowns(url) {
    loadTowns(url).then(towns => {
        townsArray = towns;
        errorBlock.style.display = 'none';
        loadingBlock.style.display = 'none';
        filterBlock.style.display = 'block';
    })
        .catch( () => {
            loadingBlock.style.display = 'none';
            filterBlock.style.display = 'none';
            errorBlock.style.display = 'block';
        });
}
GetTowns('https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.jso');
export {
    loadTowns,
    isMatching
};
