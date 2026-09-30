const addExpBtn = document.querySelector(".add-expense");
const expenseList = document.querySelector(".expense-lists");
const expenseInput = document.querySelector("#expense-input");
const sumInput = document.querySelector("#sum-input");
const totalSum = document.querySelector("#total-sum");
const categorySelect = document.querySelector("#category");
const sortButtons = document.querySelector(".sort-filters");
const categoryFilter = document.getElementById("category-filter");
const timeButtons = document.querySelectorAll(".time-btn");
const dateFromInput = document.getElementById("date-from");
const dateToInput = document.getElementById("date-to");
const clearDatesBtn = document.getElementById("clear-dates-btn");

let activePeriod = "all";
let activeCategory = "all";

const getExpenses = () => {
  const data = localStorage.getItem("expenses");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveExpenses = (expenses) => {
  localStorage.setItem("expenses", JSON.stringify(expenses));
};

let expenses = getExpenses();

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("mk-MK", {
    style: "currency",
    currency: "MKD",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Помошна функција за претворање на "DD / MM / YYYY" во JS Date објект
const parseExpenseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date();
  const day = parseInt(parts[0].trim(), 10);
  const month = parseInt(parts[1].trim(), 10) - 1;
  const year = parseInt(parts[2].trim(), 10);
  return new Date(year, month, day);
};

const addExp = () => {
  if (!expenseInput.value.trim() || Number(sumInput.value) <= 0) return;

  const now = new Date();
  const formattedDate = `${now.getDate()} / ${now.getMonth() + 1} / ${now.getFullYear()}`;

  const newExpense = {
    id: Date.now(),
    title: expenseInput.value,
    amount: Number(sumInput.value),
    category: categorySelect.value,
    date: formattedDate,
  };

  expenses.push(newExpense);
  saveExpenses(expenses);
  applyFilters(); // Освежи го приказот со активните филтри

  expenseInput.value = "";
  sumInput.value = "";
};

const renderExpenses = (expenseToRender = expenses) => {
  expenseList.innerHTML = "";

  expenseToRender.forEach((exp) => {
    const li = document.createElement("li");
    li.dataset.id = exp.id;

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = exp.title;

    const amount = document.createElement("span");
    amount.className = "amount";
    amount.textContent = formatCurrency(exp.amount);

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = exp.category;

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "Delete";

    const date = document.createElement("span");
    date.className = "date";
    date.textContent = exp.date;

    li.append(title, amount, category, editBtn, deleteBtn, date);
    expenseList.appendChild(li);
  });

  updateTotalSum();
};

expenseList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (e.target.classList.contains("delete")) {
    deleteExpense(id);
  }

  if (e.target.classList.contains("edit")) {
    startEdit(li, id);
  }

  if (e.target.classList.contains("save")) {
    saveEdit(li, id);
  }
});

// Edit Button
const startEdit = (li, id) => {
  const exp = expenses.find((e) => e.id === id);

  li.innerHTML = "";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = exp.title;

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.value = exp.amount;

  const categoryInput = categorySelect.cloneNode(true);
  categoryInput.value = exp.category;

  const dateInput = document.createElement("input");
  dateInput.type = "date";

  if (exp.date) {
    const parts = exp.date.split("/");
    if (parts.length === 3) {
      const day = parts[0].trim().padStart(2, "0");
      const month = parts[1].trim().padStart(2, "0");
      const year = parts[2].trim();
      dateInput.value = `${year}-${month}-${day}`;
    }
  }

  const btn = document.createElement("button");
  btn.textContent = "Save";
  btn.className = "save";

  li.append(titleInput, amountInput, categoryInput, dateInput, btn);
};

// Save Edit
const saveEdit = (li, id) => {
  const titleInput = li.querySelector("input[type='text']");
  const amountInput = li.querySelector("input[type='number']");
  const categoryInput = li.querySelector("select");
  const dateInput = li.querySelector("input[type='date']");

  const exp = expenses.find((e) => e.id === id);

  if (!exp || !titleInput.value.trim() || Number(amountInput.value) <= 0) {
    alert("Invalid input");
    return;
  }

  if (dateInput.value) {
    const [year, month, day] = dateInput.value.split("-");
    exp.date = `${parseInt(day, 10)} / ${parseInt(month, 10)} / ${year}`;
  }

  exp.title = titleInput.value;
  exp.amount = Number(amountInput.value);
  exp.category = categoryInput.value;

  saveExpenses(expenses);
  applyFilters();
};

const deleteExpense = (id) => {
  expenses = expenses.filter((exp) => exp.id !== id);
  saveExpenses(expenses);
  applyFilters();
};

// Apply filters function
function applyFilters() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromValue = dateFromInput ? dateFromInput.value : "";
  const toValue = dateToInput ? dateToInput.value : "";

  const filtered = expenses.filter((exp) => {
    const matchesCategory =
      activeCategory === "all" ||
      exp.category.toLowerCase() === activeCategory.toLowerCase();

    const expDate = parseExpenseDate(exp.date);
    expDate.setHours(0, 0, 0, 0);

    let matchesCustomDate = true;

    if (fromValue || toValue) {
      if (fromValue) {
        const [fYear, fMonth, fDay] = fromValue.split("-");
        const fromDate = new Date(
          Number(fYear),
          Number(fMonth) - 1,
          Number(fDay),
        );
        fromDate.setHours(0, 0, 0, 0);

        if (!toValue) {
          if (expDate.getTime() !== fromDate.getTime()) {
            matchesCustomDate = false;
          }
        } else if (expDate < fromDate) {
          matchesCustomDate = false;
        }
      }

      if (toValue) {
        const [tYear, tMonth, tDay] = toValue.split("-");
        const toDate = new Date(
          Number(tYear),
          Number(tMonth) - 1,
          Number(tDay),
        );
        toDate.setHours(0, 0, 0, 0);

        if (!fromValue) {
          if (expDate.getTime() !== toDate.getTime()) {
            matchesCustomDate = false;
          }
        } else if (expDate > toDate) {
          matchesCustomDate = false;
        }
      }
    }

    let matchesPeriod = false;

    if (fromValue || toValue) {
      matchesPeriod = true;
    } else {
      if (activePeriod === "all") {
        matchesPeriod = true;
      } else if (activePeriod === "day" || activePeriod === "daily") {
        matchesPeriod = expDate.getTime() === today.getTime();
      } else if (activePeriod === "week" || activePeriod === "weekly") {
        const diffInDays = (today - expDate) / (1000 * 60 * 60 * 24);
        matchesPeriod = diffInDays >= 0 && diffInDays <= 7;
      } else if (activePeriod === "month" || activePeriod === "monthly") {
        matchesPeriod =
          expDate.getMonth() === today.getMonth() &&
          expDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesCategory && matchesCustomDate && matchesPeriod;
  });

  renderExpenses(filtered);
}

// total sum
function updateTotalSum() {
  const visibleLiElements = document.querySelectorAll(".expense-lists li");
  let filteredTotal = 0;

  visibleLiElements.forEach((li) => {
    const id = Number(li.dataset.id);
    const exp = expenses.find((e) => e.id === id);
    if (exp) filteredTotal += exp.amount;
  });

  if (totalSum) {
    totalSum.textContent = formatCurrency(filteredTotal);
  }
}

// Event Listeners за копчињата за филтрирање
timeButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    timeButtons.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");

    // Поддршка за data-range или data-period од HTML-от
    activePeriod =
      e.target.dataset.range || e.target.getAttribute("data-period") || "all";

    applyFilters();
  });
});

if (categoryFilter) {
  categoryFilter.addEventListener("change", (e) => {
    activeCategory = e.target.value.toLowerCase();
    applyFilters();
  });
}

// Sorting
if (sortButtons) {
  sortButtons.addEventListener("click", (e) => {
    if (!e.target.classList.contains("sort-btn")) return;

    const sortType = e.target.dataset.sort;

    if (sortType === "amount-high") {
      expenses.sort((a, b) => b.amount - a.amount);
    } else if (sortType === "amount-low") {
      expenses.sort((a, b) => a.amount - b.amount);
    } else if (sortType === "date-new") {
      expenses.sort((a, b) => b.id - a.id);
    } else if (sortType === "date-old") {
      expenses.sort((a, b) => a.id - b.id);
    }

    applyFilters();
  });
}

if (dateFromInput && dateToInput) {
  dateFromInput.addEventListener("change", applyFilters);
  dateToInput.addEventListener("change", applyFilters);
}

if (clearDatesBtn) {
  clearDatesBtn.addEventListener("click", () => {
    dateFromInput.value = "";
    dateToInput.value = "";
    applyFilters();
  });
}

// Enter keypress
const handleEnterKey = (e) => {
  if (e.key === "Enter") addExp();
};
expenseInput.addEventListener("keydown", handleEnterKey);
sumInput.addEventListener("keydown", handleEnterKey);

addExpBtn.addEventListener("click", addExp);

// Apply filters
applyFilters();
