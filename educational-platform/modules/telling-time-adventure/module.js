// modules/telling-time-adventure/module.js
export default {
    grade: '1',
    subject: 'Math',
    category: 'Time',
    name: 'Telling Time Adventure',
    render: function(container, moduleName) {
        container.innerHTML = '';

        // Main content area
        const mainContent = document.createElement('div');
        mainContent.style.marginRight = '270px';
        container.appendChild(mainContent);

        // Score tracker
        const scoreTracker = document.createElement('div');
        scoreTracker.id = 'score-tracker';
        container.appendChild(scoreTracker);
        scoreTracker.innerHTML = `
            <h3>Time Explorer Score</h3>
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
                    label: 'Time Mastery',
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

        // Module content
        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = 'Telling Time Adventure';
        mainContent.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = 'Help Clocky the Clock Monster tell time on his adventure! Look at the clock and choose the right time.';
        mainContent.appendChild(intro);

        // Clock display
        const clockContainer = document.createElement('div');
        clockContainer.style.textAlign = 'center';
        const clockCanvas = document.createElement('canvas');
        clockCanvas.width = 200;
        clockCanvas.height = 200;
        clockContainer.appendChild(clockCanvas);
        mainContent.appendChild(clockContainer);

        const timeOptions = document.createElement('div');
        timeOptions.style.marginTop = '20px';
        mainContent.appendChild(timeOptions);

        const result = document.createElement('p');
        result.style.textAlign = 'center';
        result.style.display = 'none';
        mainContent.appendChild(result);

        // Clock drawing function
        function drawClock(hour, minute) {
            const ctx = clockCanvas.getContext('2d');
            ctx.clearRect(0, 0, 200, 200);
            const centerX = 100;
            const centerY = 100;
            const radius = 90;

            // Clock face
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#f0f0f0';
            ctx.fill();
            ctx.stroke();

            // Numbers
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 1; i <= 12; i++) {
                const angle = (i * 30 - 90) * Math.PI / 180;
                const x = centerX + Math.cos(angle) * (radius - 20);
                const y = centerY + Math.sin(angle) * (radius - 20);
                ctx.fillText(i, x, y);
            }

            // Hour hand
            const hourAngle = ((hour % 12) + minute / 60) * 30 * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(hourAngle - Math.PI/2) * 50, centerY + Math.sin(hourAngle - Math.PI/2) * 50);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#2196F3';
            ctx.stroke();

            // Minute hand
            const minuteAngle = (minute * 6) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(minuteAngle - Math.PI/2) * 70, centerY + Math.sin(minuteAngle - Math.PI/2) * 70);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#4CAF50';
            ctx.stroke();
        }

        // Game logic
        let currentHour, currentMinute;
        let firstAttempt = true;
        let answered = false;

        function generateQuestion() {
            currentHour = Math.floor(Math.random() * 12) + 1;
            currentMinute = Math.floor(Math.random() * 12) * 5;
            drawClock(currentHour, currentMinute);
            
            const correctTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
            const options = [correctTime];
            while (options.length < 4) {
                const fakeHour = Math.floor(Math.random() * 12) + 1;
                const fakeMinute = Math.floor(Math.random() * 12) * 5;
                const fakeTime = `${fakeHour}:${fakeMinute.toString().padStart(2, '0')}`;
                if (!options.includes(fakeTime)) options.push(fakeTime);
            }
            
            timeOptions.innerHTML = '';
            options.sort(() => Math.random() - 0.5);
            options.forEach(time => {
                const btn = document.createElement('button');
                btn.className = 'module-button';
                btn.textContent = time;
                btn.style.margin = '5px';
                btn.addEventListener('click', () => checkAnswer(time), { once: true });
                timeOptions.appendChild(btn);
            });

            result.style.display = 'none';
            firstAttempt = true;
            answered = false;
        }

        function checkAnswer(selectedTime) {
            if (answered) return;
            answered = true;

            const correctTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
            if (selectedTime === correctTime) {
                result.textContent = 'Great job, Time Explorer! You helped Clocky get it right!';
                result.style.color = '#4CAF50';
                updateScore(firstAttempt, !firstAttempt);
            } else {
                result.textContent = `Oops! Clocky needs help. The right time is ${correctTime}.`;
                result.style.color = '#d32f2f';
                if (firstAttempt) updateScore(false, true);
            }
            result.style.display = 'block';

            // Auto-populate next question after a short delay
            setTimeout(generateQuestion, 1500);
        }

        generateQuestion();
    }
};