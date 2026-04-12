const form = document.querySelector("form");
const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");
const statusInput = document.getElementById("status-input");
const tagInput = document.getElementById("tag-input");
const taskList = document.getElementById("task-list");

let tags = [];
let tasks = [];

tagInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const tagValue = tagInput.value.trim();
    if (tagValue !== "") {
      tags.push(tagValue);
      tagInput.value = "";
    }
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const taskTitle = taskInput.value.trim();
  if (taskTitle === "") return;
  const task = {
    id: Date.now(),
    title: taskTitle,
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    status: statusInput.value,
    tags: [...tags],
    done: false,
  };

  tasks.push(task);

  renderTask(task);

  tags = [];

  form.reset();
});

function renderTask(task) {
  const li = document.createElement("li");

  li.classList.add("task-card");

  li.dataset.id = task.id;

  if (task.done) li.classList.add("done");

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No due date";

  const priorityClass = `priority-${task.priority}`;

  const statusClass = `status-${task.status.replace(" ", "")}`;

  const tagsHTML = task.tags
    .map(
      (tag) =>
        `<span class="tag" data-testid="test-todo-tag-${tag.toLowerCase()}">${tag}</span>`,
    )
    .join("");

  li.innerHTML = `
    <div class="card-top">
    <div>
      <input 
        type="checkbox" 
        id="checkbox-${task.id}"
        role="checkbox"
        aria-label="Mark task complete"
        aria-checked="${task.done}"
        ${task.done ? "checked" : ""}
      />
      <label></label>
    </div>
      <div class="card-body">
        <div class="card-row">
          <span class="task-title">${task.title}</span>
          <span class="priority-badge ${priorityClass}" data-testid="test-todo-priority">${task.priority}</span>
          <span class="status-badge ${statusClass}" data-testid="test-todo-status">${task.status}</span>
        </div>
        <div class="card-meta">
          <time class="due-date" data-testid="test-todo-due-date">Due: ${formattedDate}</time>
          <time class="time-hint" data-testid="test-todo-time-remaining" id="hint-${task.id}"></time>
        </div>
        <ul class="tags" data-testid="test-todo-tags" role="list>
          <li>${tagsHTML}</li>
        </ul>
        <div class="card-actions">
          <button class="edit-btn" aria-label="Edit task" data-testid="test-todo-edit-button">Edit</button>
          <button class="delete-btn" aria-label="Delete task" data-testid="test-todo-delete-button">Delete</button>
        </div>
      </div>
    </div>
  `;

  taskList.appendChild(li);

  updateTimeHint(task);
}

function updateTimeHint(task) {
  const hintE1 = document.getElementById(`hint-${task.id}`);

  if (!hintE1) return;

  if (!task.dueDate) {
    hintE1.textContent = "";
    return;
  }

  const now = new Date();
  const due = Date(task.dueDate);

  const diffMs = due - now;

  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  let text = "";
  let cls = "";

  if (diffMins <= 0 && diffMins > -60) {
    text = "Due now!";
    cls = "hint-now";
  } else if (diffMins < 0) {
    if (diffHours < 24) {
      text = `Overdue by ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? "s" : ""}`;
    } else {
      text = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;
    }
    cls = "hint-overdue";
  } else if (diffDays == 0) {
    text = "Due today";
    cls = "hint-soon";
  } else if (diffDays == 1) {
    text = "Due tomorrow";
    cls = "hint-soon";
  } else if (diffDays <= 3) {
    text = `Due ${diffDays} days`;
    cls = "hint-soon";
  } else {
    text = `Due in ${diffDays} days`;
    cls = "hint-ok";
  }

  hintE1.textContent = text;
  hintE1.className = `time-hint ${cls}`;
}

// update all task hints every 30 seconds
setInterval(function () {
  tasks.forEach((task) => updateTimeHint(task));
}, 30000);

taskList.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const card = e.target.closest(".task-card");

    const taskId = Number(card.dataset.id);

    card.style.opacity = "0";

    setTimeout(function () {
      card.remove();
    }, 300);

    tasks = tasks.filter((task) => task.id !== taskId);
  }
});

taskList.addEventListener("change", function (e) {
  if (e.target.type === "checkbox") {
    const card = e.target.closest(".task-card");

    const taskId = Number(card.dataset.id);

    const task = tasks.find((task) => task.id === taskId);

    task.done = e.target.checked;

    e.target.setAttribute("aria-checked", task.done);

    if (task.done) {
      card.classList.add("done");
    } else {
      card.classList.remove("done");
    }

    const statusBadge = card.querySelector(".status-badge");

    if (task.done) {
      task.status = "done";

      statusBadge.textContent = "done";

      statusBadge.classList.remove(
        "status-pending",
        "status-inprogress",
        "status-done",
      );

      statusBadge.classList.add("status-done");
    } else {
      task.status = "pending";

      statusBadge.textContent = "pending";

      statusBadge.classList.remove(
        "status-pending",
        "status-inprogress",
        "status-done",
      );

      statusBadge.classList.add("status-pending");
    }
  }
});

taskList.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-btn")) {
    const card = e.target.closest(".task-card");

    const taskId = Number(card.dataset.id);

    const task = tasks.find((task) => task.id === taskId);

    taskInput.value = task.title;
    priorityInput.value = task.priority;
    dueDateInput.value = task.dueDate;
    statusInput.value = task.status;

    tags = [...task.tags];

    card.style.opacity = "0";
    setTimeout(function () {
      card.remove();
    }, 300);

    tasks = tasks.filter((t) => t.id !== taskId);

    form.scrollIntoView({ behavior: "smooth" });
  }
});
