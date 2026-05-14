document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Typewriter Animation Engine ---
  const typewriterElement = document.getElementById('typewriter');
  const words = [
    'Laravel & PHP Solutions Architect',
    'Full Stack Web Developer',
    'B.E Information Technology Student',
    'Database & ERP Systems Specialist',
    'UI/UX & Frontend Enthusiast'
  ];
  
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    if (!typewriterElement) return;

    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
  }

  if (typewriterElement) {
    setTimeout(type, 1000);
  }


  // --- 2. Mobile Menu Drawer ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.toggle('translate-x-0');
      mobileMenu.classList.toggle('translate-x-full');
    }
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', toggleMobileMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
  });


  // --- 3. Scroll Reveal via IntersectionObserver ---
  // Mark body as JS-ready so CSS can safely hide elements for animation
  document.body.classList.add('js-reveal-ready');

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        const delay = entry.target.dataset.revealDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
          // Animate progress bars inside this element
          entry.target.querySelectorAll('.progress-fill').forEach(fill => {
            const pct = fill.getAttribute('data-percent');
            fill.style.width = `${pct}%`;
          });
          // Trigger stat counters inside this element
          entry.target.querySelectorAll('.stat-counter').forEach(el => {
            animateCounter(el);
          });
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Also reveal hero immediately (above the fold)
  document.querySelectorAll('#hero .reveal-on-scroll').forEach(el => {
    el.classList.add('is-visible');
    el.querySelectorAll('.progress-fill').forEach(fill => {
      fill.style.width = `${fill.getAttribute('data-percent')}%`;
    });
    el.querySelectorAll('.stat-counter').forEach(el => animateCounter(el));
  });


  // --- 4. Animated Stat Counter ---
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1400;
    const start = performance.now();
    const suffix = el.getAttribute('data-suffix') || '';

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }


  // --- 5. Scroll Spy: Active Navigation Links ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function scrollSpy() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', scrollSpy);


  // --- 6. Contact Form AJAX Handler ---
  const contactForm = document.getElementById('contact-form');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const toastNotification = document.getElementById('toast-notification');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
      const accessKey = accessKeyInput ? accessKeyInput.value : '';

      if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
        showToast("Config Required!", "Please configure your Web3Forms Access Key inside index.html to start receiving emails.", true);
        return;
      }

      const originalBtnContent = formSubmitBtn.innerHTML;
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending Message...
      `;

      const formData = new FormData(contactForm);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 200) {
          showToast("Message Sent!", "Thank you! Your message has been sent successfully.", false);
          contactForm.reset();
        } else {
          showToast("Send Failed!", data.message || "An error occurred. Please verify your Access Key.", true);
        }
      })
      .catch(() => {
        showToast("Connection Error!", "Failed to contact the server. Please check your internet connection.", true);
      })
      .finally(() => {
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = originalBtnContent;
      });
    });
  }

  function showToast(title, message, isError = false) {
    if (!toastNotification) return;

    const titleEl = toastNotification.querySelector('.ml-3 p:first-child');
    const msgEl = toastNotification.querySelector('.ml-3 p:last-child');
    const iconContainer = toastNotification.querySelector('.flex-shrink-0');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    if (isError) {
      toastNotification.classList.remove('border-emerald-500/30', 'shadow-emerald-500/10');
      toastNotification.classList.add('border-red-500/30', 'shadow-red-500/10');
      if (iconContainer) {
        iconContainer.className = "flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400";
        iconContainer.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
      }
    } else {
      toastNotification.classList.remove('border-red-500/30', 'shadow-red-500/10');
      toastNotification.classList.add('border-emerald-500/30', 'shadow-emerald-500/10');
      if (iconContainer) {
        iconContainer.className = "flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400";
        iconContainer.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
      }
    }

    toastNotification.classList.remove('translate-y-24', 'opacity-0');
    toastNotification.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toastNotification.classList.remove('translate-y-0', 'opacity-100');
      toastNotification.classList.add('translate-y-24', 'opacity-0');
    }, 5000);
  }

  const closeToastBtn = document.getElementById('close-toast-btn');
  if (closeToastBtn && toastNotification) {
    closeToastBtn.addEventListener('click', () => {
      toastNotification.classList.remove('translate-y-0', 'opacity-100');
      toastNotification.classList.add('translate-y-24', 'opacity-0');
    });
  }
})