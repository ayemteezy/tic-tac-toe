const gameContainer = document.querySelector(".game-container");
const setupModal = document.querySelector("#setupModal");
const form = setupModal.querySelector("#setupForm");
const btnClose = document.querySelector(".close-btn");
const scoreGrid = document.querySelector(".score-grid");

const resultPopup = document.querySelector(".result-popup");
const result = resultPopup.querySelector(".result");

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

  let playerOneScore = 0;
  let playerTwoScore = 0;
  let drawCount = 0;

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
      const scoreGrid = document.createElement("div");
      scoreGrid.classList.add("score-grid");
      gameContainer.appendChild(scoreGrid);

      const scores = [
        { label: players[0].name, score: playerOneScore, type: "x" },
        { label: "draw", score: drawCount, type: "draw" },
        { label: players[1].name, score: playerTwoScore, type: "o" },
      ];

      scores.forEach(({ label, score, type }) => {
        const scoreTile = document.createElement("div");
        scoreTile.classList.add("score-tile", `score-tile--${type}`);

        scoreTile.innerHTML = /*html*/ `
          <h5 class="score-label">${label}</p>
          <p class="score-value">${score}</p>
          `;
        scoreGrid.appendChild(scoreTile);
      });

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
          render(p1, p2);
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

        tile.dataset.index = index;
        tileGrid.appendChild(tile);
      });

      const actionContainer = document.createElement("div");
      actionContainer.classList.add("action-container");
      gameContainer.appendChild(actionContainer);

      const resetBtn = document.createElement("button");
      resetBtn.classList.add("reset-btn");
      resetBtn.innerHTML = /*html*/ `
        <img src="assets/icons/reset.svg" height="30" width="30" alt="reset icon">
        `;
      actionContainer.appendChild(resetBtn);

      resetBtn.addEventListener("click", () => {
        playerOneScore = 0;
        playerTwoScore = 0;
        drawCount = 0;
        gameBoard.resetBoard();
        render();
      });
    } else {
      const startBtn = document.createElement("button");
      startBtn.textContent = "Start Game";
      startBtn.classList.add("start-btn");
      startBtn.addEventListener("click", () => {
        setupModal.showModal();
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(form);

        const name1 = data.get("playerOne");
        const name2 = data.get("playerTwo");

        const playerOne = new createPlayer(name1, "X");
        const playerTwo = new createPlayer(name2, "O");

        if (!playerOne || !playerTwo) return;

        startGame(playerOne, playerTwo);
        setupModal.close();
        form.reset();
      });

      btnClose.addEventListener("click", () => {
        setupModal.close();
      });

      gameContainer.appendChild(startBtn);
    }
  };

  const startGame = (player1, player2) => {
    players = [player1, player2];
    activePlayer = players[0];
    isGameActive = true;

    render(players[0], players[1]);
  };

  // processes the choice and tracks the player turns
  const playerTurn = (index) => {
    gameBoard.makeMove(index, activePlayer.marker);
    render();
    if (checkWin()) {
      resultPopup.style.bottom = "5%";
      result.textContent = `Game Over! ${activePlayer.name} wins!`;
      if (activePlayer.marker === players[0].marker) {
        playerOneScore++;
      } else if (activePlayer.marker === players[1].marker) {
        playerTwoScore++;
      }
      gameBoard.resetBoard();
      render();
      setTimeout(() => {
        resultPopup.style.bottom = "-50%"; // hide again after N ms
      }, 3000);
      return true; // Return true to signal that the game is over
    }
    if (checkTie()) {
      resultPopup.style.bottom = "5%";
      result.textContent = "Game Over! It's a tie!";
      drawCount++;
      gameBoard.resetBoard();
      render();
      setTimeout(() => {
        resultPopup.style.bottom = "-50%"; // hide again after N ms
      }, 3000);
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
