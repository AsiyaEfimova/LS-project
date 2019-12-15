import Map from './js/map';
const responseWindow = document.querySelector('#responseForm'),
      currentAddressTitle = document.querySelector('.currentAddress'),
      responseList = document.querySelector('.responseList'),
      responseForm = document.querySelector('#addResponse'),
      addResponseButton = document.querySelector('.addButton'),
      coordsInput = document.querySelector('input[name="coords"]'),
      addressInput = document.querySelector('input[name="address"]');

ymaps.ready(function () {
    //получаем данные из localStorege
    var localMarks = localStorage.getItem('marks');
    var marks = localMarks ? JSON.parse(localMarks) : [];

    //Создаем экземпляр api работы с картой
    const apiMap = new Map('map', {
        center: [55.76, 37.64],
        zoom: 15
    });

    //Вызываем init для создания карты
    var map = apiMap.init();

    //рендер текущих меток (из localStorage) при загрузке приложения
    marks.forEach(mark => {
        apiMap.createPlacemark(mark.coords, {
            balloonContent: `<div class="responseBox">
                                <div class="name">${mark.name}</div>
                                <a class="place js-addResponse" href="#">${mark.address}</a>
                                <div class="response">${mark.response}</div>
                            </div>`
        },function (e) {
            e.preventDefault();
            let tempArr = [];
            tempArr.push(mark);
            coordsInput.value = mark.coords;
            addressInput.value = mark.address;
            AddResponses(tempArr);
            OpenResponseWindow(e.originalEvent.domEvent._cache.pageX, e.originalEvent.domEvent._cache.pageY, mark.address);
        });
    });
    window.addEventListener('click', function (e) {
        if(e.target.classList.contains('js-addResponse')){
            map.balloon.close();
            let currenrMarks = marks.filter(x => x.address === e.target.innerHTML);
            coordsInput.value = currenrMarks[0].coords;
            addressInput.value = currenrMarks[0].address;
            AddResponses(currenrMarks);
            OpenResponseWindow(e.pageX, e.pageY, e.target.innerHTML);
        }
    });
    // Вешаем обработчик клика на карту
    map.events.add('click', async (e) => {
        var coords = e.get('coords');
        try {
            var address = await apiMap.geocoder(coords);
        } catch (error) {
            alert(error);
        }
        coordsInput.value = coords;
        addressInput.value = address;
        let [left, top] = e._cache.pagePixels;

        AddResponses(marks.filter(x => x.address === address));
        OpenResponseWindow(left, top, address);
    });

    // Вешаем обработчик клика на кнопку добавить отзыв
    addResponseButton.addEventListener('click', function (e) {
        e.preventDefault();
        var inputs = responseForm.elements;
        var data = {};
        for (let input of inputs) {
            if(input.name !== ''){
                data[input.name] = input.value;
            }
        }
        data.coords = data.coords.split(',');

        //создаем метку по координате при клике
        apiMap.createPlacemark(data.coords, {
            balloonContent: `<div class="responseBox">
                                <div class="name">${data.name}</div>
                                <a class="place js-addResponse" href="#">${data.place}</a>
                                <div class="response">${data.response}</div>
                            </div>`
        },function (e) {
            e.preventDefault();
            let tempArr = [];
            tempArr.push(mark);
            coordsInput.value = data.coords;
            addressInput.value = data.address;
            AddResponses(tempArr);
            OpenResponseWindow(e.originalEvent.domEvent._cache.pageX, e.originalEvent.domEvent._cache.pageY, mark.address);
            apiMap.balloon.close();
        });

        //Сохроняем данные в localStorage
        marks.push(data);
        localStorage.setItem('marks', JSON.stringify(marks));

        AddResponses(marks.filter(x => x.address === data.address));
        responseForm.reset();
    });

    responseWindow.addEventListener('click', function (e) {
        if(e.target.classList.contains('close')){
            CloseResponseWindow();
        }
        e.stopPropagation();
    });
});
function OpenResponseWindow(left, top, address) {
    responseWindow.style.left = left+'px';
    responseWindow.style.top = top+'px';
    currentAddressTitle.innerHTML = address;
}
function CloseResponseWindow() {
    responseWindow.style = '';
    responseForm.reset();
}
function RenderTemplate(templateName, data) {
    return require(`./${templateName}.hbs`)({reviews: data});
}
function AddResponses(marks) {
    if(marks.length>0){
        let reviewsHTML = RenderTemplate('response', marks);
        responseList.innerHTML = reviewsHTML;
    }else{
        responseList.innerHTML = 'Отзывов пока нет...';
    }
}