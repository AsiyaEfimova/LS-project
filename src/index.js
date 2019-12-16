import Map from './js/map';
import Response from './js/response';
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

    const responseApi = new Response([responseWindow, currentAddressTitle, responseList, responseForm, coordsInput, addressInput]);

    //рендер текущих меток (из localStorage) при загрузке приложения
    marks.forEach(mark => {
        apiMap.createPlacemark(mark.coords, {
            balloonContent: responseApi.RenderTemplate('balloon_response', mark)
        },function (e) {
            responseApi.PlaceMarkHandler(e, mark);
            map.balloon.close();
        });
    });
    window.addEventListener('click', function (e) {
        if(e.target.classList.contains('js-addResponse')){
            map.balloon.close();
            let currenrMarks = marks.filter(x => x.address === e.target.innerHTML);
            coordsInput.value = currenrMarks[0].coords;
            addressInput.value = currenrMarks[0].address;
            responseApi.AddResponses(currenrMarks);
            responseApi.OpenResponseWindow(e.pageX, e.pageY, e.target.innerHTML);
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

        responseApi.AddResponses(marks.filter(x => x.address === address));
        responseApi.OpenResponseWindow(left, top, address);
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
            balloonContent: responseApi.RenderTemplate('balloon_response', data)
        },function (e) {
            responseApi.PlaceMarkHandler(e, data);
            map.balloon.close();
        });

        //Сохроняем данные в localStorage
        marks.push(data);
        localStorage.setItem('marks', JSON.stringify(marks));

        responseApi.AddResponses(marks.filter(x => x.address === data.address));
        responseForm.reset();
    });

    responseWindow.addEventListener('click', function (e) {
        if(e.target.classList.contains('close')){
            responseApi.CloseResponseWindow();
        }
        e.stopPropagation();
    });
});