const board = document.getElementById("board");

let selectedPiece = null;
let currentPlayer = "white";

function createBoard() {
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("div");
        row.classList.add("row");

        for (let j = 0; j < 8; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add((i + j) % 2 === 0 ? "white" : "black");
            cell.dataset.i = i;
            cell.dataset.j = j;

            if (i < 3 && (i + j) % 2 !== 0) addPiece("black", i, j);
            if (i > 4 && (i + j) % 2 !== 0) addPiece("white", i, j);

            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function addPiece(color, row, col) {
    const piece = document.createElement("div");
    piece.classList.add("piece", color);
    piece.dataset.color = color;
    piece.dataset.row = row;
    piece.dataset.col = col;
    positionPiece(piece, row, col);
    board.appendChild(piece);
}

function positionPiece(piece, row, col) {
    const cellSize = board.clientWidth / 8;
    piece.style.transform = `translate(${col * cellSize}px, ${row * cellSize}px)`;
}

function getPieceAt(r, c) {
    return [...document.querySelectorAll(".piece")]
        .find(p => Number(p.dataset.row) === r && Number(p.dataset.col) === c);
}

function showExplosion(r, c) {
    const img = document.createElement("img");
    img.src = "./media/explosion-gif.gif";
    img.className = "explosion";

    const cellSize = board.clientWidth / 8;
    img.style.transform = `translate(${c * cellSize}px, ${r * cellSize}px)`;

    board.appendChild(img);
    setTimeout(() => img.remove(), 600);
}

function removePiece(piece) {
    const r = Number(piece.dataset.row);
    const c = Number(piece.dataset.col);
    showExplosion(r, c);
    piece.remove();
}

function playerHasMoves(color) {
    const pieces = document.querySelectorAll(`.piece.${color}`);
    for (const piece of pieces) {
        const r = Number(piece.dataset.row);
        const c = Number(piece.dataset.col);

        const directions = color === "white" ? [[-1,-1], [-1,1]] : [[1,-1],[1,1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7 && !getPieceAt(nr,nc)) {
                return true;
            }
        }

        const captureDirs = [[-2,-2],[-2,2],[2,-2],[2,2]];
        for (const [dr, dc] of captureDirs) {
            const nr = r + dr;
            const nc = c + dc;
            const mr = r + dr/2;
            const mc = c + dc/2;
            const mid = getPieceAt(mr,mc);
            const dest = getPieceAt(nr,nc);
            if (nr>=0 && nr<=7 && nc>=0 && nc<=7 && mid && mid.dataset.color !== color && !dest) {
                return true;
            }
        }
    }
    return false;
}

function checkGameOver() {
    const whitePieces = document.querySelectorAll(".piece.white").length;
    const blackPieces = document.querySelectorAll(".piece.black").length;

    if (whitePieces === 0) return showWin("Черные");
    if (blackPieces === 0) return showWin("Белые");

    const whiteCanMove = playerHasMoves("white");
    const blackCanMove = playerHasMoves("black");

    if (!whiteCanMove && !blackCanMove) return showDraw();
    if (!whiteCanMove && blackCanMove) return showDraw();
    if (!blackCanMove && whiteCanMove) return showDraw();
}

function showWin(winner) {
    const msg = document.createElement("div");
    msg.className = "win-message";
    msg.textContent = `${winner} победили!`;
    document.body.appendChild(msg);
}

function showDraw() {
    const msg = document.createElement("div");
    msg.className = "win-message";
    msg.textContent = `Ничья!`;
    document.body.appendChild(msg);
}

function clearHighlights() {
    document.querySelectorAll(".cell.highlight").forEach(c => c.classList.remove("highlight"));
}

board.addEventListener("click", function(e) {
    const target = e.target;

    if (target.classList.contains("piece")) {
        if (target.dataset.color !== currentPlayer) return;

        if (selectedPiece) selectedPiece.classList.remove("selected");
        selectedPiece = target;
        selectedPiece.classList.add("selected");
        clearHighlights();
        return;
    }

    if (selectedPiece && target.classList.contains("cell")) {
        const fromRow = Number(selectedPiece.dataset.row);
        const fromCol = Number(selectedPiece.dataset.col);
        const toRow = Number(target.dataset.i);
        const toCol = Number(target.dataset.j);

        const dr = toRow - fromRow;
        const dc = toCol - fromCol;
        const absR = Math.abs(dr);
        const absC = Math.abs(dc);

        if (getPieceAt(toRow, toCol)) return;

        if (absR === 1 && absC === 1) {
            if (selectedPiece.dataset.color === "white" && dr !== -1) return;
            if (selectedPiece.dataset.color === "black" && dr !== 1) return;

            movePiece(selectedPiece, toRow, toCol);
            endTurn();
            checkGameOver();
            return;
        }

        if (absR === 2 && absC === 2) {
            const midRow = fromRow + dr / 2;
            const midCol = fromCol + dc / 2;
            const enemy = getPieceAt(midRow, midCol);
            if (!enemy || enemy.dataset.color === selectedPiece.dataset.color) return;

            removePiece(enemy);
            movePiece(selectedPiece, toRow, toCol);
            endTurn();
            checkGameOver();
            return;
        }
    }
});

function movePiece(piece, row, col) {
    piece.dataset.row = row;
    piece.dataset.col = col;
    positionPiece(piece, row, col);
    piece.classList.remove("selected");
    selectedPiece = null;
}

function endTurn() {
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    clearHighlights();
}

createBoard();
//for githubpages