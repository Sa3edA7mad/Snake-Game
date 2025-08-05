// Get DOM elements
            const canvas = document.getElementById('game');
            const ctx = canvas.getContext('2d');

            // Game variables
            const box = 20; // Size of each snake segment and food
            const borderMargin = box; // Margin from border for obstacles
            let snake = [];
            let dx = box, dy = 0; // Initial direction: right
            let food = {};
            let score = 0;
            let gameInterval = null;
            let obstacles = [];
            const obstacleCount = 5; // Number of obstacles
            const minObstacleDistance = 3; // Minimum distance (in boxes) from snake head
            let directionChanged = false; // Prevent multiple direction changes per tick
            let gameState = 'start'; // 'start', 'playing', 'end'

            // Helper: Manhattan distance between two points
            function manhattanDistance(a, b) {
                return Math.abs(a.x - b.x) / box + Math.abs(a.y - b.y) / box;
            }

            // Generate random food position (anywhere, but not on snake or obstacles)
            function getRandomFood() {
                let pos;
                do {
                    pos = {
                        x: Math.floor(Math.random() * (canvas.width / box)) * box,
                        y: Math.floor(Math.random() * (canvas.height / box)) * box
                    };
                } while (
                    snake.some(s => s.x === pos.x && s.y === pos.y) ||
                    obstacles.some(o => o.x === pos.x && o.y === pos.y)
                );
                return pos;
            }

            // Generate random obstacles, not too close to snake head, not on border
            function getRandomObstacles() {
                const obs = [];
                const min = borderMargin / box;
                const maxX = (canvas.width - borderMargin) / box;
                const maxY = (canvas.height - borderMargin) / box;
                while (obs.length < obstacleCount) {
                    const pos = {
                        x: Math.floor(Math.random() * (maxX - min)) * box + borderMargin,
                        y: Math.floor(Math.random() * (maxY - min)) * box + borderMargin
                    };
                    if (
                        !snake.some(s => s.x === pos.x && s.y === pos.y) &&
                        (typeof food.x === 'undefined' || (food.x !== pos.x || food.y !== pos.y)) &&
                        !obs.some(o => o.x === pos.x && o.y === pos.y) &&
                        manhattanDistance(pos, snake[0]) >= minObstacleDistance
                    ) {
                        obs.push(pos);
                    }
                }
                return obs;
            }

            // Initialize snake, food, and obstacles
            function initGame() {
                snake = [
                    {x: 8 * box, y: 10 * box},
                    {x: 7 * box, y: 10 * box},
                    {x: 6 * box, y: 10 * box}
                ];
                dx = box; dy = 0;
                score = 0;
                obstacles = [];
                food = {x: -box, y: -box}; // Temporary food position to avoid overlap
                obstacles = getRandomObstacles();
                food = getRandomFood();
            }

            // Draw gradient background and border
            function drawBackground() {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, "#232526");
                gradient.addColorStop(1, "#414345");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.save();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 3;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            // Draw obstacles with rounded corners
            function drawObstacles() {
                ctx.fillStyle = "#8b0000";
                obstacles.forEach(obs => {
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(obs.x, obs.y, box, box, 6);
                    } else {
                        ctx.rect(obs.x, obs.y, box, box);
                    }
                    ctx.fill();
                    ctx.strokeStyle = "#222";
                    ctx.stroke();
                });
            }

            // Draw start screen
            function drawStartScreen() {
                ctx.save();
                ctx.font = "bold 32px Arial";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText("Classic Snake Game", canvas.width / 2, canvas.height / 2 - 30);
                ctx.font = "20px Arial";
                ctx.fillText("Press any key to start", canvas.width / 2, canvas.height / 2 + 20);
                ctx.restore();
            }

            // Draw end screen
            function drawEndScreen() {
                ctx.save();
                ctx.font = "bold 32px Arial";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);
                ctx.font = "20px Arial";
                ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);
                ctx.fillText("Press any key to restart", canvas.width / 2, canvas.height / 2 + 40);
                ctx.restore();
            }

            // Draw everything on the canvas
            function draw() {
                drawBackground();

                if (gameState === 'start') {
                    drawStartScreen();
                    return;
                }
                if (gameState === 'end') {
                    drawEndScreen();
                    return;
                }

                drawObstacles();

                // Draw snake with rounded corners
                for (let i = 0; i < snake.length; i++) {
                    ctx.fillStyle = i === 0 ? "#4caf50" : "#a5d6a7";
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(snake[i].x, snake[i].y, box, box, 6);
                    } else {
                        ctx.rect(snake[i].x, snake[i].y, box, box);
                    }
                    ctx.fill();
                    ctx.strokeStyle = "#222";
                    ctx.stroke();
                }

                // Draw food as a glowing circle
                ctx.save();
                ctx.shadowColor = "#fffde7";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2, 0, 2 * Math.PI);
                ctx.fillStyle = "#ffd600";
                ctx.fill();
                ctx.restore();

                // Draw score with a custom font and shadow
                ctx.save();
                ctx.font = "bold 22px 'Comic Sans MS', cursive, sans-serif";
                ctx.fillStyle = "#fff";
                ctx.shadowColor = "#000";
                ctx.shadowBlur = 4;
                ctx.fillText("Score: " + score, 12, 28);
                ctx.restore();
            }

            // Move the snake and handle food
            function moveSnake() {
                // Calculate new head position with wrap-around
                let newX = (snake[0].x + dx + canvas.width) % canvas.width;
                let newY = (snake[0].y + dy + canvas.height) % canvas.height;
                const head = {x: newX, y: newY};
                snake.unshift(head);

                // Check if food is eaten
                if (head.x === food.x && head.y === food.y) {
                    score++;
                    food = getRandomFood();
                    obstacles = getRandomObstacles(); // Randomize obstacles on each point
                } else {
                    snake.pop();
                }
            }

            // Check for collision with self
            function checkCollision() {
                for (let i = 1; i < snake.length; i++) {
                    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                        return true;
                    }
                }
                return false;
            }

            // Check for collision with obstacles
            function checkObstacleCollision(head) {
                return obstacles.some(obs => obs.x === head.x && obs.y === head.y);
            }

            // Main game loop
            function gameLoop() {
                if (gameState !== 'playing') return;
                directionChanged = false; // Allow direction change for this tick
                moveSnake();
                if (checkCollision() || checkObstacleCollision(snake[0])) {
                    clearInterval(gameInterval);
                    gameState = 'end';
                    draw();
                    return;
                }
                draw();
            }

            // Handle keyboard input for direction and game state
            document.addEventListener('keydown', function(e) {
                if (gameState === 'start') {
                    gameState = 'playing';
                    initGame();
                    draw();
                    gameInterval = setInterval(gameLoop, 100);
                    return;
                }
                if (gameState === 'end') {
                    gameState = 'playing';
                    initGame();
                    draw();
                    gameInterval = setInterval(gameLoop, 100);
                    return;
                }
                if (gameState !== 'playing') return;
                if (directionChanged) return;
                if (e.key === "ArrowLeft" && dx === 0) {
                    dx = -box; dy = 0;
                    directionChanged = true;
                } else if (e.key === "ArrowUp" && dy === 0) {
                    dx = 0; dy = -box;
                    directionChanged = true;
                } else if (e.key === "ArrowRight" && dx === 0) {
                    dx = box; dy = 0;
                    directionChanged = true;
                } else if (e.key === "ArrowDown" && dy === 0) {
                    dx = 0; dy = box;
                    directionChanged = true;
                }
            });

            // Initial draw
            draw();