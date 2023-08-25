export default class Map {
    constructor(x, y, width, height) {
        this._X = x;
        this._Y = y;
        this._Width = width;
        this._Height = height;
        this.element = document.getElementById('map');

        // 初始化并更新
        this.element.style.left = `${this._X}px`;
        this.element.style.top = `${this._Y}px`;
        this.element.style.width = `${this._Width}px`;
        this.element.style.height = `${this._Height}px`;

    }

    get X() {
        return this._X;
    }

    set X(value) {
        this._X = value;
        this.element.style.left = `${value}px`;
    }

    get Y() {
        return this._Y;
    }

    set Y(value) {
        this._Y = value;
        this.element.style.top = `${value}px`;
    }

    get Width() {
        return this._Width;
    }

    set Width(value) {
        this._Width = value;
        this.element.style.width = `${value}px`;
    }

    get Height() {
        return this._Height;
    }

    set Height(value) {
        this._Height = value;
        this.element.style.height = `${value}px`;
    }
}