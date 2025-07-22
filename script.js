let currentGrid = 3;
let currentImageUrl = "https://picsum.photos/500/500?random=1";
let gameStartTime = 0;
let gameTimer = null;
let completedPieces = 0;

function initializePuzzle() {
    const puzzleContainer = document.getElementById("puzzle-container");
    const dropContainer = document.getElementById("drop-target-container");
    const totalPieces = currentGrid * currentGrid;

    // CSS 변수 설정
    const pieceSize = Math.min(50, Math.floor(400 / currentGrid));
    const bgSize = pieceSize * currentGrid;

    document.documentElement.style.setProperty("--piece-size", pieceSize + "px");
    document.documentElement.style.setProperty("--bg-size", bgSize + "px " + bgSize + "px");

    // 컨테이너 초기화
    puzzleContainer.innerHTML = "";
    dropContainer.innerHTML = "";

    // 그리드 설정
    dropContainer.style.gridTemplateColumns = `repeat(${currentGrid}, ${pieceSize}px)`;
    dropContainer.style.gridTemplateRows = `repeat(${currentGrid}, ${pieceSize}px)`;

    // 퍼즐 조각 생성
    for (let i = 1; i <= totalPieces; i++) {
        // 퍼즐 조각 생성
        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.id = `piece-${i}`;
        piece.draggable = true;

        // 배경 위치 계산 (1부터 시작하는 인덱스를 0부터 시작으로 변환)
        const row = Math.floor((i - 1) / currentGrid);
        const col = (i - 1) % currentGrid;
        const bgX = -col * pieceSize;
        const bgY = -row * pieceSize;

        piece.style.backgroundImage = `url("${currentImageUrl}")`;
        piece.style.backgroundPosition = `${bgX}px ${bgY}px`;

        puzzleContainer.appendChild(piece);

        // 드롭 타겟 생성
        const target = document.createElement("div");
        target.className = "drop-target";
        target.dataset.targetId = i.toString();

        dropContainer.appendChild(target);
    }
    const imgpreview = document.createElement("img");
    imgpreview.id = "currentImage";
    imgpreview.src = currentImageUrl;
    dropContainer.appendChild(imgpreview);

    // 통계 업데이트
    document.getElementById("totalPieces").textContent = totalPieces;
    document.getElementById("completedCount").textContent = "0";
    document.getElementById("timeElapsed").textContent = "0";
    document.getElementById("progressBar").style.width = "0%";

    completedPieces = 0;

    // 이벤트 리스너 재등록
    setupEventListeners();

    // 게임 타이머 시작
    startGameTimer();

    // 조각 섞기
    setTimeout(() => shufflePieces(), 500);
}

function setupEventListeners() {
    const puzzlePieces = document.querySelectorAll(".puzzle-piece");
    const dropTargets = document.querySelectorAll(".drop-target");
    const puzzleContainer = document.getElementById("puzzle-container");

    // 퍼즐 조각 드래그 이벤트
    puzzlePieces.forEach((piece) => {
        piece.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            setTimeout(() => {
                e.target.classList.add("dragging");
            }, 0);
        });

        piece.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
        });
    });

    // 드롭 타겟 이벤트
    dropTargets.forEach((target) => {
        target.addEventListener("dragover", (e) => {
            e.preventDefault();
            target.classList.add("drag-over");
        });

        target.addEventListener("dragleave", (e) => {
            target.classList.remove("drag-over");
        });

        target.addEventListener("drop", (e) => {
            e.preventDefault();
            target.classList.remove("drag-over");

            const draggedPieceId = e.dataTransfer.getData("text/plain");
            const draggedPiece = document.getElementById(draggedPieceId);

            if (!draggedPiece) return;

            // 이미 다른 조각이 있다면 원래 자리로 돌려보냄
            if (target.children.length > 0) {
                const existingPiece = target.children[0];
                puzzleContainer.appendChild(existingPiece);
                existingPiece.style.position = "static";
                completedPieces--;
            }

            // 올바른 위치에 드롭되었는지 확인
            const pieceNumber = draggedPieceId.replace("piece-", "");
            const targetNumber = target.dataset.targetId;

            if (pieceNumber === targetNumber) {
                // 정확한 위치
                target.appendChild(draggedPiece);
                target.classList.add("filled");
                draggedPiece.style.position = "static";
                completedPieces++;
                updateStats();
                checkPuzzleCompletion();
            } else {
                // 잘못된 위치 - 다시 원래 자리로
                puzzleContainer.appendChild(draggedPiece);
                // 시각적 피드백
                draggedPiece.style.animation = "shake 0.5s";
                setTimeout(() => {
                    draggedPiece.style.animation = "";
                }, 500);
            }
        });
    });

    // 퍼즐 컨테이너 드롭 이벤트
    puzzleContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    puzzleContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedPieceId = e.dataTransfer.getData("text/plain");
        const draggedPiece = document.getElementById(draggedPieceId);

        if (draggedPiece && !puzzleContainer.contains(draggedPiece)) {
            // 원래 드롭 타겟에서 제거
            const originalTarget = draggedPiece.parentElement;
            if (originalTarget.classList.contains("drop-target")) {
                originalTarget.classList.remove("filled");
                completedPieces--;
                updateStats();
            }

            puzzleContainer.appendChild(draggedPiece);
            draggedPiece.style.position = "static";
        }
    });
}

function updateStats() {
    const totalPieces = currentGrid * currentGrid;
    const progress = (completedPieces / totalPieces) * 100;

    document.getElementById("completedCount").textContent = completedPieces;
    document.getElementById("progressBar").style.width = progress + "%";
}

function startGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }

    gameStartTime = Date.now();
    gameTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        document.getElementById("timeElapsed").textContent = elapsed;
    }, 1000);
}

function stopGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function checkPuzzleCompletion() {
    const totalPieces = currentGrid * currentGrid;

    if (completedPieces === totalPieces) {
        stopGameTimer();
        const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);

        setTimeout(() => {
            showSuccessMessage(finalTime);
        }, 500);
    }
}

function showSuccessMessage(time) {
    const successMessage = document.getElementById("successMessage");
    document.getElementById("finalTime").textContent = time;
    successMessage.style.display = "block";
    successMessage.style.animation = "bounce 0.8s ease";

    setTimeout(() => {
        successMessage.style.display = "none";
    }, 5000);
}

function changeDifficulty() {
    const difficulty = document.getElementById("difficulty").value;
    currentGrid = parseInt(difficulty);
    initializePuzzle();
}

function changeImage() {
    const imageUrl = document.getElementById("imageUrl").value.trim();
    if (imageUrl) {
        currentImageUrl = imageUrl;
        initializePuzzle();
    }
}

function shufflePieces() {
    const puzzleContainer = document.getElementById("puzzle-container");
    const pieces = Array.from(document.querySelectorAll(".puzzle-piece"));

    // 모든 조각을 원래 컨테이너로 이동
    pieces.forEach((piece) => {
        puzzleContainer.appendChild(piece);
        piece.style.position = "static";
    });

    // 드롭 타겟 초기화
    document.querySelectorAll(".drop-target").forEach((target) => {
        target.classList.remove("filled");
    });

    completedPieces = 0;
    updateStats();

    // 배열 섞기
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        puzzleContainer.insertBefore(pieces[j], pieces[i].nextSibling);
    }
}

function resetPuzzle() {
    const puzzleContainer = document.getElementById("puzzle-container");

    document.querySelectorAll(".puzzle-piece").forEach((piece) => {
        puzzleContainer.appendChild(piece);
        piece.style.position = "static";
    });

    document.querySelectorAll(".drop-target").forEach((target) => {
        target.classList.remove("filled");
    });

    completedPieces = 0;
    updateStats();
    startGameTimer();
}

function autoSolve() {
    const pieces = document.querySelectorAll(".puzzle-piece");
    let delay = 0;

    pieces.forEach((piece, index) => {
        setTimeout(() => {
            const targetId = piece.id.replace("piece-", "");
            const target = document.querySelector(`[data-target-id="${targetId}"]`);

            if (target.children.length > 0) {
                document.getElementById("puzzle-container").appendChild(target.children[0]);
                completedPieces--;
            }

            target.appendChild(piece);
            target.classList.add("filled");
            piece.style.position = "static";
            completedPieces++;
            updateStats();

            if (index === pieces.length - 1) {
                setTimeout(() => {
                    checkPuzzleCompletion();
                }, 200);
            }
        }, delay);
        delay += 100;
    });
}

function startNewGame() {
    // 랜덤 이미지로 변경
    const randomNum = Math.floor(Math.random() * 1000);
    currentImageUrl = `https://picsum.photos/500/500?random=${randomNum}`;
    initializePuzzle();
}

// 초기 퍼즐 생성
window.onload = function () {
    initializePuzzle();
};
