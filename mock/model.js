const DATE_MS = 24 * 60 * 60 * 1000;

export const ROLES = {
  owner: { label: "Owner", actions: ["mark_complete", "snooze", "assign", "create_reminder", "log_ride"] },
  manager: { label: "Manager", actions: ["mark_complete", "snooze", "assign", "create_reminder", "log_ride"] },
  staff: { label: "Staff", actions: ["mark_complete", "log_ride"] }
};

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function fullDateLabel(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function daysUntil(dateText, now = new Date()) {
  const target = new Date(`${dateText}T00:00:00`);
  const baseline = new Date(now);
  baseline.setHours(0, 0, 0, 0);
  return Math.round((target - baseline) / DATE_MS);
}

export function getCareStatus(event, now = new Date()) {
  if (event.completedAt) return "completed";
  const delta = daysUntil(event.dueDate, now);
  if (delta < 0) return "overdue";
  if (delta <= 2) return "due_soon";
  return "upcoming";
}

function getPermission(role, action) {
  return Boolean(ROLES[role]?.actions.includes(action));
}

export function createInitialState(now = new Date()) {
  const today = new Date(now);

  return {
    ranch: { id: "r-1", name: "Pine Creek Ranch", region: "Colorado" },
    users: [
      { id: "u-owner", name: "Sean", role: "owner" },
      { id: "u-manager", name: "Dana", role: "manager" },
      { id: "u-staff", name: "Luis", role: "staff" }
    ],
    horses: [
      {
        id: "h-leoti",
        name: "Leoti",
        type: "Quarter Horse",
        sex: "Mare",
        age: 8,
        height: "15.1 hh",
        weight: 1080,
        discipline: "Ranch / trail",
        photoUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=640&q=80"
      }
    ],
    careEvents: [
      { id: "c-1", horseId: "h-leoti", title: "Farrier appointment", detail: "Trim + shoes · Jake Lane", dueDate: isoDate(addDays(today, -1)), ownerId: "u-manager", completedAt: null },
      { id: "c-2", horseId: "h-leoti", title: "Dewormer", detail: "Ivermectin · barn aisle", dueDate: isoDate(addDays(today, 2)), ownerId: "u-staff", completedAt: null },
      { id: "c-3", horseId: "h-leoti", title: "Vaccines", detail: "Fall combo · Dr. Megan Lee", dueDate: isoDate(addDays(today, 7)), ownerId: "u-owner", completedAt: null },
      { id: "c-4", horseId: "h-leoti", title: "Dental float", detail: "Dr. Megan Lee", dueDate: isoDate(addDays(today, 14)), ownerId: "u-owner", completedAt: null }
    ],
    rideLogs: [
      { id: "r-1", horseId: "h-leoti", date: isoDate(addDays(today, -1)), durationMinutes: 45, notes: "Easy trail loop, no heat in legs.", riderId: "u-owner" }
    ],
    contacts: [
      { id: "ct-1", name: "Dr. Megan Lee", role: "Veterinarian", phone: "303-555-0112" },
      { id: "ct-2", name: "Jake Lane", role: "Farrier", phone: "720-555-0188" },
      { id: "ct-3", name: "Ranch manager", role: "On-call", phone: "720-555-0101" }
    ],
    alerts: [
      { id: "a-1", title: "North pasture gate ice risk", level: "warning", isOpen: true, updatedAt: isoDate(today) },
      { id: "a-2", title: "Barn cam online", level: "ok", isOpen: true, updatedAt: isoDate(today) }
    ],
    tasks: [
      { id: "t-1", title: "Prep farrier kit", dueDate: isoDate(addDays(today, 1)), ownerId: "u-staff", status: "open" },
      { id: "t-2", title: "Confirm vaccine inventory", dueDate: isoDate(addDays(today, 5)), ownerId: "u-manager", status: "open" }
    ],
    auditLog: [
      { id: "log-1", at: new Date(now).toISOString(), actorId: "system", action: "seed_data", target: "dashboard", details: "Initialized mock ranch data model." }
    ]
  };
}

function ownerName(state, ownerId) {
  return state.users.find((u) => u.id === ownerId)?.name ?? "Unassigned";
}

export function getDashboardView(state, now = new Date()) {
  const careWithStatus = state.careEvents
    .map((event) => ({ ...event, status: getCareStatus(event, now), dueLabel: fullDateLabel(event.dueDate), ownerName: ownerName(state, event.ownerId) }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const overdueCare = careWithStatus.filter((item) => item.status === "overdue");
  const next7DaysCare = careWithStatus.filter((item) => {
    const delta = daysUntil(item.dueDate, now);
    return delta >= 0 && delta <= 7 && item.status !== "completed";
  });

  const openAlerts = state.alerts.filter((alert) => alert.isOpen);
  const openTasks = state.tasks
    .filter((task) => task.status !== "done")
    .map((task) => ({ ...task, dueLabel: fullDateLabel(task.dueDate), ownerName: ownerName(state, task.ownerId) }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return { careWithStatus, overdueCare, next7DaysCare, openAlerts, openTasks };
}

function audit(state, actorId, action, target, details) {
  state.auditLog.unshift({
    id: `log-${state.auditLog.length + 1}`,
    at: new Date().toISOString(),
    actorId,
    action,
    target,
    details
  });
}

function ensurePermission(role, action) {
  if (!getPermission(role, action)) {
    return { ok: false, message: `Role ${ROLES[role]?.label ?? role} cannot ${action.replace("_", " ")}.` };
  }
  return { ok: true };
}

export function applyAction(state, { type, id, actorId, role, assigneeId }) {
  if (type === "mark_complete") {
    const allowed = ensurePermission(role, type);
    if (!allowed.ok) return allowed;
    const event = state.careEvents.find((item) => item.id === id);
    if (!event) return { ok: false, message: "Care event not found." };
    event.completedAt = new Date().toISOString();
    audit(state, actorId, "mark_complete", id, `${event.title} completed.`);
    return { ok: true, message: `${event.title} marked complete.` };
  }

  if (type === "snooze") {
    const allowed = ensurePermission(role, type);
    if (!allowed.ok) return allowed;
    const event = state.careEvents.find((item) => item.id === id);
    if (!event) return { ok: false, message: "Care event not found." };
    event.dueDate = isoDate(addDays(new Date(`${event.dueDate}T00:00:00`), 1));
    audit(state, actorId, "snooze", id, `${event.title} snoozed by 1 day.`);
    return { ok: true, message: `${event.title} snoozed to ${fullDateLabel(event.dueDate)}.` };
  }

  if (type === "assign") {
    const allowed = ensurePermission(role, type);
    if (!allowed.ok) return allowed;
    const event = state.careEvents.find((item) => item.id === id);
    if (!event) return { ok: false, message: "Care event not found." };
    event.ownerId = assigneeId;
    audit(state, actorId, "assign", id, `${event.title} assigned to ${ownerName(state, assigneeId)}.`);
    return { ok: true, message: `${event.title} assigned to ${ownerName(state, assigneeId)}.` };
  }

  if (type === "create_reminder") {
    const allowed = ensurePermission(role, type);
    if (!allowed.ok) return allowed;
    const task = {
      id: `t-${state.tasks.length + 1}`,
      title: id,
      dueDate: isoDate(addDays(new Date(), 2)),
      ownerId: actorId,
      status: "open"
    };
    state.tasks.push(task);
    audit(state, actorId, "create_reminder", task.id, `Created reminder: ${task.title}`);
    return { ok: true, message: `Reminder created: ${task.title}.` };
  }

  if (type === "log_ride") {
    const allowed = ensurePermission(role, type);
    if (!allowed.ok) return allowed;
    const ride = {
      id: `r-${state.rideLogs.length + 1}`,
      horseId: state.horses[0].id,
      date: isoDate(new Date()),
      durationMinutes: 42,
      notes: id,
      riderId: actorId
    };
    state.rideLogs.unshift(ride);
    audit(state, actorId, "log_ride", ride.id, `Ride logged: ${ride.notes}`);
    return { ok: true, message: "Ride logged for today." };
  }

  return { ok: false, message: "Unsupported action." };
}

function parseIntent(text, state) {
  const q = text.toLowerCase().trim();

  if (q.includes("overdue")) {
    return { type: "show_overdue" };
  }
  if (q.includes("next") && q.includes("care")) {
    return { type: "show_next" };
  }
  if (q.includes("call")) {
    const hit = state.contacts.find((contact) => q.includes(contact.name.toLowerCase().split(" ")[0]));
    return { type: "call_contact", contact: hit ?? state.contacts[0] };
  }
  if (q.includes("create reminder") || q.includes("remind me")) {
    return { type: "create_reminder", title: text.replace(/create reminder:?/i, "").trim() || "General ranch reminder" };
  }
  if (q.includes("log ride")) {
    const note = text.replace(/log ride:?/i, "").trim() || "Walk/trot session, no issues flagged.";
    return { type: "log_ride", note };
  }
  if (q.includes("ready to ride") || q.includes("ride readiness")) {
    return { type: "ride_readiness" };
  }

  return { type: "fallback" };
}

export function handleAssistantInput({ state, text, role, actorId, pendingAction, now = new Date() }) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      text: "Please enter a question or action request.",
      confidence: "low",
      groundedOn: []
    };
  }

  if (pendingAction && /^(yes|confirm|yep|do it)$/i.test(trimmed)) {
    const result = applyAction(state, { ...pendingAction, actorId, role });
    return {
      text: result.message,
      confidence: result.ok ? "high" : "low",
      groundedOn: ["audit_log", "tasks", "care_events", "ride_logs"],
      pendingAction: null
    };
  }

  if (pendingAction && /^(no|cancel|stop)$/i.test(trimmed)) {
    return {
      text: "Okay, canceled. No changes were made.",
      confidence: "high",
      groundedOn: ["pending_action"],
      pendingAction: null
    };
  }

  const intent = parseIntent(trimmed, state);
  const view = getDashboardView(state, now);

  if (intent.type === "show_overdue") {
    if (!view.overdueCare.length) {
      return {
        text: "No overdue care items right now.",
        confidence: "high",
        groundedOn: ["care_events"],
        pendingAction: null
      };
    }
    const list = view.overdueCare.map((item) => `${item.title} (${item.dueLabel})`).join(", ");
    return {
      text: `Overdue now: ${list}.`,
      confidence: "high",
      groundedOn: ["care_events"],
      pendingAction: null
    };
  }

  if (intent.type === "show_next") {
    const upcoming = view.next7DaysCare.slice(0, 3).map((item) => `${item.title} (${item.dueLabel})`).join(", ");
    return {
      text: upcoming ? `Next 7-day care window: ${upcoming}.` : "No care events due in the next 7 days.",
      confidence: "high",
      groundedOn: ["care_events"],
      pendingAction: null
    };
  }

  if (intent.type === "call_contact") {
    return {
      text: `Call ${intent.contact.name} at ${intent.contact.phone}.`,
      confidence: "high",
      groundedOn: ["contacts"],
      pendingAction: null
    };
  }

  if (intent.type === "create_reminder") {
    return {
      text: `I can create reminder "${intent.title}". Confirm?`,
      confidence: "medium",
      groundedOn: ["tasks", "role_permissions"],
      pendingAction: { type: "create_reminder", id: intent.title }
    };
  }

  if (intent.type === "log_ride") {
    return {
      text: `I can log a ride with note "${intent.note}". Confirm?`,
      confidence: "medium",
      groundedOn: ["ride_logs", "role_permissions"],
      pendingAction: { type: "log_ride", id: intent.note }
    };
  }

  if (intent.type === "ride_readiness") {
    const latestRide = state.rideLogs[0];
    const alertCount = view.openAlerts.filter((alert) => alert.level === "warning").length;
    return {
      text: `Leoti is ride-ready based on latest ride (${latestRide.durationMinutes} min) and no critical open alerts. ${alertCount ? "One caution alert is open." : "No caution alerts open."}`,
      confidence: "medium",
      groundedOn: ["ride_logs", "alerts"],
      pendingAction: null
    };
  }

  return {
    text: "I can answer from ranch records only. Try: show overdue care, next care, create reminder, log ride, or call contact.",
    confidence: "low",
    groundedOn: ["care_events", "ride_logs", "contacts", "tasks"],
    pendingAction: null
  };
}

export function roleLabel(role) {
  return ROLES[role]?.label ?? role;
}

export function roleCan(role, action) {
  return getPermission(role, action);
}
