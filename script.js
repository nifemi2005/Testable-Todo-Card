const form = document.querySelector("form");
const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");
const statusInput = document.getElementById("status-input");
const descriptionInput = document.getElementById("description-input");
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
    description: descriptionInput.value.trim(),
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

  updateTaskCount();
});

function descriptionHTML(task) {
  if (!task.description) return "";
  if (task.description.length <= 100) {
    return `<p class="task-description" data-testid="test-todo-description">${task.description}</p>`;
  }
  const preview = task.description.slice(0, 100);
  return `
    <div class="description-wrapper">
      <p class="task-description" data-testid="test-todo-description">${preview}...</p>
      <div id="desc-full-${task.id}" class="desc-full" data-testid="test-todo-collapsible-section" hidden>
        <p class="task-description">${task.description}</p>
      </div>
      <button
        type="button"
        class="expand-toggle"
        data-testid="test-todo-expand-toggle"
        aria-expanded="false"
        aria-controls="desc-full-${task.id}"
      >Show more</button>
    </div>
  `;
}

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
    <div class="priority-indicator priority-indicator-${task.priority}" data-testid="test-todo-priority-indicator"></div>
    <div class="card-top">
    <div>
      <input 
        type="checkbox" 
        id="checkbox-${task.id}"
        role="checkbox"
        aria-label="Mark task complete"
        aria-checked="${task.done}"
        ${task.done ? "checked" : ""}
        data-testid="test-todo-complete-toggle"
      />
      <label></label>
    </div>
      <div class="card-body">
        <div class="card-row">
          <span class="task-title">${task.title}</span>
          <div class='group'>
            <span class="priority-badge ${priorityClass}" data-testid="test-todo-priority">${task.priority}</span>
            <select class="status-control ${statusClass}" data-testid="test-todo-status-control" aria-label="Task status">
              <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="in progress" ${task.status === "in progress" ? "selected" : ""}>In Progress</option>
              <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
            </select>
          </div>
        </div>
        ${descriptionHTML(task)}
        <div class="card-meta">
          <time class="due-date" data-testid="test-todo-due-date">Due: ${formattedDate}</time>
          <span class="overdue-indicator" data-testid="test-todo-overdue-indicator" hidden></span>
          <time class="time-hint" data-testid="test-todo-time-remaining" id="hint-${task.id}" aria-live="polite"></time>
        </div>
        <ul class="tags" data-testid="test-todo-tags" role="list">
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
  const hintEl = document.getElementById(`hint-${task.id}`);
  if (!hintEl) return;

  const card = hintEl.closest(".task-card");
  const overdueIndicator = card
    ? card.querySelector('[data-testid="test-todo-overdue-indicator"]')
    : null;

  if (task.done || task.status === "done") {
    hintEl.textContent = "Completed";
    hintEl.className = "time-hint hint-done";
    if (overdueIndicator) overdueIndicator.hidden = true;
    return;
  }

  if (!task.dueDate) {
    hintEl.textContent = "";
    hintEl.className = "time-hint";
    if (overdueIndicator) overdueIndicator.hidden = true;
    return;
  }

  const now = new Date();
  const due = new Date(task.dueDate);
  const diffMs = due - now;
  const absDiffMs = Math.abs(diffMs);
  const absDiffMins = Math.floor(absDiffMs / 60000);
  const absDiffHours = Math.floor(absDiffMs / 3600000);
  const absDiffDays = Math.floor(absDiffMs / 86400000);

  let text = "";
  let cls = "";
  let isOverdue = false;

  if (diffMs <= 0) {
    isOverdue = true;
    if (absDiffMins < 60) {
      text = absDiffMins <= 1
        ? "Overdue by 1 minute"
        : `Overdue by ${absDiffMins} minutes`;
    } else if (absDiffHours < 24) {
      text = absDiffHours === 1
        ? "Overdue by 1 hour"
        : `Overdue by ${absDiffHours} hours`;
    } else {
      text = absDiffDays === 1
        ? "Overdue by 1 day"
        : `Overdue by ${absDiffDays} days`;
    }
    cls = "hint-overdue";
  } else if (diffMs < 60000) {
    text = "Due now!";
    cls = "hint-now";
  } else if (diffMs < 3600000) {
    const mins = Math.round(diffMs / 60000);
    text = mins === 1 ? "Due in 1 minute" : `Due in ${mins} minutes`;
    cls = "hint-soon";
  } else if (diffMs < 86400000) {
    const hours = Math.round(diffMs / 3600000);
    text = hours === 1 ? "Due in 1 hour" : `Due in ${hours} hours`;
    cls = "hint-soon";
  } else if (absDiffDays === 1) {
    text = "Due tomorrow";
    cls = "hint-soon";
  } else {
    text = `Due in ${absDiffDays} days`;
    cls = "hint-ok";
  }

  hintEl.textContent = text;
  hintEl.className = `time-hint ${cls}`;
  if (overdueIndicator) overdueIndicator.hidden = !isOverdue;
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
    updateTaskCount();
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

    const statusControl = card.querySelector(".status-control");

    if (task.done) {
      task.status = "done";
      statusControl.value = "done";
      statusControl.className = "status-control status-done";
    } else {
      task.status = "pending";
      statusControl.value = "pending";
      statusControl.className = "status-control status-pending";
    }
  }
});

taskList.addEventListener("change", function (e) {
  if (e.target.classList.contains("status-control")) {
    const card = e.target.closest(".task-card");
    const taskId = Number(card.dataset.id);
    const task = tasks.find((t) => t.id === taskId);
    const checkbox = card.querySelector('input[type="checkbox"]');

    task.status = e.target.value;
    const statusClass = `status-${task.status.replace(" ", "")}`;
    e.target.className = `status-control ${statusClass}`;

    if (task.status === "done") {
      task.done = true;
      checkbox.checked = true;
      checkbox.setAttribute("aria-checked", "true");
      card.classList.add("done");
    } else {
      task.done = false;
      checkbox.checked = false;
      checkbox.setAttribute("aria-checked", "false");
      card.classList.remove("done");
    }
  }
});

taskList.addEventListener("click", function (e) {
  if (e.target.classList.contains("expand-toggle")) {
    const btn = e.target;
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    const section = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", !isExpanded);
    section.hidden = isExpanded;
    btn.textContent = isExpanded ? "Show more" : "Show less";
  }
});

taskList.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-btn")) {
    const card = e.target.closest(".task-card");

    const taskId = Number(card.dataset.id);

    const task = tasks.find((task) => task.id === taskId);

    const editBtn = e.target;

    card.innerHTML = `
    <form data-testid="test-todo-edit-form" class="edit-form">
      
      <div class="edit-field">
        <label for="edit-title-${task.id}">Title</label>
        <input 
          type="text" 
          id="edit-title-${task.id}"
          data-testid="test-todo-edit-title-input"
          value="${task.title}"
          class="edit-input"
        />
      </div>

      <div class="edit-field">
        <label for="edit-desc-${task.id}">Description</label>
        <textarea 
          id="edit-desc-${task.id}"
          data-testid="test-todo-edit-description-input"
          class="edit-input edit-textarea"
        >${task.description || ""}</textarea>
      </div>

      <div class="edit-field">
        <label for="edit-priority-${task.id}">Priority</label>
        <select 
          id="edit-priority-${task.id}"
          data-testid="test-todo-edit-priority-select"
          class="edit-input"
        >
          <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
          <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
          <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
        </select>
      </div>

      <div class="edit-field">
        <label for="edit-due-${task.id}">Due Date</label>
        <input 
          type="datetime-local" 
          id="edit-due-${task.id}"
          data-testid="test-todo-edit-due-date-input"
          value="${task.dueDate || ""}"
          class="edit-input"
        />
      </div>

      <div class="edit-actions">
        <button 
          type="submit"
          data-testid="test-todo-save-button"
          class="save-btn"
        >Save</button>
        <button 
          type="button"
          data-testid="test-todo-cancel-button"
          class="cancel-btn"
        >Cancel</button>
      </div>

    </form>
    `;
    card.querySelector(`#edit-title-${task.id}`).focus();

    card.querySelector(".edit-form").addEventListener("submit", function (e) {
      e.preventDefault();

      task.title = card.querySelector(`#edit-title-${task.id}`).value.trim();
      task.description = card
        .querySelector(`#edit-desc-${task.id}`)
        .value.trim();
      task.priority = card.querySelector(`#edit-priority-${task.id}`).value;
      task.dueDate = card.querySelector(`#edit-due-${task.id}`).value;

      card.innerHTML = "";
      rebuildCard(card, task);

      card.querySelector(".edit-btn").focus();
    });

    card.querySelector(".cancel-btn").addEventListener("click", function () {
      card.innerHTML = "";
      rebuildCard(card, task);

      card.querySelector(".edit-btn").focus();
    });
  }
});

function rebuildCard(card, task) {
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'No due date';

  const priorityClass = `priority-${task.priority}`;
  const statusClass = `status-${task.status.replace(' ', '')}`;
  const tagsHTML = task.tags
    .map(tag => `<span class="tag" data-testid="test-todo-tag-${tag.toLowerCase()}">${tag}</span>`)
    .join('');

  card.innerHTML = `
    <div class="priority-indicator priority-indicator-${task.priority}" data-testid="test-todo-priority-indicator"></div>
    <div class="card-top">
      <label for="checkbox-${task.id}">
        <input 
          type="checkbox" 
          id="checkbox-${task.id}"
          role="checkbox"
          aria-label="Mark task complete"
          aria-checked="${task.done}"
          ${task.done ? 'checked' : ''}
        />
        <span></span>
      </label>
      <div class="card-body">
        <div class="card-row">
          <span class="task-title">${task.title}</span>
          <div class="group">
            <span class="priority-badge ${priorityClass}">${task.priority}</span>
            <select class="status-control ${statusClass}" data-testid="test-todo-status-control" aria-label="Task status">
              <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in progress" ${task.status === 'in progress' ? 'selected' : ''}>In Progress</option>
              <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            </select>
          </div>
        </div>
        ${descriptionHTML(task)}
        <div class="card-meta">
          <span class="due-date">Due ${formattedDate}</span>
          <span class="overdue-indicator" data-testid="test-todo-overdue-indicator" hidden></span>
          <span class="time-hint" id="hint-${task.id}" aria-live="polite"></span>
        </div>
        <div class="tags">${tagsHTML}</div>
        <div class="card-actions">
          <button class="edit-btn" aria-label="Edit task">Edit</button>
          <button class="delete-btn" aria-label="Delete task">Delete</button>
        </div>
      </div>
    </div>
  `;

  // reapply done class if task is done
  if (task.done) card.classList.add('done');
  else card.classList.remove('done');

  // update the time hint
  updateTimeHint(task);
}

const taskCount = document.getElementById("count");

function updateTaskCount() {
  taskCount.textContent = `${tasks.length} task`;
}
