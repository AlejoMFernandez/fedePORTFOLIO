/*
  TRABAJOS DE FEDE — editá acá.
  Cada texto va como [español, inglés].
  audio: ruta al archivo en /audio (mp3 u ogg, ideal < 1 MB). Si es null, no se muestra reproductor.
  link: [texto visible, url] o null.
*/
window.FF_PROJECTS = [
  {
    code: 'DIA', title: ['Mafalda', 'Mafalda'],
    studio: ['Mundoloco CGI', 'Mundoloco CGI'],
    via: ['Producción para Netflix', 'Production for Netflix'],
    role: ['Selección y edición de tomas de diálogo', 'Dialogue take selection & editing'],
    desc: [
      'Asistente de audio en rodaje junto a Juan José Campanella: feedback para elegir tomas y retomas, y registro detallado para la postproducción.',
      'On-set audio assistant alongside Juan José Campanella: feedback on takes and retakes, plus detailed logging for post-production.'
    ],
    lang: 'ES', audio: null,
    link: ['netflix.com', 'https://www.netflix.com/ar-en/']
  },
  {
    code: 'DIA', title: ['Mini Beat Power Rockers', 'Mini Beat Power Rockers'],
    studio: ['Mundoloco CGI', 'Mundoloco CGI'],
    via: ['Con Discovery · 3 temporadas', 'With Discovery · 3 seasons'],
    role: ['Diálogos ES/EN y diseño sonoro', 'ES/EN dialogue & sound design'],
    desc: [
      'Grabación, edición y postproducción de diálogos en español e inglés durante tres temporadas, más diseño sonoro para distintos contenidos de la producción.',
      'Recording, editing and post-production of Spanish and English dialogue across three seasons, plus sound design for several pieces of the production.'
    ],
    lang: 'ES/EN', audio: null,
    link: ['mundolococgi.com', 'https://mundolococgi.com/portfolio/minibeat/']
  },
  {
    code: 'DIA', title: ['Underdogs United', 'Underdogs United'],
    studio: ['Mundoloco CGI', 'Mundoloco CGI'],
    via: ['Con Discovery', 'With Discovery'],
    role: ['Edición y postproducción de diálogos', 'Dialogue editing & post-production'],
    desc: [
      'Edición y postproducción de diálogos para la serie, con preparación y tratamiento de material en español e inglés.',
      'Dialogue editing and post-production for the series, preparing and treating Spanish and English material.'
    ],
    lang: 'ES/EN', audio: null,
    link: ['mundolococgi.com', 'https://mundolococgi.com/portfolio/underdogs-united/']
  },
  {
    code: 'FOL', title: ['The Warriors Within 2', 'The Warriors Within 2'],
    studio: ["Tauro's Sound", "Tauro's Sound"],
    via: ['Largometraje · China', 'Feature film · China'],
    role: ['Foley spotting', 'Foley spotting'],
    desc: [
      'Spotting detallado de Foley: marcar cada acción en pantalla que necesitaba Foley para facilitar la grabación y la edición, con colaboración presencial en las sesiones para ajustar cues.',
      'Detailed Foley spotting: marking every on-screen action that needed Foley to streamline recording and editing, collaborating on site during sessions to refine cues.'
    ],
    lang: '—', audio: null,
    link: ['IMDb', 'https://www.imdb.com/title/tt29406775/']
  },
  {
    code: 'LIVE', title: ['Sonido en vivo', 'Live sound'],
    studio: ['Shows y eventos', 'Shows & events'],
    via: ['Audio en vivo · Argentina', 'Live audio · Argentina'],
    role: ['Operación y asistencia técnica', 'Operation & technical support'],
    desc: [
      'Operación y asistencia técnica de audio para shows, eventos, charlas y producciones en vivo: microfonía, mezcla y resolución de problemas técnicos.',
      'Audio operation and technical support for shows, events, talks and live productions: miking, mixing and troubleshooting.'
    ],
    lang: '—', audio: null, link: null
  },
  {
    code: 'STU', title: ['DixSound', 'DixSound'],
    studio: ['Proyecto propio', 'Own project'],
    via: ['Estudio independiente · Buenos Aires', 'Independent studio · Buenos Aires'],
    role: ['Post, diseño sonoro y Foley', 'Post, sound design & Foley'],
    desc: [
      'Estudio independiente de postproducción de audio: diseño sonoro, edición de diálogos, Foley y producción de audio para contenido audiovisual.',
      'Independent audio post-production studio: sound design, dialogue editing, Foley and audio production for audiovisual content.'
    ],
    lang: 'ES/EN', audio: null, link: null
  }
];
