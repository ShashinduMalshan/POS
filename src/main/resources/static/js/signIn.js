function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('#theme-toggle-btn i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.querySelector('#theme-toggle-btn i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
});