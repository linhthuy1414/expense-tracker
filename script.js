const STORAGE_KEY = 'expense-tracker-data';

const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const balanceElement = document.getElementById('balance');
const incomeElement = document.getElementById('total-income');
const expenseElement = document.getElementById('total-expense');
const transactionList = document.getElementById('transaction-list');
const emptyState = document.getElementById('empty-state');
const clearAllButton = document.getElementById('clear-all');

let transactions = loadTransactions();

function loadTransactions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function renderSummary() {
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;

  balanceElement.textContent = formatCurrency(balance);
  incomeElement.textContent = formatCurrency(income);
  expenseElement.textContent = formatCurrency(expense);
}

function renderTransactions() {
  transactionList.innerHTML = '';

  if (transactions.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  transactions
    .slice()
    .reverse()
    .forEach((transaction) => {
      const item = document.createElement('li');
      item.className = `transaction-item ${transaction.type}-item`;

      item.innerHTML = `
        <div class="transaction-main">
          <strong>${transaction.description}</strong>
          <span>${transaction.type === 'income' ? 'Khoản thu' : 'Khoản chi'}</span>
        </div>
        <div class="transaction-meta">
          <strong>${formatCurrency(transaction.amount)}</strong>
          <span>${transaction.date}</span>
        </div>
        <button class="delete-btn" data-id="${transaction.id}">Xóa</button>
      `;

      transactionList.appendChild(item);
    });
}

function renderApp() {
  renderSummary();
  renderTransactions();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (!description || amount <= 0) {
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    description,
    amount,
    type,
    date: new Date().toLocaleString('vi-VN'),
  };

  transactions.push(transaction);
  saveTransactions();
  renderApp();
  form.reset();
  typeInput.value = 'income';
  descriptionInput.focus();
});

transactionList.addEventListener('click', (event) => {
  if (!event.target.classList.contains('delete-btn')) {
    return;
  }

  const { id } = event.target.dataset;
  transactions = transactions.filter((item) => item.id !== id);
  saveTransactions();
  renderApp();
});

clearAllButton.addEventListener('click', () => {
  if (transactions.length === 0) {
    return;
  }

  const confirmed = window.confirm('Ông chủ có chắc muốn xóa toàn bộ giao dịch không?');

  if (!confirmed) {
    return;
  }

  transactions = [];
  saveTransactions();
  renderApp();
});

renderApp();
