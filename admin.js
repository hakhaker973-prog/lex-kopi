import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Samakan dengan konfigurasi di script.js
const SUPABASE_URL = "https://xplpfjtmjlkqlpsfwuei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_R_S9Mq8WwrUsWKYqGu7Yig_IhZ7q0HR";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = id => document.getElementById(id);

const loginSection = $("admin-login");
const dashboard = $("admin-dashboard");
const loginForm = $("login-form");
const loginMessage = $("login-message");

let products = [];
let orders = [];

const rupiah = value =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const escapeHTML = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

// ==========================
// LOGIN DAN ADMIN
// ==========================

async function checkAdmin() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    loginSection.hidden = false;
    dashboard.hidden = true;
    return false;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    await supabase.auth.signOut();
    loginSection.hidden = false;
    dashboard.hidden = true;
    loginMessage.textContent = "Akun tidak memiliki akses admin.";
    return false;
  }

  loginSection.hidden = true;
  dashboard.hidden = false;

  await loadDashboard();
  return true;
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  loginMessage.textContent = "Memeriksa akun...";

  const email = $("admin-email").value.trim();
  const password = $("admin-password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Login gagal. Periksa email dan password.";
    return;
  }

  await checkAdmin();
});

$("admin-logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  loginSection.hidden = false;
  dashboard.hidden = true;
  loginMessage.textContent = "Kamu sudah keluar.";
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    loginSection.hidden = false;
    dashboard.hidden = true;
  }
});

// ==========================
// NAVIGASI DASHBOARD
// ==========================

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(item =>
      item.classList.remove("active")
    );

    button.classList.add("active");

    document.querySelectorAll(".admin-page-section").forEach(section =>
      section.hidden = true
    );

    $(`page-${button.dataset.page}`).hidden = false;
  });
});

// ==========================
// MEMUAT DASHBOARD
// ==========================

async function loadDashboard() {
  await Promise.all([
    loadProducts(),
    loadOrders()
  ]);

  updateStats();
}

// ==========================
// KELOLA PRODUK
// ==========================

async function loadProducts() {
  const { data, error } = await supabase
    .from("product-lex-kopi")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    $("product-message").textContent = error.message;
    return;
  }

  products = data || [];
  renderProducts();
  $("stat-products").textContent = products.length;
}

function renderProducts() {
  $("product-list").innerHTML = products.map(product => `
    <tr>
      <td>${escapeHTML(product.name)}</td>
      <td>${rupiah(product.price)}</td>
      <td>${escapeHTML(product.category)}</td>
      <td>${escapeHTML(product.stock)}</td>
      <td>
        <div class="product-actions">
          <button data-edit="${escapeHTML(product.id)}">Edit</button>
          <button data-delete="${escapeHTML(product.id)}">Hapus</button>
        </div>
      </td>
    </tr>
  `).join("") || `
    <tr><td colspan="5">Belum ada produk.</td></tr>
  `;
}

$("product-form").addEventListener("submit", async event => {
  event.preventDefault();

  const id = $("product-id").value;

  const product = {
    name: $("product-name").value.trim(),
    price: Number($("product-price").value),
    category: $("product-category").value.trim(),
    stock: Number($("product-stock").value),
    image_url: $("product-image").value.trim(),
    description: $("product-description").value.trim()
  };

  if (
    !product.name ||
    !product.category ||
    !Number.isFinite(product.price) ||
    product.price < 0 ||
    !Number.isInteger(product.stock) ||
    product.stock < 0
  ) {
    $("product-message").textContent = "Periksa kembali data produk.";
    return;
  }

  try {
    new URL(product.image_url);
    if (!["https:", "http:"].includes(new URL(product.image_url).protocol)) {
      throw new Error();
    }
  } catch {
    $("product-message").textContent = "URL gambar tidak valid.";
    return;
  }

  $("save-product").disabled = true;
  $("product-message").textContent = "Menyimpan produk...";

  const result = id
    ? await supabase.from("product-lex-kopi").update(product).eq("id", id)
    : await supabase.from("product-lex-kopi").insert(product);

  $("save-product").disabled = false;

  if (result.error) {
    $("product-message").textContent = result.error.message;
    return;
  }

  $("product-message").textContent = "Produk berhasil disimpan.";
  resetProductForm();
  await loadProducts();
  updateStats();
});

$("product-list").addEventListener("click", async event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const product = products.find(item => String(item.id) === editId);
    if (!product) return;

    $("product-id").value = product.id;
    $("product-name").value = product.name || "";
    $("product-price").value = product.price || 0;
    $("product-category").value = product.category || "";
    $("product-stock").value = product.stock || 0;
    $("product-image").value = product.image_url || "";
    $("product-description").value = product.description || "";

    $("product-form-title").textContent = "Edit Produk";
    $("save-product").textContent = "Simpan Perubahan";
    $("cancel-edit").hidden = false;

    $("product-form").scrollIntoView({ behavior: "smooth" });
  }

  if (deleteId) {
    const confirmed = confirm("Yakin ingin menghapus produk ini?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("product-lex-kopi")
      .delete()
      .eq("id", deleteId);

    if (error) {
      alert("Gagal menghapus: " + error.message);
      return;
    }

    await loadProducts();
    updateStats();
  }
});

function resetProductForm() {
  $("product-form").reset();
  $("product-id").value = "";
  $("product-form-title").textContent = "Tambah Produk";
  $("save-product").textContent = "Simpan Produk";
  $("cancel-edit").hidden = true;
}

$("cancel-edit").addEventListener("click", resetProductForm);

// ==========================
// KELOLA PESANAN
// ==========================

async function loadOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    $("order-message").textContent = error.message;
    return;
  }

  orders = data || [];
  renderOrders();
  updateStats();
}

function renderOrders() {
  const statusOptions = [
    ["pending", "Menunggu"],
    ["processing", "Diproses"],
    ["completed", "Selesai"],
    ["cancelled", "Dibatalkan"]
  ];

  $("order-list").innerHTML = orders.map(order => `
    <tr>
      <td>#${escapeHTML(order.id)}</td>
      <td>${escapeHTML(order.customer_name)}</td>
      <td>${rupiah(order.total)}</td>
      <td>
        <select data-status="${escapeHTML(order.id)}">
          ${statusOptions.map(([value, label]) => `
            <option value="${value}"
              ${order.status === value ? "selected" : ""}>
              ${label}
            </option>
          `).join("")}
        </select>
      </td>
      <td>${new Date(order.created_at).toLocaleString("id-ID")}</td>
      <td>
        <button data-detail="${escapeHTML(order.id)}">Detail</button>
      </td>
    </tr>
  `).join("") || `
    <tr><td colspan="6">Belum ada pesanan.</td></tr>
  `;
}

$("order-list").addEventListener("change", async event => {
  const id = event.target.dataset.status;
  if (!id) return;

  const { error } = await supabase
    .from("orders")
    .update({ status: event.target.value })
    .eq("id", id);

  if (error) {
    alert("Gagal mengubah status: " + error.message);
    await loadOrders();
    return;
  }

  await loadOrders();
});

$("order-list").addEventListener("click", async event => {
  const id = event.target.dataset.detail;
  if (!id) return;

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (error) {
    alert("Gagal mengambil detail pesanan.");
    return;
  }

  const details = (data || []).map(item =>
    `${item.product_name} x${item.quantity} = ${rupiah(item.subtotal)}`
  ).join("\n");

  const order = orders.find(item => String(item.id) === id);

  alert(
    `Pesanan #${id}\n` +
    `Pelanggan: ${order?.customer_name || "-"}\n` +
    `WhatsApp: ${order?.whatsapp || "-"}\n` +
    `Jenis: ${order?.order_type || "-"}\n\n` +
    `${details || "Tidak ada rincian produk."}`
  );
});

$("refresh-orders").addEventListener("click", loadOrders);

// ==========================
// RINGKASAN
// ==========================

function updateStats() {
  $("stat-products").textContent = products.length;
  $("stat-orders").textContent = orders.length;

  $("stat-pending").textContent =
    orders.filter(order => order.status === "pending").length;

  const revenue = orders
    .filter(order => order.status === "completed")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  $("stat-revenue").textContent = rupiah(revenue);
}

// Mulai aplikasi
checkAdmin();
