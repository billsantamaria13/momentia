/**
 * MOMENTIA – APP PRINCIPAL
 * Lógica de UI: navbar, categorías, render de productos, sidebar móvil
 */

// ================================================================
// NAVBAR SCROLL EFFECT
// ================================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ================================================================
// HAMBURGER / MOBILE DRAWER
// ================================================================
function openDrawer() {
  document.getElementById('mobile-drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('mobile-drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('hamburger')?.addEventListener('click', openDrawer);
document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);

// ================================================================
// SIDEBAR FILTER TOGGLE (mobile)
// ================================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('open');

  // Create overlay if needed
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'drawer-overlay';
    overlay.onclick = () => sidebar.classList.remove('open') || overlay.classList.remove('open');
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle('open', sidebar.classList.contains('open'));
}

// ================================================================
// CATEGORY FILTER
// ================================================================
let activeCategory = 'todos';

function filterCategory(cat) {
  activeCategory = cat;

  // Update button states
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });

  // Update title
  const titleEl = document.getElementById('products-title');
  if (titleEl) titleEl.textContent = CATEGORY_LABELS[cat] || cat;

  renderProducts(cat);

  // Close sidebar on mobile
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');

  // Scroll to grid
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ================================================================
// RENDER PRODUCTS
// ================================================================
function renderProducts(cat = 'todos') {
  const grid    = document.getElementById('products-grid');
  const empty   = document.getElementById('empty-state');
  const countEl = document.getElementById('visible-count');
  if (!grid) return;

  const filtered = cat === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === cat);

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = filtered.map((p, idx) => `
    <article class="product-card" style="animation-delay:${idx * 0.07}s" id="card-${p.id}">
      <div class="product-img-wrap">
        <img
          src="${p.img}"
          alt="${p.name}"
          class="product-img"
          loading="${idx < 3 ? 'eager' : 'lazy'}"
          onerror="this.src='assets/images/placeholder.jpg'"
        />
        <span class="product-category-tag">${CATEGORY_LABELS[p.category] || p.category}</span>
        <span class="product-code-tag">${p.id}</span>
      </div>
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <p class="product-price">${formatPrice(p.price)}</p>
      </div>
      <div class="product-footer">
        <button
          class="btn-add-cart"
          id="add-btn-${p.id}"
          onclick="handleAddToCart('${p.id}')"
          aria-label="Agregar al carrito"
        >
          🛒 Agregar
        </button>
        <button
          class="btn-wa-product"
          onclick="askProductWhatsApp('${p.id}')"
          aria-label="Preguntar por este producto"
          title="Preguntar por este producto"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </button>
      </div>
    </article>
  `).join('');

  updateCategoryCounts();
}

function handleAddToCart(productId) {
  addToCart(productId);
  const btn = document.getElementById(`add-btn-${productId}`);
  if (btn) {
    btn.textContent = '✅ Añadido';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '🛒 Agregar';
      btn.classList.remove('added');
    }, 1800);
  }
}

function askProductWhatsApp(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const msg = `¡Hola! 🎁✨ Deseo información sobre el producto:\n\n*${product.name}*\nCódigo: \`${product.id}\`\n\n¿Me pueden dar más detalles? 😊`;
  openWhatsApp(msg);
}

// ================================================================
// UPDATE CATEGORY COUNTS
// ================================================================
function updateCategoryCounts() {
  const countKeys = [
    'todos', 'cumpleanos', 'grados', 'amor-amistad',
    'san-valentin', 'dia-nino', 'dia-padre',
    'dia-madre', 'despedidas', 'aniversarios',
  ];
  countKeys.forEach(cat => {
    const el = document.getElementById(`count-${cat}`);
    if (!el) return;
    const n = cat === 'todos'
      ? PRODUCTS.length
      : PRODUCTS.filter(p => p.category === cat).length;
    el.textContent = n;
  });
}

// ================================================================
// CATEGORY BUTTON LISTENERS
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => filterCategory(btn.dataset.cat));
  });

  // Initial render
  renderProducts('todos');
  updateCategoryCounts();
});
