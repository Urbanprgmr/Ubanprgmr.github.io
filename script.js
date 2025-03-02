let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let totalPurchased = {
  USD: parseFloat(localStorage.getItem('totalPurchasedUSD')) || 0,
  EUR: parseFloat(localStorage.getItem('totalPurchasedEUR')) || 0,
  USDT: parseFloat(localStorage.getItem('totalPurchasedUSDT')) || 0,
};
let totalSold = {
  USD: parseFloat(localStorage.getItem('totalSoldUSD')) || 0,
  EUR: parseFloat(localStorage.getItem('totalSoldEUR')) || 0,
  USDT: parseFloat(localStorage.getItem('totalSoldUSDT')) || 0,
};
let totalBuyCost = parseFloat(localStorage.getItem('totalBuyCost')) || 0;
let totalSellRevenue = parseFloat(localStorage.getItem('totalSellRevenue')) || 0;
let totalPaymentIn = parseFloat(localStorage.getItem('totalPaymentIn')) || 0;
let totalPaymentOut = parseFloat(localStorage.getItem('totalPaymentOut')) || 0;
let currentCapital = parseFloat(localStorage.getItem('currentCapital')) || 0;

// Load saved data on page load
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
});

document.getElementById('buyForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('buyCurrency').value;
  const amount = parseFloat(document.getElementById('buyAmount').value);
  const rate = parseFloat(document.getElementById('buyRate').value);
  const remarks = document.getElementById('buyRemarks').value;
  const timestamp = new Date().toLocaleString();

  transactions.push({ type: 'Buy', currency, amount, rate, remarks, timestamp });
  totalPurchased[currency] += amount;
  totalBuyCost += amount * rate;

  saveToLocalStorage();
  updateUI();
});

document.getElementById('sellForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('sellCurrency').value;
  const amount = parseFloat(document.getElementById('sellAmount').value);
  const rate = parseFloat(document.getElementById('sellRate').value);
  const remarks = document.getElementById('sellRemarks').value;
  const timestamp = new Date().toLocaleString();

  transactions.push({ type: 'Sell', currency, amount, rate, remarks, timestamp });
  totalSold[currency] += amount;
  totalSellRevenue += amount * rate;

  saveToLocalStorage();
  updateUI();
});

document.getElementById('paymentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);
  const remarks = document.getElementById('paymentRemarks').value;
  const timestamp = new Date().toLocaleString();

  transactions.push({ type: `Payment ${type}`, currency: 'MVR', amount, rate: 1, remarks, timestamp });
  if (type === 'In') {
    totalPaymentIn += amount;
  } else {
    totalPaymentOut += amount;
  }

  // Calculate net payment
  const netPayment = totalPaymentIn - totalPaymentOut;

  // If net payment is negative, deduct from capital
  if (netPayment < 0) {
    currentCapital += netPayment; // Deduct from capital
    totalPaymentIn = 0; // Reset payment totals
    totalPaymentOut = 0;
  }

  saveToLocalStorage();
  updateUI();
});

document.getElementById('capitalForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const action = document.getElementById('capitalAction').value;
  const amount = parseFloat(document.getElementById('capitalAmount').value);
  const remarks = document.getElementById('capitalRemarks').value;
  const timestamp = new Date().toLocaleString();

  if (action === 'Set') {
    currentCapital = amount;
  } else if (action === 'Add') {
    currentCapital += amount;
  } else if (action === 'Deduct') {
    currentCapital -= amount;
  }

  transactions.push({ type: `Capital ${action}`, currency: 'MVR', amount, rate: 1, remarks, timestamp });
  saveToLocalStorage();
  updateUI();
});

function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('totalPurchasedUSD', totalPurchased.USD);
  localStorage.setItem('totalPurchasedEUR', totalPurchased.EUR);
  localStorage.setItem('totalPurchasedUSDT', totalPurchased.USDT);
  localStorage.setItem('totalSoldUSD', totalSold.USD);
  localStorage.setItem('totalSoldEUR', totalSold.EUR);
  localStorage.setItem('totalSoldUSDT', totalSold.USDT);
  localStorage.setItem('totalBuyCost', totalBuyCost);
  localStorage.setItem('totalSellRevenue', totalSellRevenue);
  localStorage.setItem('totalPaymentIn', totalPaymentIn);
  localStorage.setItem('totalPaymentOut', totalPaymentOut);
  localStorage.setItem('currentCapital', currentCapital);
}

function updateUI() {
  // Update Buy Summary
  document.getElementById('totalPurchasedUSD').textContent = totalPurchased.USD.toFixed(2);
  document.getElementById('totalPurchasedEUR').textContent = totalPurchased.EUR.toFixed(2);
  document.getElementById('totalPurchasedUSDT').textContent = totalPurchased.USDT.toFixed(2);
  const avgPurchaseCost = totalBuyCost / (totalPurchased.USD + totalPurchased.EUR + totalPurchased.USDT) || 0;
  document.getElementById('avgPurchaseCost').textContent = avgPurchaseCost.toFixed(2);

  // Update Sell Summary
  document.getElementById('totalSoldUSD').textContent = totalSold.USD.toFixed(2);
  document.getElementById('totalSoldEUR').textContent = totalSold.EUR.toFixed(2);
  document.getElementById('totalSoldUSDT').textContent = totalSold.USDT.toFixed(2);
  const avgSellPrice = totalSellRevenue / (totalSold.USD + totalSold.EUR + totalSold.USDT) || 0;
  document.getElementById('avgSellPrice').textContent = avgSellPrice.toFixed(2);
  const currentProfit = totalSellRevenue - (totalSold.USD + totalSold.EUR + totalSold.USDT) * avgPurchaseCost;
  document.getElementById('currentProfit').textContent = currentProfit.toFixed(2);

  // Update Payment Summary
  document.getElementById('totalPaymentIn').textContent = totalPaymentIn.toFixed(2);
  document.getElementById('totalPaymentOut').textContent = totalPaymentOut.toFixed(2);
  const netPayment = totalPaymentIn - totalPaymentOut;
  document.getElementById('netPayment').textContent = netPayment.toFixed(2);

  // Update Capital Summary
  document.getElementById('currentCapital').textContent = currentCapital.toFixed(2);

  // Update Currency Balances
  const balanceUSD = totalPurchased.USD - totalSold.USD;
  const balanceEUR = totalPurchased.EUR - totalSold.EUR;
  const balanceUSDT = totalPurchased.USDT - totalSold.USDT;
  document.getElementById('balanceUSD').textContent = balanceUSD.toFixed(2);
  document.getElementById('balanceEUR').textContent = balanceEUR.toFixed(2);
  document.getElementById('balanceUSDT').textContent = balanceUSDT.toFixed(2);

  // Update Transaction History
  const tbody = document.querySelector('#transactionHistory tbody');
  tbody.innerHTML = transactions.map((transaction, index) => `
    <tr>
      <td>${transaction.type}</td>
      <td>${transaction.currency}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>${transaction.rate.toFixed(2)}</td>
      <td>${transaction.remarks}</td>
      <td>${transaction.timestamp}</td>
      <td>
        <button class="action-button edit-button" onclick="editTransaction(${index})">Edit</button>
        <button class="action-button delete-button" onclick="deleteTransaction(${index})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Edit Transaction
function editTransaction(index) {
  const transaction = transactions[index];
  const newType = prompt('Enter new type (Buy/Sell/Payment In/Payment Out/Capital Set/Capital Add/Capital Deduct):', transaction.type);
  const newCurrency = prompt('Enter new currency (USD/EUR/USDT/MVR):', transaction.currency);
  const newAmount = parseFloat(prompt('Enter new amount:', transaction.amount));
  const newRate = parseFloat(prompt('Enter new rate:', transaction.rate));
  const newRemarks = prompt('Enter new remarks:', transaction.remarks);

  if (newType && newCurrency && !isNaN(newAmount) && !isNaN(newRate)) {
    // Update totals
    if (transaction.type.startsWith('Payment')) {
      if (transaction.type === 'Payment In') {
        totalPaymentIn -= transaction.amount;
      } else {
        totalPaymentOut -= transaction.amount;
      }
    } else if (transaction.type.startsWith('Capital')) {
      if (transaction.type === 'Capital Set') {
        currentCapital = 0;
      } else if (transaction.type === 'Capital Add') {
        currentCapital -= transaction.amount;
      } else if (transaction.type === 'Capital Deduct') {
        currentCapital += transaction.amount;
      }
    } else if (transaction.type === 'Buy') {
      totalPurchased[transaction.currency] -= transaction.amount;
      totalBuyCost -= transaction.amount * transaction.rate;
    } else {
      totalSold[transaction.currency] -= transaction.amount;
      totalSellRevenue -= transaction.amount * transaction.rate;
    }

    // Update transaction
    transactions[index] = {
      type: newType,
      currency: newCurrency,
      amount: newAmount,
      rate: newRate,
      remarks: newRemarks,
      timestamp: new Date().toLocaleString(),
    };

    // Update totals with new values
    if (newType.startsWith('Payment')) {
      if (newType === 'Payment In') {
        totalPaymentIn += newAmount;
      } else {
        totalPaymentOut += newAmount;
      }
    } else if (newType.startsWith('Capital')) {
      if (newType === 'Capital Set') {
        currentCapital = newAmount;
      } else if (newType === 'Capital Add') {
        currentCapital += newAmount;
      } else if (newType === 'Capital Deduct') {
        currentCapital -= newAmount;
      }
    } else if (newType === 'Buy') {
      totalPurchased[newCurrency] += newAmount;
      totalBuyCost += newAmount * newRate;
    } else {
      totalSold[newCurrency] += newAmount;
      totalSellRevenue += newAmount * newRate;
    }

    saveToLocalStorage();
    updateUI();
  }
}

// Delete Transaction
function deleteTransaction(index) {
  const transaction = transactions[index];
  if (confirm('Are you sure you want to delete this transaction?')) {
    // Update totals
    if (transaction.type.startsWith('Payment')) {
      if (transaction.type === 'Payment In') {
        totalPaymentIn -= transaction.amount;
      } else {
        totalPaymentOut -= transaction.amount;
      }
    } else if (transaction.type.startsWith('Capital')) {
      if (transaction.type === 'Capital Set') {
        currentCapital = 0;
      } else if (transaction.type === 'Capital Add') {
        currentCapital -= transaction.amount;
      } else if (transaction.type === 'Capital Deduct') {
        currentCapital += transaction.amount;
      }
    } else if (transaction.type === 'Buy') {
      totalPurchased[transaction.currency] -= transaction.amount;
      totalBuyCost -= transaction.amount * transaction.rate;
    } else {
      totalSold[transaction.currency] -= transaction.amount;
      totalSellRevenue -= transaction.amount * transaction.rate;
    }

    transactions.splice(index, 1);
    saveToLocalStorage();
    updateUI();
  }
}

// Export to CSV
document.getElementById('exportCSV').addEventListener('click', () => {
  const headers = ['Type', 'Currency', 'Amount', 'Rate (MVR)', 'Remarks', 'Timestamp'];
  const rows = transactions.map(transaction => [
    transaction.type,
    transaction.currency,
    transaction.amount.toFixed(2),
    transaction.rate.toFixed(2),
    transaction.remarks,
    transaction.timestamp,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transactions.csv';
  link.click();
});
