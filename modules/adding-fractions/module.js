/**
 * Module: Adding Fractions
 * License: AGPL-3.0
 */
export default {
    grade: '5',
    subject: 'Math',
    category: 'Fractions',
    name: 'Adding Fractions',
    render: function(container) {
        container.innerHTML = '';
        const title = document.createElement('h2');
        title.className = 'module-title';
        title.textContent = this.name;
        container.appendChild(title);
        const lesson = document.createElement('p');
        lesson.innerHTML = 'To add fractions, find a common denominator, then add the numerators.';
        container.appendChild(lesson);
        const example = document.createElement('p');
        example.textContent = 'For example, 1/4 + 1/2 = 1/4 + 2/4 = 3/4';
        example.style.backgroundColor = '#e8f5e9';
        example.style.padding = '10px';
        example.style.borderRadius = '5px';
        container.appendChild(example);
    }
};