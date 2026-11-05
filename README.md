# by.nicocieplak — landing

HTML + Tailwind (compilado) + JS sin dependencias. La cabeza 3D del hero usa three.js, empaquetado aparte y cargado después de que la página ya se ve.

## Estructura

```
index.html
assets/
  css/tailwind.css      ← generado (no editar a mano)
  css/styles.css        ← estilos propios
  js/main.js            ← idioma, menú, WhatsApp, formulario, animaciones, carga de la cabeza
  js/i18n.js            ← textos en inglés + mensajes de WhatsApp (ES/EN)
  js/hero-head.min.js   ← generado (three.js + cabeza)
  fonts/                ← Geist + Geist Mono (self-hosted)
  images/               ← posters de los videos, og-image, favicon
  video/                ← mini-videos de los proyectos (MP4, ~300 KB c/u)
src/
  tailwind.css          ← entrada de Tailwind
  particle-head.js      ← la cabeza de partículas (forma, shaders, mouse)
  hero-head.js          ← colores/encuadre de la cabeza para este hero
```

## Comandos

```bash
npm install
npm run dev        # recompila Tailwind mientras editás el HTML
npm run build      # genera tailwind.css + hero-head.min.js (correr antes de subir)
npm run serve      # servidor local (los módulos JS no funcionan abriendo el archivo con doble clic)
```

Los archivos generados se commitean, así el hosting no necesita correr ningún build.

## Configurar

- Textos en español: directo en `index.html`. Textos en inglés: `assets/js/i18n.js` (misma clave que el `data-i18n` del HTML).
- Link directo en inglés: `?lang=en` al final de la URL.
- Colores: todos salen de las variables de `:root` en `assets/css/styles.css` . Para cambiar un color, cambialo ahí y se aplica en toda la página.
- Número de WhatsApp: `CONFIG.whatsappNumber` en `assets/js/main.js`.
- Colores / tamaño / posición de la cabeza: `src/hero-head.js` → después `npm run build:js`.
