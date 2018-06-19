import { Component, HostListener } from '@angular/core';
import { Snake } from '../snake';
import { Controls, Colors, Canvas_Size } from '../controls';
import { Fruit } from '../fruit';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  host: {
    '(document:keypress)': 'handleKeyboardEvents($event)'
  }
})
export class CanvasComponent {

  public isGameOver = false;
  public getKeys = Object.keys;
  public board = [];
  public obstacles = [];
  public score = 0;
  public gameStarted = false;
  public temp: number;

  snake: Snake = {
    snakeDirection: Controls.Right,
    snakeBody: [
      {
      x: -1,
      y: -1
      }
    ]
  };

  fruit: Fruit = {
    fruitCoordinates: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  constructor() { 
    this.createBoard();
  }

  snakeDirection(e: KeyboardEvent) {
    if(e.keyCode === Controls.Left && this.snake.snakeDirection !== Controls.Right){
      this.temp = Controls.Left;
    }
    else if (e.keyCode === Controls.Up && this.snake.snakeDirection !== Controls.Down){
      this.temp = Controls.Up;
    }
    else if (e.keyCode === Controls.Right && this.snake.snakeDirection !== Controls.Left){
      this.temp = Controls.Right;
    }
    else if (e.keyCode === Controls.Down && this.snake.snakeDirection !== Controls.Up){
      this.temp = Controls.Down;
    }
  }

  //Set Colors of Snake Head, Snake Body, Game Canvas
  setColors(col: number, row: number) {
    if (this.isGameOver) {
      return Colors.SnakeDied;
    }
    else if (this.fruit.fruitCoordinates.x === row && this.fruit.fruitCoordinates.y === col){
      return Colors.Apple;
    }
    else if (this.snake.snakeBody[0].x === row && this.snake.snakeBody[0].y === col){
      return Colors.SnakeHead;
    }
    else if (this.board[col][row] === true){
      return Colors.SnakeBody;
    }

    return Colors.Canvas;
  }

  changeSnakeDirection(){
    let snakeNewHead = this.repositionSnakeHead();
    let me = this;

    if(this.snakeHitCanvas(snakeNewHead)){
      return this.gameOver();
    }

    if(this.snakeHitObstacle(snakeNewHead)){
      return this.gameOver();
    }
    
    if(this.snakeHitSnake(snakeNewHead)){
      return this.gameOver();
    }

    if(this.snakeEatApple(snakeNewHead)){
      return this.snakeEatFruit();  
    }

    let snakeTail = this.snake.snakeBody.pop();
    this.board[snakeTail.y][snakeTail.x] = false;

    this.snake.snakeBody.unshift(snakeNewHead);
    this.board[snakeNewHead.y][snakeNewHead.x] = true;

    this.snake.snakeDirection = this.temp;
  }

  repositionSnakeHead() {
    let snakeNewHead = Object.assign({}, this.snake.snakeBody[0]);

    if (this.temp === Controls.Left){
      snakeNewHead.x -= 1;
    }
    else if (this.temp === Controls.Right){
      snakeNewHead.x += 1;
    }
    else if (this.temp === Controls.Up){
      snakeNewHead.y -= -1;
    }
    else if (this.temp === Controls.Down){
      snakeNewHead.y += 1;
    }

    return snakeNewHead;
  }

  addObstacles(){
    let x = this.generateRandomNumber();
    let y = this.generateRandomNumber();

    // console.log(x);

    if (this.board[x][y] === true || y === 8) {
      return this.addObstacles();
    }

    this.obstacles.push({
      x: x,
      y: y
    });
  }

  checkObstacles(x, y){
    let res = false;

    this.obstacles.forEach((val) => {
      if (val.x === x && val.y ===y){
        res = true;
      }
    });

    return res;
  }

  snakeHitObstacle(body){
    return this.checkObstacles(body.x, body.y);
  }

  snakeHitCanvas(body){
    // return this.snake.snakeBody.x === Canvas_Size || this.snake.snakeBody.x === -1 || this.snake.snakeBody.y === Canvas_Size || this.snake.snakeBody.y === -1;
    return body.x === Canvas_Size || body.x === -1 || body.y === Canvas_Size || body.y === -1;
  }

  snakeHitSnake(body) {
    return this.board[body.x][body.y] === true;
  }

  snakeEatApple(body){
    return body.x === this.fruit.fruitCoordinates.x && body.y === this.fruit.fruitCoordinates.y; 
  }

  regenerateFruit(){
    let x = this.generateRandomNumber();
    let y = this.generateRandomNumber();

    if(this.board[x][y] === true || this.checkObstacles(x, y)){
      return this.regenerateFruit();
    }

    this.fruit.fruitCoordinates = {
      x: x,
      y: y
    };
  }

  snakeEatFruit(){
    this.score++;

    let snakeTail = Object.assign({}, this.snake.snakeBody[this.snake.snakeBody.length - 1]);

    this.snake.snakeBody.push(snakeTail);

    this.regenerateFruit();
  }

  gameOver(){
    this.isGameOver = true;
    this.gameStarted = false;

    this.createBoard();
  }

  generateRandomNumber(){
    return Math.floor(Math.random() * Canvas_Size);
  }

  createBoard() {
    this.board = [];

    for(let i = 0; i < Canvas_Size; i++){
      this.board[i] = [];
      for(let j = 0; j < Canvas_Size; j++){
        this.board[i][j] = false
      }
    }
  }

  startGame() {
    this.gameStarted = true;
    this.score = 0;
    // this.snake.snakeDirection = Controls.Right;
    this.isGameOver = false;

    this.snake = {
      snakeDirection: Controls.Right,
      snakeBody: []
    };

    for (let i = 0; i < 3; i++){
      this.snake.snakeBody.push({ x: 8 + i, y: 8});
    }

    this.addObstacles();
    this.regenerateFruit();
    this.repositionSnakeHead();
  }

}
