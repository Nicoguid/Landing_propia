# by.nicocieplak — landing

HTML + Tailwind (compilado) + JS sin dependencias. La cabeza 3D del hero usa three.js, empaquetado aparte y cargado después de que la página ya se ve.

## Estructura

```
index.html
assets/
  css/tailwind.css      ← generado (no editar a mano)
  css/styles.css        ← estilos propios
  js/main.js            ← menú, WhatsApp, contadores, carga diferida de la cabeza
  js/hero-head.min.js   ← generado (three.js + cabeza)
  fonts/                ← Inter + Geist Mono (self-hosted)
  images/
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

- Número de WhatsApp: `CONFIG.whatsappNumber` en `assets/js/main.js`.
- Colores / tamaño / posición de la cabeza: `src/hero-head.js` → después `npm run build:js`.
