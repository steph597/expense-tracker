const addExpBtn = document.querySelector(".add-expense");
const expenseList = document.querySelector(".expense-lists");
const expenseInput = document.querySelector("#expense-input");
const sumInput = document.querySelector("#sum-input");
const sumBtn = document.querySelector("#sum-expenses");
const totalSum = document.querySelector("#total-sum");
const categorySelect = document.querySelector("#category");
const filterLists = document.querySelector(".time-filters");
const sortButtons = document.querySelector(".sort-filters");

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
  renderExpenses();

  // expenseInput.addEventListener("keydown", (e) => {
  //   if (e.key === "Enter") addExp();
  // });

  // sumInput.addEventListener("keydown", (e) => {
  //   if (e.key === "Enter") addExp();
  // });

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
    amount.textContent = new Intl.NumberFormat("de-De", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(exp.amount);

    const category = document.createElement("span");
    category.classList = "category";
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

  updateTotal(expenseToRender);
};

expenseList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  // Delete
  if (e.target.classList.contains("delete")) {
    deleteExpense(id);
  }

  // Edit
  if (e.target.classList.contains("edit")) {
    startEdit(li, id);
  }

  // Save
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
    const [day, month, year] = exp.date.split("-");
    dateInput.value = `${year}-${month}-${day}`;
  }

  const btn = document.createElement("button");
  btn.textContent = "Save";
  btn.className = "save";

  li.append(titleInput, amountInput, categoryInput, dateInput, btn);
};

// Save
const saveEdit = (li, id) => {
  const titleInput = li.querySelector("input[type='text']");
  const amountInput = li.querySelector("input[type='number']");
  const categoryInput = li.querySelector("select");
  const dateInput = li.querySelector("input[type='date']");

  const exp = expenses.find((e) => e.id === id);

  if (!exp || !titleInput.value.trim() || amountInput.value <= 0) {
    alert("Invalid input");
    return;
  }

  if (dateInput.value) {
    const [year, month, day] = dateInput.value.split("-");
    exp.date = `${day} / ${month} / ${year}`;
  }

  exp.title = titleInput.value;
  exp.amount = Number(amountInput.value);
  exp.category = categoryInput.value;

  saveExpenses(expenses);
  renderExpenses();
};

const deleteExpense = (id) => {
  expenses = expenses.filter((exp) => exp.id !== id);

  saveExpenses(expenses);

  renderExpenses();
};

const updateTotal = (list = expenses) => {
  let total = 0;

  list.forEach((exp) => {
    total += exp.amount;
  });

  totalSum.textContent = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(total);
};

// Filter by time
filterLists.addEventListener("click", (e) => {
  if (!e.target.classList.contains("time-btn")) return;

  const range = e.target.dataset.range;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filtered;

  if (range === "all") {
    filtered = expenses;
  } else {
    filtered = expenses.filter((exp) => {
      const dateParts = exp.date.split("/");
      if (dateParts.length !== 3) return false;

      const day = parseInt(dateParts[0].trim());
      const month = parseInt(dateParts[1].trim()) - 1;
      const year = parseInt(dateParts[2].trim());

      const expenseDate = new Date(year, month, day).getTime();

      if (range === "day") {
        return expenseDate >= today.getTime();
      } else if (range === "week") {
        const startOfWeek = new Date(today);
        const dayOfWeek = startOfWeek.getDay();
        const diff =
          startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return expenseDate >= startOfWeek.getTime();
      } else if (range === "month") {
        const startOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        ).getTime();
        return expenseDate >= startOfMonth;
      }
      return true;
    });
  }

  renderExpenses(filtered);
});

sortButtons.addEventListener("click", (e) => {
  if (!e.target.classList.contains("sort-btn")) return;

  const sortType = e.target.dataset.sort;

  let sorted = [...expenses];

  if (sortType === "amount-high") {
    sorted.sort((a, b) => b.amount - a.amount);
  } else if (sortType === "amount-low") {
    sorted.sort((a, b) => a.amount - b.amount);
  } else if (sortType === "date-new") {
    sorted.sort((a, b) => b.id - a.id);
  } else if (sortType === "date-old") {
    sorted.sort((a, b) => a.id - b.id);
  }

  renderExpenses(sorted);
});

addExpBtn.addEventListener("click", addExp);
renderExpenses();
