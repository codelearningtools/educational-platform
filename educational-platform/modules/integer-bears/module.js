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

        const mainContent = document.createElement('div');
        mainContent.style.marginRight = '0'; // Adjusted for mobile stacking
        container.appendChild(mainContent);

        const scoreTracker = document.createElement('div');
        scoreTracker.id = 'score-tracker';
        container.appendChild(scoreTracker);

        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = 'Integer Bears: Climb the Tree!';
        mainContent.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = 'Drag the bear up (+) or down (-) the tree to solve integer problems! Watch leaves fall when you’re right!';
        mainContent.appendChild(intro);

        const canvas = document.createElement('canvas');
        canvas.style.border = '2px solid #4CAF50';
        canvas.style.borderRadius = '5px';
        canvas.style.backgroundColor = '#e8f5e9';
        canvas.style.width = '100%'; // Responsive width
        canvas.style.maxWidth = '400px'; // Cap for larger screens
        canvas.style.height = 'auto'; // Maintain aspect ratio
        mainContent.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Set canvas size dynamically
        function resizeCanvas() {
            const width = Math.min(window.innerWidth - 40, 400); // Account for padding
            canvas.width = width;
            canvas.height = width * 2; // Maintain 1:2 aspect ratio
            drawScene();
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const roarSound = document.createElement('audio');
        roarSound.src = 'modules/integer-bears/roar.mp3';
        mainContent.appendChild(roarSound);

        const grrSound = document.createElement('audio');
        grrSound.src = 'modules/integer-bears/grr.mp3';
        mainContent.appendChild(grrSound);

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
            options: { 
                scales: { y: { min: 0, max: 1, ticks: { stepSize: 1, callback: v => v ? 'Correct' : 'Incorrect' } } },
                responsive: true,
                maintainAspectRatio: false
            }
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

        let bearY = 400;
        let startNum, moveNum, targetNum;
        let isDragging = false;
        let draggedBear = null;
        let leaves = [];
        let firstAttempt = true;

        function generateProblem() {
            startNum = Math.floor(Math.random() * 11) - 5;
            moveNum = Math.floor(Math.random() * 11) - 5;
            targetNum = startNum + moveNum;
            problemText.textContent = `A bear starts at ${startNum}. It climbs ${moveNum >= 0 ? 'up ' + moveNum : 'down ' + Math.abs(moveNum)}. Where is it now?`;
            bearY = canvas.height / 2 - startNum * 20;
            result.style.display = 'none';
            input.value = '';
            leaves = [];
            firstAttempt = true;
            drawScene();
        }

        function drawScene() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerY = canvas.height / 2;
            const scale = canvas.width / 400; // Scale based on original width

            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 50 * scale, 100 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#45a049';
            ctx.beginPath();
            ctx.arc(canvas.width / 2 - 50 * scale, 30 * scale, 50 * scale, 0, Math.PI * 2);
            ctx.arc(canvas.width / 2 + 50 * scale, 40 * scale, 60 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(canvas.width / 2 - 10 * scale, 100 * scale, 20 * scale, canvas.height - 100 * scale);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(50 * scale, centerY);
            ctx.lineTo(canvas.width - 50 * scale, centerY);
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.font = `${16 * scale}px Comic Sans MS`;
            ctx.fillText('0', canvas.width - 40 * scale, centerY + 5 * scale);
            for (let i = -15; i <= 15; i++) {
                const y = centerY - i * 20 * scale;
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 20 * scale, y);
                ctx.lineTo(canvas.width / 2 + 20 * scale, y);
                ctx.stroke();
                if (i % 5 === 0) ctx.fillText(i, canvas.width / 2 - 40 * scale, y + 5 * scale);
            }
            ctx.fillStyle = '#6D4C41';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, bearY, 20 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8D5524';
            ctx.beginPath();
            ctx.arc(canvas.width / 2 - 10 * scale, bearY - 15 * scale, 5 * scale, 0, Math.PI * 2);
            ctx.arc(canvas.width / 2 + 10 * scale, bearY - 15 * scale, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(canvas.width / 2 - 5 * scale, bearY + 5 * scale, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(canvas.width / 2 - 8 * scale, bearY - 5 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.arc(canvas.width / 2 - 2 * scale, bearY - 5 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.arc(canvas.width / 2 - 5 * scale, bearY + 7 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
            leaves.forEach(leaf => {
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(leaf.x, leaf.y, 5 * scale, 0, Math.PI * 2);
                ctx.fill();
                leaf.y += 2 * scale;
                leaf.x += Math.sin(leaf.y / 20) * scale;
            });
            leaves = leaves.filter(leaf => leaf.y < canvas.height);
        }

        function setupDragging() {
            // Mouse events
            canvas.onmousedown = (e) => startDrag(e);
            canvas.onmousemove = (e) => moveDrag(e);
            canvas.onmouseup = () => endDrag();
            // Touch events
            canvas.ontouchstart = (e) => startDrag(e.touches[0]);
            canvas.ontouchmove = (e) => moveDrag(e.touches[0]);
            canvas.ontouchend = () => endDrag();

            function startDrag(e) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (Math.sqrt((x - canvas.width / 2) ** 2 + (y - bearY) ** 2) < 20 * (canvas.width / 400)) {
                    isDragging = true;
                    draggedBear = { offsetY: y - bearY };
                    e.preventDefault(); // Prevent scrolling on touch
                }
            }

            function moveDrag(e) {
                if (isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const y = e.clientY - rect.top - draggedBear.offsetY;
                    bearY = Math.max(100 * (canvas.width / 400), Math.min(canvas.height - 100 * (canvas.width / 400), y));
                    drawScene();
                    const currentPos = Math.round((canvas.height / 2 - bearY) / (20 * (canvas.width / 400)));
                    input.value = currentPos;
                    e.preventDefault();
                }
            }

            function endDrag() {
                isDragging = false;
                draggedBear = null;
            }
        }

        checkButton.addEventListener('click', () => {
            const answer = parseInt(input.value);
            if (answer === targetNum) {
                result.textContent = 'Roar! You got it! The bear is at ' + targetNum + '! Watch the leaves fall!';
                result.style.color = '#4CAF50';
                result.style.display = 'block';
                roarSound.play().catch(() => console.log('Roar sound not loaded'));
                updateScore(firstAttempt, !firstAttempt);
                for (let i = 0; i < 10; i++) leaves.push({ x: canvas.width / 4 + Math.random() * canvas.width / 2, y: 50 * (canvas.width / 400) });
                let jump = 0;
                const jumpInterval = setInterval(() => {
                    jump += 1;
                    bearY = canvas.height / 2 - (targetNum * 20 * (canvas.width / 400)) - (jump % 2 === 0 ? 10 * (canvas.width / 400) : 0);
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
                    ctx.translate(canvas.width / 2, bearY);
                    ctx.rotate((tilt % 2 === 0 ? 0.1 : -0.1));
                    ctx.translate(-canvas.width / 2, -bearY);
                    drawScene();
                    ctx.restore();
                    if (tilt > 4) {
                        clearInterval(tiltInterval);
                        setTimeout(generateProblem, 500);
                    }
                }, 200);
            }
        });

        resetButton.addEventListener('click', () => {
            bearY = canvas.height / 2 - startNum * 20 * (canvas.width / 400);
            input.value = startNum;
            drawScene();
        });

        generateProblem();
        setupDragging();
    }
};