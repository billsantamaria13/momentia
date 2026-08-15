/**
 * MOMENTIA – CARRITO DE COMPRAS
 * ============================================================
 * Manejo de carrito temporal con localStorage.
 * Los descuentos se gestionan desde el panel admin (admin.html).
 * No requiere base de datos.
 */

// ================================================================
// CONFIGURACIÓN DE DESCUENTOS
// ================================================================
// El descuento se gestiona visualmente desde admin.html.
// También puedes editarlo aquí manualmente si lo prefieres:
//
/* ======= CODIGO DE DESCUENTO (respaldo manual) =======
   Deja vacío si gestionas desde admin.html
   const CODIGO    = 'SANVALEN20';  // Ej: código de descuento
   const VALOR_DTO = 20;            // Ej: 20%
   ===================================================== */

// Lee config de descuento del panel admin (prioridad) o usa valores manuales
function getDiscountConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem('momentia_discount_cfg'));
    if (cfg && cfg.code && cfg.pct > 0) return cfg;
  } catch(e) {}
  // Fallback a variables hardcodeadas (si las defines arriba)
  const CODIGO    = '';  // ← editar aquí si no usas admin.html
  const VALOR_DTO = 0;   // ← editar aquí si no usas admin.html
  if (CODIGO && VALOR_DTO > 0) return { code: CODIGO, pct: VALOR_DTO };
  return { code: '', pct: 0 };
}

// ================================================================
// WHATSAPP
// ================================================================
const WA_NUMBER  = '573505267000';  // Número sin + ni espacios
const WA_MSG_DEFAULT = '¡Hola! 🎁✨ Deseo información para un regalo 💝';

function openWhatsApp(customMsg) {
  const msg = encodeURIComponent(customMsg || WA_MSG_DEFAULT);
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

// ================================================================
// CART ENGINE
// ================================================================
const CART_KEY = 'momentia_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      img:      product.img,
      category: product.category,
      qty:      1,
    });
  }
  saveCart(cart);
  showToast(`🛒 "${product.name}" añadido al carrito`, 'success');
  updateCartBadge();
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  if (!confirm('¿Seguro que deseas vaciar el carrito?')) return;
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem('momentia_discount');
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const cart  = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('#cart-badge').forEach(el => {
    el.textContent = total;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  });
}

// ================================================================
// CART RENDER (cart.html)
// ================================================================
function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO');
}

function renderCart() {
  const listEl      = document.getElementById('cart-items-list');
  const emptyEl     = document.getElementById('cart-empty');
  const summaryEl   = document.getElementById('cart-summary');
  if (!listEl) return;   // No estamos en cart.html

  const cart = getCart();

  if (cart.length === 0) {
    listEl.innerHTML  = '';
    emptyEl.style.display   = 'block';
    summaryEl.style.display  = 'none';
    return;
  }

  emptyEl.style.display   = 'none';
  summaryEl.style.display  = 'flex';

  // Render items
  listEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" loading="lazy" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-code">${item.id}</p>
        <p class="cart-item-cat">${CATEGORY_LABELS[item.category] || item.category}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Reducir cantidad">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}', 1)"  aria-label="Aumentar cantidad">+</button>
        <button class="btn-remove-item" onclick="removeFromCart('${item.id}')" aria-label="Eliminar producto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  recalculate();
}

// ================================================================
// DISCOUNT LOGIC
// ================================================================
let discountPct = 0;

function applyDiscount() {
  const input  = document.getElementById('discount-code-input');
  const msgEl  = document.getElementById('discount-msg');
  const code   = input.value.trim().toUpperCase();
  const cfg    = getDiscountConfig();

  // Sin descuento activo
  if (!cfg.code || cfg.pct <= 0) {
    msgEl.textContent = '😕 No hay códigos de descuento activos en este momento.';
    msgEl.className = 'discount-msg error';
    discountPct = 0;
    recalculate();
    return;
  }

  if (code === cfg.code.toUpperCase()) {
    discountPct = cfg.pct;
    localStorage.setItem('momentia_discount', discountPct);
    msgEl.textContent = `🎉 ¡Código aplicado! ${discountPct}% de descuento`;
    msgEl.className   = 'discount-msg success';
  } else {
    discountPct = 0;
    localStorage.removeItem('momentia_discount');
    msgEl.textContent = '❌ Código inválido. ¡Verifica e intenta de nuevo!';
    msgEl.className   = 'discount-msg error';
  }
  recalculate();
}

function recalculate() {
  const cart    = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = Math.round(subtotal * (discountPct / 100));
  const total    = subtotal - discount;

  const subtotalEl  = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountAmt = document.getElementById('discount-amount');
  const totalEl     = document.getElementById('cart-total');

  if (subtotalEl)  subtotalEl.textContent  = formatPrice(subtotal);
  if (totalEl)     totalEl.textContent     = formatPrice(total);

  if (discountRow && discountAmt) {
    if (discountPct > 0 && discount > 0) {
      discountRow.style.display = 'flex';
      discountAmt.textContent   = `-${formatPrice(discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  // Visible count badge
  const vcEl = document.getElementById('visible-count');
  if (vcEl) vcEl.textContent = cart.length;
}

// ================================================================
// SEND ORDER VIA WHATSAPP
// ================================================================
function sendOrderWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Tu carrito está vacío 😊', 'error');
    return;
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = Math.round(subtotal * (discountPct / 100));
  const total    = subtotal - discount;

  let msg = `🎁 *Pedido Momentia* 🎁\n`;
  msg    += `━━━━━━━━━━━━━━━━━━━━\n`;
  cart.forEach(item => {
    msg += `\n🛍️ *${item.name}*\n`;
    msg += `   Código: \`${item.id}\`\n`;
    msg += `   Cantidad: ${item.qty}\n`;
    msg += `   Precio unit: ${formatPrice(item.price)}\n`;
    msg += `   Subtotal: ${formatPrice(item.price * item.qty)}\n`;
  });
  msg   += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg   += `💰 *Subtotal:* ${formatPrice(subtotal)}\n`;
  if (discount > 0) {
    msg += `🎉 *Descuento (${discountPct}%):* -${formatPrice(discount)}\n`;
  }
  msg   += `✅ *TOTAL: ${formatPrice(total)}*\n`;
  msg   += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg   += `\n¡Hola! Quiero confirmar este pedido 😊✨`;

  openWhatsApp(msg);
}

// ================================================================
// TOAST
// ================================================================
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Init badge on every page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Restore discount if was applied
  const saved = localStorage.getItem('momentia_discount');
  if (saved) discountPct = parseFloat(saved) || 0;

  renderCart();   // Renders on cart.html; no-op on index.html
});
