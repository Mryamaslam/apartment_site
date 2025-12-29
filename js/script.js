// Custom Scripts for Fallete's Service Apartments

document.addEventListener('DOMContentLoaded', function() {
    console.log("Fallete's Website Loaded Successfully");

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
