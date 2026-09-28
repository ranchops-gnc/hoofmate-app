import {
  applyAction,
  createInitialState,
  getDashboardView,
  getCareStatus,
  handleAssistantInput,
  roleCan,
  roleLabel
} from "./model.js";

const state = createInitialState();
const horse = state.horses[0];
let currentRole = "owner";
let currentActorId = "u-owner";
let pendingAction = null;

const roleSelect = document.getElementById("roleSelect");
const roleBadge = document.getElementById("roleBadge");
const careList = document.getElementById("careTimeline");
const overdueList = document.getElementById("overdueList");
const alertList = document.getElementById("alertList");
const taskList = document.getElementById("taskList");
const contactsList = document.getElementById("contactsList");
const auditList = document.getElementById("auditList");
const chat = document.getElementById("chat");
const form = document.getElementById("askForm");
const input = document.getElementById("askInput");
const confirmHint = document.getElementById("confirmHint");
const confidenceTag = document.getElementById("confidenceTag");
const groundedTag = document.getElementById("groundedTag");
const heroTitle = document.getElementById("horseName");
const heroMeta = document.getElementById("horseMeta");
const heroStats = document.getElementById("horseStats");

function addBubble(text, who = "bot") {
  const el = document.createElement("div");
  el.className = `bubble ${who}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function withConfirm(question, callback) {
  if (window.confirm(question)) callback();
}

function formatStatus(status) {
  return {
    overdue: "Overdue",
    due_soon: "Due soon",
    upcoming: "Upcoming",
    completed: "Completed"
  }[status] ?? status;
}

function actorIdForRole(role) {
  return state.users.find((u) => u.role === role)?.id ?? "u-owner";
}

function renderHero() {
  heroTitle.textContent = horse.name;
  heroMeta.textContent = `${horse.sex} · ${horse.type}`;
  heroStats.innerHTML = `
    <div><span>Age</span><strong>${horse.age}</strong></div>
    <div><span>Height</span><strong>${horse.height}</strong></div>
    <div><span>Weight</span><strong>${horse.weight} lb</strong></div>
    <div><span>Discipline</span><strong>${horse.discipline}</strong></div>
  `;
  document.getElementById("horsePhoto").src = horse.photoUrl;
}

function renderCare(view) {
  careList.innerHTML = "";
  view.next7DaysCare.forEach((item) => {
    const row = document.createElement("li");
    row.innerHTML = `
      <time>${item.dueLabel}</time>
      <div>
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
      <div class="row-actions">
        <em class="tag ${item.status === "due_soon" ? "due" : ""}">${formatStatus(item.status)}</em>
        <button data-action="mark_complete" data-id="${item.id}">Done</button>
        <button data-action="snooze" data-id="${item.id}">+1d</button>
      </div>
    `;
    careList.appendChild(row);
  });

  careList.querySelectorAll("button").forEach((btn) => {
    btn.disabled = !roleCan(currentRole, btn.dataset.action);
    btn.addEventListener("click", () => {
      withConfirm("Confirm this change?", () => {
        const result = applyAction(state, {
          type: btn.dataset.action,
          id: btn.dataset.id,
          role: currentRole,
          actorId: currentActorId
        });
        addBubble(result.message, "bot");
        render();
      });
    });
  });
}

function renderOverdue(view) {
  overdueList.innerHTML = "";
  if (!view.overdueCare.length) {
    overdueList.innerHTML = "<li><span>No overdue care items.</span></li>";
    return;
  }

  view.overdueCare.forEach((item) => {
    const row = document.createElement("li");
    row.innerHTML = `
      <span>${item.title}</span>
      <strong>${item.dueLabel}</strong>
      <em class="warn">Owner: ${item.ownerName}</em>
    `;
    overdueList.appendChild(row);
  });
}

function renderAlerts(view) {
  alertList.innerHTML = "";
  view.openAlerts.forEach((alert) => {
    const row = document.createElement("li");
    row.innerHTML = `<span>${alert.title}</span><em class="${alert.level === "warning" ? "warn" : "ok"}">${alert.level}</em>`;
    alertList.appendChild(row);
  });
}

function renderTasks(view) {
  taskList.innerHTML = "";
  view.openTasks.forEach((task) => {
    const row = document.createElement("li");
    row.innerHTML = `
      <span>${task.title}</span>
      <strong>${task.dueLabel}</strong>
      <div class="row-actions">
        <em class="tag">${task.ownerName}</em>
      </div>
    `;
    taskList.appendChild(row);
  });
}

function renderContacts() {
  contactsList.innerHTML = "";
  state.contacts.forEach((contact) => {
    const row = document.createElement("li");
    row.innerHTML = `<strong>${contact.name}</strong><span>${contact.role}</span><a href="tel:+1${contact.phone.replaceAll("-", "")}">${contact.phone}</a>`;
    contactsList.appendChild(row);
  });
}

function renderAudit() {
  auditList.innerHTML = "";
  state.auditLog.slice(0, 6).forEach((entry) => {
    const row = document.createElement("li");
    const time = new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    row.innerHTML = `<span>${time}</span><strong>${entry.action}</strong><em class="tag">${entry.details}</em>`;
    auditList.appendChild(row);
  });
}

function assignSelectedEvent() {
  const firstOpen = state.careEvents.find((item) => getCareStatus(item) !== "completed");
  if (!firstOpen) {
    addBubble("No open care events to assign.", "bot");
    return;
  }
  withConfirm(`Assign ${firstOpen.title} to current role?`, () => {
    const result = applyAction(state, {
      type: "assign",
      id: firstOpen.id,
      assigneeId: currentActorId,
      role: currentRole,
      actorId: currentActorId
    });
    addBubble(result.message, "bot");
    render();
  });
}

function renderRole() {
  roleSelect.value = currentRole;
  roleBadge.textContent = roleLabel(currentRole);
  roleBadge.className = `tag role-${currentRole}`;
}

function render() {
  const view = getDashboardView(state);
  renderRole();
  renderHero();
  renderCare(view);
  renderOverdue(view);
  renderAlerts(view);
  renderTasks(view);
  renderContacts();
  renderAudit();
}

roleSelect.addEventListener("change", () => {
  currentRole = roleSelect.value;
  currentActorId = actorIdForRole(currentRole);
  addBubble(`Role switched to ${roleLabel(currentRole)}.`, "bot");
  render();
});

document.getElementById("assignTask").addEventListener("click", assignSelectedEvent);

document.getElementById("logRide").addEventListener("click", () => {
  withConfirm("Log a new ride for today?", () => {
    const result = applyAction(state, {
      type: "log_ride",
      id: "Quick action ride log from dashboard.",
      role: currentRole,
      actorId: currentActorId
    });
    addBubble(result.message, "bot");
    render();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const q = input.value.trim();
  if (!q) return;
  addBubble(q, "user");
  input.value = "";

  const response = handleAssistantInput({
    state,
    text: q,
    role: currentRole,
    actorId: currentActorId,
    pendingAction
  });

  pendingAction = response.pendingAction ?? null;
  confirmHint.textContent = pendingAction ? "Pending action: reply yes to confirm or no to cancel." : "";
  confidenceTag.textContent = `Confidence: ${response.confidence}`;
  groundedTag.textContent = `Grounded on: ${response.groundedOn.join(", ")}`;

  setTimeout(() => {
    addBubble(response.text, "bot");
    render();
  }, 120);
});

addBubble("Data-backed mode is live. Ask for overdue care, create reminders, log rides, or call contacts.", "bot");
render();
