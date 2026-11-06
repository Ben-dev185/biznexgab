/* ==========================================================
   Biznex Gab – scripts du site
   Chaque module vérifie que ses éléments existent : le même
   fichier sert pour index.html et mentions-legales.html.
   ========================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Menu mobile ------------------------------------------ */
  function initMenu() {
    const burger = $('.burger');
    const menu = $('#menu');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', menu.classList.toggle('ouvert'));
    });
    menu.addEventListener('click', (e) => {
      if (!e.target.closest('a')) return;
      menu.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  /* 2. En-tête : ombre au défilement + barre de progression --- */
  function initHeader() {
    const header = $('header');
    const bar = $('#progress');

    const update = () => {
      if (header) header.classList.toggle('scrolled', scrollY > 10);
      if (bar) {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      }
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  /* 3. Carrousel des services (flèches) ---------------------- */
  function initCarousel() {
    const track = $('#piste');
    if (!track) return;

    const step = () => $('.carte', track).offsetWidth + 20;
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: 'smooth' });

    $('#prev')?.addEventListener('click', () => go(-1));
    $('#next')?.addEventListener('click', () => go(1));
  }

  /* 4. Compteurs animés (une seule fois) --------------------- */
  function initCounters() {
    const counters = $$('[data-n]');
    if (!counters.length) return;

    const run = (el) => {
      const target = Number(el.dataset.n);
      if (reduceMotion || target === 0) {
        el.textContent = target;
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1100, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) return counters.forEach(run);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => observer.observe(el));
  }

  /* 5. Apparition au défilement ------------------------------ */
  function initReveal() {
    const targets = $$(
      '.tete, .carte, .engage div, .equipe > *, .contact > *, .marquee,' +
      '.faq-grid > div:first-child, .faq-liste details, .legal .wrap > *, .pied'
    );
    if (!targets.length) return;

    targets.forEach((el) => {
      el.classList.add('rev');
      const rank = [...el.parentElement.children].indexOf(el);
      el.style.setProperty('--d', `${Math.min(rank, 6) * 0.09}s`);
    });

    if (!('IntersectionObserver' in window)) {
      return targets.forEach((el) => el.classList.add('vu'));
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('vu');
        observer.unobserve(el);
        // Une fois affiché, l'élément retrouve ses transitions normales (survol)
        setTimeout(() => {
          el.classList.remove('rev', 'vu');
          el.style.removeProperty('--d');
        }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el) => observer.observe(el));
  }

  /* 6. FAQ : une seule question ouverte à la fois ------------ */
  function initFaq() {
    const items = $$('#faq details');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  }

  /* 7. Bouton « Demander ce service » -> pré-remplit le formulaire */
  function initServicePrefill() {
    const select = $('#service');
    if (!select) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-service]');
      if (!link) return;
      const option = [...select.options].find((o) => o.text === link.dataset.service);
      if (option) select.value = option.text;
    });
  }

  /* 8. Formulaire de contact (envoi sans rechargement) -------- */
  function initForm() {
    const form = $('#form');
    const status = $('#statut');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Envoi en cours…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = 'Message envoyé. Nous vous répondons rapidement.';
      } catch {
        status.textContent = 'L’envoi a échoué. Réessayez ou contactez-nous directement.';
      }
    });
  }

  /* Démarrage ------------------------------------------------ */
  [initMenu, initHeader, initCarousel, initCounters, initReveal, initFaq, initServicePrefill, initForm]
    .forEach((init) => init());
})();
