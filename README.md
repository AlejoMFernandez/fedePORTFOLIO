# Portfolio · Federico Fernández

Sitio estático (HTML, CSS y JS, sin build). Se publica en Vercel desde GitHub.

## Estructura
- `index.html`: contenido (en español; el inglés está en los atributos `data-en`).
- `css/styles.css`: estilos y temas (oscuro por defecto, claro opcional).
- `js/data.js`: **los trabajos**. Para agregar, quitar o editar un trabajo, se toca solo este archivo.
- `js/main.js`: intro, idioma, tema, lista de cues, reproductor y animaciones.
- `img/`: fotos en WebP (480/720/960) y logos.
- `audio/`: muestras de audio (ver `audio/LEEME.txt`).
- `cv/federico-fernandez-cv.pdf`: CV comprimido.

## Agregar audios
1. Copiar el MP3 a `audio/` (128–192 kbps, idealmente menos de 1 MB).
2. En `js/data.js`, completar `audio: 'audio/archivo.mp3'` en el trabajo correspondiente.
La onda se calcula sola a partir del audio real.

## Dominio
Hoy está puesto `federicofernandez.com.ar`. Si el dominio es otro, hay que reemplazarlo en
`index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` y `sitemap.xml`.

## Probar en local
Con XAMPP, abrir la carpeta desde `http://localhost/...`, o correr `python -m http.server` dentro de esta carpeta.
Las rutas son relativas, así que funciona tanto en la raíz como en una subcarpeta de XAMPP.
La intro se muestra una vez por sesión; para volver a verla, abrir una pestaña nueva.
