/**
 * by.nicocieplak — JS principal (sin dependencias)
 * La cabeza 3D se carga aparte y recién cuando la página ya está visible.
 */

const CONFIG = {
  // ⚠️ Reemplazá por tu número real (código de país + área, sin + ni espacios)
  whatsappNumber: '5493410000000',
  brandName: 'by.nicocieplak',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initWhatsAppLinks();
  initCounters();
  initSpeedometer();
  initSpotlightCards();
  loadHeroHead();
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
});

/* 1. Header: transparente arriba, sólido al scrollear ----------------------- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* 2. Menú móvil accesible (Esc, clic afuera, cierre al navegar) ------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
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

/* 3. Links de WhatsApp con mensaje según el botón ---------------------------
   Se arman al cargar (no al hacer clic) para que funcionen también con
   clic del medio, "abrir en pestaña nueva" o mantener apretado en el celular. */
function initWhatsAppLinks() {
  const phone = CONFIG.whatsappNumber.replace(/\D/g, '');
  document.querySelectorAll('[data-wa]').forEach((link) => {
    const service = link.getAttribute('data-wa') || 'Consulta general';
    const text = `Hola Nico, vi tu web ${CONFIG.brandName} y quiero consultar por: ${service}. ¿Podemos coordinar?`;
    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  });
}

/* 4. Contadores: el HTML ya trae el valor final (sirve sin JS y para SEO);
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

/* 5. Velocímetro ------------------------------------------------------------ */
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

/* 6. Tarjetas de servicios: el brillo sigue al cursor ----------------------- */
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

/* 7. Cabeza 3D: se descarga después de que la página ya cargó ---------------
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
    script.src = 'assets/js/hero-head.min.js';
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
