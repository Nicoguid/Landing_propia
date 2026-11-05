/**
 * particle-head.js
 * Busto 3D hecho de partículas que sigue al mouse (Three.js).
 * La forma se genera por código (SDF), así que no necesitás ningún modelo 3D.
 *
 * Uso:
 *   import { createParticleHead } from './particle-head.js';
 *   const head = createParticleHead(document.querySelector('#hero-3d'));
 *   // head.destroy() para limpiarlo (ej: al desmontar un componente de React)
 */
import * as THREE from 'three';

const DEFAULTS = {
  count: 120000,           // cantidad de partículas (bajalo en mobile si hace falta)
  // 4 colores que "fluyen" sobre el busto (de abajo hacia arriba, más una onda animada)
  colors: ['#0070f3', '#38bdf8', '#3ad389', '#00e5ff'],
  sparkle: 0.06,           // porcentaje de partículas blancas que brillan
  size: 13,                // tamaño base de cada partícula
  mouseRadius: 0.16,       // radio del "agujero" alrededor del cursor (en pantalla)
  mouseForce: 0.35,        // cuánto empuja el cursor a las partículas
  lookStrength: 1,         // cuánto gira la cabeza hacia el cursor
  intro: true,             // animación de entrada (partículas que se juntan)
  lookY: 1.0,              // altura a la que mira la cámara (más alto = busto más abajo en pantalla)
  lookYNarrow: 1.0,        // lo mismo, en pantallas angostas
  cameraZ: 7.2,            // distancia de cámara en pantallas anchas (más = busto más chico)
  cameraZNarrow: 9.5,      // distancia de cámara en pantallas angostas (celular vertical)
};

/* ------------------------------------------------------------------ */
/*  1) Forma del busto: funciones de distancia (SDF)                   */
/*     Cada pieza (cráneo, cuello, hombros) es una figura simple      */
/*     y las uniones suaves (smin) las funden en una sola superficie.  */
/* ------------------------------------------------------------------ */
const len = (x, y, z) => Math.sqrt(x * x + y * y + z * z);

function ellipsoid(px, py, pz, cx, cy, cz, rx, ry, rz) {
  const x = px - cx, y = py - cy, z = pz - cz;
  const k0 = len(x / rx, y / ry, z / rz);
  const k1 = len(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return (k0 * (k0 - 1)) / k1;
}
function sphere(px, py, pz, cx, cy, cz, r) {
  return len(px - cx, py - cy, pz - cz) - r;
}
function capsule(px, py, pz, ax, ay, az, bx, by, bz, r) {
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  let h = (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz);
  h = Math.min(Math.max(h, 0), 1);
  return len(pax - bax * h, pay - bay * h, paz - baz * h) - r;
}
function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
const smax = (a, b, k) => -smin(-a, -b, k);

function bustSDF(px, py, pz) {
  const ax = Math.abs(px); // simetría izquierda/derecha

  // Cabeza lisa, sin rasgos: cráneo + parte de adelante + mandíbula suave
  let d = ellipsoid(px, py, pz, 0, 1.62, -0.06, 0.74, 0.86, 0.84);                 // cráneo
  d = smin(d, ellipsoid(px, py, pz, 0, 1.15, 0.1, 0.6, 0.8, 0.62), 0.3);           // frente / cara
  d = smin(d, capsule(ax, py, pz, 0.46, 1.0, -0.05, 0.08, 0.66, 0.3, 0.17), 0.3);  // mandíbula

  // Cuello, hombros y pecho
  d = smin(d, capsule(px, py, pz, 0, 0.0, -0.1, 0, 1.0, -0.12, 0.37), 0.18);
  d = smin(d, ellipsoid(px, py, pz, 0, -0.55, -0.1, 1.9, 0.62, 0.72), 0.45);
  d = smin(d, ellipsoid(px, py, pz, 0, -0.75, 0.12, 1.2, 0.7, 0.6), 0.3);

  return d;
}

/* ------------------------------------------------------------------ */
/*  2) Repartir partículas sobre la superficie                         */
/* ------------------------------------------------------------------ */
// Genera los puntos de a poco (unos ms por frame) para no congelar la página.
function createBustSampler(count) {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 3);
  for (let j = 0; j < randoms.length; j++) randoms[j] = Math.random();
  const e = 0.002;
  const BOTTOM = -1.05;

  // a) Grilla gruesa: guardamos solo las celdas que tocan la superficie,
  //    así no perdemos tiempo probando puntos en el aire.
  const C = 0.07; // tamaño de celda
  const cells = [];
  for (let x = -2.0; x < 2.0; x += C)
    for (let y = BOTTOM; y < 2.6; y += C)
      for (let z = -1.0; z < 1.2; z += C)
        if (Math.abs(bustSDF(x + C / 2, y + C / 2, z + C / 2)) < C) cells.push(x, y, z);
  const nCells = cells.length / 3;

  // b) Punto al azar dentro de una celda -> se proyecta sobre la superficie
  function sampleOne(i) {
    const c = ((Math.random() * nCells) | 0) * 3;
    let x = cells[c] + Math.random() * C;
    let y = cells[c + 1] + Math.random() * C;
    let z = cells[c + 2] + Math.random() * C;

    // Menos densidad en hombros para que la cara tenga protagonismo
    if (y < 0.2 && Math.random() < 0.5) return false;

    // Gradiente "tetraédrico" (4 evaluaciones) para encontrar la normal
    let nx = 0, ny = 0, nz = 0;
    for (let it = 0; it < 3; it++) {
      const a = bustSDF(x + e, y - e, z - e);
      const b = bustSDF(x - e, y - e, z + e);
      const cc = bustSDF(x - e, y + e, z - e);
      const f = bustSDF(x + e, y + e, z + e);
      const d = (a + b + cc + f) * 0.25;
      nx = a - b - cc + f; ny = -a - b + cc + f; nz = -a + b - cc + f;
      const l = len(nx, ny, nz) || 1;
      nx /= l; ny /= l; nz /= l;
      x -= nx * d; y -= ny * d; z -= nz * d;
    }
    if (y < BOTTOM) return false;

    const k = i * 3;
    positions[k] = x; positions[k + 1] = y; positions[k + 2] = z;
    normals[k] = nx; normals[k + 1] = ny; normals[k + 2] = nz;
    return true;
  }

  const sampler = {
    positions, normals, randoms, count, filled: 0,
    /** Genera puntos durante `budgetMs` milisegundos. Devuelve cuántos hay listos. */
    step(budgetMs = 6) {
      const t0 = performance.now();
      while (sampler.filled < count && performance.now() - t0 < budgetMs) {
        for (let j = 0; j < 256 && sampler.filled < count; j++) {
          if (sampleOne(sampler.filled)) sampler.filled++;
        }
      }
      return sampler.filled;
    },
  };
  return sampler;
}

/* ------------------------------------------------------------------ */
/*  3) Shaders                                                         */
/* ------------------------------------------------------------------ */
const vertexShader = /* glsl */ `
  attribute vec3 aRandom;

  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uLook;
  uniform vec2  uMouse;
  uniform float uMouseStrength;
  uniform float uMouseRadius;
  uniform float uMouseForce;
  uniform float uAspect;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vLight;
  varying float vColorT;
  varying float vSpark;
  varying float vFade;
  varying float vHit;

  uniform float uSparkle;

  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }

  void main() {
    vec3 p = position;
    vec3 n = normal;

    // La cabeza gira completa, los hombros apenas (como un cuello real)
    float headW = mix(0.25, 1.0, smoothstep(0.1, 0.9, p.y));
    vec3 pivot = vec3(0.0, 0.55, -0.1);
    mat3 R = rotY(uLook.x * headW) * rotX(uLook.y * headW);
    p = R * (p - pivot) + pivot;
    n = R * n;

    // "Respiración": vibración mínima de cada partícula
    p += n * sin(uTime * 1.4 + aRandom.x * 6.2831) * 0.006;

    // Animación de entrada: de una nube dispersa a la forma final
    vec3 scattered = (aRandom.yzx - 0.5) * vec3(7.0, 6.0, 4.0) + vec3(0.0, 0.6, 1.0);
    float t = clamp((uProgress - aRandom.x * 0.45) / 0.55, 0.0, 1.0);
    t = 1.0 - pow(1.0 - t, 3.0);
    p = mix(scattered, p, t);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Interacción con el cursor: se calcula en pantalla y se empuja hacia afuera
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 diff = ndc - uMouse;
    diff.x *= uAspect;
    float dist = length(diff);
    float hit = (1.0 - smoothstep(0.0, uMouseRadius, dist)) * uMouseStrength;
    vec2 dir = dist > 0.0001 ? diff / dist : vec2(0.0);
    mv.xy += dir * hit * uMouseForce * (0.5 + aRandom.y);
    mv.z  += hit * 0.3 * aRandom.z;

    gl_Position = projectionMatrix * mv;

    // Luz falsa para que se lea el volumen de la cara
    vec3 nv = normalize(normalMatrix * n);
    vec3 L = normalize(vec3(-0.45, 0.55, 0.8));
    float diffuse = max(dot(nv, L), 0.0);
    float rim = pow(1.0 - abs(nv.z), 2.0);
    float sparkle = aRandom.y > 0.92 ? 1.6 : 1.0;
    float body = mix(0.8, 1.0, smoothstep(-0.7, 0.5, position.y)); // hombros más apagados
    vLight = (0.06 + diffuse * 0.95 + rim * 0.3) * sparkle * body;

    // Posición en la paleta: abajo -> arriba + ondas que se mueven con el tiempo
    float flow = sin(position.x * 1.8 + position.y * 1.2 + uTime * 0.5) * 0.5
               + sin(position.z * 2.3 - position.y * 1.7 - uTime * 0.35) * 0.5;
    vColorT = clamp(0.35 + 0.27 * position.y + flow * 0.22 + (aRandom.z - 0.5) * 0.15, 0.0, 1.0);
    vSpark = step(1.0 - uSparkle, aRandom.y);
    vFade = smoothstep(-1.05, -0.25, position.y) * smoothstep(1.9, 1.0, abs(position.x));
    vHit = hit;

    gl_PointSize = uSize * uPixelRatio * (0.55 + aRandom.z * 0.9) / -mv.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  uC0;
  uniform vec3  uC1;
  uniform vec3  uC2;
  uniform vec3  uC3;
  uniform float uOpacity;

  varying float vLight;
  varying float vColorT;
  varying float vSpark;
  varying float vFade;
  varying float vHit;

  vec3 palette(float t) {
    t *= 3.0;
    if (t < 1.0) return mix(uC0, uC1, t);
    if (t < 2.0) return mix(uC1, uC2, t - 1.0);
    return mix(uC2, uC3, t - 2.0);
  }

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;

    vec3 col = palette(vColorT);
    col = mix(col, vec3(1.0), vSpark * 0.7);      // algunas partículas blancas
    col *= vLight;
    col = mix(col, vec3(1.0), vHit * 0.4);        // brillo donde toca el cursor

    gl_FragColor = vec4(col, vFade * uOpacity);
  }
`;

/* ------------------------------------------------------------------ */
/*  4) Escena + loop                                                   */
/* ------------------------------------------------------------------ */
export function createParticleHead(container, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia?.('(pointer: coarse)').matches;
  const count = isMobile ? Math.round(o.count * 0.55) : o.count;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    // Sin WebGL (navegador viejo o desactivado): la página sigue funcionando sin la cabeza
    console.warn('[particle-head] WebGL no disponible', err);
    return { setColors() {}, destroy() {} };
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.pointerEvents = 'none'; // no bloquea clics en botones/textos
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, o.lookY, o.cameraZ);
  camera.lookAt(0, o.lookY, 0);

  const sampler = createBustSampler(count);
  const posAttr = new THREE.BufferAttribute(sampler.positions, 3).setUsage(THREE.DynamicDrawUsage);
  const nrmAttr = new THREE.BufferAttribute(sampler.normals, 3).setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('normal', nrmAttr);
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(sampler.randoms, 3));
  geometry.setDrawRange(0, 0);
  // La caja envolvente es fija (los puntos se mueven en el shader)
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.7, 0), 3);

  function growGeometry() {
    const before = sampler.filled;
    const after = sampler.step(6);
    if (after === before) return;
    posAttr.clearUpdateRanges(); nrmAttr.clearUpdateRanges();
    posAttr.addUpdateRange(before * 3, (after - before) * 3);
    nrmAttr.addUpdateRange(before * 3, (after - before) * 3);
    posAttr.needsUpdate = true; nrmAttr.needsUpdate = true;
    geometry.setDrawRange(0, after);
  }

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: o.intro && !reduceMotion ? 0 : 1 },
    uLook: { value: new THREE.Vector2() },
    uMouse: { value: new THREE.Vector2(9, 9) },
    uMouseStrength: { value: 0 },
    uMouseRadius: { value: o.mouseRadius },
    uMouseForce: { value: o.mouseForce },
    uAspect: { value: 1 },
    uSize: { value: o.size },
    uPixelRatio: { value: pixelRatio },
    uC0: { value: new THREE.Color(o.colors[0]) },
    uC1: { value: new THREE.Color(o.colors[1]) },
    uC2: { value: new THREE.Color(o.colors[2]) },
    uC3: { value: new THREE.Color(o.colors[3]) },
    uSparkle: { value: o.sparkle },
    uOpacity: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    // Con depth las partículas de adelante tapan a las de atrás (y al texto),
    // así el volumen de la cara se lee mucho mejor
    transparent: true,
    depthTest: true,
    depthWrite: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // --- Tamaño ---
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En pantallas angostas alejamos la cámara para que entre el busto
    const aspect = w / h;
    const t = Math.min(Math.max((aspect - 0.6) / 0.6, 0), 1); // 0 = celular, 1 = escritorio
    camera.position.z = o.cameraZNarrow + (o.cameraZ - o.cameraZNarrow) * t;
    const ly = o.lookYNarrow + (o.lookY - o.lookYNarrow) * t;
    camera.position.y = ly;
    camera.lookAt(0, ly, 0);
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // --- Mouse / touch ---
  const pointer = new THREE.Vector2(0, 0);   // posición del cursor en NDC (-1..1)
  const mouseSmooth = new THREE.Vector2(9, 9);
  let pointerInside = false;
  let lastMove = -Infinity;

  function onPointerMove(e) {
    const r = container.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointerInside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (mouseSmooth.x > 5) mouseSmooth.copy(pointer);
    lastMove = performance.now();
  }
  function onPointerLeave() { pointerInside = false; }
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);

  // --- Pausar cuando no se ve (ahorra batería) ---
  let visible = true;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(container);

  // --- Loop ---
  const clock = new THREE.Clock();
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (sampler.filled < sampler.count) growGeometry();
    uniforms.uTime.value = reduceMotion ? 0 : t;

    if (uniforms.uProgress.value < 1) {
      uniforms.uProgress.value = Math.min(1, uniforms.uProgress.value + dt / 2.2);
    }

    // Hacia dónde mira: al cursor, o un vaivén suave si no hay mouse (mobile)
    const idle = performance.now() - lastMove > 4000;
    const targetX = idle ? Math.sin(t * 0.4) * 0.25 : pointer.x * 0.6;
    const targetY = idle ? Math.sin(t * 0.3) * 0.06 : -pointer.y * 0.3;
    const k = 1 - Math.exp(-dt * 3.5);
    uniforms.uLook.value.x += (targetX * o.lookStrength - uniforms.uLook.value.x) * k;
    uniforms.uLook.value.y += (targetY * o.lookStrength - uniforms.uLook.value.y) * k;

    // El "agujero" sigue al cursor con un poquito de retraso
    const km = 1 - Math.exp(-dt * 10);
    mouseSmooth.x += (pointer.x - mouseSmooth.x) * km;
    mouseSmooth.y += (pointer.y - mouseSmooth.y) * km;
    uniforms.uMouse.value.copy(mouseSmooth);
    const sTarget = pointerInside && !reduceMotion ? 1 : 0;
    uniforms.uMouseStrength.value += (sTarget - uniforms.uMouseStrength.value) * (1 - Math.exp(-dt * 4));

    renderer.render(scene, camera);
  }
  tick();

  return {
    /** Cambiar la paleta en caliente: head.setColors(['#0070f3', '#38bdf8', '#3ad389', '#00e5ff']) */
    setColors(colors) {
      [uniforms.uC0, uniforms.uC1, uniforms.uC2, uniforms.uC3].forEach((u, i) => colors[i] && u.value.set(colors[i]));
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
