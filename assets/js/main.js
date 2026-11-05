/**
 * ==========================================================================
 * by.nicocieplak — HIGH PERFORMANCE CORE JAVASCRIPT
 * RESEND ART DIRECTION & KIN 3D REACTIVE HERO
 * ==========================================================================
 */

const CONFIG = {
  whatsappNumber: '5493410000000',
  brandName: 'by.nicocieplak',
  defaultMessage: 'Hola Nico, estuve viendo tu portfolio by.nicocieplak y me gustaría cotizar una web a medida con código puro.'
};

document.addEventListener('DOMContentLoaded', () => {
  initGlobalCursorAura();
  initHeaderInteractions();
  initSmoothScroll();
  initMobileNavigation();
  initWhatsAppActions();
  initKin3DInteractiveHero();
  initProgressiveCounters();
  initSpeedometerAnimation();
});

/**
 * 1. AURA SPOTLIGHT GLOBAL QUE SIGUE EL CURSOR
 */
function initGlobalCursorAura() {
  const aura = document.getElementById('global-cursor-aura');
  if (!aura) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const renderAura = () => {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    aura.style.setProperty('--global-mouse-x', `${currentX.toFixed(1)}px`);
    aura.style.setProperty('--global-mouse-y', `${currentY.toFixed(1)}px`);
    requestAnimationFrame(renderAura);
  };
  requestAnimationFrame(renderAura);
}

/**
 * 2. DESPLAZAMIENTO SUAVE CINEMATOGRÁFICO (ANIMACIÓN REAL HACIA ARRIBA / ABAJO)
 * Garantiza animación visible a 60 FPS con curva easeInOutCubic en cualquier dispositivo
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const headerHeight = 72;

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || !href) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        e.stopPropagation();

        // Cerrar menú móvil si está abierto
        const mobileDrawer = document.getElementById('mobile-drawer');
        const menuToggle = document.getElementById('menu-toggle');
        if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
          mobileDrawer.classList.add('hidden');
          if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }

        const targetPosition = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerHeight);
        smoothScrollTo(targetPosition, 850);

        // Actualizar URL sin salto
        history.pushState(null, '', href);
      }
    });
  });
}

/**
 * Función de animación manual de scroll por requestAnimationFrame
 * Ignora cualquier reducción del sistema que intente forzar un salto instantáneo
 */
function smoothScrollTo(targetY, duration = 850) {
  const startY = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  let startTime = null;

  // Curva de aceleración y desaceleración fluida (easeInOutCubic)
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const step = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * ease);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

/**
 * 3. HEADER HAIRLINE SHIFT
 */
function initHeaderInteractions() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.borderBottomColor = 'rgba(0, 112, 243, 0.35)';
      header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
    } else {
      header.style.borderBottomColor = 'var(--color-graphite-hairline)';
      header.style.backgroundColor = 'rgba(0, 0, 0, 0.88)';
    }
  }, { passive: true });
}

/**
 * 4. KIN / MYKIN.AI 3D HEAD & GAZE TRACKING (REACTIVO AL MOUSE CON FÍSICA)
 */
function initKin3DInteractiveHero() {
  const card = document.getElementById('kin-card');
  const portrait = document.getElementById('kin-portrait');
  const eyeTracker = document.getElementById('kin-eye');
  const immersiveBtn = document.getElementById('immersive-toggle-btn');
  const statusBadge = document.getElementById('kin-status-text');

  if (!card || !portrait) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let targetCardRotX = 0;
  let targetCardRotY = 0;
  let currentCardRotX = 0;
  let currentCardRotY = 0;

  let targetHeadX = 0;
  let targetHeadY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let targetGazeX = 0;
  let targetGazeY = 0;

  let currentHeadX = 0;
  let currentHeadY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let currentGazeX = 0;
  let currentGazeY = 0;

  // Escuchar mouse en todo el viewport para que la mirada reaccione siempre
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    // Inclinación 3D de la tarjeta completa
    const normCardX = (mouseX - cardCenterX) / (window.innerWidth / 2);
    const normCardY = (mouseY - cardCenterY) / (window.innerHeight / 2);

    targetCardRotY = Math.max(-14, Math.min(14, normCardX * 14));
    targetCardRotX = Math.max(-12, Math.min(12, -normCardY * 12));

    // Luz local spotlight dentro de la tarjeta
    const localX = mouseX - cardRect.left;
    const localY = mouseY - cardRect.top;
    card.style.setProperty('--mouse-x', `${localX}px`);
    card.style.setProperty('--mouse-y', `${localY}px`);

    // Movimiento reactivo de la cabeza y mirada (Kin Style)
    const pRect = portrait.getBoundingClientRect();
    const pCenterX = pRect.left + pRect.width / 2;
    const pCenterY = pRect.top + pRect.height / 2;

    // Normalizado de -1 a 1 respecto al centro de la cara
    const normFaceX = Math.max(-1, Math.min(1, (mouseX - pCenterX) / (window.innerWidth * 0.4)));
    const normFaceY = Math.max(-1, Math.min(1, (mouseY - pCenterY) / (window.innerHeight * 0.4)));

    // Rotación evidente en 3D
    targetRotY = normFaceX * 22; // Hasta 22 grados horizontal
    targetRotX = -normFaceY * 18; // Hasta 18 grados vertical
    targetHeadX = normFaceX * 24; // Desplazamiento 24px
    targetHeadY = normFaceY * 20; // Desplazamiento 20px

    // Pupila / Mirada
    targetGazeX = normFaceX * 28;
    targetGazeY = normFaceY * 22;
  }, { passive: true });

  // Loop de renderizado a 60 FPS con suavizado LERP
  const updateKinMotion = () => {
    // Lerp suave para la tarjeta
    currentCardRotX += (targetCardRotX - currentCardRotX) * 0.08;
    currentCardRotY += (targetCardRotY - currentCardRotY) * 0.08;
    card.style.setProperty('--card-rot-x', `${currentCardRotX.toFixed(2)}deg`);
    card.style.setProperty('--card-rot-y', `${currentCardRotY.toFixed(2)}deg`);

    // Lerp suave para la cabeza (Rotación y traslación 3D)
    currentHeadX += (targetHeadX - currentHeadX) * 0.10;
    currentHeadY += (targetHeadY - currentHeadY) * 0.10;
    currentRotX += (targetRotX - currentRotX) * 0.10;
    currentRotY += (targetRotY - currentRotY) * 0.10;

    portrait.style.setProperty('--head-x', `${currentHeadX.toFixed(2)}px`);
    portrait.style.setProperty('--head-y', `${currentHeadY.toFixed(2)}px`);
    portrait.style.setProperty('--rot-x', `${currentRotX.toFixed(2)}deg`);
    portrait.style.setProperty('--rot-y', `${currentRotY.toFixed(2)}deg`);

    // Lerp para la mirada
    if (eyeTracker) {
      currentGazeX += (targetGazeX - currentGazeX) * 0.14;
      currentGazeY += (targetGazeY - currentGazeY) * 0.14;
      eyeTracker.style.setProperty('--gaze-x', `${currentGazeX.toFixed(2)}px`);
      eyeTracker.style.setProperty('--gaze-y', `${currentGazeY.toFixed(2)}px`);
    }

    requestAnimationFrame(updateKinMotion);
  };
  requestAnimationFrame(updateKinMotion);

  // Modo Inmersivo
  const toggleImmersive = () => {
    card.classList.toggle('is-focused');
    const isFocused = card.classList.contains('is-focused');
    
    if (statusBadge) {
      statusBadge.textContent = isFocused ? '● Modo Inmersivo Activo' : '● Interacción 3D en vivo (60 FPS)';
      statusBadge.style.color = isFocused ? 'var(--color-cyan-accent)' : 'var(--color-ash-gray)';
    }

    if (immersiveBtn) {
      immersiveBtn.textContent = isFocused ? 'Restaurar vista' : 'Probar transición inmersiva';
    }
  };

  card.addEventListener('click', toggleImmersive);
  if (immersiveBtn) {
    immersiveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleImmersive();
    });
  }
}

/**
 * 5. CONTADORES PROGRESIVOS ANIMADOS
 */
function initProgressiveCounters() {
  const counterElements = document.querySelectorAll('[data-counter-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-counter-target'));
        const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const suffix = el.getAttribute('data-counter-suffix') || '';

        animateCountUp(el, 0, target, 1200, decimals, prefix, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  counterElements.forEach(el => observer.observe(el));
}

function animateCountUp(element, start, end, duration, decimals = 0, prefix = '', suffix = '') {
  let startTime = null;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const value = easeOut * (end - start) + start;
    element.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}

/**
 * 6. VELOCÍMETRO ANIMADO DE 0.4s
 */
function initSpeedometerAnimation() {
  const needle = document.getElementById('speed-needle');
  const speedLabel = document.getElementById('speed-counter');
  if (!needle) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Rotar aguja desde -90deg hasta +45deg (velocidad extrema)
        needle.style.transform = 'rotate(45deg)';
        if (speedLabel) {
          animateCountUp(speedLabel, 0, 0.4, 1000, 1, '', 's');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(needle);
}

/**
 * 7. NAVEGACIÓN MÓVIL ACCESIBLE
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    drawer.classList.toggle('hidden');
  });

  const mobileLinks = drawer.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * 8. GESTOR DE CONVERSIÓN WHATSAPP
 */
function initWhatsAppActions() {
  const buttons = document.querySelectorAll('[data-wa-service]');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = btn.getAttribute('data-wa-service') || 'General';
      const cleanPhone = CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(`Hola Nico, vi tu web ${CONFIG.brandName} y quiero consultar por: ${service}. ¿Podemos coordinar?`);
      btn.setAttribute('href', `https://wa.me/${cleanPhone}?text=${message}`);
    });
  });
}
