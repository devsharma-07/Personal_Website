/**
 * interactions.js
 * Hover effects: bold active entry, fade siblings
 * Contact form handling
 */

(function () {

  // ── Entry list hover effects ─────────────────────────────────
  const lists = document.querySelectorAll('.entry-list');

  lists.forEach(list => {
    const entries = list.querySelectorAll('.entry');

    entries.forEach(entry => {
      entry.addEventListener('mouseenter', () => {
        list.classList.add('is-hovered');
      });

      entry.addEventListener('mouseleave', () => {
        list.classList.remove('is-hovered');
      });
    });
  });

  // ── Contact form ─────────────────────────────────────────────
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('.form-btn');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value,
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          status.textContent = 'Message received. We will be in touch.';
          status.style.color = '#444';
          form.reset();
        } else {
          status.textContent = 'Something went wrong. Please try again.';
          status.style.color = '#c00';
        }
      } catch {
        status.textContent = 'Unable to reach server. Please try again later.';
        status.style.color = '#c00';
      }

      btn.textContent = 'Initiate Contact';
      btn.disabled = false;
    });
  }

  // ── Smooth scroll for nav links ──────────────────────────────
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href) || document.querySelector(href + '-content');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

})();
