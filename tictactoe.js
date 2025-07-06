/* game.js */
class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' or 'pvc'
        this.scores = {
            x: 0,
            o: 0,
            draw: 0
        };
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Cell click events
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', this.resetGame.bind(this));

        // Mode selector
        document.getElementById('pvp-mode').addEventListener('click', () => this.setGameMode('pvp'));
        document.getElementById('pvc-mode').addEventListener('click', () => this.setGameMode('pvc'));
    }

    handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (this.board[clickedCellIndex] !== '' || !this.gameActive) {
            return;
        }

        this.makeMove(clickedCellIndex, this.currentPlayer);
        
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.computerMove(), 500);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.updateCellDisplay(index, player);
        
        if (this.checkWinner()) {
            this.endGame(`Player ${player} wins!`);
            this.scores[player.toLowerCase()]++;
            this.updateScoreDisplay();
            return;
        }

        if (this.checkDraw()) {
            this.endGame("It's a draw!");
            this.scores.draw++;
            this.updateScoreDisplay();
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }

    computerMove() {
        if (!this.gameActive) return;

        // Try to win
        let move = this.findWinningMove('O');
        if (move !== -1) {
            this.makeMove(move, 'O');
            return;
        }

        // Try to block player from winning
        move = this.findWinningMove('X');
        if (move !== -1) {
            this.makeMove(move, 'O');
            return;
        }

        // Take center if available
        if (this.board[4] === '') {
            this.makeMove(4, 'O');
            return;
        }

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            this.makeMove(randomCorner, 'O');
            return;
        }

        // Take any available space
        const availableCells = this.board.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
        if (availableCells.length > 0) {
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            this.makeMove(randomCell, 'O');
        }
    }

    findWinningMove(player) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            const line = [this.board[a], this.board[b], this.board[c]];
            
            if (line.filter(cell => cell === player).length === 2 && line.includes('')) {
                return condition[line.indexOf('')];
            }
        }
        return -1;
    }

    checkWinner() {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningLine(condition);
                return true;
            }
        }
        return false;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    highlightWinningLine(condition) {
        condition.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning-line');
        });
    }

    endGame(message) {
        this.gameActive = false;
        this.showMessage(message, 'win');
        this.disableAllCells();
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }

    disableAllCells() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.disabled = true;
        });
    }

    updateCellDisplay(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.disabled = true;
    }

    updateDisplay() {
        document.getElementById('current-player').textContent = `Current Player: ${this.currentPlayer}`;
    }

    updateScoreDisplay() {
        document.getElementById('x-score').textContent = this.scores.x;
        document.getElementById('o-score').textContent = this.scores.o;
        document.getElementById('draw-score').textContent = this.scores.draw;
    }

    setGameMode(mode) {
        this.gameMode = mode;
        
        // Update button styles
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode === 'pvp' ? 'pvp-mode' : 'pvc-mode').classList.add('active');
        
        this.resetGame();
    }

    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Reset cell displays
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.disabled = false;
            cell.classList.remove('x', 'o', 'winning-line');
        });
        
        // Clear message
        document.getElementById('game-message').textContent = '';
        document.getElementById('game-message').className = 'game-message';
        
        this.updateDisplay();
    }
}

// Initialize the game
const game = new TicTacToe();