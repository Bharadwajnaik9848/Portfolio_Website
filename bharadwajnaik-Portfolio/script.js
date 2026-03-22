// Minimal script so the <script> tag doesn't 404 and to verify JS loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');
    // Theme toggle setup
    const toggleBtn = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    } else {
        if (toggleBtn) toggleBtn.textContent = '🌙';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            toggleBtn.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Reveal-on-scroll setup
    const sections = document.querySelectorAll('section');

    // Ensure sections have initial hidden state (in case CSS didn't apply yet)
    sections.forEach(section => {
        section.style.opacity = section.style.opacity || '0';
        section.style.transform = section.style.transform || 'translateY(20px)';
        section.style.transition = section.style.transition || 'opacity 1.0s ease, transform 1.0s ease';
    });

    const revealSections = () => {
        const triggerBottom = window.innerHeight * 0.8;

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;

            if (sectionTop < triggerBottom) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', revealSections);
    // run once on load to reveal sections already in view
    revealSections();
    // Typing effect (fade in/out between words)
    const typingElement = document.getElementById('typing');
    if (typingElement) {
        typingElement.style.opacity = 0;
        typingElement.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { typingElement.style.opacity = 1; }, 200);

        const words = [
            'Software Developer',
            'Full Stack Developer',
            'Frontend Engineer',
            'Future AWS Architect'
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentWord = words[wordIndex];

            if (!isDeleting) {
                typingElement.textContent = currentWord.slice(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentWord.length) {
                    // wait, then start deleting
                    setTimeout(() => isDeleting = true, 1000);
                }
            } else {
                typingElement.textContent = currentWord.slice(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    // before changing to next word, fade out then fade in
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    typingElement.style.opacity = '0';
                    setTimeout(() => {
                        typingElement.style.opacity = '1';
                    }, 200);
                }
            }

            const typingSpeed = isDeleting ? 40 : 80;
            setTimeout(typeEffect, typingSpeed);
        }

        typeEffect();
    }
});




