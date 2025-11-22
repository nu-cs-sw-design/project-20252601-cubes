let chosenLength = null;

function selectLength(length) {
    chosenLength = length;

    // Remove selected style from all buttons
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Highlight the one that was clicked
    const buttons = document.querySelectorAll('.select-btn');
    buttons[length === 4 ? 0 : length === 5 ? 1 : 2].classList.add('selected');

    // Enable the start button
    const startBtn = document.getElementById("startBtn");
    startBtn.disabled = false;
    startBtn.classList.add("enabled");
}

function startGame() {
    if (!chosenLength) return;
    window.location.href = `game.html?length=${chosenLength}`;
}