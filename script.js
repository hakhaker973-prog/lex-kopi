/*
  LEX KOPI — katalog dan keranjang sederhana.
  PENTING: ganti nomor di bawah dengan nomor WhatsApp LEX KOPI.
  Gunakan format internasional tanpa tanda +, spasi, atau tanda hubung.
  Contoh Indonesia: 6281234567890
*/
const WHATSAPP_NUMBER = "6282281398048"; // GANTI dengan nomor WhatsApp kedai yang aktif.

const products = [
  {id:1,name:"Kopi Susu Gula Aren",category:"Coffee",price:18000,description:"Espresso, susu creamy, dan manis gula aren.",drink:"#a87955",bg:"#eee7dc"},
  {id:2,name:"Americano",category:"Coffee",price:15000,description:"Kopi hitam dengan rasa bold dan clean.",image:"americano-dingin.jpeg",drink:"#513c30",bg:"#e9e9df"},
  {id:3,name:"Cappuccino",category:"Coffee",price:20000,description:"Espresso dengan susu lembut dan foam.",image:"cappucino-dingin.jpeg",drink:"#b38b66",bg:"#f0e7d9"},
  {id:4,name:"Caramel Latte",category:"Coffee",price:22000,description:"Latte lembut dengan sentuhan karamel.",image:"caramel-latte-dingin.jpeg",drink:"#bc8d5e",bg:"#eee5d8"},
  {id:5,name:"Matcha Latte",category:"Non-Coffee",price:22000,description:"Matcha earthy berpadu dengan susu.",image:"matcha-latte-dingin.jpeg",drink:"#8c9a67",bg:"#e7eadd"},
  {id:6,name:"Chocolate",category:"Non-Coffee",price:20000,description:"Cokelat nikmat untuk teman santai.",image:"ice-coklat.jpeg",drink:"#704b3c",bg:"#eee4de"},
  {id:7,name:"Lemon Tea",category:"Non-Coffee",price:15000,description:"Teh segar dengan rasa lemon ringan.",image:"lemon-tea.jpeg",drink:"#c5a84e",bg:"#f1ecd8"},
  {id:8,name:"Kentang Goreng",category:"Snack",price:16000,description:"Camilan renyah untuk menemani kopi.",drink:"#d1a34f",bg:"#efe7d6",snack:true},
  {id:9,name:"Roti Bakar",category:"Snack",price:18000,description:"Roti panggang hangat untuk teman minum.",drink:"#b77e4b",bg:"#f0e4d3",snack:true},
  {id:10,name:"Kopi Susu LEX",category:"Coffee",price:20000,description:"Racikan kopi susu khas LEX KOPI.",image:"images-kopi-susu.jpeg",drink:"#986448",bg:"#e9e5d9"},
  {id:11,name:"Teh dingin",category:"Non-Coffee",price:6000,description:"Enak waktu buka puasa.",image:"teh-dingin.jpeg",drink:"#FF0000",bg:"#800000"}
];

const cart = new Map();
let activeCategory = "Semua";
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const emptyState = document.getElementById("empty-state");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
}

function visualFor(product) {
  if (product.snack) {
    const isFries = product.name === "Kentang Goreng";
    return `<div class="drink-art" aria-hidden="true">
      <div class="drink-cup" style="background:${product.drink};border-radius:${isFries ? "7px 7px 18px 18px" : "5px"};transform:${isFries ? "rotate(2deg)" : "rotate(-4deg)"}">
      </div><div class="drink-shadow"></div></div>`;
  }
  return `<div class="drink-art" aria-hidden="true">
    <div class="drink-straw"></div><div class="drink-lid"></div>
    <div class="drink-cup" style="--drink:${product.drink}"></div>
    <div class="drink-shadow"></div></div>`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("id-ID");
  const filtered = products.filter(product =>
    (activeCategory === "Semua" || product.category === activeCategory) &&
    (product.name.toLocaleLowerCase("id-ID").includes(query) ||
     product.description.toLocaleLowerCase("id-ID").includes(query))
  );
  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-visual" style="--visual-bg:${product.bg}">
  <span class="product-category">${product.category.toUpperCase()}</span>
  ${product.image
    ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;">`
    : visualFor(product)}
</div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom">
          <span class="product-price">${rupiah(product.price)}</span>
          <button class="add-button" data-add="${product.id}" aria-label="Tambah ${product.name} ke keranjang" title="Tambah ke keranjang">+</button>
        </div>
      </div>
    </article>`).join("");
  emptyState.hidden = filtered.length > 0;
}

function renderCart() {
  const entries = [...cart.entries()];
  const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => {
    const product = products.find(item => item.id === id);
    return sum + product.price * quantity;
  }, 0);

  document.getElementById("header-cart-count").textContent = itemCount;
  document.getElementById("cart-count-label").textContent = `${itemCount} item`;
  cartTotal.textContent = rupiah(total);

  if (entries.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><span>＋</span><p>Keranjang masih kosong.</p><small>Tambahkan menu favoritmu dari katalog.</small></div>`;
    return;
  }

  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return `<div class="cart-row">
      <div><div class="cart-row-name">${product.name}</div>
      <div class="cart-row-price">${rupiah(product.price)} × ${quantity} = <strong>${rupiah(product.price * quantity)}</strong></div></div>
      <div class="quantity-control" aria-label="Jumlah ${product.name}">
        <button data-change="${id}" data-delta="-1" aria-label="Kurangi ${product.name}">−</button>
        <span>${quantity}</span>
        <button data-change="${id}" data-delta="1" aria-label="Tambah ${product.name}">+</button>
      </div>
    </div>`;
  }).join("");
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  button.textContent = "✓";
  window.setTimeout(() => { if (button.isConnected) button.textContent = "+"; }, 650);
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;
  const id = Number(button.dataset.change);
  const next = (cart.get(id) || 0) + Number(button.dataset.delta);
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  renderCart();
});

document.getElementById("filter-list").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});
searchInput.addEventListener("input", renderProducts);

document.getElementById("clear-cart").addEventListener("click", () => {
  cart.clear();
  renderCart();
});

document.getElementById("checkout-form").addEventListener("submit", event => {
  event.preventDefault();
  if (cart.size === 0) {
    alert("Keranjang masih kosong. Tambahkan menu terlebih dahulu.");
    document.getElementById("menu").scrollIntoView({behavior:"smooth"});
    return;
  }

  const customerName = document.getElementById("customer-name").value.trim();
  const orderType = document.getElementById("order-type").value;
  const notes = document.getElementById("order-notes").value.trim();
  if (!customerName) {
    document.getElementById("customer-name").focus();
    return;
  }

  const entries = [...cart.entries()];
  const total = entries.reduce((sum, [id, quantity]) => {
    return sum + products.find(item => item.id === id).price * quantity;
  }, 0);
  const lines = [
    "Halo LEX KOPI, saya ingin memesan:",
    "",
    ...entries.map(([id, quantity]) => {
      const product = products.find(item => item.id === id);
      return `• ${product.name} x${quantity} — ${rupiah(product.price * quantity)}`;
    }),
    "",
    `Total: ${rupiah(total)}`,
    `Nama: ${customerName}`,
    `Jenis pesanan: ${orderType}`,
    ...(notes ? [`Catatan: ${notes}`] : []),
    "",
    "Mohon konfirmasi pesanan saya. Terima kasih!"
  ];

 if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
  document.getElementById("config-warning").hidden = false;
  alert("Nomor WhatsApp tidak valid. Periksa kembali nomor yang digunakan.");
  return;
}

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("current-year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
