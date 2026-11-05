/**
 * Punto de entrada de la cabeza 3D del hero.
 * Se compila (con three.js adentro) a assets/js/hero-head.min.js con `npm run build:js`.
 */
import { createParticleHead } from './particle-head.js';

export function mountHeroHead(container) {
  const head = createParticleHead(container, {
    colorTop: '#e4ecff',    // blanco azulado
    colorBottom: '#00b8ff', // celeste de la marca
    lookY: 1.05,
    lookYNarrow: 0.95,
    cameraZ: 7.4,
    cameraZNarrow: 12.5,
  });
  // Fade-in del canvas una vez montado
  requestAnimationFrame(() => container.classList.add('is-ready'));
  return head;
}
