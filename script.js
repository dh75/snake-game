class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        this.initializeElements();
        this.updateDisplay();
        this.bindEvents();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        this.pauseBtn.disabled = true;
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        const key = e.key.toLowerCase();
        
        if ((key === 'arrowup' || key === 'w') && this.dy === 0) {
            this.dx = 0;
            this.dy = -1;
        } else if ((key === 'arrowdown' || key === 's') && this.dy === 0) {
            this.dx = 0;
            this.dy = 1;
        } else if ((key === 'arrowleft' || key === 'a') && this.dx === 0) {
            this.dx = -1;
            this.dy = 0;
        } else if ((key === 'arrowright' || key === 'd') && this.dx === 0) {
            this.dx = 1;
            this.dy = 0;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.restartBtn.disabled = false;
        
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
            this.dy = 0;
        }
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 150);
    }
    
    pauseGame() {
        if (this.gameRunning) {
            this.gameRunning = false;
            clearInterval(this.gameLoop);
            this.pauseBtn.textContent = '재개';
        } else {
            this.gameRunning = true;
            this.pauseBtn.textContent = '일시정지';
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, 150);
        }
    }
    
    restartGame() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '일시정지';
        this.restartBtn.disabled = true;
        
        this.gameOverElement.classList.remove('show');
        this.updateDisplay();
        this.draw();
    }
    
    update() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y
        ));
        
        return foodPosition;
    }
    
    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        for (let segment of this.snake) {
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        }
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
        
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateDisplay();
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.add('show');
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '일시정지';
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});