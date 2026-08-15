/**
 * MOMENTIA – CATÁLOGO DE PRODUCTOS
 * ============================================================
 * Para agregar un nuevo producto, añade un objeto al array PRODUCTS.
 * Sigue este formato:
 * {
 *   id:       'DET00004',         // Siguiente código disponible
 *   name:     'Nombre del producto',
 *   desc:     'Descripción breve del regalo',
 *   price:    150000,             // Precio en COP (sin puntos)
 *   img:      'assets/images/DET00004.jpg',
 *   category: 'amor-amistad',    // Ver lista de categorías abajo
 *   badge:    'Nuevo',           // Opcional: etiqueta especial
 * }
 *
 * CATEGORÍAS DISPONIBLES:
 *   'cumpleanos'   → 🎂 Cumpleaños
 *   'grados'       → 🎓 Grados
 *   'amor-amistad' → 💝 Amor y Amistad
 *   'san-valentin' → 💌 San Valentín
 *   'dia-nino'     → 🧸 Día del Niño
 *   'dia-padre'    → 👔 Día del Padre
 *   'dia-madre'    → 🌸 Día de la Madre
 *   'despedidas'   → 🥂 Despedidas
 *   'aniversarios' → 💍 Aniversarios
 */

const PRODUCTS = [
  {
    id:       'DET00001',
    name:     'Box Love & Friendship Champagne',
    desc:     'Set premium con bouquet de flores secas, chocolates artesanales y champagne Moët & Chandon. El regalo perfecto para esa persona especial.',
    price:    285000,
    img:      'assets/images/DET00001.jpg',
    category: 'amor-amistad',
  },
  {
    id:       'DET00002',
    name:     'The Love Collection – Velas Aromáticas',
    desc:     'Colección de velas de soya artesanales con esencias Rose Blossom y Romantic Nights. Caja de terciopelo con lazo dorado incluida.',
    price:    165000,
    img:      'assets/images/DET00002.jpg',
    category: 'amor-amistad',
  },
  {
    id:       'DET00003',
    name:     'Canasta Amistad Vineyard',
    desc:     'Canasta mimbre con vino tinto premium Friendship Vineyard, caja de trufas y pralinés Aurélia, flores secas y tarjeta personalizada.',
    price:    220000,
    img:      'assets/images/DET00003.jpg',
    category: 'amor-amistad',
  },
  // ── Agrega nuevos productos abajo de esta línea ──────────────
];

/** Mapa de labels por categoría */
const CATEGORY_LABELS = {
  'todos':       '✨ Todos los regalos',
  'cumpleanos':  '🎂 Cumpleaños',
  'grados':      '🎓 Grados',
  'amor-amistad':'💝 Amor y Amistad',
  'san-valentin':'💌 San Valentín',
  'dia-nino':    '🧸 Día del Niño',
  'dia-padre':   '👔 Día del Padre',
  'dia-madre':   '🌸 Día de la Madre',
  'despedidas':  '🥂 Despedidas',
  'aniversarios':'💍 Aniversarios',
};
