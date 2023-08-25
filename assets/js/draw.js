import Cell from './cell.js';
import Grid from './Grid.js';
import Map from './map.js';
export class Draw {
    constructor(app) {
        this.app = app;
        this.routerId = -1;
        this.stars = [];
        this._isDrawStars = true;
        this.ticker = null;
        this.grid = null;

        this.map = new Map(50, 50, 500, 500, this.grid);
        this.grid = new Grid(this.map, 5, 5);
    }

    drawCircle(x, y, radius, color = 0xFFFFFF) {
        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        circle.x = x;
        circle.y = y;
        this.app.stage.addChild(circle);
    }

    

    addStars() {
        const starAmount = 100;
        const centerX = this.app.screen.width / 2;
        const centerY = this.app.screen.height / 2;
        const maxSpeed = 5; // 设定最大速度

        for (let i = 0; i < starAmount; i++) {
            let star = PIXI.Sprite.from(PIXI.Texture.WHITE);

            star.anchor.set(0.5);

            star.width = star.height = Math.random() * 3;

            star.tint = Math.random() * 0xFFFFFF;

            const radius = Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            star.x = centerX + radius * Math.cos(angle);
            star.y = centerY + radius * Math.sin(angle);

            star.speed = Math.random() * 1.1;
            star.angle = angle;
            star.maxSpeed = 0.8;

            this.app.stage.addChild(star);
            this.stars.push(star);
        }
    }

    removeStars() {
        for (let i = this.stars.length - 1; i >= 0; i--) {
            let star = this.stars[i];
            this.app.stage.removeChild(star);
        }
        this.stars = [];
        if (this.ticker) {
            this.app.ticker.remove(this.ticker);
            this.ticker = null;
        }
    }

    set isDrawStars(value) {
        if (value) {
            this.addStars();
            if (this.ticker) {
                this.app.ticker.remove(this.ticker);
            }
            this.ticker = (delta) => {
                for (let i = this.stars.length - 1; i >= 0; i--) {
                    let star = this.stars[i];
                    let tempIncrease = Math.min(star.speed * delta, star.maxSpeed)
                    star.x += Math.cos(star.angle) * tempIncrease;
                    star.y += Math.sin(star.angle) * tempIncrease;

                    // 如果星星移动到屏幕外，重置位置到屏幕中心
                    if (star.x < 0 || star.x > this.app.screen.width ||
                        star.y < 0 || star.y > this.app.screen.height) {
                        star.x = this.app.screen.width / 2 + (Math.random() - 0.5) * 2 * 20;
                        star.y = this.app.screen.height / 2 + (Math.random() - 0.5) * 2 * 20;
                        star.speed = Math.random() * 0.8;
                    }
                }
            };
            this.app.ticker.add(this.ticker);
        } else {
            this.removeStars();
        }
        this._isDrawStars = value;
    }

    get isDrawStars() {
        return this._isDrawStars;
    }
}