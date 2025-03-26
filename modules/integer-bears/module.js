/**
 * Module: Integer Bears
 * License: AGPL-3.0
 */

export default {
    grade: '5',
    subject: 'Math',
    category: 'Integers',
    name: 'Integer Bears',
    render: function(container, moduleName) {
        container.innerHTML = '';

        // Main content area
        const mainContent = document.createElement('div');
        mainContent.style.marginRight = '270px'; // Prevent overlap with score tracker (250px width + 20px padding)
        container.appendChild(mainContent);

        // Score tracker (upper right corner via CSS)
        const scoreTracker = document.createElement('div');
        scoreTracker.id = 'score-tracker';
        container.appendChild(scoreTracker);

        // Title
        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = 'Integer Bears: Climb the Tree!';
        mainContent.appendChild(title);

        // Intro
        const intro = document.createElement('p');
        intro.textContent = 'Drag the bear up (+) or down (-) the tree to solve integer problems! Watch leaves fall when you’re right!';
        mainContent.appendChild(intro);

        // Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 800;
        canvas.style.border = '2px solid #4CAF50';
        canvas.style.borderRadius = '5px';
        canvas.style.backgroundColor = '#e8f5e9';
        mainContent.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Sound effects
        const roarSound = document.createElement('audio');
        roarSound.src = 'modules/integer-bears/roar.mp3';
        mainContent.appendChild(roarSound);

        const grrSound = document.createElement('audio');
        grrSound.src = 'modules/integer-bears/grr.mp3';
        mainContent.appendChild(grrSound);

        // Game elements
        const problemText = document.createElement('p');
        problemText.className = 'module-text';
        mainContent.appendChild(problemText);

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'module-input';
        input.placeholder = 'Enter the bear’s position';
        mainContent.appendChild(input);

        const checkButton = document.createElement('button');
        checkButton.className = 'module-button';
        checkButton.textContent = 'Check My Answer!';
        mainContent.appendChild(checkButton);

        const resetButton = document.createElement('button');
        resetButton.className = 'module-button';
        resetButton.textContent = 'Reset Bear';
        resetButton.style.marginLeft = '10px';
        mainContent.appendChild(resetButton);

        const result = document.createElement('p');
        result.style.display = 'none';
        mainContent.appendChild(result);

        // Score tracker setup
        scoreTracker.innerHTML = `
            <h3>Score Tracker</h3>
            <p>Correct First Attempts: <span id="correct-count">0</span></p>
            <p>Incorrect Attempts: <span id="incorrect-count">0</span></p>
            <canvas id="trend-chart" width="230" height="150"></canvas>
        `;
        const correctCount = document.getElementById('correct-count');
        const incorrectCount = document.getElementById('incorrect-count');
        const trendCtx = document.getElementById('trend-chart').getContext('2d');
        let attempts = [];

        const trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Answer Trend',
                    data: [],
                    borderColor: '#4CAF50',
                    fill: false
                }]
            },
            options: { scales: { y: { min: 0, max: 1, ticks: { stepSize: 1, callback: v => v ? 'Correct' : 'Incorrect' } } } }
        });

        function updateScore(correctFirst, incorrect) {
            const correct = parseInt(correctCount.textContent) + (correctFirst ? 1 : 0);
            const incorrectTotal = parseInt(incorrectCount.textContent) + (incorrect ? 1 : 0);
            correctCount.textContent = correct;
            incorrectCount.textContent = incorrectTotal;
            attempts.push({ correct: correctFirst });
            trendChart.data.labels = attempts.map((_, i) => i + 1);
            trendChart.data.datasets[0].data = attempts.map(a => a.correct ? 1 : 0);
            trendChart.update();
            window.updateSessionStats(moduleName, correctFirst ? 1 : 0, incorrect ? 1 : 0);
        }

        // Game state
        let bearY = 400;
        let startNum, moveNum, targetNum;
        let isDragging = false;
        let draggedBear = null;
        let leaves = [];
        let firstAttempt = true;

        // Generate a new problem
        function generateProblem() {
            startNum = Math.floor(Math.random() * 11) - 5;
            moveNum = Math.floor(Math.random() * 11) - 5;
            targetNum = startNum + moveNum;
            problemText.textContent = `A bear starts at ${startNum}. It climbs ${moveNum >= 0 ? 'up ' + moveNum : 'down ' + Math.abs(moveNum)}. Where is it now?`;
            bearY = 400 - startNum * 20;
            result.style.display = 'none';
            input.value = '';
            leaves = [];
            firstAttempt = true;
            drawScene();
        }

        // Draw scene
        function drawScene() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(200, 50, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#45a049';
            ctx.beginPath();
            ctx.arc(150, 30, 50, 0, Math.PI * 2);
            ctx.arc(250, 40, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(190, 100, 20, 600);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, 400);
            ctx.lineTo(350, 400);
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.font = '16px Comic Sans MS';
            ctx.fillText('0', 360, 405);
            for (let i = -15; i <= 15; i++) {
                const y = 400 - i * 20;
                ctx.beginPath();
                ctx.moveTo(180, y);
                ctx.lineTo(220, y);
                ctx.stroke();
                if (i % 5 === 0) ctx.fillText(i, 160, y + 5);
            }
            ctx.fillStyle = '#6D4C41';
            ctx.beginPath();
            ctx.arc(200, bearY, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8D5524';
            ctx.beginPath();
            ctx.arc(190, bearY - 15, 5, 0, Math.PI * 2);
            ctx.arc(210, bearY - 15, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(195, bearY + 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(192, bearY - 5, 2, 0, Math.PI * 2);
            ctx.arc(198, bearY - 5, 2, 0, Math.PI * 2);
            ctx.arc(195, bearY + 7, 2, 0, Math.PI * 2);
            ctx.fill();
            leaves.forEach(leaf => {
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(leaf.x, leaf.y, 5, 0, Math.PI * 2);
                ctx.fill();
                leaf.y += 2;
                leaf.x += Math.sin(leaf.y / 20);
            });
            leaves = leaves.filter(leaf => leaf.y < canvas.height);
        }

        // Dragging logic
        function setupDragging() {
            canvas.onmousedown = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (Math.sqrt((x - 200) ** 2 + (y - bearY) ** 2) < 20) {
                    isDragging = true;
                    draggedBear = { offsetY: y - bearY };
                }
            };
            canvas.onmousemove = (e) => {
                if (isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const y = e.clientY - rect.top - draggedBear.offsetY;
                    bearY = Math.max(100, Math.min(700, y));
                    drawScene();
                    const currentPos = Math.round((400 - bearY) / 20);
                    input.value = currentPos;
                }
            };
            canvas.onmouseup = () => {
                isDragging = false;
                draggedBear = null;
            };
        }

        // Check answer
        checkButton.addEventListener('click', () => {
            const answer = parseInt(input.value);
            if (answer === targetNum) {
                result.textContent = 'Roar! You got it! The bear is at ' + targetNum + '! Watch the leaves fall!';
                result.style.color = '#4CAF50';
                result.style.display = 'block';
                roarSound.play().catch(() => console.log('Roar sound not loaded'));
                updateScore(firstAttempt, !firstAttempt);
                for (let i = 0; i < 10; i++) leaves.push({ x: 100 + Math.random() * 200, y: 50 });
                let jump = 0;
                const jumpInterval = setInterval(() => {
                    jump += 1;
                    bearY = 400 - (targetNum * 20) - (jump % 2 === 0 ? 10 : 0);
                    drawScene();
                    if (jump > 4) {
                        clearInterval(jumpInterval);
                        setTimeout(generateProblem, 500);
                    }
                }, 200);
                const leafInterval = setInterval(drawScene, 50);
                setTimeout(() => clearInterval(leafInterval), 3000);
            } else {
                result.textContent = 'Grrr... Not quite! Try again. Hint: Start at ' + startNum + ' and move ' + moveNum + '.';
                result.style.color = '#d32f2f';
                result.style.display = 'block';
                grrSound.play().catch(() => console.log('Grr sound not loaded'));
                if (firstAttempt) updateScore(false, true);
                firstAttempt = false;
                let tilt = 0;
                const tiltInterval = setInterval(() => {
                    tilt += 1;
                    ctx.save();
                    ctx.translate(200, bearY);
                    ctx.rotate((tilt % 2 === 0 ? 0.1 : -0.1));
                    ctx.translate(-200, -bearY);
                    drawScene();
                    ctx.restore();
                    if (tilt > 4) {
                        clearInterval(tiltInterval);
                        setTimeout(generateProblem, 500);
                    }
                }, 200);
            }
        });

        // Reset bear
        resetButton.addEventListener('click', () => {
            bearY = 400 - startNum * 20;
            input.value = startNum;
            drawScene();
        });

        // Start the game
        generateProblem();
        setupDragging();
    }
};