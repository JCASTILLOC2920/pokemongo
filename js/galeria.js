document.addEventListener('DOMContentLoaded', () => {
    const pokemonCards = document.querySelectorAll('.pokemon-card');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the card must be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    pokemonCards.forEach(card => {
        observer.observe(card);
    });
});
