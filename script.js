import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xplpfjtmjlkqlpsfwuei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_R_S9Mq8WwrUsWKYqGu7Yig_IhZ7q0HR";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
/*
  LEX KOPI — katalog dan keranjang sederhana.
  PENTING: ganti nomor di bawah dengan nomor WhatsApp LEX KOPI.
  Gunakan format internasional tanpa tanda +, spasi, atau tanda hubung.
  Contoh Indonesia: 6281234567890
*/
const WHATSAPP_NUMBER = "6282281398048"; // GANTI dengan nomor WhatsApp kedai yang aktif.

let products = [];

async function loadProducts() {
  const { data, error } = await supabase
    .from("product-lex-kopi")
    .select("id, name, price, image_url, category, stock, description")
    .order("id", { ascending: true });

  if (error) {
    console.error("Gagal mengambil produk:", error);
    document.getElementById("empty-state").textContent =
      "Menu gagal dimuat. Silakan coba lagi.";
    document.getElementById("empty-state").hidden = false;
    return;
  }

  products = data.map(product => ({
    ...product,
    image: product.image_url,
    drink: "#986448",
    bg: "#e9e5d9"
  }));

  renderProducts();
  renderCart();
}

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
    (
      product.name.toLocaleLowerCase("id-ID").includes(query) ||
      (product.description || "").toLocaleLowerCase("id-ID").includes(query)
    )
  );

  productGrid.innerHTML = filtered.map(product => {
    const stock = Number(product.stock) || 0;
    const isOutOfStock = stock <= 0;

    return `
      <article class="product-card">
        <div class="product-visual" style="--visual-bg:${product.bg}">
          <span class="product-category">${product.category.toUpperCase()}</span>
          ${product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`
            : visualFor(product)}
        </div>

        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description || ""}</p>

          <p class="product-stock">
            ${isOutOfStock ? "Stok habis" : `Stok tersedia: ${stock}`}
          </p>

          <div class="product-bottom">
            <span class="product-price">${rupiah(product.price)}</span>

            <button
              class="add-button"
              data-add="${product.id}"
              aria-label="Tambah ${product.name} ke keranjang"
              title="${isOutOfStock ? "Stok habis" : "Tambah ke keranjang"}"
              ${isOutOfStock ? "disabled" : ""}
            >
              ${isOutOfStock ? "Habis" : "+"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

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
  const stock = Number(product.stock) || 0;

  return `<div class="cart-row">
    <div>
      <div class="cart-row-name">${product.name}</div>
      <div class="cart-row-price">
        ${rupiah(product.price)} × ${quantity} =
        <strong>${rupiah(product.price * quantity)}</strong>
      </div>
    </div>

    <div class="quantity-control" aria-label="Jumlah ${product.name}">
      <button data-change="${id}" data-delta="-1"
        aria-label="Kurangi ${product.name}">−</button>

      <span>${quantity}</span>

      <button data-change="${id}" data-delta="1"
        aria-label="Tambah ${product.name}"
        ${quantity >= stock ? "disabled" : ""}>+</button>
    </div>
  </div>`;
}).join("");
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const id = Number(button.dataset.add);
  const product = products.find(item => item.id === id);

  if (!product) return;

  const stock = Number(product.stock) || 0;
  const currentQuantity = cart.get(id) || 0;

  if (currentQuantity >= stock) {
    alert("Jumlah pesanan sudah mencapai batas stok tersedia.");
    return;
  }

  cart.set(id, currentQuantity + 1);
  renderCart();
  renderProducts();
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;

  const id = Number(button.dataset.change);
  const product = products.find(item => item.id === id);

  if (!product) return;

  const currentQuantity = cart.get(id) || 0;
  const delta = Number(button.dataset.delta);
  const next = currentQuantity + delta;
  const stock = Number(product.stock) || 0;

  if (next > stock) {
    alert("Jumlah pesanan melebihi stok tersedia.");
    return;
  }

  if (next <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, next);
  }

  renderCart();
  renderProducts();
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

const orderTypeSelect = document.getElementById("order-type");
const tableNumberSelect = document.getElementById("table-number");
const tableNumberGroup = document.getElementById("table-number-group");

// Membuat pilihan Meja 01 sampai Meja 100 secara otomatis.
for (let i = 1; i <= 100; i++) {
  const number = String(i).padStart(2, "0");
  const option = document.createElement("option");

  option.value = `Meja ${number}`;
  option.textContent = `Meja ${number}`;

  tableNumberSelect.appendChild(option);
}

// Menampilkan nomor meja hanya untuk pesanan dine-in.
function updateOrderType() {
  const isDineIn = orderTypeSelect.value === "Dine-in";

  tableNumberGroup.hidden = !isDineIn;
  tableNumberSelect.required = isDineIn;

  if (!isDineIn) {
    tableNumberSelect.value = "";
  }
}

orderTypeSelect.addEventListener("change", updateOrderType);
updateOrderType();

// Memproses pesanan ke WhatsApp.
document.getElementById("checkout-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    if (cart.size === 0) {
      alert("Keranjang masih kosong. Tambahkan menu terlebih dahulu.");
      document.getElementById("menu").scrollIntoView({
        behavior: "smooth"
      });
      return;
    }

    const customerName = document
      .getElementById("customer-name").value.trim();

    const orderType = orderTypeSelect.value;
    const tableNumber = tableNumberSelect.value;
    const notes = document
      .getElementById("order-notes").value.trim();

    if (!customerName) {
      document.getElementById("customer-name").focus();
      return;
    }

    if (orderType === "Dine-in" && !tableNumber) {
      alert("Silakan pilih nomor meja terlebih dahulu.");
      tableNumberSelect.focus();
      return;
    }

    const entries = [...cart.entries()];

    const total = entries.reduce((sum, [id, quantity]) => {
      const product = products.find(item => item.id === id);
      return sum + product.price * quantity;
    }, 0);

    const lines = [
      "Halo LEX KOPI, saya ingin memesan:",
      "",
      `Jenis pesanan: ${
        orderType === "Dine-in"
          ? "Makan di tempat (Dine-in)"
          : "Bungkus / Bawa Pulang (Takeaway)"
      }`,
      ...(orderType === "Dine-in"
        ? [`Nomor meja: ${tableNumber}`]
        : []),
      `Nama pemesan: ${customerName}`,
      "",
      "Daftar pesanan:",
      ...entries.map(([id, quantity]) => {
        const product = products.find(item => item.id === id);
        return `- ${product.name} x${quantity} — ${
          rupiah(product.price * quantity)
        }`;
      }),
      "",
      `Total harga: ${rupiah(total)}`,
      ...(notes ? [`Catatan: ${notes}`] : []),
      "",
      "Mohon konfirmasi pesanan saya. Terima kasih!"
    ];

    if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
      document.getElementById("config-warning").hidden = false;
      alert("Nomor WhatsApp tidak valid. Periksa kembali nomor kedai.");
      return;
    }

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${
        encodeURIComponent(lines.join("\n"))
      }`;

    window.open(url, "_blank", "noopener,noreferrer");
  });
document.getElementById("current-year").textContent = new Date().getFullYear();
loadProducts();
