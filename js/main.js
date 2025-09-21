document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidenav = document.getElementById('sidenav');
    const content = document.getElementById('content');

    if (menuToggle && sidenav) {
        menuToggle.addEventListener('click', () => {
            sidenav.classList.toggle('active');
            // The content margin is handled by CSS media queries,
            // but you could add a class here if more complex behavior is needed.
            // For example, to prevent scrolling on the body when the menu is open.
        });
    }
});