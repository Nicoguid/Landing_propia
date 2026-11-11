// Copia solo lo necesario para producción a /public (lo que Vercel sirve)
const fs = require('fs');
fs.rmSync('public', { recursive: true, force: true });
fs.mkdirSync('public', { recursive: true });
fs.copyFileSync('index.html', 'public/index.html');
fs.cpSync('assets', 'public/assets', { recursive: true });
console.log('public/ listo');
