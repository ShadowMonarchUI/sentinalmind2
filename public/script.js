// Set reminder functionality
const setReminderBtn = document.getElementById('setReminder');
if (setReminderBtn) {
    setReminderBtn.addEventListener('click', function() {
        const medication = document.getElementById('medication').value;
        const time = document.getElementById('reminderTime').value;
        
        if (!medication || !time) {
            alert('Please fill in all fields');
            return;
        }
        
        const reminderTime = new Date(time);
        if (reminderTime < new Date()) {
            alert('Please select a future time');
            return;
        }
        
        // Store reminder in localStorage
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push({
            medication,
            time: reminderTime.toISOString()
        });
        localStorage.setItem('reminders', JSON.stringify(reminders));
        
        alert('Reminder set successfully!');
    });
}

// Lazy loading for images
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if (lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Image error handling
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'assets/img/illustrations/placeholder.svg';
    });
});

// Smooth animations for elements
const animateElements = document.querySelectorAll('.animate-on-scroll');
if (animateElements.length > 0) {
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    });

    animateElements.forEach(element => animationObserver.observe(element));
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll behavior
const navbar = document.querySelector('.navbar');
if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}
