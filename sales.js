const rupiahSales = value =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

const salesDate = document.getElementById("sales-date");
const expenseDate = document.getElementById("expense-date");
const salesFilterDate = document.getElementById("sales-filter-date");

const today = new Date();
const localDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

salesDate.value = localDate;
expenseDate.value = localDate;
salesFilterDate.value = localDate;

let salesRecords = JSON.parse(
  localStorage.getItem("lexSalesRecords") || "[]"
);
let expenseRecords = JSON.parse(
  localStorage.getItem("lexExpenseRecords") || "[]"
);

function saveSalesData() {
  localStorage.setItem(
    "lexSalesRecords", JSON.stringify(salesRecords)
  );
  localStorage.setItem(
    "lexExpenseRecords", JSON.stringify(expenseRecords)
  );
}

function renderSales() {
  const date = salesFilterDate.value;

  const dailySales = salesRecords.filter(item => item.date === date);
  const dailyExpenses = expenseRecords.filter(item => item.date === date);

  const totalSales = dailySales.reduce(
    (sum, item) => sum + item.amount, 0
  );
  const totalExpenses = dailyExpenses.reduce(
    (sum, item) => sum + item.amount, 0
  );

  document.getElementById("sales-total").textContent =
    rupiahSales(totalSales);
  document.getElementById("expense-total").textContent =
    rupiahSales(totalExpenses);
  document.getElementById("sales-profit").textContent =
    rupiahSales(totalSales - totalExpenses);
  document.getElementById("sales-count").textContent =
    dailySales.length;

  document.getElementById("sales-history").innerHTML =
    dailySales.map(item => `
      <tr>
        <td>${item.time}</td>
        <td>${escapeSales(item.name)}<br>
          <small>${escapeSales(item.description)}</small>
        </td>
        <td>${item.type}</td>
        <td>${item.payment}</td>
        <td>${rupiahSales(item.amount)}</td>
        <td>
          <button type="button" data-delete-sale="${item.id}">
            Hapus
          </button>
        </td>
      </tr>
    `).join("") ||
    '<tr><td colspan="6">Belum ada penjualan pada tanggal ini.</td></tr>';

  document.getElementById("expense-history").innerHTML =
    dailyExpenses.map(item => `
      <div class="expense-row">
        <span>
          ${escapeSales(item.description)}
          <br><small>${item.time}</small>
        </span>
        <span>
          ${rupiahSales(item.amount)}
          <br>
          <button type="button" data-delete-expense="${item.id}">
            Hapus
          </button>
        </span>
      </div>
    `).join("") || "<p>Belum ada pengeluaran.</p>";
}

function escapeSales(value) {
  const element = document.createElement("span");
  element.textContent = String(value);
  return element.innerHTML;
}

document.getElementById("sales-form").addEventListener(
  "submit", event => {
    event.preventDefault();

    const amount = Number(
      document.getElementById("sales-amount").value
    );

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      alert("Masukkan jumlah pembayaran yang valid.");
      return;
    }

    salesRecords.push({
      id: crypto.randomUUID(),
      date: salesDate.value,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      name: document.getElementById("sales-name").value.trim(),
      type: document.getElementById("sales-type").value,
      description: document.getElementById("sales-description").value.trim(),
      payment: document.getElementById("sales-payment").value,
      amount
    });

    saveSalesData();
    salesFilterDate.value = salesDate.value;
    event.target.reset();
    salesDate.value = localDate;
    renderSales();
    alert("Penjualan berhasil dicatat.");
  }
);

document.getElementById("expense-form").addEventListener(
  "submit", event => {
    event.preventDefault();

    const amount = Number(
      document.getElementById("expense-amount").value
    );

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      alert("Masukkan jumlah pengeluaran yang valid.");
      return;
    }

    expenseRecords.push({
      id: crypto.randomUUID(),
      date: expenseDate.value,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      description: document
        .getElementById("expense-description").value.trim(),
      amount
    });

    saveSalesData();
    salesFilterDate.value = expenseDate.value;
    event.target.reset();
    expenseDate.value = localDate;
    renderSales();
    alert("Pengeluaran berhasil dicatat.");
  }
);

salesFilterDate.addEventListener("change", renderSales);

document.getElementById("sales-history").addEventListener(
  "click", event => {
    const button = event.target.closest("[data-delete-sale]");
    if (!button) return;

    if (!confirm("Hapus catatan penjualan ini?")) return;

    salesRecords = salesRecords.filter(
      item => item.id !== button.dataset.deleteSale
    );

    saveSalesData();
    renderSales();
  }
);

document.getElementById("expense-history").addEventListener(
  "click", event => {
    const button = event.target.closest("[data-delete-expense]");
    if (!button) return;

    if (!confirm("Hapus catatan pengeluaran ini?")) return;

    expenseRecords = expenseRecords.filter(
      item => item.id !== button.dataset.deleteExpense
    );

    saveSalesData();
    renderSales();
  }
);

renderSales();
