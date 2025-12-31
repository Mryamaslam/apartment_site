// Custom Scripts for Fallete's Service Apartments

document.addEventListener('DOMContentLoaded', function() {
    console.log("Fallete's Website Loaded Successfully");

    // Drop-In Scroll Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay for elements appearing in the same batch
                // Use index from forEach loop on entries array
                entry.target.style.transitionDelay = `${index * 150}ms`; 
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Removed to allow re-animation
            } else {
                // Remove class when element leaves viewport to reset animation
                entry.target.classList.remove('visible');
                // Optional: Reset delay to ensure clean exit/re-entry
                entry.target.style.transitionDelay = '0ms';
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('.card, .section-title, .hero-content > *, .gallery-item, .list-group-item, h1, h2, h3, h4, p.lead');
    
    animatedElements.forEach((el) => {
        el.classList.add('drop-in');
        observer.observe(el);
    });

    // Optional: Add scroll effect to navbar if needed
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
    });
});
