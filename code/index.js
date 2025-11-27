class Wordle {
  constructor(wordLength) {
    this.wordLength = wordLength;
    this.maxAttempts = 6;
    this.gridContainer = document.getElementById("grid-container");
    this.createGrid();
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
}

const wordleGame = new Wordle(6);
