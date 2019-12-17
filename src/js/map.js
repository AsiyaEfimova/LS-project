class Map {
    constructor(root = 'map', init, settings) {
        this._init = init;
        this._root = root;
        this._settings = settings;
    }

    init() {
        //создаем карту
        var map = new ymaps.Map(this._root, this._init);
        //создаем кластер
        this.clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем стандартный макет балуна кластера "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 300,
            clusterBalloonContentLayoutHeight: 130,
            // Устанавливаем максимальное количество элементов в нижней панели на одной странице
            clusterBalloonPagerSize: 5
        });
        map.geoObjects.add(this.clusterer);

        //Метод init вернет созданную карту
        return map;
    }

    addClusterEventListener(event, handler){
        this.clusterer.events.add(event, handler);
    }

    createPlacemark(coords, options, handler) {
        const placemark = new ymaps.Placemark(coords, options);

        this.clusterer.add(placemark);
        placemark.events.add('click', handler);
    }

    async geocoder(coords) {
        const response = await ymaps.geocode(coords);
        const data = response.geoObjects.get(0)
            .properties.get('metaDataProperty').GeocoderMetaData.text;

        return data;
    }
}

export default Map;