const gameContainer = document.querySelector(".game-container");
const setupModal = document.querySelector("#setupModal");

const gameBoard = (() => {
  const board = Array(9).fill(null);

  // this resets the board by setting null to every index
  const resetBoard = () => {
    board.fill(null);
  };

  const getBoard = () => {
    return board;
  };

  const makeMove = (index, marker) => {
    return (board[index] = marker);
  };

  return { getBoard, makeMove, resetBoard };
})();

// this creates a player and stores it to an object
function createPlayer(name, marker) {
  return { name, marker };
}

// this controls the flow of the game
const gameController = (() => {
  let players = [];
  let activePlayer = null;
  let isGameActive = false;

  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const render = () => {
    const currentBoard = gameBoard.getBoard();

    gameContainer.innerHTML = ""; //reset the tile container

    if (isGameActive) {
      const tileGrid = document.createElement("div");
      tileGrid.classList.add("tile-grid");
      gameContainer.appendChild(tileGrid);

      tileGrid.addEventListener("click", (e) => {
        // Target only elements with the "tile" class name
        const tile = e.target.closest(".tile");
        if (!tile) return;

        // Extract the index we stored in the dataset
        const index = parseInt(tile.dataset.index, 10);

        // Check if the board position is currently empty
        if (gameBoard.getBoard()[index] === null) {
          playerTurn(index); // Execute the turn logic
          render();
        }
      });

      currentBoard.forEach((tileValue, index) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        if (tileValue === "X") {
          tile.classList.add("x-marker");
        } else if (tileValue === "O") {
          tile.classList.add("o-marker");
        }

        tile.textContent = tileValue || "";
        tile.dataset.index = index;
        tileGrid.appendChild(tile);
      });
    } else {
      const startBtn = document.createElement("button");
      startBtn.textContent = "Start Game";
      startBtn.classList.add("start-btn");
      startBtn.addEventListener("click", () => {
        startGame();
      });

      gameContainer.appendChild(startBtn);
    }
  };

  const startGame = () => {
    const name1 = prompt("Enter Player 1 Name (X):") || "Player 1";
    const name2 = prompt("Enter Player 2 Name (O):") || "Player 2";

    const player1 = createPlayer(name1, "X");
    const player2 = createPlayer(name2, "O");
    players = [player1, player2];
    activePlayer = players[0];
    isGameActive = true;

    render();
  };

  // processes the choice and tracks the player turns
  const playerTurn = (index) => {
    gameBoard.makeMove(index, activePlayer.marker);
    render();
    if (checkWin()) {
      alert(`🎉 Game Over! ${activePlayer.name} wins!`);
      isGameActive = false;
      gameBoard.resetBoard();
      return true; // Return true to signal that the game is over
    }
    if (checkTie()) {
      alert("🤝 Game Over! It's a tie!");
      isGameActive = false;
      gameBoard.resetBoard();
      return true; // Return true to signal that the game is over
    }
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
    return false;
  };

  const checkWin = () => {
    const currentBoard = gameBoard.getBoard();
    return winConditions.some((combination) => {
      return combination.every(
        (index) => currentBoard[index] === activePlayer.marker,
      );
    });
  };

  const checkTie = () => {
    const currentBoard = gameBoard.getBoard();
    // If every single tile is NOT null, the board is full
    return currentBoard.every((tile) => tile !== null);
  };

  return { startGame, render };
})();

gameController.render();
