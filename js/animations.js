/**
 * Inspireshift Technologies - Award-Style Animation Engine
 * Powered by GSAP 3 + ScrollTrigger + Lenis Smooth Scroll
 */

// Central Configuration for Tuning Speed and Effects
const CONFIG = {
  SPEED: 1, // Global duration multiplier (1 = normal, 0.7 = faster, 1.4 = slower)
  INTENSITY: {
    cursor: true,     // Desktop magnetic cursor dot + ring
    magnetic: true,   // Magnetic pull on buttons and cards
    particles: true,  // Interactive pixel squares in hero
    pinning: false    // Keep the services overview static and easy to navigate
  }
};

// 1. Mark JavaScript Active
document.documentElement.classList.add('js');

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;

  let lenisInstance = null;

  document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP & ScrollTrigger are available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded; falling back to static presentation.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
      handleReducedMotion();
      return;
    }

    // Initialize all signature moments
    initLenis();
    initIntroLoader();
    initCustomCursor();
    initPageTransitionCurtain();
    initScrollProgressBar();
    initNavbarScrollSpy();
    initHeroAwardExperience();
    initBigTypeScrub();
    initPinnedServicesStorytelling();
    initPinnedProcessTimeline();
    initMarqueeStrip();
    initWhyChooseUsCards();
    initCardSpotlightAndTilt();
    initMagneticButtons();
    initFooterHugeWordmark();
    initServicesPageExperience();
    initFormCelebrationHooks();

    // Refresh ScrollTrigger after window fully loads
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  });

  /* ==========================================================================
     0. Reduced Motion Fallback
     ========================================================================== */
  function handleReducedMotion() {
    document.body.classList.add('page-loaded');
    document.querySelectorAll('[data-scrub-text] .scrub-word').forEach(w => w.style.opacity = '1');
    const wordmark = document.querySelector('.footer-huge-wordmark');
    if (wordmark) wordmark.classList.add('is-filled');
  }

  /* ==========================================================================
     1. Lenis Smooth Inertial Scrolling
     ========================================================================== */
  function initLenis() {
    if (typeof Lenis === 'undefined' || isTouchDevice) return;

    try {
      lenisInstance = new Lenis({
        duration: 1.1 * CONFIG.SPEED,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false
      });

      lenisInstance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // Wire anchor clicks to smooth scroll
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId !== '#') {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              lenisInstance.scrollTo(targetEl, { offset: -80, duration: 1.2 * CONFIG.SPEED });
            }
          }
        });
      });
    } catch (e) {
      console.warn('Lenis initialization notice:', e);
    }
  }

  /* ==========================================================================
     2. Intro Loader Screen (1.6s Max, Session Controlled)
     ========================================================================== */
  function initIntroLoader() {
    const isLoaderSeen = sessionStorage.getItem('inspireshift_loader_seen');

    if (isLoaderSeen) {
      document.body.classList.add('page-loaded');
      return;
    }

    sessionStorage.setItem('inspireshift_loader_seen', 'true');

    // Create Intro Loader DOM
    const loader = document.createElement('div');
    loader.className = 'intro-loader-screen';
    loader.innerHTML = `
      <div class="intro-loader-content">
        <div class="intro-logo-wrap">
          <div class="intro-logo-glow"></div>
          <img src="assets/logo.png" alt="Inspireshift Logo" class="intro-logo-img">
        </div>
        <div class="intro-brand-title">Inspireshift</div>
        <div class="intro-tagline">Transforming Ideas into Digital Impact</div>
        <div class="intro-progress-bar-wrap">
          <div class="intro-progress-line"></div>
        </div>
      </div>
    `;
    document.body.prepend(loader);

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        document.body.classList.add('page-loaded');
        loader.remove();
        ScrollTrigger.refresh();
      }
    });

    const durationFactor = 1 * CONFIG.SPEED;

    tl.fromTo(loader.querySelector('.intro-logo-wrap'), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 * durationFactor })
      .fromTo(loader.querySelectorAll('.intro-brand-title, .intro-tagline'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.4 * durationFactor }, '-=0.3')
      .to(loader.querySelector('.intro-progress-line'), { width: '100%', duration: 0.6 * durationFactor, ease: 'power2.inOut' })
      .to(loader, { yPercent: -100, duration: 0.55 * durationFactor, ease: 'power4.inOut' }, '+=0.1');
  }

  /* ==========================================================================
     3. Custom Magnetic Cursor (Desktop)
     ========================================================================== */
  function initCustomCursor() {
    if (!CONFIG.INTENSITY.cursor || isTouchDevice) return;

    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';

    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    ring.innerHTML = `<span class="cursor-ring-label">View</span>`;

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    const label = ring.querySelector('.cursor-ring-label');

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    });

    // Expand over clickable elements with custom labels
    const interactiveSelectors = 'a, button, .card, .why-card, .portfolio-card, .industry-chip';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('is-hovering');
        if (el.classList.contains('portfolio-card')) {
          label.textContent = 'Explore';
        } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
          label.textContent = 'Open';
        } else {
          label.textContent = 'View';
        }
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-hovering');
      });
    });

    // Hide over inputs & textareas
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('mouseenter', () => {
        dot.classList.add('is-hidden');
        ring.classList.add('is-hidden');
      });
      field.addEventListener('mouseleave', () => {
        dot.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
      });
    });
  }

  /* ==========================================================================
     4. Page-to-Page Transition Curtain
     ========================================================================== */
  function initPageTransitionCurtain() {
    const curtain = document.createElement('div');
    curtain.className = 'page-transition-curtain';
    document.body.appendChild(curtain);

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;

      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          gsap.to(curtain, {
            yPercent: 0,
            duration: 0.45 * CONFIG.SPEED,
            ease: 'power3.inOut',
            onComplete: () => {
              window.location.href = link.href;
            }
          });
        });
      }
    });
  }

  /* ==========================================================================
     5. Scroll Progress Bar & Circular Back to Top
     ========================================================================== */
  function initScrollProgressBar() {
    // Top Progress Line
    let progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-bar';
      document.body.prepend(progressBar);
    }

    // Circular Back to Top Button
    const circleBtn = document.createElement('button');
    circleBtn.className = 'back-to-top-circle';
    circleBtn.setAttribute('aria-label', 'Back to top of page');
    circleBtn.innerHTML = `
      <svg class="back-to-top-svg" viewBox="0 0 44 44">
        <circle class="progress-track" cx="22" cy="22" r="20"/>
        <circle class="progress-indicator" cx="22" cy="22" r="20"/>
      </svg>
      <svg class="back-to-top-arrow" viewBox="0 0 24 24">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    `;
    document.body.appendChild(circleBtn);

    const indicator = circleBtn.querySelector('.progress-indicator');
    const circumference = 2 * Math.PI * 20; // ~125.6px
    indicator.style.strokeDasharray = circumference;

    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress;
        progressBar.style.width = `${progress * 100}%`;
        indicator.style.strokeDashoffset = circumference - (progress * circumference);

        if (self.scroll() > 500) {
          circleBtn.classList.add('is-visible');
        } else {
          circleBtn.classList.remove('is-visible');
        }
      }
    });

    circleBtn.addEventListener('click', () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.2 * CONFIG.SPEED });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ==========================================================================
     6. Navbar Scroll Elevation & Scroll-Spy
     ========================================================================== */
  function initNavbarScrollSpy() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -40',
      onUpdate: (self) => {
        if (self.direction === 1 || self.scroll() > 40) {
          header.classList.add('is-scrolled');
          header.classList.remove('is-transparent');
        } else {
          header.classList.remove('is-scrolled');
          header.classList.add('is-transparent');
        }
      }
    });

    // Scroll-Spy for In-Page Nav
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    document.querySelectorAll('section[id]').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => updateNavActive(section.id),
        onEnterBack: () => updateNavActive(section.id)
      });
    });

    function updateNavActive(id) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}` || href === `index.html#${id}`) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }
  }

  /* ==========================================================================
     7. Hero: 3D Headline Flip, Interactive Pixels & Parallax Scrub
     ========================================================================== */
  function initHeroAwardExperience() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // 1. Headline Word Splitting for 3D Stagger Flip
    const heroTitle = hero.querySelector('.hero-title');
    if (heroTitle && !heroTitle.dataset.gsapSplit) {
      heroTitle.dataset.gsapSplit = 'true';

      const nodes = Array.from(heroTitle.childNodes);
      heroTitle.innerHTML = '';

      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const words = node.textContent.trim().split(/\s+/);
          words.forEach(w => {
            const span = document.createElement('span');
            span.className = 'hero-word-flip';
            span.textContent = w;
            heroTitle.appendChild(span);
            heroTitle.appendChild(document.createTextNode(' '));
          });
        } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('hero-gradient-text')) {
          const words = node.textContent.trim().split(/\s+/);
          const gradWrapper = document.createElement('span');
          gradWrapper.className = 'hero-gradient-text';
          words.forEach(w => {
            const span = document.createElement('span');
            span.className = 'hero-word-flip';
            span.textContent = w;
            gradWrapper.appendChild(span);
            gradWrapper.appendChild(document.createTextNode(' '));
          });
          heroTitle.appendChild(gradWrapper);
        } else if (node.tagName === 'BR') {
          heroTitle.appendChild(document.createElement('br'));
        }
      });

      // Animate 3D Rise
      const words = heroTitle.querySelectorAll('.hero-word-flip');
      gsap.fromTo(words, {
        opacity: 0,
        y: 45,
        rotateX: -55
      }, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.06 * CONFIG.SPEED,
        duration: 0.9 * CONFIG.SPEED,
        ease: 'power3.out',
        delay: 0.2
      });

      // Subtext, infographic, and CTAs entrance
      gsap.fromTo(hero.querySelectorAll('.hero-subtext, .hero-lead, .hero-infographic, .hero-actions, .scroll-down-indicator'), {
        opacity: 0,
        y: 25
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.08 * CONFIG.SPEED,
        duration: 0.7 * CONFIG.SPEED,
        ease: 'power2.out',
        delay: 0.5
      });
    }

    // 2. Interactive Floating Logo-Themed Pixel Squares (~40)
    if (CONFIG.INTENSITY.particles) {
      let canvas = hero.querySelector('.hero-particles-canvas');
      if (!canvas) {
        canvas = document.createElement('div');
        canvas.className = 'hero-particles-canvas';
        hero.prepend(canvas);
      }

      const particles = [];
      const particleColors = ['#1452A0', '#6BA7CC', '#6E42A0', '#4CAC6A', '#BFDCE8'];

      for (let i = 0; i < 40; i++) {
        const sq = document.createElement('div');
        sq.className = 'hero-floating-square';
        const size = gsap.utils.random(5, 14);
        sq.style.width = `${size}px`;
        sq.style.height = `${size}px`;
        sq.style.backgroundColor = particleColors[i % particleColors.length];
        sq.style.opacity = gsap.utils.random(0.12, 0.32);

        const pData = {
          el: sq,
          baseX: gsap.utils.random(5, 95),
          baseY: gsap.utils.random(10, 85),
          x: 0,
          y: 0,
          vx: gsap.utils.random(-0.3, 0.3),
          vy: gsap.utils.random(-0.3, 0.3),
          size: size
        };

        sq.style.left = `${pData.baseX}%`;
        sq.style.top = `${pData.baseY}%`;

        canvas.appendChild(sq);
        particles.push(pData);
      }

      // Repel / Attract within 150px on desktop
      if (!isTouchDevice) {
        let mousePixX = -1000, mousePixY = -1000;
        window.addEventListener('mousemove', (e) => {
          const heroRect = hero.getBoundingClientRect();
          mousePixX = e.clientX - heroRect.left;
          mousePixY = e.clientY - heroRect.top;
        }, { passive: true });

        gsap.ticker.add(() => {
          particles.forEach(p => {
            const rect = p.el.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();
            const px = rect.left - heroRect.left + (p.size / 2);
            const py = rect.top - heroRect.top + (p.size / 2);

            const dx = mousePixX - px;
            const dy = mousePixY - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150 && dist > 0) {
              const force = (150 - dist) / 150;
              p.x -= (dx / dist) * force * 4;
              p.y -= (dy / dist) * force * 4;
            }

            p.x *= 0.92;
            p.y *= 0.92;

            p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
          });
        });
      }
    }

    // 3. Scroll Scrub: Hero Content Scales Down & Fades
    gsap.to(hero.querySelector('.hero-content'), {
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      scale: 0.93,
      opacity: 0.25,
      y: 60,
      ease: 'none'
    });
  }

  /* ==========================================================================
     8. Big-Type Reveal: Scroll-Scrubbed Text (Mission & Vision)
     ========================================================================== */
  function initBigTypeScrub() {
    const scrubStatements = document.querySelectorAll('.mv-quote, [data-scrub-text]');

    scrubStatements.forEach(quote => {
      const text = quote.textContent.trim();
      const words = text.split(/\s+/);
      quote.innerHTML = '';

      words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'scrub-word';
        span.textContent = word;
        quote.appendChild(span);
        quote.appendChild(document.createTextNode(' '));
      });

      const wordSpans = quote.querySelectorAll('.scrub-word');

      gsap.to(wordSpans, {
        scrollTrigger: {
          trigger: quote,
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: 0.5
        },
        opacity: 1,
        stagger: 0.05,
        ease: 'power1.inOut'
      });
    });
  }

  /* ==========================================================================
     9. Pinned Storytelling Section (Our Services: L, Q, C, T)
     ========================================================================== */
  function initPinnedServicesStorytelling() {
    if (!CONFIG.INTENSITY.pinning) return;

    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;

    ScrollTrigger.matchMedia({
      // Desktop Only (>= 1025px)
      '(min-width: 1025px)': function () {
        const stage = servicesSection.querySelector('.services-pinned-stage');
        if (!stage) return;

        const cards = stage.querySelectorAll('.services-pinned-card');
        const indicators = stage.querySelectorAll('.pinned-step-indicator');
        const progressBar = stage.querySelector('.pinned-progress-bar');
        const bigLetter = stage.querySelector('.services-giant-letter');
        const letters = ['L', 'Q', 'C', 'T'];

        const totalSteps = cards.length;
        if (totalSteps < 4) return;

        // Set initial states via GSAP to avoid CSS/GSAP conflict (CSS transition: none on pinned cards)
        gsap.set(cards[0], { opacity: 1, scale: 1, y: 0 });
        cards.forEach((card, i) => {
          if (i > 0) gsap.set(card, { opacity: 0, scale: 0.96, y: 30 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: servicesSection,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1
          }
        });

        cards.forEach((card, i) => {
          if (i > 0) {
            tl.to(cards[i - 1], { opacity: 0, scale: 0.95, y: -20, duration: 0.8, ease: 'power2.inOut' }, `step${i}`)
              .to(card, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power2.inOut' }, `step${i}`)
              .call(() => {
                bigLetter.textContent = letters[i];
                indicators.forEach((ind, idx) => ind.classList.toggle('active', idx === i));
              }, null, `step${i}`);
          }
          if (progressBar) {
            tl.to(progressBar, { height: `${((i + 1) / totalSteps) * 100}%`, duration: 0.8 }, `step${i}`);
          }
        });
      }
    });
  }

  /* ==========================================================================
     10. Process Timeline (simple scroll-reveal — no pinned horizontal scroll)
     ========================================================================== */
  function initPinnedProcessTimeline() {
    // Horizontal pinned scroll removed per QA feedback — 6 cards now show in
    // a single aligned row via CSS grid. Only keep the active-step highlight
    // using a simple IntersectionObserver so the section still feels dynamic.
    const processSection = document.getElementById('process');
    if (!processSection) return;

    const stepCards = processSection.querySelectorAll('.process-step');
    if (stepCards.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepCards.forEach(c => c.classList.remove('is-active-step'));
          entry.target.classList.add('is-active-step');
        }
      });
    }, { threshold: 0.6 });

    stepCards.forEach(card => observer.observe(card));
  }

  /* ==========================================================================
     11. Infinite Smooth Marquee Strip (Industries)
     ========================================================================== */
  function initMarqueeStrip() {
    const chipsCloud = document.querySelector('.chips-cloud');
    if (!chipsCloud) return;

    // Wrap in marquee track
    const parent = chipsCloud.parentElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'marquee-wrapper';

    const track = document.createElement('div');
    track.className = 'marquee-track';

    // Duplicate chips for seamless infinite loop
    const originalChips = Array.from(chipsCloud.children);
    originalChips.forEach(ch => track.appendChild(ch.cloneNode(true)));
    originalChips.forEach(ch => track.appendChild(ch.cloneNode(true)));

    wrapper.appendChild(track);
    chipsCloud.replaceWith(wrapper);

    // GSAP infinite horizontal scroll loop
    const trackWidth = track.scrollWidth / 2;

    const marqueeAnim = gsap.to(track, {
      x: -trackWidth,
      ease: 'none',
      duration: 28 * CONFIG.SPEED,
      repeat: -1
    });

    // Velocity scale on scroll
    ScrollTrigger.create({
      onUpdate: (self) => {
        const vel = Math.abs(self.getVelocity() / 300);
        gsap.to(marqueeAnim, {
          timeScale: 1 + Math.min(vel, 3),
          duration: 0.3,
          overwrite: 'auto',
          onComplete: () => {
            gsap.to(marqueeAnim, { timeScale: 1, duration: 0.6 });
          }
        });
      }
    });
  }

  /* ==========================================================================
     12. Why Choose Us: 01-06 Alternating Entrance & Numbers
     ========================================================================== */
  function initWhyChooseUsCards() {
    const whyCards = document.querySelectorAll('.why-card');
    if (!whyCards.length) return;
    const useHorizontalEntrance = window.matchMedia('(min-width: 1280px)').matches;

    whyCards.forEach((card, i) => {
      const fromLeft = i % 2 === 0;
      gsap.fromTo(card, {
        opacity: 0,
        x: useHorizontalEntrance ? (fromLeft ? -45 : 45) : 0,
        rotate: useHorizontalEntrance ? (fromLeft ? -4 : 4) : 0
      }, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 1,
        x: 0,
        rotate: 0,
        duration: 0.75 * CONFIG.SPEED,
        ease: 'back.out(1.2)'
      });
    });
  }

  /* ==========================================================================
     13. Cards: Magnetic Perspective Tilt & Spotlight Gradient
     ========================================================================== */
  function initCardSpotlightAndTilt() {
    if (!CONFIG.INTENSITY.magnetic || isTouchDevice) return;

    const cards = document.querySelectorAll('.card, .why-card, .portfolio-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);
        card.style.setProperty('--spotlight-opacity', '1');

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 900,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--spotlight-opacity', '0');
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }

  /* ==========================================================================
     14. Magnetic Buttons (Pull within 80px)
     ========================================================================== */
  function initMagneticButtons() {
    if (!CONFIG.INTENSITY.magnetic || isTouchDevice) return;

    const magneticElements = document.querySelectorAll('.btn--primary, .btn--secondary, .btn--purple');

    magneticElements.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        gsap.to(btn, {
          x: x * 0.32,
          y: y * 0.32,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }

  /* ==========================================================================
     15. Footer Huge Wordmark Gradient Fill on Scroll
     ========================================================================== */
  function initFooterHugeWordmark() {
    const wordmark = document.querySelector('.footer-huge-wordmark');
    if (!wordmark) return;

    ScrollTrigger.create({
      trigger: wordmark,
      start: 'top 85%',
      onEnter: () => wordmark.classList.add('is-filled'),
      onLeaveBack: () => wordmark.classList.remove('is-filled')
    });
  }

  /* ==========================================================================
     16. Services Page Sticky Index & Alternating Blocks
     ========================================================================== */
  function initServicesPageExperience() {
    const serviceBlocks = document.querySelectorAll('.service-detail-section');
    if (!serviceBlocks.length) return;
    const useHorizontalEntrance = window.matchMedia('(min-width: 1280px)').matches;

    serviceBlocks.forEach((block, idx) => {
      const fromLeft = idx % 2 === 0;
      const lead = block.querySelector('.service-detail-lead');
      const media = block.querySelector('.service-detail-media');

      if (lead) {
        gsap.fromTo(lead, { opacity: 0, x: useHorizontalEntrance ? (fromLeft ? -50 : 50) : 0 }, {
          scrollTrigger: {
            trigger: block,
            start: 'top 75%'
          },
          opacity: 1,
          x: 0,
          duration: 0.8 * CONFIG.SPEED,
          ease: 'power3.out'
        });
      }

      if (media) {
        gsap.fromTo(media, { opacity: 0, scale: 0.94 }, {
          scrollTrigger: {
            trigger: block,
            start: 'top 70%'
          },
          opacity: 1,
          scale: 1,
          duration: 0.8 * CONFIG.SPEED,
          ease: 'power3.out'
        });
      }
    });
  }

  /* ==========================================================================
     17. Contact Form Animation & Confetti Hooks
     ========================================================================== */
  function initFormCelebrationHooks() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Field stagger animation
    gsap.from(form.querySelectorAll('.form-group'), {
      scrollTrigger: {
        trigger: form,
        start: 'top 80%'
      },
      opacity: 0,
      y: 20,
      stagger: 0.07 * CONFIG.SPEED,
      duration: 0.6 * CONFIG.SPEED,
      ease: 'power2.out'
    });
  }

})();
