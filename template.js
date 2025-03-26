/**
 * Educational Module Template
 * License: AGPL-3.0
 * Instructions: Place this in a new folder under modules/ (e.g., modules/my-module/module.js).
 * Add assets like MP3s in the same folder and reference them relative to the module (e.g., 'my-sound.mp3').
 * Update manifest.json with the path: "modules/my-module/module.js".
 * Styling: Elements like h2, p, button, and input get default styles in .module-container.
 * Use optional classes (e.g., .module-title, .module-button) for customization.
 * Score Tracker: For quiz-style modules, use the score tracker below to track Correct First Attempts and Incorrect Attempts.
 *   - The score tracker is automatically positioned in the upper right corner via CSS (#score-tracker).
 *   - Ensure the main content has `style.marginRight = '270px'` to prevent overlap with the score tracker (250px width + 20px padding).
 *   - Do NOT set `container.style.display = 'flex'`, as this conflicts with the absolute positioning of the score tracker.
 * Question Flow: For interactive modules, automatically populate the next question after an answer is submitted:
 *   - Use a flag (e.g., `answered`) to prevent multiple submissions for the same question.
 *   - Use `addEventListener` with `{ once: true }` option to ensure single-click handling.
 *   - Call the question generation function (e.g., `generateQuestion()`) in a `setTimeout` after answer feedback.
 */

export default {
    grade: 'GRADE',
    subject: 'SUBJECT',
    category: 'CATEGORY',
    name: 'MODULE NAME',
    render: function(container, moduleName) {
        container.innerHTML = '';

        // Main content area
        const mainContent = document.createElement('div');
        mainContent.style.marginRight = '270px';
        container.appendChild(mainContent);

        // Score tracker (for quiz-style modules)
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

        // Example content
        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = 'Module Title';
        mainContent.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = 'Welcome to this module! Follow the instructions to get started.';
        mainContent.appendChild(intro);

        // Add your module-specific content here
        const question = document.createElement('p');
        question.className = 'module-text';
        question.textContent = 'Sample question: What is 2 + 2?';
        mainContent.appendChild(question);

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'module-input';
        input.placeholder = 'Enter your answer';
        mainContent.appendChild(input);

        const button = document.createElement('button');
        button.className = 'module-button';
        button.textContent = 'Check Answer';
        mainContent.appendChild(button);

        const result = document.createElement('p');
        result.style.display = 'none';
        mainContent.appendChild(result);

        // Example question logic with auto-population
        let firstAttempt = true;
        let answered = false;

        function generateQuestion() {
            question.textContent = 'Sample question: What is 2 + 2?';
            input.value = '';
            result.style.display = 'none';
            firstAttempt = true;
            answered = false;
        }

        button.addEventListener('click', () => {
            if (answered) return;
            answered = true;

            const answer = parseInt(input.value);
            if (answer === 4) {
                result.textContent = 'Correct! Great job!';
                result.style.color = '#4CAF50';
                result.style.display = 'block';
                updateScore(firstAttempt, !firstAttempt);
            } else {
                result.textContent = 'Incorrect. The correct answer is 4.';
                result.style.color = '#d32f2f';
                result.style.display = 'block';
                if (firstAttempt) updateScore(false, true);
            }
            setTimeout(generateQuestion, 1500);
        }, { once: true });
        
        generateQuestion();
    }
};