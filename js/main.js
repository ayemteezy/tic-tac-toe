const gameContainer = document.querySelector(".game-container");
const multiplayerModal = document.querySelector("#multiplayerModal");
const multiplayerForm = multiplayerModal.querySelector("#multiplayerForm");
const singleplayerModal = document.querySelector("#singleplayerModal");
const singleplayerForm = singleplayerModal.querySelector("#singleplayerForm");
const btnClose = document.querySelectorAll(".close-btn");
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

  const makeComputerMove = () => {
    const currentBoard = gameBoard.getBoard();
    const emptyIndexes = [];

    currentBoard.forEach((tile, index) => {
      if (tile === null) emptyIndexes.push(index);
    });

    if (emptyIndexes.length === 0) return;

    // Pick a random available index
    const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

    // 500ms delay simulates computer "thinking" before triggering its turn
    setTimeout(() => {
      playerTurn(randomIndex);
    }, 500);
  };

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
         if (activePlayer && activePlayer.name === "Computer") return;

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

      const menuBtn = document.createElement('button')
      const resetBtn = document.createElement("button");
      resetBtn.classList.add("reset-btn");
      menuBtn.classList.add('menu-btn');
      resetBtn.innerHTML = /*html*/ `
        <img src="assets/icons/reset.svg" height="30" width="30" alt="reset icon">
        `;
      menuBtn.innerHTML = /*html*/ `
        <img src="assets/icons/menu.svg" height="30" width="30" alt="menu icon">
        `;
      actionContainer.appendChild(resetBtn);
      actionContainer.appendChild(menuBtn);

      menuBtn.addEventListener("click", () => {
        playerOneScore = 0;
        playerTwoScore = 0;
        drawCount = 0;
        gameBoard.resetBoard();
        activePlayer = players[0];
        isGameActive = false;
        render();
      });

      resetBtn.addEventListener("click", () => {
        playerOneScore = 0;
        playerTwoScore = 0;
        drawCount = 0;
        gameBoard.resetBoard();
        activePlayer = players[0];
        render();
      });
    } else {
      const startBtn = document.createElement("button");
      const computerBtn = document.createElement("button");
      startBtn.textContent = "Start Game";
      computerBtn.textContent= "Singleplayer"
      startBtn.classList.add("start-btn");
      computerBtn.classList.add("com-btn");
      startBtn.addEventListener("click", () => {
        multiplayerModal.showModal();
      });
      computerBtn.addEventListener("click", () => {
        singleplayerModal.showModal();
      });



      gameContainer.appendChild(startBtn);
      gameContainer.appendChild(computerBtn);
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
    // Check if the newly updated active player is the computer, and run its engine
      if (isGameActive && activePlayer.name === "Computer") {
        makeComputerMove();
      }
      return false;

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


multiplayerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(multiplayerForm);

  const name1 = data.get("playerOne");
  const name2 = data.get("playerTwo");

  const playerOne = new createPlayer(name1, "X");
  const playerTwo = new createPlayer(name2, "O");

  if (!playerOne || !playerTwo) return;

  gameController.startGame(playerOne, playerTwo);
  multiplayerModal.close();
  multiplayerForm.reset();
});

singleplayerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(singleplayerForm);

  const name1 = data.get('playerOne');

  const playerOne = new createPlayer(name1, "X");
  const playerTwo = new createPlayer("Computer", "O");

  gameController.startGame(playerOne, playerTwo);
  singleplayerModal.close();
   singleplayerForm.reset();
})

btnClose.forEach((btn) => {
  btn.addEventListener("click", () => {
    singleplayerModal.close();
    multiplayerModal.close();
  });
});
gameController.render();
