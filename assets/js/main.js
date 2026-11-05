/**
 * by.nicocieplak — JS principal (sin dependencias)
 * La cabeza 3D se carga aparte y recién cuando la página ya está visible.
 * Las traducciones al inglés están en assets/js/i18n.js.
 */

const CONFIG = {
  // Número de WhatsApp (código de país + área, sin + ni espacios): +54 9 11 3674-0676
  whatsappNumber: '5491136740676',
};

// Cambiá este valor cada vez que subas cambios: obliga al navegador a bajar
// la versión nueva de la cabeza 3D en lugar de usar la que tiene guardada.
// (Usá el mismo valor en los ?v= de index.html)
const ASSET_VERSION = '20261105h';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const I18N = window.I18N || { en: {}, ui: { es: {}, en: {} }, whatsapp: { es: null, en: null } };
let currentLang = 'es';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();          // primero: guarda los textos en español antes de tocar nada
  initReveal();
  initHeader();
  initMobileMenu();
  initWhatsAppLinks();
  initQuoteForm();
  initSmoothScroll();
  initCaseVideos();
  initFloatingWhatsApp();
  initCounters();
  initSpeedometer();
  initSpotlightCards();
  loadHeroHead();
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
});

/* 0. Utilidades ------------------------------------------------------------- */
const t = (key) => (I18N.ui[currentLang] || {})[key] || (I18N.ui.es || {})[key] || key;
const waPhone = () => CONFIG.whatsappNumber.replace(/\D/g, '');
const waUrl = (text) => `https://wa.me/${waPhone()}?text=${encodeURIComponent(text)}`;
const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* modo privado: no pasa nada */ } },
};

/* 1. Idioma ES / EN ----------------------------------------------------------
   El español está en el HTML. Al cargar se guarda una copia de cada texto,
   así al volver de inglés a español se restaura sin escribirlo dos veces. */
const ES = {};

function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { ES[el.dataset.i18n] ??= el.textContent.trim(); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { ES[el.dataset.i18nHtml] ??= el.innerHTML.trim(); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    eachAttr(el, (attr, key) => { ES[key] ??= el.getAttribute(attr) || ''; });
  });
  ES['meta.title'] = document.title;
  ES['meta.description'] = document.querySelector('meta[name="description"]')?.content || '';

  const toggle = document.querySelector('.lang-toggle');
  toggle?.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang, true));
  });

  // ?lang=en en la URL tiene prioridad (útil para compartir el link en inglés)
  const fromUrl = new URLSearchParams(location.search).get('lang');
  const saved = storage.get('lang');
  // Sin preferencia guardada: si el navegador no está en español, arranca en inglés
  const browserLangs = navigator.languages || [navigator.language || 'es'];
  const fromBrowser = browserLangs.some((l) => /^es\b/i.test(l)) ? 'es' : 'en';
  const initial = ['es', 'en'].includes(fromUrl) ? fromUrl : ['es', 'en'].includes(saved) ? saved : fromBrowser;
  if (initial !== 'es') setLang(initial, false);
}

function eachAttr(el, fn) {
  el.dataset.i18nAttr.split(';').forEach((pair) => {
    const [attr, key] = pair.split(':').map((s) => s.trim());
    if (attr && key) fn(attr, key);
  });
}

function setLang(lang, remember) {
  if (lang === currentLang) return;
  currentLang = lang;
  const dict = lang === 'es' ? ES : { ...ES, ...I18N.en };

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const v = dict[el.dataset.i18nHtml];
    if (v == null) return;
    el.innerHTML = v;
    if (el.dataset.split === '1') splitWords(el); // re-armar la animación por palabra
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    eachAttr(el, (attr, key) => { if (dict[key] != null) el.setAttribute(attr, dict[key]); });
  });

  document.documentElement.lang = lang;
  document.title = dict['meta.title'];
  document.querySelector('meta[name="description"]')?.setAttribute('content', dict['meta.description']);

  const toggle = document.querySelector('.lang-toggle');
  if (toggle) {
    toggle.dataset.active = lang;
    toggle.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  const menu = document.getElementById('menu-toggle');
  if (menu) menu.setAttribute('aria-label', menu.getAttribute('aria-expanded') === 'true' ? t('menuClose') : t('menuOpen'));

  updateVideoLabels();
  initWhatsAppLinks();
  if (remember) storage.set('lang', lang);
}


/* 2. Títulos que aparecen palabra por palabra -------------------------------- */
function splitWords(root) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const outer = document.createElement('span');
          outer.className = 'w';
          const inner = document.createElement('span');
          inner.className = 'wi';
          inner.style.setProperty('--i', String(i++));
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(root);
}

function initReveal() {
  const titles = document.querySelectorAll('[data-reveal]');
  if (!titles.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;
  titles.forEach((el) => { splitWords(el); el.dataset.split = '1'; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
  titles.forEach((el) => io.observe(el));
}

/* 2b. Scroll suave al tocar un link del menú ---------------------------------
   Se hace con JS (y no con scroll-behavior de CSS) para que se deslice siempre,
   también en Windows con "efectos de animación" apagados, y para descontar
   la altura del header fijo. */
function initSmoothScroll() {
  const header = document.getElementById('site-header');
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let raf = 0;

  const scrollToY = (to) => {
    cancelAnimationFrame(raf);
    const from = window.scrollY;
    const dist = to - from;
    // Más lejos = un poco más de tiempo, con tope (entre 450 y 900 ms)
    const duration = Math.min(900, Math.max(450, Math.abs(dist) * 0.35));
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, from + dist * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  // Si el usuario scrollea con la rueda o el dedo, se cancela la animación
  ['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, () => cancelAnimationFrame(raf), { passive: true }));

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    const offset = id === 'top' ? 0 : (header?.offsetHeight || 64) + 16;
    const y = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
    scrollToY(Math.max(0, y));
    history.pushState(null, '', `#${id}`);
    // Accesibilidad: el foco del teclado acompaña al scroll
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

/* 2c. Videos de los proyectos -----------------------------------------------
   Se reproducen solo cuando están en pantalla (ahorra batería y datos) y tienen
   botón de pausa. Con "reducir movimiento" arrancan pausados: se ven con el play. */
function initCaseVideos() {
  const videos = document.querySelectorAll('.case-video');
  if (!videos.length) return;

  videos.forEach((video) => {
    const btn = video.closest('.browser-window')?.querySelector('.video-toggle');
    let userPaused = prefersReducedMotion;
    const sync = () => {
      const paused = video.paused;
      btn?.setAttribute('data-paused', String(paused));
      btn?.setAttribute('aria-pressed', String(paused));
      btn?.setAttribute('aria-label', paused ? t('videoPlay') : t('videoPause'));
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    btn?.addEventListener('click', () => {
      if (video.paused) { userPaused = false; video.play().catch(() => {}); }
      else { userPaused = true; video.pause(); }
    });

    if (!('IntersectionObserver' in window)) { if (!userPaused) video.play().catch(() => {}); sync(); return; }
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !userPaused) video.play().catch(() => {});
      else if (!entry.isIntersecting) video.pause();
    }, { threshold: 0.35 }).observe(video);
    sync();
  });
}

function updateVideoLabels() {
  document.querySelectorAll('.video-toggle').forEach((btn) => {
    btn.setAttribute('aria-label', btn.getAttribute('data-paused') === 'true' ? t('videoPlay') : t('videoPause'));
  });
}

/* 3. Header: transparente arriba, sólido al scrollear ----------------------- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* 4. Menú móvil accesible (Esc, clic afuera, cierre al navegar) ------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? t('menuClose') : t('menuOpen'));
    if (open) drawer.querySelector('a')?.focus();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('is-open') && !drawer.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
}

/* 5. Links de WhatsApp con mensaje según el botón y el idioma ---------------
   Se arman al cargar (no al hacer clic) para que funcionen también con
   clic del medio, "abrir en pestaña nueva" o mantener apretado en el celular. */
function initWhatsAppLinks() {
  const wa = I18N.whatsapp[currentLang] || I18N.whatsapp.es;
  document.querySelectorAll('[data-wa]').forEach((link) => {
    const key = link.getAttribute('data-wa') || 'general';
    const topic = (wa && wa.topics[key]) || key;
    link.href = wa ? waUrl(wa.template(topic)) : `https://wa.me/${waPhone()}`;
  });
}

/* 6. "Armá tu pedido": arma el mensaje y abre WhatsApp ----------------------- */
function initQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const wa = I18N.whatsapp[currentLang] || I18N.whatsapp.es;
    const data = new FormData(form);
    const labelOf = (name) => form.querySelector(`input[name="${name}"]:checked + span`)?.textContent.trim() || '';
    const business = String(data.get('business') || '').trim();
    const name = String(data.get('name') || '').trim();

    const lines = [
      wa.form.hello,
      `• ${wa.form.business}: ${business || wa.form.none}`,
      `• ${wa.form.need}: ${labelOf('need')}`,
      `• ${wa.form.when}: ${labelOf('when')}`,
    ];
    if (name) lines.push(`${wa.form.name} ${name}.`);

    const url = waUrl(lines.join('\n'));
    const win = window.open(url, '_blank', 'noopener');
    if (!win) location.href = url; // si el navegador bloqueó la pestaña nueva
  });
}

/* 7. Botón flotante de WhatsApp: aparece cuando ya pasaste el hero ---------- */
function initFloatingWhatsApp() {
  const btn = document.querySelector('.wa-float');
  const hero = document.getElementById('top');
  if (!btn) return;
  if (!hero || !('IntersectionObserver' in window)) { btn.classList.add('is-visible'); return; }
  new IntersectionObserver(([entry]) => {
    btn.classList.toggle('is-visible', !entry.isIntersecting);
  }, { threshold: 0.15 }).observe(hero);
}

/* 8. Contadores: el HTML ya trae el valor final (sirve sin JS y para SEO);
      acá solo se anima de 0 a ese valor cuando entra en pantalla. ---------- */
function initCounters() {
  const items = document.querySelectorAll('[data-counter]');
  if (!items.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      const end = parseFloat(el.dataset.counter);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const duration = 1100;
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });

  items.forEach((el) => io.observe(el));
}

/* 9. Velocímetro ------------------------------------------------------------ */
function initSpeedometer() {
  const gauge = document.getElementById('speedometer');
  if (!gauge) return;
  if (!('IntersectionObserver' in window)) { gauge.classList.add('is-on'); return; }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      gauge.classList.add('is-on');
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(gauge);
}

/* 10. Tarjetas de servicios: el brillo sigue al cursor ---------------------- */
function initSpotlightCards() {
  const group = document.querySelector('[data-spotlight]');
  if (!group || window.matchMedia('(hover: none)').matches) return;
  group.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.spot-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - r.left}px`);
    card.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
}

/* 11. Cabeza 3D: se descarga después de que la página ya cargó --------------
   Así el texto y los botones aparecen al instante y three.js (~120 KB gzip)
   llega después, sin frenar la primera carga. */
function loadHeroHead() {
  const mount = document.getElementById('hero-head');
  if (!mount) return;
  if (navigator.connection && navigator.connection.saveData) return; // modo ahorro de datos

  // Script clásico (no módulo ES): así funciona también abriendo index.html
  // con doble clic (file://), donde el navegador bloquea los import().
  const start = () => {
    const script = document.createElement('script');
    script.src = `assets/js/hero-head.min.js?v=${ASSET_VERSION}`;
    script.async = true;
    script.onload = () => {
      try {
        window.HeroHead.mountHeroHead(mount);
      } catch (err) {
        console.warn('[hero-head] no se pudo iniciar', err);
      }
    };
    script.onerror = () => console.warn('[hero-head] no se pudo descargar assets/js/hero-head.min.js');
    document.body.appendChild(script);
  };

  const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200));
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
