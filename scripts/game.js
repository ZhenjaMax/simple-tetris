import {GameClass} from "./gameClass.js";
import * as config from "./config.js";

const game = new GameClass(localStorage["tetris.username"]);
var intervalID = undefined;

/* ===== DISPLAY ===== */

function drawField(){
    const canvas = document.getElementById('gameCanvas');
    if (!canvas.getContext)
        return;
    let ctx = canvas.getContext('2d');
    let cellLength = config.squarePx;

    for(let i = 0; i < game.field.length; i++)
        for(let j = 0; j < game.field[0].length; j++){
            ctx.fillStyle = config.colors[game.field[i][j]];
            ctx.fillRect(j*cellLength, i*cellLength, cellLength, cellLength);
        }
}

function drawNextFigure(){
    const canvas = document.getElementById('nextFigureCanvas');
    if (!canvas.getContext)
        return;
    let ctx = canvas.getContext('2d');
    let cellLength = config.squarePx;
    let offset = cellLength/2*(config.figures[0].length-game.nextFigure.squares.length);

    ctx.clearRect(0, 0, cellLength*4, cellLength*4);
    for(let i = 0; i < game.nextFigure.squares.length; i++)
        for(let j = 0; j < game.nextFigure.squares.length; j++)
            if(game.nextFigure.squares[i][j]) {
                ctx.fillStyle = config.colors[game.nextFigure.id+1];
                ctx.fillRect(offset+j*cellLength, offset+i*cellLength, cellLength, cellLength);
            }
}

function drawCurrentFigure(){
    const canvas = document.getElementById('gameCanvas');
    if (!canvas.getContext)
        return;
    let ctx = canvas.getContext('2d');
    let cellLength = config.squarePx;

    for(let i = 0; i < game.currentFigure.squares.length; i++)
        for(let j = 0; j < game.currentFigure.squares.length; j++)
            if(game.currentFigure.squares[i][j]){
                ctx.fillStyle = config.colors[game.currentFigure.id+1]
                ctx.fillRect((game.currentFigure.y+j)*cellLength, (game.currentFigure.x+i)*cellLength, cellLength, cellLength);
            }
}

/* ===== LISTENERS ===== */

function KeyUnpressed(event){
    if(event.key === 'ArrowDown')
        updateGameSpeed("standard");
}

function keyPressed(event){
    switch (event.key){
        case 'ArrowLeft':
        case 'ArrowRight':
            if(game.move(event.key)) {
                drawField();
                drawCurrentFigure();
            }
            return;
        case 'ArrowUp':
            if(game.rotate()){
                drawField();
                drawCurrentFigure();
            }
            return;
        case 'ArrowDown':
            updateGameSpeed("speedUp");
            return;
    }
}

// Обновить игровую скорость:
// standard - по формуле,
// speedUp - при нажатии клавиши "вниз"
function updateGameSpeed(intervalType){
    if(!game.setInterval(intervalType))
        return;
    clearInterval(intervalID);
    intervalID = setInterval(intervalRoutine, game.interval);
}

function intervalRoutine(){
    if(game.move("DownRoutine")){
        drawField();
        drawCurrentFigure();
        return;
    }
    let isPlaced = game.nextFigureRoutine();
    drawField();
    drawCurrentFigure();
    drawNextFigure();
    if(isPlaced) {
        document.getElementById("score").innerHTML = `Счет: ${game.score}`;
        updateGameSpeed("standard");
    }
    else
        endGame();
}

function updateLeaderboard(){
    let leaderboard = (!!localStorage["leaderboard"])
        ? JSON.parse(localStorage.getItem("leaderboard"))
        : [];
    leaderboard.push({
        username: game.username,
        score: game.score
    });
    leaderboard.sort((a, b) => b.score-a.score);
    leaderboard = leaderboard.slice(0, config.leaderboardMax);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function endGame(){
    document.removeEventListener('keydown', keyPressed);
    document.removeEventListener('keyup', KeyUnpressed);
    updateLeaderboard();
    if(intervalID)
        clearInterval(intervalID);
    alert(`Вы проиграли.\nВаш счет: ${game.score}`);
    window.location.href = "../html/leaderboard.html";
}

function startGame(){
    document.getElementById("username").innerHTML = `Игрок: ${game.username}`;
    document.getElementById("score").innerHTML = `Счет: ${game.score}`;
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', KeyUnpressed);
    intervalID = setInterval(intervalRoutine, game.interval);
    drawField();
    drawCurrentFigure();
    drawNextFigure();
}

startGame();
