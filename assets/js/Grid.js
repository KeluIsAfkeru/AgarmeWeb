export default class Grid {
    constructor() {
        this.map = document.getElementById('map');
        this.grid = this.map.querySelector('#grid');

        // 获取 map 元素的宽度和高度
        this.mapWidth = this.map.offsetWidth;
        this.mapHeight = this.map.offsetHeight;
    }

    drawGrid() {
        // Calculate the distance between grid lines
        const gridSpacingX = this.mapWidth / 5;
        const gridSpacingY = this.mapHeight / 5;

        // Clear any existing grid lines
        while (this.grid.firstChild) {
            this.grid.removeChild(this.grid.firstChild);
        }

        // Draw the vertical grid lines
        for (let i = 1; i < 5; i++) {
            const lineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineX.setAttribute('x1', gridSpacingX * i);
            lineX.setAttribute('y1', 0);
            lineX.setAttribute('x2', gridSpacingX * i);
            lineX.setAttribute('y2', this.mapHeight);
            lineX.setAttribute('stroke', 'white');
            lineX.setAttribute('stroke-width', '2');
            this.grid.appendChild(lineX);
        }

        // Draw the horizontal grid lines
        for (let i = 1; i < 5; i++) {
            const lineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineY.setAttribute('x1', 0);
            lineY.setAttribute('y1', gridSpacingY * i);
            lineY.setAttribute('x2', this.mapWidth);
            lineY.setAttribute('y2', gridSpacingY * i);
            lineY.setAttribute('stroke', 'white');
            lineY.setAttribute('stroke-width', '2');
            this.grid.appendChild(lineY);
        }
    }
}