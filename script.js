const addExpBtn = document.querySelector(".add-expense");
const expenseList = document.querySelector(".expense-lists");
const expenseInput = document.querySelector("#expense-input");
const sumInput = document.querySelector("#sum-input");
const sumBtn = document.querySelector("#sum-expenses");
const totalSum = document.querySelector("#total-sum");
const categorySelect = document.querySelector("#category");

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

  const newExpense = {
    id: Date.now(),
    title: expenseInput.value,
    amount: Number(sumInput.value),
    category: categorySelect.value,
    date: new Date().toLocaleDateString(),
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

const renderExpenses = () => {
  expenseList.innerHTML = "";

  expenses.forEach((exp) => {
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

  updateTotal();
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

  if (!titleInput.value.trim() || amountInput.value <= 0) {
    alert("Invalid input");
    return;
  }

  if (dateInput.value) {
    const [year, month, day] = dateInput.value.split("-");
    exp.date = `${day} / ${month} / ${year}`;
  }

  const exp = expenses.find((e) => e.id === id);

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

const updateTotal = () => {
  let total = 0;

  expenses.forEach((exp) => {
    total += exp.amount;
  });

  totalSum.textContent = total;
};

addExpBtn.addEventListener("click", addExp);
renderExpenses();
