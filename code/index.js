class Wordle {
  constructor(wordLength) {
    // Parse URL parameters for game mode (if any)
    const urlParams = new URLSearchParams(window.location.search);
    const modeFromURL = urlParams.get("mode");

    this.wordLength = modeFromURL ? parseInt(modeFromURL) : wordLength;
    this.maxAttempts = 6; //max attemps for guessing (can be changed later)
    this.currentRow = 0;
    this.currentCol = 0;

    this.modeKey = `wordle_${this.wordLength}`;

    //hard coded for now, can be replaced with API or larger word list later
    this.wordList = {
      4: [
        "ABLE",
        "BAND",
        "CART",
        "DART",
        "EARN",
        "FARM",
        "GATE",
        "HARD",
        "IDEA",
        "JUMP",
        "KING",
        "LAMP",
        "MINT",
        "NOTE",
        "OPEN",
        "PARK",
        "QUAD",
        "RING",
        "SAND",
        "TIME",
        "UNIT",
        "VASE",
        "WIND",
        "YARD",
        "ZONE",
      ],
      5: [
        "APPLE",
        "BANJO",
        "CRANE",
        "DANCE",
        "EAGLE",
        "FLAME",
        "GRAPE",
        "HOUSE",
        "INDEX",
        "JELLY",
        "KNIFE",
        "LIGHT",
        "MOUSE",
        "NURSE",
        "OCEAN",
        "PLANT",
        "QUICK",
        "ROBOT",
        "SNAKE",
        "TABLE",
        "ULTRA",
        "VIVID",
        "WATER",
        "XENON",
        "YACHT",
        "ZEBRA",
      ],
      6: [
        "PLANET",
        "GARDEN",
        "FAMILY",
        "MARKET",
        "BRIDGE",
        "WINDOW",
        "BUTTON",
        "CANDLE",
        "DESERT",
        "ENGINE",
        "FOREST",
        "GUITAR",
        "HUNTER",
        "ISLAND",
        "JOURNY",
        "KITTEN",
        "LANTERN",
        "MONSTER",
        "NUGGET",
        "ORANGE",
        "POCKET",
        "QUARTZ",
        "ROCKET",
        "SILVER",
        "TUNNEL",
        "UMBREL",
        "VALLEY",
        "WIZARD",
        "YELLOW",
        "ZEBRA",
      ],
    };
    this.validWords = this.wordList[this.wordLength] || this.wordList[5];
    this.targetWord =
      this.validWords[Math.floor(Math.random() * this.validWords.length)]; //get random word
    this.gameOver = false;
    this.guessedWords = [];
    this.keyboardStatus = {};

    //streak
    this.currentStreak =
      parseInt(localStorage.getItem(`${this.modeKey}_streak`)) || 0;
    this.maxStreak =
      parseInt(localStorage.getItem(`${this.modeKey}_maxStreak`)) || 0;

    //settings
    this.darkMode = localStorage.getItem("wordleDarkMode") === "true";
    this.highContrastMode =
      localStorage.getItem("wordleHighContrast") === "true";

    //stats
    this.gamesPlayed =
      parseInt(localStorage.getItem(`${this.modeKey}_gamesPlayed`)) || 0;
    this.gamesWon =
      parseInt(localStorage.getItem(`${this.modeKey}_gamesWon`)) || 0;
    this.guessDistribution = JSON.parse(
      localStorage.getItem(`${this.modeKey}_guessDistribution`)
    ) || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    this.lastWinGuesses =
      parseInt(localStorage.getItem(`${this.modeKey}_lastWinGuesses`)) || 0;

    //hint
    this.hintUsed = false;
    this.hintLetter = null;

    this.gridContainer = document.getElementById("grid-container");
    this.gridContainer.innerHTML = "";

    this.createGrid();
    this.initializeKeyboard();
    this.updateStreakDisplay();
    this.updateModeDisplay();
    this.initializePlayAgainButton();
    this.initializeSettings();
    this.createHintButton();
    this.applySettings();
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
      const tiles = document.querySelectorAll(
        `[data-row='${this.currentRow}']`
      );
      tiles.forEach((tile) => {
        tile.style.animation = "shake 0.5s";
      });
      setTimeout(() => {
        tiles.forEach((tile) => {
          tile.style.animation = "";
        });
      }, 500);
      return;
    }

    let guess = "";
    for (let col = 0; col < this.wordLength; col++) {
      const tile = this.getTile(this.currentRow, col);
      guess += tile.textContent;
    }

    console.log("Submitted guess:", guess);

    //green
    if (!this.validWords.includes(guess)) {
      this.showToast("Not in word list");
      const tiles = document.querySelectorAll(
        `[data-row='${this.currentRow}']`
      );
      tiles.forEach((tile) => {
        tile.style.animation = "shake 0.5s";
      });
      setTimeout(() => {
        tiles.forEach((tile) => {
          tile.style.animation = "";
        });
      }, 500);
      return;
    }

    //yellow
    if (this.guessedWords.includes(guess)) {
      this.showToast("You already guessed that word");
      const tiles = document.querySelectorAll(
        `[data-row='${this.currentRow}']`
      );
      tiles.forEach((tile) => {
        tile.style.animation = "shake 0.5s";
      });
      setTimeout(() => {
        tiles.forEach((tile) => {
          tile.style.animation = "";
        });
      }, 500);
      return;
    }
    this.guessedWords.push(guess);

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

    const currentRoNum = this.currentRow;
    for (let i = 0; i < this.wordLength; i++) {
      const tile = this.getTile(currentRoNum, i);
      const letter = guess[i];
      const status = evaluation[i];
      setTimeout(() => {
        tile.classList.add("tile-flip");
        const correctColor = this.highContrastMode ? "#f5793a" : "#6aaa64";
        const presentColor = this.highContrastMode ? "#85c0f9" : "#c9b458";
        const absentColor = "#787c7e";

        setTimeout(() => {
          if (status === "correct") {
            tile.style.backgroundColor = correctColor;
            tile.style.borderColor = correctColor;
            tile.style.color = "white";
          } else if (status === "present") {
            tile.style.backgroundColor = presentColor;
            tile.style.borderColor = presentColor;
            tile.style.color = "white";
          } else {
            tile.style.backgroundColor = absentColor;
            tile.style.borderColor = absentColor;
            tile.style.color = "white";
          }
        }, 250);

        const keyboardButtons = document.querySelectorAll(
          ".keyboard-button, .keyboard-button-double"
        );
        keyboardButtons.forEach((button) => {
          if (button.textContent === letter) {
            const currentStatus = this.keyboardStatus[letter];
            if (status === "correct") {
              this.keyboardStatus[letter] = "correct";
              button.style.backgroundColor = correctColor;
              button.style.color = "white";
            } else if (status === "present" && currentStatus !== "correct") {
              this.keyboardStatus[letter] = "present";
              button.style.backgroundColor = presentColor;
              button.style.color = "white";
            } else if (status === "absent" && !currentStatus) {
              this.keyboardStatus[letter] = "absent";
              button.style.backgroundColor = absentColor;
              button.style.color = "white";
            }
          }
        });
      }, i * 250);
    }
    const animationDuration = this.wordLength * 250 + 250;

    if (guess === this.targetWord) {
      this.gameOver = true;
      setTimeout(() => {
        const tiles = document.querySelectorAll(`[data-row='${currentRoNum}']`);
        tiles.forEach((tile, index) => {
          setTimeout(() => {
            tile.classList.add("tile-bounce");
          }, index * 100);
        });

        const attemps = currentRoNum + 1;
        let message = "";
        if (attemps === 1) {
          message = "Genius! 1st try!";
        } else if (attemps === 2) {
          message = "Magnificent! 2nd try!";
        } else if (attemps === 3) {
          message = "Impressive! 3rd try!";
        } else if (attemps === 4) {
          message = "Great! 4th try!";
        } else if (attemps === 5) {
          message = "Good job! 5th try!";
        } else {
          message = "Phew! Made it on the 6th try!";
        }
        this.showToast(message, 3000);

        this.gamesPlayed++;
        this.gamesWon++;
        this.guessDistribution[attemps] =
          (this.guessDistribution[attemps] || 0) + 1;
        this.lastWinGuesses = attemps;

        localStorage.setItem(`${this.modeKey}_gamesPlayed`, this.gamesPlayed);
        localStorage.setItem(`${this.modeKey}_gamesWon`, this.gamesWon);
        localStorage.setItem(
          `${this.modeKey}_guessDistribution`,
          JSON.stringify(this.guessDistribution)
        );
        localStorage.setItem(
          `${this.modeKey}_lastWinGuesses`,
          this.lastWinGuesses
        );

        this.currentStreak++;
        if (this.currentStreak > this.maxStreak) {
          this.maxStreak = this.currentStreak;
          setTimeout(() => {
            this.showToast(`New max streak: ${this.maxStreak}`, 3000);
          }, 3500);
        }

        localStorage.setItem(`${this.modeKey}_streak`, this.currentStreak);
        localStorage.setItem(`${this.modeKey}_maxStreak`, this.maxStreak);
        /////////////////

        const gameEndOverlay = document.getElementById("game-end-overlay");
        const gameEndMessage = document.getElementById("game-end-message");
        const gameEndWord = document.getElementById("game-end-word");
        if (gameEndOverlay && gameEndMessage && gameEndWord) {
          gameEndMessage.textContent = message;
          gameEndWord.textContent = `The word was: ${this.targetWord}`;
          gameEndOverlay.style.display = "flex";
        }
      }, animationDuration);
    } else {
      this.currentRow++;
      this.currentCol = 0;
      if (this.currentRow >= this.maxAttempts) {
        this.gameOver = true;
        setTimeout(() => {
          this.showToast(`Game Over! The word was: ${this.targetWord}`, 5000);

          this.gamesPlayed++;
          this.lastWinGuesses = 0;
          localStorage.setItem(`${this.modeKey}_gamesPlayed`, this.gamesPlayed);
          localStorage.setItem(
            `${this.modeKey}_lastWinGuesses`,
            this.lastWinGuesses
          );
          if (this.currentStreak > 0) {
            setTimeout(() => {
              this.showToast(`Streak ended at: ${this.currentStreak}`, 4000);
            }, 5500);
          }

          this.currentStreak = 0;
          localStorage.setItem(`${this.modeKey}_streak`, this.currentStreak);
          this.updateStreakDisplay();

          const gameEndOverlay = document.getElementById("game-end-overlay");
          const gameEndMessage = document.getElementById("game-end-message");
          const gameEndWord = document.getElementById("game-end-word");
          if (gameEndOverlay && gameEndMessage && gameEndWord) {
            gameEndMessage.textContent = "Game Over!";
            gameEndWord.textContent = `The word was: ${this.targetWord}`;
            gameEndOverlay.style.display = "flex";
          }
        }, animationDuration);
      }
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

  updateStreakDisplay() {
    const streakCount = document.getElementById("streak-count");
    if (streakCount) {
      streakCount.textContent = this.currentStreak;
    }
    const maxStreakCount = document.getElementById("max-streak-count");
    if (maxStreakCount) {
      maxStreakCount.textContent = this.maxStreak;
    }
  }

  updateStatsDisplay() {
    const statPlayed = document.getElementById("stat-played");
    const statWinPercent = document.getElementById("stat-win-percent");
    const statCurrentStreak = document.getElementById("stat-current-streak");
    const statMaxStreak = document.getElementById("stat-max-streak");

    if (statPlayed) {
      statPlayed.textContent = this.gamesPlayed;
    }
    if (statWinPercent) {
      const winPercent =
        this.gamesPlayed > 0
          ? Math.round((this.gamesWon / this.gamesPlayed) * 100)
          : 0;
      statWinPercent.textContent = `${winPercent}%`;
    }
    if (statCurrentStreak) {
      statCurrentStreak.textContent = this.currentStreak;
    }
    if (statMaxStreak) {
      statMaxStreak.textContent = this.maxStreak;
    }

    const maxGuesses = Math.max(...Object.values(this.guessDistribution), 1);

    for (let i = 1; i <= 6; i++) {
      const bar = document.getElementById(`guess-bar-${i}`);
      const count = document.getElementById(`guess-count-${i}`);
      const guessCount = this.guessDistribution[i] || 0;

      if (bar && count) {
        count.textContent = guessCount;
        const widthPercent =
          guessCount > 0 ? Math.max((guessCount / maxGuesses) * 100, 7) : 7;
        bar.style.width = `${widthPercent}%`;

        if (this.lastWinGuesses === i && guessCount > 0) {
          bar.style.backgroundColor = this.highContrastMode
            ? "#f5793a"
            : "#6aaa64";
        } else {
          bar.style.backgroundColor = "#787c7e";
        }
      }
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

  updateModeDisplay() {
    const modeDisplay = document.getElementById("mode-display");
    if (modeDisplay) {
      modeDisplay.textContent = `${this.wordLength} Letters`;
    }
  }

  createHintButton() {
    const hintButton = document.getElementById("hint-button");
    if (hintButton) {
      hintButton.addEventListener("click", () => {
        this.useHint();
      });
    }
  }

  useHint() {
    //if hint is already used
    if (this.hintUsed) {
      this.showToast("Hint already used this game");
      return;
    }

    if (this.gameOver) {
      this.showToast("Game is over. Cannot use hint.");
      return;
    }

    const targetLetters = this.targetWord.split("");
    const unrevealedLetters = [];

    for (const letter of targetLetters) {
      const status = this.keyboardStatus[letter];
      if (status !== "correct" && status !== "present" && status !== "hint") {
        unrevealedLetters.push(letter);
      }
    }

    //when hint would be of no use
    if (unrevealedLetters.length === 0) {
      this.showToast("All letters have been revealed!");
      return;
    }

    const hintLetter =
      unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
    this.hintLetter = hintLetter;
    const hintColor = this.highContrastMode ? "#9d4edd" : "#e85d9a";
    const keyboardButtons = document.querySelectorAll(
      ".keyboard-button, .keyboard-button-double"
    );
    keyboardButtons.forEach((button) => {
      if (button.textContent === hintLetter) {
        button.style.backgroundColor = hintColor;
        button.style.color = "white"; //
      }
    });

    this.keyboardStatus[hintLetter] = "hint";
    this.hintUsed = true;
    const hintButton = document.getElementById("hint-button");
    if (hintButton) {
      hintButton.style.opacity = "0.5";
      hintButton.style.cursor = "not-allowed";
    }

    this.showToast(
      `Hint used! The letter "${hintLetter}" is in the word.`,
      2500
    );
  }

  reapplyColors() {
    const correctColor = this.highContrastMode ? "#f5793a" : "#6aaa64";
    const presentColor = this.highContrastMode ? "#85c0f9" : "#c9b458";
    const hintColor = this.highContrastMode ? "#9d4edd" : "#e85d9a";
    const absentColor = "#787c7e";

    const defaultKeyColor = this.darkMode ? "#3a3a3c" : "#d3d6da";
    const defaultKeyTextColor = this.darkMode ? "#ffffff" : "#000000";

    const allTiles = document.querySelectorAll(".grid-tile");
    allTiles.forEach((tile) => {
      const backgroundColor = tile.style.backgroundColor;
      if (
        backgroundColor === "rgb(106,170,100)" ||
        backgroundColor === "rgb(245,121,58)"
      ) {
        tile.style.backgroundColor = correctColor;
        tile.style.borderColor = correctColor;
      } else if (
        backgroundColor === "rgb(201,180,88)" ||
        backgroundColor === "rgb(133,192,249)"
      ) {
        tile.style.backgroundColor = presentColor;
        tile.style.borderColor = presentColor;
      }
    });

    // on screen keyboard
    const keyboardButtons = document.querySelectorAll(
      ".keyboard-button, .keyboard-button-double"
    );
    keyboardButtons.forEach((button) => {
      const letter = button.textContent;
      const status = this.keyboardStatus[letter];
      if (status === "correct") {
        button.style.backgroundColor = correctColor;
        button.style.color = "white";
      } else if (status === "present") {
        button.style.backgroundColor = presentColor;
        button.style.color = "white";
      } else if (status === "hint") {
        button.style.backgroundColor = hintColor;
        button.style.color = "white";
      } else if (status === "absent") {
        button.style.backgroundColor = absentColor;
        button.style.color = "white";
      } else if (letter !== "ENTER" && letter !== "⌫") {
        button.style.backgroundColor = defaultKeyColor;
        button.style.color = defaultKeyTextColor;
      }
    });
  }

  applySettings() {
    if (this.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    if (this.highContrastMode) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    this.reapplyColors();
  }

  initializeSettings() {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const highContrastToggle = document.getElementById("high-contrast-toggle");
    if (darkModeToggle) {
      darkModeToggle.checked = this.darkMode;
      darkModeToggle.addEventListener("change", () => {
        this.darkMode = darkModeToggle.checked;
        localStorage.setItem("wordleDarkMode", this.darkMode);
        this.applySettings();
      });
    }
    if (highContrastToggle) {
      highContrastToggle.checked = this.highContrastMode;
      highContrastToggle.addEventListener("change", () => {
        this.highContrastMode = highContrastToggle.checked;
        localStorage.setItem("wordleHighContrast", this.highContrastMode);
        this.applySettings();
      });
    }
  }

  resetGame() {
    this.currentRow = 0;
    this.currentCol = 0;
    this.gameOver = false;
    this.guessedWords = [];
    this.keyboardStatus = {};
    this.hintUsed = false;
    this.hintLetter = null;

    //enable hint
    const hintButton = document.getElementById("hint-button");
    if (hintButton) {
      hintButton.style.opacity = "1";
      hintButton.style.cursor = "pointer";
    }

    //new word
    this.targetWord =
      this.validWords[Math.floor(Math.random() * this.validWords.length)];

    //clear grid
    this.gridContainer.innerHTML = "";
    this.createGrid();

    //clear keyboard colors
    const keyboardButtons = document.querySelectorAll(
      ".keyboard-button, .keyboard-button-double"
    );
    keyboardButtons.forEach((button) => {
      if (button.textContent !== "ENTER" && button.textContent !== "⌫") {
        button.style.backgroundColor = "#d3d6da";
        button.style.color = "#000000";
      }
    });

    const gameEndOverlay = document.getElementById("game-end-overlay");
    if (gameEndOverlay) {
      gameEndOverlay.style.display = "none";
    }

    //reload local storage
    this.currentStreak =
      parseInt(localStorage.getItem(`${this.modeKey}_streak`)) || 0;
    this.maxStreak =
      parseInt(localStorage.getItem(`${this.modeKey}_maxStreak`)) || 0;
    this.updateStreakDisplay();
  }

  initializePlayAgainButton() {
    const playAgainButton = document.getElementById("play-again-button");
    if (playAgainButton) {
      playAgainButton.addEventListener("click", () => {
        this.resetGame();
      });
    }

    const settingsButton = document.getElementById("settings-button");
    const settingsOverlay = document.getElementById("settings-overlay");
    const closeSettings = document.getElementById("close-settings");

    if (settingsButton && settingsOverlay) {
      settingsButton.addEventListener("click", () => {
        settingsOverlay.style.display = "flex";
      });
    }
    if (closeSettings && settingsOverlay) {
      closeSettings.addEventListener("click", () => {
        settingsOverlay.style.display = "none";
      });
    }
    if (settingsOverlay) {
      settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) {
          settingsOverlay.style.display = "none";
        }
      });
    }
    const statsButton = document.getElementById("stats-button");
    const statsOverlay = document.getElementById("stats-overlay");
    const closeStats = document.getElementById("close-stats");

    if (statsButton && statsOverlay) {
      statsButton.addEventListener("click", () => {
        this.updateStatsDisplay();
        statsOverlay.style.display = "flex";
      });
    }
    if (closeStats && statsOverlay) {
      closeStats.addEventListener("click", () => {
        statsOverlay.style.display = "none";
      });
    }
    if (statsOverlay) {
      statsOverlay.addEventListener("click", (e) => {
        if (e.target === statsOverlay) {
          statsOverlay.style.display = "none";
        }
      });
    }
  }
}

const wordleGame = new Wordle(5);
