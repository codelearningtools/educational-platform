/**
 * Module: Temperature Trek
 * License: AGPL-3.0
 */

export default {
    grade: '5',
    subject: 'Math',
    category: 'Integers',
    name: 'Temperature Trek',
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

        // Title
        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = 'Temperature Trek: Weather Wizard!';
        mainContent.appendChild(title);

        // Intro
        const intro = document.createElement('p');
        intro.textContent = 'Help the Weather Wizard set the temperature on the gauge! Drag the marker to the correct temperature and watch the weather change!';
        mainContent.appendChild(intro);

        // Canvas for the temperature gauge
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 600;
        canvas.style.border = '2px solid #4CAF50';
        canvas.style.borderRadius = '5px';
        canvas.style.backgroundColor = '#e0f7fa'; // Light cyan background for a "weather" feel
        mainContent.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Game elements
        const problemText = document.createElement('p');
        problemText.className = 'module-text';
        mainContent.appendChild(problemText);

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'module-input';
        input.placeholder = 'Enter the temperature';
        mainContent.appendChild(input);

        const checkButton = document.createElement('button');
        checkButton.className = 'module-button';
        checkButton.textContent = 'Check Temperature!';
        mainContent.appendChild(checkButton);

        const resetButton = document.createElement('button');
        resetButton.className = 'module-button';
        resetButton.textContent = 'Reset Gauge';
        resetButton.style.marginLeft = '10px';
        mainContent.appendChild(resetButton);

        const result = document.createElement('p');
        result.style.display = 'none';
        mainContent.appendChild(result);

        // Game state
        let markerY = 300; // Center of the gauge (0°C)
        let startTemp, changeTemp, targetTemp;
        let isDragging = false;
        let draggedMarker = null;
        let weatherEffects = []; // For animations (e.g., snowflakes or sun rays)
        let firstAttempt = true;

        // Generate a new problem
        function generateProblem() {
            startTemp = Math.floor(Math.random() * 21) - 10; // -10 to 10
            changeTemp = Math.floor(Math.random() * 21) - 10; // -10 to 10
            targetTemp = startTemp + changeTemp;
            problemText.textContent = `The temperature starts at ${startTemp}°C. It changes by ${changeTemp}°C. What’s the new temperature?`;
            markerY = 300 - startTemp * 10; // Each degree is 10 pixels
            result.style.display = 'none';
            input.value = '';
            weatherEffects = [];
            firstAttempt = true;
            drawScene();
        }

        // Draw the temperature gauge and scene
        function drawScene() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the sky background based on temperature
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            if (targetTemp <= 0) {
                gradient.addColorStop(0, '#b3e5fc'); // Light blue for cold
                gradient.addColorStop(1, '#e1f5fe');
            } else {
                gradient.addColorStop(0, '#ffeb3b'); // Yellow for warm
                gradient.addColorStop(1, '#fff9c4');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the gauge (vertical thermometer)
            ctx.fillStyle = '#d3d3d3'; // Light gray for the gauge background
            ctx.fillRect(130, 50, 40, 500);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(130, 50, 40, 500);

            // Draw temperature markings (-20°C to 20°C)
            ctx.fillStyle = '#333';
            ctx.font = '14px Comic Sans MS';
            for (let temp = -20; temp <= 20; temp++) {
                const y = 300 - temp * 10; // 0°C at y=300, each degree is 10 pixels
                ctx.beginPath();
                ctx.moveTo(temp % 5 === 0 ? 110 : 120, y);
                ctx.lineTo(190, y);
                ctx.stroke();
                if (temp % 5 === 0) {
                    ctx.fillText(`${temp}°C`, temp < 0 ? 70 : 80, y + 5);
                }
            }

            // Draw the mercury (temperature level)
            const currentTemp = Math.round((300 - markerY) / 10); // Calculate the current temperature based on markerY
            const mercuryTopY = markerY; // Top of the mercury aligns with the marker's center
            const mercuryHeight = 550 - mercuryTopY; // Height from the bottom of the gauge (y=550) to the marker
            ctx.fillStyle = currentTemp <= 0 ? '#42a5f5' : '#ef5350'; // Blue for cold, red for warm
            ctx.fillRect(135, mercuryTopY, 30, mercuryHeight);

            // Draw the marker (draggable)
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(150, markerY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '12px Comic Sans MS';
            ctx.textAlign = 'center';
            ctx.fillText(`${currentTemp}°C`, 150, markerY + 4);

            // Draw weather effects (snowflakes or sun rays)
            weatherEffects.forEach(effect => {
                if (targetTemp <= 0) {
                    // Snowflakes
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    effect.y += 2;
                    effect.x += Math.sin(effect.y / 20);
                } else {
                    // Sun rays
                    ctx.strokeStyle = '#ffca28';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(effect.x, effect.y);
                    ctx.lineTo(effect.x + 10, effect.y + 10);
                    ctx.stroke();
                    effect.y += 2;
                    effect.x -= 1;
                }
            });
            weatherEffects = weatherEffects.filter(effect => effect.y < canvas.height);
        }

        // Dragging logic for the marker
        function setupDragging() {
            canvas.onmousedown = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (Math.sqrt((x - 150) ** 2 + (y - markerY) ** 2) < 15) {
                    isDragging = true;
                    draggedMarker = { offsetY: y - markerY };
                }
            };
            canvas.onmousemove = (e) => {
                if (isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const y = e.clientY - rect.top - draggedMarker.offsetY;
                    markerY = Math.max(50, Math.min(550, y)); // Limit to gauge range (-20 to 20)
                    drawScene();
                    const currentTemp = Math.round((300 - markerY) / 10);
                    input.value = currentTemp;
                }
            };
            canvas.onmouseup = () => {
                isDragging = false;
                draggedMarker = null;
            };
        }

        // Check answer
        checkButton.addEventListener('click', () => {
            const answer = parseInt(input.value);
            if (answer === targetTemp) {
                result.textContent = `Perfect! The temperature is ${targetTemp}°C! Watch the weather change!`;
                result.style.color = '#4CAF50';
                result.style.display = 'block';
                updateScore(firstAttempt, !firstAttempt);
                // Add weather effects
                for (let i = 0; i < 15; i++) {
                    weatherEffects.push({ x: 50 + Math.random() * 200, y: 50 });
                }
                let pulse = 0;
                const pulseInterval = setInterval(() => {
                    pulse += 1;
                    markerY = 300 - (targetTemp * 10) + (pulse % 2 === 0 ? 5 : 0);
                    drawScene();
                    if (pulse > 4) {
                        clearInterval(pulseInterval);
                        setTimeout(generateProblem, 500);
                    }
                }, 200);
                const effectInterval = setInterval(drawScene, 50);
                setTimeout(() => clearInterval(effectInterval), 3000);
            } else {
                result.textContent = `Not quite! The correct temperature is ${targetTemp}°C. Try again!`;
                result.style.color = '#d32f2f';
                result.style.display = 'block';
                if (firstAttempt) updateScore(false, true);
                firstAttempt = false;
                let shake = 0;
                const shakeInterval = setInterval(() => {
                    shake += 1;
                    ctx.save();
                    ctx.translate(150, markerY);
                    ctx.rotate((shake % 2 === 0 ? 0.1 : -0.1));
                    ctx.translate(-150, -markerY);
                    drawScene();
                    ctx.restore();
                    if (shake > 4) {
                        clearInterval(shakeInterval);
                        setTimeout(generateProblem, 500);
                    }
                }, 200);
            }
        });

        // Reset gauge
        resetButton.addEventListener('click', () => {
            markerY = 300 - startTemp * 10;
            input.value = startTemp;
            drawScene();
        });

        // Start the game
        generateProblem();
        setupDragging();
    }
};