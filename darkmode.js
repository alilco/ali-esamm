const darkModeButton = document.getElementById('dark-mode');

darkModeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load saved dark mode state
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}
