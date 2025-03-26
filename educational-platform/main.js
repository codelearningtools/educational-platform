async function init() {
    try {
        const response = await fetch('manifest.json');
        if (!response.ok) throw new Error(`Failed to fetch manifest.json: ${response.statusText}`);
        const manifest = await response.json();
        console.log('Manifest loaded:', manifest);
        populateGradeFilter(manifest);

        document.getElementById('show-reporting').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('module-container').style.display = 'none';
            document.getElementById('reporting-container').style.display = 'block';
            updateDashboard();
        });

        const gradeFilter = document.getElementById('grade-filter');
        gradeFilter.addEventListener('change', () => {
            console.log('Grade selected:', gradeFilter.value);
            onGradeChange(manifest);
            showModuleView();
        });

        const subjectFilter = document.getElementById('subject-filter');
        subjectFilter.addEventListener('change', () => {
            console.log('Subject selected:', subjectFilter.value);
            onSubjectChange(manifest);
            showModuleView();
        });

        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.addEventListener('change', () => {
            console.log('Category selected:', categoryFilter.value);
            onCategoryChange(manifest);
            showModuleView();
        });
    } catch (error) {
        console.error('Error in init:', error);
        alert('Failed to initialize the application. Please check the console for details.');
    }
}

function showModuleView() {
    document.getElementById('module-container').style.display = 'block';
    document.getElementById('reporting-container').style.display = 'none';
}

function populateGradeFilter(manifest) {
    const grades = [...new Set(manifest.map(m => m.grade))];
    const gradeFilter = document.getElementById('grade-filter');
    gradeFilter.innerHTML = '<option value="">Select Grade</option>';
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeFilter.appendChild(option);
    });
}

function onGradeChange(manifest) {
    const grade = document.getElementById('grade-filter').value;
    const subjectFilter = document.getElementById('subject-filter');
    const categoryFilter = document.getElementById('category-filter');
    subjectFilter.innerHTML = '<option value="">Select Subject Area</option>';
    categoryFilter.innerHTML = '<option value="">Select Category</option>';
    categoryFilter.disabled = true;
    document.getElementById('module-list').innerHTML = '';

    if (grade) {
        const subjects = [...new Set(manifest.filter(m => m.grade === grade).map(m => m.subject))];
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });
        subjectFilter.disabled = false;
    } else {
        subjectFilter.disabled = true;
    }
}

function onSubjectChange(manifest) {
    const grade = document.getElementById('grade-filter').value;
    const subject = document.getElementById('subject-filter').value;
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = '<option value="">Select Category</option>';
    document.getElementById('module-list').innerHTML = '';

    if (subject) {
        const categories = [...new Set(manifest.filter(m => m.grade === grade && m.subject === subject).map(m => m.category))];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        categoryFilter.disabled = false;
    }
}

function onCategoryChange(manifest) {
    const grade = document.getElementById('grade-filter').value;
    const subject = document.getElementById('subject-filter').value;
    const category = document.getElementById('category-filter').value;
    const moduleList = document.getElementById('module-list');
    moduleList.innerHTML = '';

    if (category) {
        const modules = manifest.filter(m => m.grade === grade && m.subject === subject && m.category === category);
        modules.forEach(module => {
            const card = document.createElement('div');
            card.className = 'module-card';
            card.textContent = module.name;
            card.addEventListener('click', () => loadModule(module.path, module.name));
            moduleList.appendChild(card);
        });
    }
}

async function loadModule(modulePath, moduleName) {
    try {
        const module = await import(`./${modulePath}`);
        const container = document.getElementById('module-container');
        container.innerHTML = '';
        module.default.render(container, moduleName);
        showModuleView();
    } catch (error) {
        console.error('Error loading module:', error);
        alert('Failed to load the module. Please try again.');
    }
}

window.updateSessionStats = function(moduleName, correctFirst, incorrect) {
    let stats = JSON.parse(sessionStorage.getItem('moduleStats') || '{}');
    if (!stats[moduleName]) stats[moduleName] = { correctFirst: 0, incorrect: 0 };
    stats[moduleName].correctFirst += correctFirst;
    stats[moduleName].incorrect += incorrect;
    sessionStorage.setItem('moduleStats', JSON.stringify(stats));
};

let dashboardChart = null;

function updateDashboard() {
    const stats = JSON.parse(sessionStorage.getItem('moduleStats') || '{}');
    const ctx = document.getElementById('dashboard-chart').getContext('2d');

    if (dashboardChart) dashboardChart.destroy();

    const labels = Object.keys(stats);
    const correctData = labels.map(name => stats[name].correctFirst);
    const incorrectData = labels.map(name => stats[name].incorrect);

    dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Correct First Attempts', data: correctData, backgroundColor: '#4CAF50' },
                { label: 'Incorrect Attempts', data: incorrectData, backgroundColor: '#d32f2f' }
            ]
        },
        options: { 
            scales: { y: { beginAtZero: true } },
            responsive: true, /* Ensure chart scales on mobile */
            maintainAspectRatio: false /* Allow chart to fit container */
        }
    });

    const statsDiv = document.getElementById('dashboard-stats');
    statsDiv.innerHTML = labels.map(name => 
        `<p>${name}: ${stats[name].correctFirst} Correct, ${stats[name].incorrect} Incorrect</p>`
    ).join('');
}

init();