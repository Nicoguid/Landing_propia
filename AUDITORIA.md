# Auditoría de la landing — by.nicocieplak

Revisión completa del código que estaba en `main` (commit `dcca2d4`) y qué se cambió.

## 🔴 Crítico (afecta clientes o credibilidad)

| # | Problema | Qué se hizo |
|---|----------|-------------|
| 1 | **Todos los botones de WhatsApp apuntan a un número falso** (`5493410000000`). Nadie te podía escribir. | Quedó en un solo lugar: `CONFIG.whatsappNumber` en `assets/js/main.js` (y en los `href` del HTML como respaldo). Configurado: +54 9 11 3674-0676. |
| 2 | **La imagen para redes (`og:image`) era la foto de una mujer** (`hero-portrait.jpg`, 614 KB). Al compartir el link en WhatsApp/LinkedIn aparecía ella. | Se borró y se generó `og-image.jpg` (1200×630) con el hero y tu marca. |
| 3 | **Tailwind por CDN (`cdn.tailwindcss.com`)**: es la versión "Play", que el propio Tailwind dice que no se use en producción. Descarga ~300 KB de JS y arma el CSS en el navegador → la página se ve sin estilos un instante y contradice el "carga en 0.4s". | Tailwind compilado: `assets/css/tailwind.css` pesa **3 KB gzip**. Se regenera con `npm run build`. |
| 4 | **El dominio `artesanal.dev`** está en canonical, og:url y og:image, pero la marca es by.nicocieplak. | No se tocó: **confirmá cuál es tu dominio real** y reemplazalo (4 lugares en `index.html`). |

## 🟠 Rendimiento

- **Google Fonts con `@import` dentro del CSS**: era una cadena de 3 descargas antes de mostrar texto. → Fuentes **self-hosted** en `assets/fonts/` con `preload` (Inter variable + Geist Mono).
- **Código muerto**: ~200 líneas de CSS y ~130 de JS del "efecto Kin" (`kin-card`, `kin-portrait`…) que buscaban elementos que no existen en el HTML. → Eliminado.
- **Aura global del cursor**: corría un `requestAnimationFrame` infinito (60 veces por segundo, para siempre) para un brillo al 5% casi invisible. Gasta batería en notebooks y celulares. → Eliminado; la cabeza 3D es ahora el único elemento animado "firma".
- **Imágenes con tamaño mal declarado**: decían `1280×800` pero son `800×600` → saltos de layout (CLS). → Corregido + versiones **WebP** (de 96/317 KB a 27/37 KB).
- **Cabeza 3D sin frenar la carga**: three.js (~124 KB gzip) se descarga **después** del evento `load`, en un momento ocioso. El texto y los botones aparecen primero. Se pausa cuando no está en pantalla, usa menos partículas en celular y no se carga con "ahorro de datos".

## 🟡 Accesibilidad

- **El scroll suave ignoraba "reducir movimiento"** (el comentario lo decía explícitamente). Eso es un problema real para gente con vértigo. → Scroll nativo con CSS, solo si el usuario no pidió reducir movimiento. También se cortan las animaciones en ese caso.
- **Contadores en `0`**: el HTML decía `0x`, `0%`, `0.0s`; sin JS (o para Google) las métricas valían cero. → El HTML trae el valor real y el JS solo anima.
- **Menú móvil**: no cerraba con `Esc` ni tocando afuera, y no movía el foco. → Arreglado.
- **Links de WhatsApp armados recién al hacer clic**: con clic del medio o "abrir en pestaña nueva" se perdía el mensaje. Además algunos no tenían `target="_blank"`. → Se arman al cargar, todos abren pestaña nueva.
- Íconos del navegador y velocímetro sin `aria-hidden`; links del footer con área táctil < 44px. → Arreglado.

## 🟢 SEO / detalles

- Se agregó `og:locale`, tamaño de og:image y datos estructurados (`ProfessionalService`).
- Favicon: emoji ⚡ → SVG con tu logo `/>`.
- `AGENTS.md`/`GEMINI.md` mencionaban Spline 3D → actualizado a Three.js.

## ⚠️ Para revisar vos (no lo cambié porque son datos tuyos)

1. **Número de WhatsApp** y **dominio** (ver crítico 1 y 4).
2. **Métricas sin respaldo**: "3x más consultas", "0.4s", "4.8s de carga" de WordPress. Si un cliente pregunta, conviene poder mostrarlo (ej.: captura de PageSpeed Insights de Dorear). Lo de "más de la mitad abandona si tarda más de 3s" es un dato conocido de Google (53%, 2016).
3. **Captura de Splitealo**: tiene el cartel de cookies tapando parte. Sacala de nuevo (idealmente a 1600×1200 para que se vea nítida en pantallas retina).

## Cambios de diseño

- **Hero nuevo** a pantalla completa: título gigante "WEBS A MEDIDA" detrás, cabeza de partículas que sigue al mouse (con hueco al pasar el cursor), resplandor azul de marca y textos + CTA abajo.
- Header transparente sobre el hero, se vuelve sólido al scrollear.
- **Proyectos**: filas grandes alternadas (captura grande + texto), en lugar de dos tarjetas chicas.
- **Comparativa**: formato `git diff` real (líneas rojas/verdes con número de línea).
- **Servicios**: tarjetas con brillo que sigue al cursor y numeración grande.
- **Metodología**: línea de tiempo con degradé en vez de 3 tarjetas iguales.
- **CTA final**: resplandor y grilla de puntos.
