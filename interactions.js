/**
 * interactions.js
 * Hover effects: bold active entry, fade siblings
 * Contact form handling
 * Loading screen: typewriter belief + name reveal
 */

(function () {

  // ── Loading Screen ───────────────────────────────────────────
  const loader     = document.getElementById('loader');
  const beliefEl   = document.getElementById('loaderBelief');
  const nameEl     = document.getElementById('loaderName');
  const barEl      = document.getElementById('loaderBar');

  const BELIEF = "\u201CThe mind that opens to a new idea never returns to its original size.\u201D";

  // Animate the progress bar over the full loader duration
  const TOTAL_MS = 3800; // total loader visible time
  barEl.style.transition = `width ${TOTAL_MS}ms linear`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { barEl.style.width = '100%'; });
  });

  // Typewriter: one character every ~42ms
  let charIndex = 0;
  const TYPE_SPEED = 42;

  function typeNextChar() {
    if (charIndex < BELIEF.length) {
      beliefEl.textContent += BELIEF[charIndex++];
      setTimeout(typeNextChar, TYPE_SPEED);
    } else {
      // Done typing — blink cursor off, then reveal name
      beliefEl.classList.add('cursor-off');
      setTimeout(revealName, 420);
    }
  }

function revealName() {
    document.getElementById('loaderAttribution').classList.add('visible');
    nameEl.classList.add('visible');
    // After name is visible + user has had a beat to read, exit
    setTimeout(exitLoader, 1100);
  }

  function exitLoader() {
    loader.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => loader.remove(), 750);
  }

  // Tiny delay so fonts are loaded before we start
  setTimeout(typeNextChar, 280);

  // ── Currently Thinking About typewriter ──────────────────────
    const thinkingTyped  = document.getElementById('thinkingTyped');
    const thinkingCursor = document.getElementById('thinkingCursor');
    const THOUGHTS = ["human trust in AI.", "startup expansion.", "new challenges."];
    let thoughtIndex = 0;

    function typeThought(text, callback) {
      thinkingTyped.textContent = '';
      thinkingTyped.style.opacity = '1';
      thinkingCursor.classList.remove('hidden');
      let i = 0;
      function typeChar() {
        if (i < text.length) {
          thinkingTyped.textContent += text[i++];
          setTimeout(typeChar, 75);
        } else {
          // Done typing — hold 2s then fade out
          setTimeout(() => {
            thinkingCursor.classList.add('hidden');
            thinkingTyped.classList.add('fade-out');
            setTimeout(callback, 500); // wait for fade
          }, 2000);
        }
      }
      typeChar();
    }

    function nextThought() {
      thinkingTyped.classList.remove('fade-out');
      const text = THOUGHTS[thoughtIndex % THOUGHTS.length];
      thoughtIndex++;
      typeThought(text, nextThought);
    }

    // Start after a short delay
    setTimeout(nextThought, 800);

  // ── Sticky nav on scroll ─────────────────────────────────────
  const nav = document.getElementById('mainNav');
  const hero = document.getElementById('aboutme');

  function updateNav() {
    const aboutMe = document.getElementById('aboutme');
    const triggerPoint = aboutMe.getBoundingClientRect().top;
    if (triggerPoint <= 0) {
      nav.classList.add('sticky');
    } else {
      nav.classList.remove('sticky');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });

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

  // ── Projects Search & Filter ──────────────────────────────────
  const searchInput   = document.getElementById('projectSearch');
  const searchClear   = document.getElementById('searchClear');
  const noResults     = document.getElementById('projectsNoResults');
  const projectTags   = document.querySelectorAll('.ptag');
  let activeTag = 'all';

  function filterProjects() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const entries = document.querySelectorAll('#projects-list .entry');
    let visibleCount = 0;

    entries.forEach(entry => {
      const keywords = (entry.dataset.keywords || '').toLowerCase();
      const title    = (entry.querySelector('.entry-title')?.textContent || '').toLowerCase();
      const desc     = (entry.querySelector('.entry-desc')?.textContent || '').toLowerCase();
      const skills   = (entry.querySelector('.entry-skill-tags')?.textContent || '').toLowerCase();
      const allText  = keywords + ' ' + title + ' ' + desc + ' ' + skills;

      const matchesQuery = query === '' || allText.includes(query);
      const matchesTag   = activeTag === 'all' || allText.includes(activeTag);

      if (matchesQuery && matchesTag) {
        entry.classList.remove('hidden');
        visibleCount++;
      } else {
        entry.classList.add('hidden');
      }
    });

    if (noResults) {
      noResults.classList.toggle('visible', visibleCount === 0);
    }

    if (searchClear) {
      searchClear.classList.toggle('visible', query.length > 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProjects);
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      filterProjects();
    });
  }

  projectTags.forEach(tag => {
    tag.addEventListener('click', () => {
      projectTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeTag = tag.dataset.tag;
      filterProjects();
    });
  });

  // ── Experiences Search & Filter ───────────────────────────────
  const expSearchInput = document.getElementById('experienceSearch');
  const expSearchClear = document.getElementById('expSearchClear');
  const expNoResults   = document.getElementById('experiencesNoResults');
  const expTags        = document.querySelectorAll('.etag');
  let activeExpTag = 'all';

  function filterExperiences() {
    const query = expSearchInput ? expSearchInput.value.toLowerCase().trim() : '';
    const entries = document.querySelectorAll('#experiences-list .entry');
    let visibleCount = 0;

    entries.forEach(entry => {
      const keywords = (entry.dataset.keywords || '').toLowerCase();
      const title    = (entry.querySelector('.entry-title')?.textContent || '').toLowerCase();
      const desc     = (entry.querySelector('.entry-details')?.textContent || '').toLowerCase();
      const company  = (entry.querySelector('.entry-company')?.textContent || '').toLowerCase();
      const skills   = (entry.querySelector('.entry-skill-tags')?.textContent || '').toLowerCase();
      const allText  = keywords + ' ' + title + ' ' + desc + ' ' + company + ' ' + skills;

      const matchesQuery = query === '' || allText.includes(query);
      const matchesTag   = activeExpTag === 'all' || allText.includes(activeExpTag);

      if (matchesQuery && matchesTag) {
        entry.classList.remove('hidden');
        visibleCount++;
      } else {
        entry.classList.add('hidden');
      }
    });

    if (expNoResults) {
      expNoResults.classList.toggle('visible', visibleCount === 0);
    }

    if (expSearchClear) {
      expSearchClear.classList.toggle('visible', query.length > 0);
    }
  }

  if (expSearchInput) {
    expSearchInput.addEventListener('input', filterExperiences);
  }

  if (expSearchClear) {
    expSearchClear.addEventListener('click', () => {
      expSearchInput.value = '';
      filterExperiences();
    });
  }

  expTags.forEach(tag => {
    tag.addEventListener('click', () => {
      expTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeExpTag = tag.dataset.tag;
      filterExperiences();
    });
  });
  
  // ── Details Dropdowns ─────────────────────────────────────────
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const details = btn.nextElementSibling;
      const isOpen = details.classList.contains('open');

      details.classList.toggle('open', !isOpen);
      btn.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
      btn.textContent = isOpen ? 'Details ↓' : 'Details ↑';
    });
  });

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

  // ── Gallery Lightbox ──────────────────────────────────────────
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxClose   = document.getElementById('lightboxClose');
  const lightboxPrev    = document.getElementById('lightboxPrev');
  const lightboxNext    = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxVideo    = document.getElementById('lightboxVideo');
  const lightboxVideoSrc = document.getElementById('lightboxVideoSrc');

  // Build preview images (shown on homepage) per hobby
  const previewImages = {
    architecture: Array.from(document.querySelectorAll('.hobby-img[data-hobby="architecture"]')).map(i => i.src),
    clothing:     Array.from(document.querySelectorAll('.hobby-img[data-hobby="clothing"]')).map(i => i.src),
    events:       Array.from(document.querySelectorAll('.hobby-img[data-hobby="events"]')).map(i => i.src),
  };

  // Build full image sets (preview + extra) per hobby
  function buildFullSet(hobby) {
    const btn = document.querySelector(`.view-all-btn[data-hobby="${hobby}"]`);
    const extra = btn && btn.dataset.extra ? JSON.parse(btn.dataset.extra) : [];
    return [...previewImages[hobby], ...extra];
  }

  const fullImages = {
    architecture: buildFullSet('architecture'),
    clothing:     buildFullSet('clothing'),
    events:       buildFullSet('events'),
  };

  function isVideo(src) {
    return src.match(/\.(mp4|mov|webm)$/i);
  }

  function showMedia(src) {
    if (isVideo(src)) {
      lightboxImg.style.display = 'none';
      lightboxVideoSrc.src = src;
      lightboxVideo.load();
      lightboxVideo.style.display = 'block';
    } else {
      lightboxVideo.style.display = 'none';
      lightboxVideo.pause();
      lightboxImg.style.display = 'block';
      lightboxImg.src = src;
    }
  }

  let currentHobby = null;
  let currentIndex = 0;

  function openLightbox(hobby, index) {
    currentHobby = hobby;
    currentIndex = index;
    showMedia(fullImages[hobby][index]);
    lightboxCounter.textContent = `${index + 1} / ${fullImages[hobby].length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxVideo.pause();
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % fullImages[currentHobby].length;
    showMedia(fullImages[currentHobby][currentIndex]);
    lightboxCounter.textContent = `${currentIndex + 1} / ${fullImages[currentHobby].length}`;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + fullImages[currentHobby].length) % fullImages[currentHobby].length;
    showMedia(fullImages[currentHobby][currentIndex]);
    lightboxCounter.textContent = `${currentIndex + 1} / ${fullImages[currentHobby].length}`;
  }

  // Clicking a preview image opens at that index
  document.querySelectorAll('.hobby-img').forEach(img => {
    img.addEventListener('click', () => {
      openLightbox(img.dataset.hobby, parseInt(img.dataset.index));
    });
  });

  // Clicking view all always opens at index 0 with full set
  document.querySelectorAll('.view-all-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openLightbox(btn.dataset.hobby, 0);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closeLightbox();
  });
})();
