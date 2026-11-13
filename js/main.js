/**
 * Inspireshift Technologies - Main Interactive Logic
 * Handles navigation, mobile menu, scroll-reveal, smooth anchor scrolling, and UI states.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initServicesNav();
  initCurrentYear();
});

/**
 * Navbar scroll elevation & mobile menu toggle
 */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!header) return;

  // Header shadow on scroll
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.contains('is-open');
      toggleMenu(!isOpen);
    });

    // Close on navigation click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('is-open') && !header.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });
  }

  function toggleMenu(open) {
    if (!toggleBtn || !navLinks) return;
    toggleBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      navLinks.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  // Active page indicator
  highlightCurrentPage();
}

/**
 * Highlight nav links based on pathname or active hash section
 */
function highlightCurrentPage() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('#')[0].split('/').pop();

    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else if (currentPath === 'index.html' && href.startsWith('#')) {
      // Handled by scroll observer on single-page sections
    } else {
      link.classList.remove('active');
    }
  });
}



/**
 * Smooth scrolling with sticky header offset
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 84;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL hash without causing jumps
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });
}

/**
 * Services page sub-navigation active indicator
 */
function initServicesNav() {
  const navBtns = document.querySelectorAll('.services-nav-btn');
  const sections = document.querySelectorAll('.service-detail-section');

  if (!navBtns.length || !sections.length) return;

  const navList = navBtns[0].parentElement;
  if (!navList) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        let activeBtn = null;

        navBtns.forEach(btn => {
          const isActive = btn.getAttribute('href') === `#${id}`;
          btn.classList.toggle('active', isActive);
          if (isActive) activeBtn = btn;
        });

        if (activeBtn) {
          const listRect = navList.getBoundingClientRect();
          const buttonRect = activeBtn.getBoundingClientRect();
          let scrollDelta = 0;

          if (buttonRect.left < listRect.left) {
            scrollDelta = buttonRect.left - listRect.left - 8;
          } else if (buttonRect.right > listRect.right) {
            scrollDelta = buttonRect.right - listRect.right + 8;
          }

          if (scrollDelta) {
            navList.scrollBy({ left: scrollDelta, behavior: 'smooth' });
          }
        }
      }
    });
  }, {
    rootMargin: '-20% 0px -65% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
}

/**
 * Dynamic copyright year
 */
function initCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
