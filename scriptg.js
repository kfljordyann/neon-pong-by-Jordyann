const canvas = document.getElementById("pongCanvas");
        const ctx = canvas.getContext("2d");
        
        const ball = { x: 400, y: 250, radius: 10, speedX: 5, speedY: 5 };
        const p1 = { x: 10, y: 210, w: 15, h: 80, score: 0, color: "#00d2ff", targetY: 210 };
        const p2 = { x: 775, y: 210, w: 15, h: 80, score: 0, color: "#ff007f", targetY: 210 };
        
        let gameRunning = false;
        let mode = "p1vIA";
        let difficulty = 0.1;
        let keys = {};
        let name1, name2;

        // --- CONTROLES CLAVIER ---
        window.addEventListener("keydown", e => keys[e.key] = true);
        window.addEventListener("keyup", e => keys[e.key] = false);

        // --- CONTROLES TACTILES ---
        canvas.addEventListener("touchstart", handleTouch, {passive: false});
        canvas.addEventListener("touchmove", handleTouch, {passive: false});

        function handleTouch(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleY = canvas.height / rect.height;
            
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const touchX = touch.clientX - rect.left;
                const touchY = (touch.clientY - rect.top) * scaleY;

                // Côté gauche (J1)
                if (touchX < rect.width / 2) {
                    if (mode !== "iavia") p1.y = touchY - p1.h / 2;
                } 
                // Côté droit (J2)
                else {
                    if (mode === "p1vp2") p2.y = touchY - p2.h / 2;
                }
            }
        }

        function startGame() {
            name1 = document.getElementById("p1Name").value || "J1";
            name2 = document.getElementById("p2Name").value || "J2";
            mode = document.getElementById("gameMode").value;
            difficulty = parseFloat(document.getElementById("difficulty").value);

            document.getElementById("menu").style.display = "none";
            document.getElementById("game-container").style.display = "block";
            
            p1.score = 0; p2.score = 0;
            resetBall();
            gameRunning = true;
            requestAnimationFrame(gameLoop);
        }

        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speedX = (Math.random() > 0.5 ? 6 : -6);
            ball.speedY = (Math.random() * 6 - 3);
        }

        function movePaddles() {
            // IA ou Clavier pour P1
            if (mode === "iavia") {
                p1.y += (ball.y - (p1.y + p1.h / 2)) * difficulty;
            } else {
                if (keys["z"] || keys["Z"]) p1.y -= 8;
                if (keys["s"] || keys["S"]) p1.y += 8;
            }

            // IA ou Clavier pour P2
            if (mode === "p1vIA" || mode === "iavia") {
                p2.y += (ball.y - (p2.y + p2.h / 2)) * difficulty;
            } else {
                if (keys["ArrowUp"]) p2.y -= 8;
                if (keys["ArrowDown"]) p2.y += 8;
            }

            [p1, p2].forEach(p => {
                if (p.y < 0) p.y = 0;
                if (p.y + p.h > canvas.height) p.y = canvas.height - p.h;
            });
        }

        function update() {
            ball.x += ball.speedX;
            ball.y += ball.speedY;

            if (ball.y <= 0 || ball.y >= canvas.height) ball.speedY *= -1;

            let paddle = (ball.x < canvas.width / 2) ? p1 : p2;
            if (checkCollision(ball, paddle)) {
                let cp = ball.y - (paddle.y + paddle.h / 2);
                ball.speedX *= -1.05;
                ball.speedY = cp * 0.15;
            }

            if (ball.x < 0) { p2.score++; checkWin(); resetBall(); }
            if (ball.x > canvas.width) { p1.score++; checkWin(); resetBall(); }
        }

        function checkCollision(b, p) {
            return b.x < p.x + p.w && b.x + b.radius > p.x && b.y < p.y + p.h && b.y + b.radius > p.y;
        }

        function checkWin() {
            if (p1.score >= 5 || p2.score >= 5) {
                gameRunning = false;
                const win = p1.score >= 5 ? name1 : name2;
                const los = p1.score >= 5 ? name2 : name1;
                document.getElementById("winner-screen").style.display = "block";
                document.getElementById("winner-text").innerText = win + " GAGNE !";
                document.getElementById("match-details").innerText = `${win} a battu ${los} (${p1.score}-${p2.score})`;
            }
        }

        function draw() {
            ctx.fillStyle = "#0a0a0c";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Filet
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.setLineDash([10, 10]);
            ctx.strokeRect(canvas.width/2, 0, 1, canvas.height);

            // Raquettes
            drawRect(p1.x, p1.y, p1.w, p1.h, p1.color);
            drawRect(p2.x, p2.y, p2.w, p2.h, p2.color);

            // Balle
            ctx.shadowBlur = 10; ctx.shadowColor = "white";
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;

            document.getElementById("score1").innerText = p1.score;
            document.getElementById("score2").innerText = p2.score;
        }

        function drawRect(x, y, w, h, c) {
            ctx.shadowBlur = 15; ctx.shadowColor = c;
            ctx.fillStyle = c;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
        }

        function resetMenu() {
            document.getElementById("winner-screen").style.display = "none";
            document.getElementById("game-container").style.display = "none";
            document.getElementById("menu").style.display = "flex";
        }

        function gameLoop() {
            if (!gameRunning) return;
            movePaddles();
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }