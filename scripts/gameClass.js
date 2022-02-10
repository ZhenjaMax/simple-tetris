import * as config from "./config.js";

class Figure{
    constructor() {
        this.id = Math.floor(Math.random()*config.figures.length);
        this.squares = config.figures[this.id].map(x => x.slice());
        this.x = -1;    // Высота, сверху вниз;        // Точка (x,y) показывает    // -1 показывает, что фигуры нет
        this.y = -1;    // Ширина, слева направо;      // верхний левый угол;       // на поле (она будет следующей).
    }
    moveToField(){
        this.x = 0;
        this.y = Math.ceil((config.dimensions.width-this.squares.length)/2);
    }
}

export class GameClass{
    constructor(username) {
        this.username = username;
        this.score = 0;
        this.interval = config.intervalMax;

        this.field = Array(config.dimensions.height).fill(0).map(() => Array(config.dimensions.width).fill(0));
        this.nextFigure = new Figure();
        this.currentFigure = new Figure();
        this.currentFigure.moveToField();
    }

    // standard - по формуле,
    // speedUp - быстрая скорость.
    // Возвращает false, если скорость не изменилась.
    setInterval(intervalType){
        let interval = (intervalType === "standard")
            ? Math.max(config.intervalMax-this.score/4, config.intervalMin)
            : config.intervalSpeedUp;
        if(interval === this.interval)
            return false;
        this.interval = interval;
        return true;
    }

    // удаляет линии и начисляет очки: 100,300,600,1000
    removeLines(){
        let lines = 0;
        for(let i = 0; i < this.field.length; i++)
            if(this.field[i].filter(x => x).length === config.dimensions.width){
                this.field.splice(i, 1);
                this.field.unshift(Array(config.dimensions.width).fill(0));
                i--;
                lines++;
            }
        this.score += Math.floor((config.baseScore)*(1+lines)/2*lines);
    }

    isFitFigure(){
        for(let i = 0; i < this.currentFigure.squares.length; i++)
            for(let j = 0; j < this.currentFigure.squares.length; j++)
                if(this.currentFigure.squares[i][j] !== 0){                 // если за пределы массива
                    if(this.field[this.currentFigure.x+i] === undefined)    // или клетка занята
                        return false;
                    if((this.field[this.currentFigure.x+i][this.currentFigure.y+j] > 0) || (this.field[this.currentFigure.x+i][this.currentFigure.y+j] === undefined))
                        return false;
                }
        return true;
    }

    // Делает то, что нужно для установки
    // следующей фигуры - вставляет в поле текущую фигуру,
    // меняет следующую фигуру на текущую, удаляет линии.
    // Если можно поставить новую фигуру,
    // возвращает true.
    nextFigureRoutine(){
        for(let i = 0; i < this.currentFigure.squares.length; i++)
            for(let j = 0; j < this.currentFigure.squares.length; j++)
                if(this.currentFigure.squares[i][j])
                    this.field[this.currentFigure.x+i][this.currentFigure.y+j] = this.currentFigure.squares[i][j];
        this.currentFigure = this.nextFigure;
        this.currentFigure.moveToField();
        this.nextFigure = new Figure();
        this.removeLines();
        return this.isFitFigure();
    }

    // Двигает фигуру влево, вправо или вниз.
    // true, если фигура подвинулась влево-вправо, false - в противном случае.
    // true, если фигура подвинулась вниз или появилась новая, false - если не получается поставить новую фигуру.
    move(direction){
        switch(direction){
            case "ArrowLeft":
                this.currentFigure.y--;
                if(!this.isFitFigure()) {
                    this.currentFigure.y++;
                    return false;
                }
                return true;
            case "ArrowRight":
                this.currentFigure.y++;
                if(!this.isFitFigure()) {
                    this.currentFigure.y--;
                    return false;
                }
                return true;
            case "DownRoutine":
                this.currentFigure.x++;
                if(!this.isFitFigure()) {
                    this.currentFigure.x--;
                    return false;
                }
                return true;
        }
    }

    // Поворачивает фигуру на 90 градусов по часовой стрелке.
    // true - если фигура повернулась,
    // false - если нет.
    rotate(){
        this.currentFigure.squares = this.rotateMatrix(this.currentFigure.squares, true);
        if(!this.isFitFigure()) {
            this.currentFigure.squares = this.rotateMatrix(this.currentFigure.squares, false)
            return false;
        }
        return true;
    }

    rotateMatrix(matrix, clockwise) {
        if(clockwise)
            matrix = matrix.reverse();
        return matrix[0].map((column, index) => (
            matrix.map(row => row[clockwise ? index : row.length-index-1])
        ));
    }
}
