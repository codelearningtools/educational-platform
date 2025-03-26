/**
 * Module: Introduction to Integers
 * License: AGPL-3.0
 */

export default {
    grade: '5',
    subject: 'Math',
    category: 'Integers',
    name: 'Introduction to Integers',
    render: function(container, moduleName) {
        container.innerHTML = '';

        // Main content area
        const mainContent = document.createElement('div');
        mainContent.style.marginRight = '270px'; // Prevent overlap with score tracker
        container.appendChild(mainContent);

        // Score tracker (upper right corner via CSS)
        const scoreTracker = document.createElement('div');
        scoreTracker.id = 'score-tracker';
        container.appendChild(scoreTracker);

        // Title
        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = 'Introduction to Integers';
        mainContent.appendChild(title);

        // Intro
        const intro = document.createElement('p');
        intro.textContent = 'Let’s practice adding integers! Solve the problem below.';
        mainContent.appendChild(intro);

        // Question
        const question = document.createElement('p');
        question.className = 'module-text';
        mainContent.appendChild(question);

        // Input
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'module-input';
        input.placeholder = 'Enter your answer';
        mainContent.appendChild(input);

        // Check button
        const button = document.createElement('button');
        button.className = 'module-button';
        button.textContent = 'Check Answer';
        mainContent.appendChild(button);

        // Result
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
        let num1, num2, correctAnswer;
        let firstAttempt = true;

        // Generate a new problem
        function generateProblem() {
            num1 = Math.floor(Math.random() * 21) - 10; // -10 to 10
            num2 = Math.floor(Math.random() * 21) - 10; // -10 to 10
            correctAnswer = num1 + num2;
            question.textContent = `What is ${num1} + ${num2}?`;
            result.style.display = 'none';
            input.value = '';
            firstAttempt = true;
        }

        // Check answer
        button.addEventListener('click', () => {
            const answer = parseInt(input.value);
            if (answer === correctAnswer) {
                result.textContent = 'Correct! Great job!';
                result.style.color = '#4CAF50';
                result.style.display = 'block';
                updateScore(firstAttempt, !firstAttempt);
                setTimeout(generateProblem, 1000);
            } else {
                result.textContent = `Incorrect. The correct answer is ${correctAnswer}.`;
                result.style.color = '#d32f2f';
                result.style.display = 'block';
                if (firstAttempt) updateScore(false, true);
                firstAttempt = false;
                setTimeout(generateProblem, 1000);
            }
        });

        // Start the game
        generateProblem();
    }
};