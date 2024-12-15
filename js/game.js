// game.js
class HangmanGame {
    constructor() {
        // Game state
        this.word = '';
        this.hint = '';
        this.guessedLetters = new Set();
        this.remainingGuesses = 6;
        this.wins = parseInt(localStorage.getItem('hangmanWins') || 0);
        this.losses = parseInt(localStorage.getItem('hangmanLosses') || 0);
        this.soundEnabled = true;

        // DOM Elements
        this.wordDisplay = document.getElementById('wordDisplay');
        this.hintText = document.getElementById('hintText');
        this.messageBox = document.getElementById('messageBox');
        this.messageText = document.getElementById('messageText');
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Audio Elements
        this.sounds = {
            correct: document.getElementById('correctSound'),
            wrong: document.getElementById('wrongSound'),
            win: document.getElementById('winSound'),
            lose: document.getElementById('loseSound'),
            bg: document.getElementById('bgMusic')
        };

        // Initialize
        this.initializeGame();
        this.setupEventListeners();
        this.updateScore();
    }

    initializeGame() {
        const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        this.word = randomWord.word;
        this.hint = randomWord.hint;
        this.guessedLetters.clear();
        this.remainingGuesses = 6;
        this.createVirtualKeyboard();
        this.updateWordDisplay();
        this.drawHangman();
        this.hideMessage();
        
        // Mostrar la pista inmediatamente
        this.hintText.textContent = this.hint;
        
        if (this.soundEnabled) {
            this.sounds.bg.play();
            this.sounds.bg.volume = 0.1;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('newGameBtn').addEventListener('click', () => this.initializeGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }

    createVirtualKeyboard() {
        const keyboard = document.getElementById('virtualKeyboard');
        keyboard.innerHTML = '';
        
        // Layout QWERTY
        const qwertyLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
    
        // Crear un div para cada fila
        qwertyLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(letter => {
                const button = document.createElement('button');
                button.className = 'key-button';
                button.textContent = letter;
                button.addEventListener('click', () => this.handleGuess(letter));
                rowDiv.appendChild(button);
            });
            
            keyboard.appendChild(rowDiv);
        });
    }

    handleKeyPress(e) {
        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
            this.handleGuess(letter);
        }
    }

    handleGuess(letter) {
        if (this.guessedLetters.has(letter) || letter === ' ') return;
    
        this.guessedLetters.add(letter);
        const button = [...document.getElementsByClassName('key-button')]
            .find(btn => btn.textContent === letter);
        
        if (this.word.includes(letter)) {
            if (this.soundEnabled) this.sounds.correct.play();
            button.style.backgroundColor = 'var(--neon-green)';
            button.style.color = 'black';
        } else {
            if (this.soundEnabled) this.sounds.wrong.play();
            button.style.backgroundColor = 'var(--neon-pink)';
            button.style.color = 'black';
            this.remainingGuesses--;
            this.drawHangman();
        }
    
        this.updateWordDisplay();
        this.checkGameEnd();
    }

    updateWordDisplay() {
        this.wordDisplay.innerHTML = this.word
        .split('')
        .map(letter => {
            if (letter === ' ') {
                return '<span class="letter space"></span>';
            }
            return `<span class="letter">
                ${this.guessedLetters.has(letter) ? letter : '_'}
            </span>`;
        })
        .join('');
    }

    showHint() {
        const typewriter = new TypeWriter(this.hintText, this.hint);
        typewriter.start();
    }

    showMessage(text, isWin = false) {
        this.messageText.textContent = '';
        this.messageBox.classList.remove('hidden');
        const typewriter = new TypeWriter(this.messageText, text);
        typewriter.start();
        this.messageBox.style.borderColor = isWin ? 'var(--neon-green)' : 'var(--neon-pink)';
    }

    hideMessage() {
        this.messageBox.classList.add('hidden');
    }

    checkGameEnd() {
        const won = [...this.word].every(letter => 
            letter === ' ' || this.guessedLetters.has(letter)
        );
        const lost = this.remainingGuesses === 0;
    
        if (won) {
            if (this.soundEnabled) this.sounds.win.play();
            this.wins++;
            this.showMessage('YOU WIN! PRESS NEW GAME TO PLAY AGAIN', true);
            localStorage.setItem('hangmanWins', this.wins);
        } else if (lost) {
            if (this.soundEnabled) this.sounds.lose.play();
            this.losses++;
            this.showMessage(`GAME OVER! THE WORD WAS: ${this.word}`);
            localStorage.setItem('hangmanLosses', this.losses);
        }
    
        if (won || lost) {
            this.updateScore();
            this.disableKeyboard();
        }
    }

    updateScore() {
        document.getElementById('wins').textContent = this.wins;
        document.getElementById('losses').textContent = this.losses;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.textContent = `SOUND: ${this.soundEnabled ? 'ON' : 'OFF'}`;
        if (!this.soundEnabled) {
            this.sounds.bg.pause();
        } else {
            this.sounds.bg.play();
        }
    }

    disableKeyboard() {
        const buttons = document.getElementsByClassName('key-button');
        [...buttons].forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
    }

    drawHangman() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 2;

        // Dibujar base
        const drawBase = () => {
            this.ctx.beginPath();
            this.ctx.moveTo(50, 250);
            this.ctx.lineTo(250, 250);
            this.ctx.stroke();
        };

        // Dibujar poste
        const drawPost = () => {
            this.ctx.beginPath();
            this.ctx.moveTo(100, 250);
            this.ctx.lineTo(100, 50);
            this.ctx.lineTo(200, 50);
            this.ctx.lineTo(200, 80);
            this.ctx.stroke();
        };

        // Dibujar cabeza
        const drawHead = () => {
            this.ctx.beginPath();
            this.ctx.arc(200, 100, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        };

        // Dibujar cuerpo
        const drawBody = () => {
            this.ctx.beginPath();
            this.ctx.moveTo(200, 120);
            this.ctx.lineTo(200, 180);
            this.ctx.stroke();
        };

        // Dibujar brazos
        const drawArms = () => {
            this.ctx.beginPath();
            this.ctx.moveTo(200, 140);
            this.ctx.lineTo(160, 160);
            this.ctx.moveTo(200, 140);
            this.ctx.lineTo(240, 160);
            this.ctx.stroke();
        };

        // Dibujar piernas
        const drawLegs = () => {
            this.ctx.beginPath();
            this.ctx.moveTo(200, 180);
            this.ctx.lineTo(160, 220);
            this.ctx.moveTo(200, 180);
            this.ctx.lineTo(240, 220);
            this.ctx.stroke();
        };

        const parts = [drawBase, drawPost, drawHead, drawBody, drawArms, drawLegs];
        const partsToShow = 6 - this.remainingGuesses;
        
        for (let i = 0; i <= partsToShow; i++) {
            if (parts[i]) parts[i]();
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new HangmanGame();
});