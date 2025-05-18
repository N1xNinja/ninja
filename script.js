'use strict';

// Wrap the entire script in a function to avoid global scope pollution
function initializeVaporwaveInterface() {
    console.log("Initializing Vaporwave Portfolio Interface v3.0...");

    // Constants for configuration
    const TYPING_SPEED_MS = 70;
    const TYPING_LINE_DELAY_MS = 600;
    const REVEAL_THRESHOLD = 0.15;
    const SCROLL_THROTTLE_MS = 100;
    const HEADER_HIDE_THRESHOLD_PX = 60;
    const BACK_TO_TOP_THRESHOLD_VH = 40;
    const PARTICLE_COUNT = 45; // Slightly more particles
    const PARTICLE_SPEED_MAX = 0.7; // Slightly faster
    const PARTICLE_SIZE_MIN = 1.5; // Smaller min size
    const PARTICLE_SIZE_MAX = 5; // Smaller max size

    // DOM Element Selectors
    const SELECTORS = {
        subtitle: '#typing-subtitle',
        ctaButton: '.cta-button', // Added selector for the button
        sections: '.full-screen-section, .content-section',
        footerYear: '#current-year',
        footerTimestamp: '#session-timestamp',
        siteHeader: '#site-header',
        backToTopButton: '#back-to-top',
        contactForm: '#contact-form',
        formStatus: '#form-status',
        particleCanvas: '#particle-canvas',
        mobileMenuToggle: '#mobile-menu-toggle',
        siteNav: '.site-nav'
    };

    // Utility to get elements safely
    const getElement = (selector, parent = document) => {
        const element = parent.querySelector(selector);
        if (!element && ['#particle-canvas', '#site-header', '#typing-subtitle'].includes(selector)) { // Added subtitle check
            console.warn(`Critical element not found: ${selector}. Some features might be disabled.`);
        } else if (!element) {
             console.log(`Optional element not found: ${selector}`);
        }
        return element;
    };

    // Get DOM elements
    const subtitleElement = getElement(SELECTORS.subtitle);
    const ctaButtonElement = getElement(SELECTORS.ctaButton); // Get CTA Button
    const sections = document.querySelectorAll(SELECTORS.sections);
    const footerYearElement = getElement(SELECTORS.footerYear);
    const footerTimestampElement = getElement(SELECTORS.footerTimestamp);
    const siteHeaderElement = getElement(SELECTORS.siteHeader);
    const backToTopButtonElement = getElement(SELECTORS.backToTopButton);
    const contactFormElement = getElement(SELECTORS.contactForm);
    const formStatusElement = getElement(SELECTORS.formStatus);
    const canvas = getElement(SELECTORS.particleCanvas);
    const mobileMenuToggle = getElement(SELECTORS.mobileMenuToggle);
    const siteNav = getElement(SELECTORS.siteNav);
    const ctx = canvas ? canvas.getContext('2d') : null;

    // State variables
    let typingIntervalId = null;
    let lastScrollTop = 0;
    let headerHeight = siteHeaderElement ? siteHeaderElement.offsetHeight : 75;
    let particlesArray = [];
    let animationFrameId;

    // --- UTILITY FUNCTIONS ---

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function getCssVariable(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }

    // --- CORE FUNCTIONALITY ---

    function typeWriter(element, text, callback) {
         if (!element || typeof text !== 'string') {
             if (callback) callback();
             return;
         }
         element.textContent = '';
         element.classList.remove('typing-cursor');
         let charIndex = 0;

         if (typingIntervalId) clearInterval(typingIntervalId);

         typingIntervalId = setInterval(() => {
             if (charIndex < text.length) {
                 element.textContent += text.charAt(charIndex);
                 charIndex++;
             } else {
                 clearInterval(typingIntervalId);
                 typingIntervalId = null;
                 element.classList.add('typing-cursor');
                 if (callback) {
                     setTimeout(callback, TYPING_LINE_DELAY_MS);
                 }
             }
         }, TYPING_SPEED_MS);
    }

    function startSubtitleTyping() {
         if (!subtitleElement || !ctaButtonElement) return; // Check for button too
         subtitleElement.textContent = '';
         ctaButtonElement.style.opacity = '0'; // Hide button initially
         ctaButtonElement.style.transform = 'translateY(20px)'; // Move button down
         // Updated subtitle text
         const subtitleText = "Community Manager | Developer | API Exploiter";
         setTimeout(() => {
             typeWriter(subtitleElement, subtitleText, () => {
                 // Callback after typing finishes: Fade in the button
                 setTimeout(() => { // Add a small delay before button fades in
                     ctaButtonElement.style.opacity = '1';
                     ctaButtonElement.style.transform = 'translateY(0)';
                 }, 100);
             });
         }, 500);
    }

    function handleSectionIntersection(entries, observer) {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.classList.add('visible');
                 observer.unobserve(entry.target);
             }
         });
    }

    function updateFooterContent() {
         if (footerYearElement) {
             footerYearElement.textContent = new Date().getFullYear();
         }
         if (footerTimestampElement) {
             footerTimestampElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
         }
    }

    function handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;

        if (siteHeaderElement) {
            if (currentScrollTop > lastScrollTop && currentScrollTop > headerHeight + HEADER_HIDE_THRESHOLD_PX) {
                siteHeaderElement.classList.add('header-hidden');
            } else if (currentScrollTop < lastScrollTop || currentScrollTop <= headerHeight) {
                siteHeaderElement.classList.remove('header-hidden');
            }
        }

        if (backToTopButtonElement) {
            if (currentScrollTop > viewportHeight * (BACK_TO_TOP_THRESHOLD_VH / 100)) {
                backToTopButtonElement.classList.add('visible');
            } else {
                backToTopButtonElement.classList.remove('visible');
            }
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }

    const throttledScrollHandler = throttle(handleScroll, SCROLL_THROTTLE_MS);

    function handleContactFormSubmit(event) {
        event.preventDefault();
        if (!contactFormElement || !formStatusElement) return;

        const name = contactFormElement.elements.name.value.trim();
        const email = contactFormElement.elements.email.value.trim();
        const message = contactFormElement.elements.message.value.trim();

        formStatusElement.textContent = '';
        formStatusElement.className = 'form-status-message';

        if (!name || !email || !message) {
            formStatusElement.textContent = 'ERROR: DATA PACKET CORRUPT. CHECK ALL FIELDS.';
            formStatusElement.classList.add('error');
            return;
        }

        console.log('Simulating transmission:');
        console.log('Identifier:', name);
        console.log('Comlink:', email);
        console.log('Data Packet:', message);

        formStatusElement.textContent = 'Transmission initiated... Signal Acquired! SUCCESS.';
        formStatusElement.classList.add('success');
        contactFormElement.reset();

        setTimeout(() => {
            formStatusElement.textContent = '';
            formStatusElement.className = 'form-status-message';
        }, 5000);
    }

    function toggleMobileMenu() {
        if (mobileMenuToggle && siteNav) {
            const isActive = mobileMenuToggle.classList.contains('active');
            mobileMenuToggle.classList.toggle('active');
            siteNav.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', String(!isActive)); // Use String()
        }
    }

    // --- PARTICLE ANIMATION SYSTEM ---

    class Particle {
        constructor(x, y, vx, vy, size, color, shape) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.baseSize = size;
            this.color = color;
            this.shape = shape;
            this.mass = this.size * 0.5;
            this.opacity = Math.random() * 0.5 + 0.3; // Random opacity
        }

        draw() {
            if (!ctx) return;
            // Apply opacity using rgba
            const drawColor = this.color.replace(/[^,]+(?=\))/, this.opacity.toFixed(2)); // Adjust alpha in rgba string
            ctx.fillStyle = drawColor;
            ctx.beginPath();
            const s = this.size;

            if (this.shape === 'circle') {
                ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            } else if (this.shape === 'square') {
                ctx.rect(this.x - s / 2, this.y - s / 2, s, s);
            } else if (this.shape === 'triangle') {
                const height = (Math.sqrt(3) / 2) * s;
                ctx.moveTo(this.x, this.y - height / 2);
                ctx.lineTo(this.x - s / 2, this.y + height / 2);
                ctx.lineTo(this.x + s / 2, this.y + height / 2);
                ctx.closePath();
            }
            ctx.fill();
        }

        update(canvasWidth, canvasHeight) {
             if (this.x + this.size > canvasWidth || this.x - this.size < 0) {
                this.vx = -this.vx * 0.85; // Slightly less bounce
                 this.x = Math.max(this.size, Math.min(this.x, canvasWidth - this.size));
            }
            if (this.y + this.size > canvasHeight || this.y - this.size < 0) {
                this.vy = -this.vy * 0.85;
                this.y = Math.max(this.size, Math.min(this.y, canvasHeight - this.size));
            }

            this.x += this.vx;
            this.y += this.vy;

            // Subtle size variation
            this.size = this.baseSize + Math.sin(Date.now() * 0.002 + this.x * 0.1) * 0.5;
             // Fade out near edges (optional)
            // const edgeThreshold = 50;
            // this.opacity = Math.min(this.opacity, this.x / edgeThreshold, (canvasWidth - this.x) / edgeThreshold, this.y / edgeThreshold, (canvasHeight - this.y) / edgeThreshold);
            // this.opacity = Math.max(0, this.opacity); // Ensure opacity is not negative

        }

        checkCollision(otherParticle) {
             const dx = otherParticle.x - this.x;
             const dy = otherParticle.y - this.y;
             const distance = Math.sqrt(dx * dx + dy * dy);
             const minDistance = this.size + otherParticle.size;

             if (distance < minDistance) {
                 const tempVx = this.vx;
                 const tempVy = this.vy;
                 this.vx = otherParticle.vx * 0.8; // More energy loss
                 this.vy = otherParticle.vy * 0.8;
                 otherParticle.vx = tempVx * 0.8;
                 otherParticle.vy = tempVy * 0.8;

                 const overlap = (minDistance - distance) / 2;
                 const angle = Math.atan2(dy, dx);
                 const adjustX = overlap * Math.cos(angle);
                 const adjustY = overlap * Math.sin(angle);

                 this.x -= adjustX;
                 this.y -= adjustY;
                 otherParticle.x += adjustX;
                 otherParticle.y += adjustY;
             }
        }
    }

    function initParticles() {
        if (!canvas || !ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        particlesArray = [];
        const shapes = ['circle', 'square', 'triangle'];
        const particleColor = getCssVariable('--particle-color') || 'rgba(0, 229, 255, 0.5)';

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            let size = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let vx = (Math.random() - 0.5) * PARTICLE_SPEED_MAX * 2;
            let vy = (Math.random() - 0.5) * PARTICLE_SPEED_MAX * 2;
            let shape = shapes[Math.floor(Math.random() * shapes.length)];

            particlesArray.push(new Particle(x, y, vx, vy, size, particleColor, shape));
        }

        if (!animationFrameId) {
            animateParticles();
        }
    }

    function handleParticles() {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update(canvasWidth, canvasHeight);
            particlesArray[i].draw();

            for (let j = i + 1; j < particlesArray.length; j++) {
                particlesArray[i].checkCollision(particlesArray[j]);
            }
        }
    }

    function animateParticles() {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function handleResize() {
         if (siteHeaderElement) {
             headerHeight = siteHeaderElement.offsetHeight;
         }
         if (canvas) {
              initParticles(); // Re-init particles on resize
         }
    }

    // --- INITIALIZATION AND EVENT LISTENERS ---

    function initializeApp() {
        const observerOptions = { root: null, rootMargin: '0px', threshold: REVEAL_THRESHOLD };
        const sectionObserver = new IntersectionObserver(handleSectionIntersection, observerOptions);
        sections.forEach(section => {
            if (section) sectionObserver.observe(section);
        });

        startSubtitleTyping();
        updateFooterContent();
        setInterval(updateFooterContent, 60000);
        initParticles();

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
        window.addEventListener('resize', throttle(handleResize, 150), { passive: true });

        if (backToTopButtonElement) {
             backToTopButtonElement.addEventListener('click', (e) => {
                 e.preventDefault();
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             });
        }

        if (contactFormElement) {
            contactFormElement.addEventListener('submit', handleContactFormSubmit);
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }
        if (siteNav) {
            siteNav.addEventListener('click', (e) => {
                // Use closest to handle clicks on elements inside the link if needed
                const link = e.target.closest('a');
                if (link && siteNav.classList.contains('active')) {
                    // Check if it's an internal link before closing
                     if (link.getAttribute('href').startsWith('#')) {
                         toggleMobileMenu();
                     }
                }
            });
        }

         const primaryColor = getCssVariable('--accent-color-primary') || '#ff33cc';
         const bgColor = getCssVariable('--bg-color-primary') || '#0d0221';
         console.log(`%c VAPORWAVE UI v3.0 Initialized. SYSTEM ONLINE. `,
                     `background: ${primaryColor}; color: ${bgColor}; font-weight: bold; padding: 4px 8px; border-radius: 3px; font-family: 'Audiowide', sans-serif;`);
    }

    // --- RUN INITIALIZATION ---

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    // Optional cleanup
    window.addEventListener('beforeunload', () => {
        stopAnimation();
    });

} // End of initializeVaporwaveInterface

initializeVaporwaveInterface();