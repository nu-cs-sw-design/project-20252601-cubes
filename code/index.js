class Wordle {
  constructor(wordLength) {
    this.wordLength = wordLength;
    this.maxAttempts = 6;
    this.currentRow = 0;
    this.currentCol = 0;
    this.validWords = ["APPLE", "BANJO", "CRANE", "DANCE", "EAGLE"];
    this.targetWord = "APPLE";
    this.gameOver = false;
    this.gridContainer = document.getElementById("grid-container");
    this.createGrid();
    this.initializeKeyboard();
  }

  createGrid() {
    for (let i = 0; i < this.maxAttempts; i++) {
      const row = document.createElement("div");
      row.classList.add("grid-row");
      for (let j = 0; j < this.wordLength; j++) {
        const tile = document.createElement("div");
        tile.classList.add("grid-tile");
        tile.dataset.row = i;
        tile.dataset.col = j;
        row.appendChild(tile);
      }
      this.gridContainer.appendChild(row);
    }
  }

  initializeKeyboard() {
    const keyboardButtons = document.querySelectorAll(
      ".keyboard-button, .keyboard-button-double"
    );
    keyboardButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const letter = button.textContent;
        this.handleKeyPress(letter);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (this.gameOver) return;
      const letter = event.key.toUpperCase();
      if (event.key === "Enter") {
        this.handleKeyPress("ENTER");
      } else if (event.key === "Backspace") {
        this.handleKeyPress("⌫");
      } else if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        this.handleKeyPress(letter);
      }
    });
  }

  handleKeyPress(letter) {
    if (this.gameOver) return;

    if (letter === "ENTER") {
      this.submitGuess();
    } else if (letter === "⌫" || letter === "BACKSPACE") {
      this.deleteLetter();
    } else if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      this.addLetter(letter);
    }
  }

  addLetter(letter) {
    if (this.currentCol >= this.wordLength) {
      return;
    }
    const tile = this.getTile(this.currentRow, this.currentCol);
    if (tile) {
      tile.textContent = letter;
      tile.style.borderColor = "rgb(142, 143, 143)";
      tile.classList.add("tile-pop");
      setTimeout(() => {
        tile.classList.remove("tile-pop");
      }, 100);
      this.currentCol++;
    }
  }

  deleteLetter() {
    if (this.currentCol === 0) return;
    this.currentCol--;
    const tile = this.getTile(this.currentRow, this.currentCol);
    if (tile) {
      tile.textContent = "";
      tile.style.borderColor = "rgb(211, 214, 218)";
    }
  }

  submitGuess() {
    if (this.currentCol !== this.wordLength) {
      this.showToast("Not enough letters");
      this.shakeRow();
      return;
    }

    let guess = "";
    for (let col = 0; col < this.wordLength; col++) {
      const tile = this.getTile(this.currentRow, col);
      guess += tile.textContent;
    }

    console.log("Submitted guess:", guess);
    const validWords = ["APPLE", "BANJO", "CRANE", "DANCE", "EAGLE"];
    if (!validWords.includes(guess)) {
      this.showToast("Not in word list");
      this.shakeRow();
      return;
    }

    this.currentRow++;
    this.currentCol = 0;

    if (this.currentRow >= this.maxAttempts) {
      this.gameOver = true;
      setTimeout(() => {
        this.showToast(`Game Over! The word was ${this.targetWord}`, 5000);
      }, 1500);
    }
  }
  getTile(row, col) {
    return document.querySelector(`[data-row='${row}'][data-col='${col}']`);
  }
  shakeRow() {
    const tiles = document.querySelectorAll(`[data-row='${this.currentRow}']`);
    tiles.forEach((tile) => {
      tile.style.animation = "shake 0.5s";
    });
    setTimeout(() => {
      tiles.forEach((tile) => {
        tile.style.animation = "";
      });
    }, 500);
  }

  evaluateGuess(guess) {
    const targetCounts = {};
    for (const letter of this.targetWord) {
      targetCounts[letter] = (targetCounts[letter] || 0) + 1;
    }

    const evaluation = Array(this.wordLength).fill(null);

    for (let i = 0; i < this.wordLength; i++) {
      if (guess[i] === this.targetWord[i]) {
        evaluation[i] = "correct";
        targetCounts[guess[i]]--;
      }
    }
    for (let i = 0; i < this.wordLength; i++) {
      if (evaluation[i] === "correct") continue;
      const letter = guess[i];
      if (this.targetWord.includes(letter) && targetCounts[letter] > 0) {
        evaluation[i] = "present";
        targetCounts[letter]--;
      } else {
        evaluation[i] = "absent";
      }
    }
    for (let i = 0; i < this.wordLength; i++) {
      const tile = this.getTile(this.currentRow, i);
      const letter = guess[i];
      const status = evaluation;
    }
  }
  showToast(message, duration = 2000) {
    const toastContainer = document.getElementById("toast-container");
    const existingToast = toastContainer.querySelectorAll(".toast");
    existingToast.forEach((toast) => {
      toast.remove();
    });

    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, duration);
  }
}
const wordleGame = new Wordle(5);
