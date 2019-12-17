class Response {
    constructor(selectors) {
        [this._responseWindow, this._currentAddressTitle, this._responseList, this._responseForm, this._coordsInput, this._addressInput] = selectors;
    }
    CorrectPosition(left, top) {
        var windowWidth = document.documentElement.clientWidth,
            windowHeight = document.documentElement.clientHeight,
            modalWidth = this._responseWindow.clientWidth,
            modalHeight = this._responseWindow.clientHeight;

        if ((modalWidth + left) > windowWidth) {
            left = windowWidth-modalWidth;
        }
        if ((modalHeight + top) > windowHeight) {
            top = windowHeight-modalHeight;
        }

        return [left, top];
    }
    OpenResponseWindow(left, top, address) {
        [left, top] = this.CorrectPosition(left, top);
        this._responseWindow.style.left = left+'px';
        this._responseWindow.style.top = top+'px';
        this._currentAddressTitle.innerHTML = address;
    }
    CloseResponseWindow() {
        this._responseWindow.style = '';
        this._responseForm.reset();
    }
    RenderTemplate(templateName, data) {
        return require(`./../views/${templateName}.hbs`)({ reviews: data });
    }
    AddResponses(marks) {
        if (marks.length>0) {
            let reviewsHTML = this.RenderTemplate('response', marks);

            this._responseList.innerHTML = reviewsHTML;
        } else {
            this._responseList.innerHTML = 'Отзывов пока нет...';
        }
    }
    PlaceMarkHandler(e, data) {
        e.preventDefault();
        e.stopPropagation();
        let tempArr = [],
            [left, top] = e.get('position');

        tempArr.push(data);
        this._coordsInput.value = data.coords;
        this._addressInput.value = data.address;
        this.AddResponses(tempArr);
        this.OpenResponseWindow(left, top, data.address);
    }
}

export default Response;