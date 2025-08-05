// Get DOM elements
            const canvas = document.getElementById('game');
            const ctx = canvas.getContext('2d');

            // Game variables
            const box = 20; // Size of each snake segment and food
            let snake = [];
            let dx = box, dy = 0; // Initial direction: right
            let food = {};
            let score = 0;
            let gameInterval = null;
            let obstacles = [];
            const obstacleCount = 5; // Number of obstacles
            const minObstacleDistance = 3; // Minimum distance (in boxes) from snake head
            let directionChanged = false; // Prevent multiple direction changes per tick

            // Helper: Manhattan distance between two points
            function manhattanDistance(a, b) {
                return Math.abs(a.x - b.x) / box + Math.abs(a.y - b.y) / box;
            }

            // Generate random food position
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

            // Generate random obstacles, not too close to snake head
            function getRandomObstacles() {
                const obs = [];
                while (obs.length < obstacleCount) {
                    const pos = {
                        x: Math.floor(Math.random() * (canvas.width / box)) * box,
                        y: Math.floor(Math.random() * (canvas.height / box)) * box
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

            // Draw obstacles
            function drawObstacles() {
                ctx.fillStyle = "#8b0000";
                obstacles.forEach(obs => {
                    ctx.fillRect(obs.x, obs.y, box, box);
                });
            }

            // Draw everything on the canvas
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw obstacles
                drawObstacles();

                // Draw snake
                for (let i = 0; i < snake.length; i++) {
                    ctx.fillStyle = i === 0 ? "#4caf50" : "#fff";
                    ctx.fillRect(snake[i].x, snake[i].y, box, box);
                    ctx.strokeStyle = "#222";
                    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
                }

                // Draw food
                ctx.fillStyle = "#ffeb3b";
                ctx.fillRect(food.x, food.y, box, box);

                // Draw score
                ctx.fillStyle = "#fff";
                ctx.font = "20px Arial";
                ctx.fillText("Score: " + score, 10, 25);
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
                directionChanged = false; // Allow direction change for this tick
                moveSnake();
                if (checkCollision() || checkObstacleCollision(snake[0])) {
                    clearInterval(gameInterval);
                    alert('Game Over! Your score: ' + score);
                    document.location.reload();
                    return;
                }
                draw();
            }

            // Handle keyboard input for direction
            document.addEventListener('keydown', function(e) {
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

            // Start the game automatically
            initGame();
            draw();
            gameInterval = setInterval(gameLoop, 100);