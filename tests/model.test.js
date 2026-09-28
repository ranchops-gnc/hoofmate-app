import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAction,
  createInitialState,
  getCareStatus,
  handleAssistantInput
} from "../mock/model.js";

test("getCareStatus returns overdue, due_soon, upcoming, completed", () => {
  const now = new Date("2026-09-28T10:00:00Z");

  assert.equal(getCareStatus({ dueDate: "2026-09-26", completedAt: null }, now), "overdue");
  assert.equal(getCareStatus({ dueDate: "2026-09-29", completedAt: null }, now), "due_soon");
  assert.equal(getCareStatus({ dueDate: "2026-10-07", completedAt: null }, now), "upcoming");
  assert.equal(getCareStatus({ dueDate: "2026-10-07", completedAt: "2026-09-28T11:00:00Z" }, now), "completed");
});

test("applyAction enforces role permissions for snooze", () => {
  const state = createInitialState(new Date("2026-09-28T12:00:00Z"));
  const target = state.careEvents[0].id;

  const denied = applyAction(state, {
    type: "snooze",
    id: target,
    role: "staff",
    actorId: "u-staff"
  });

  assert.equal(denied.ok, false);
  assert.match(denied.message, /cannot snooze/i);
});

test("assistant create reminder requires confirmation", () => {
  const state = createInitialState(new Date("2026-09-28T12:00:00Z"));

  const first = handleAssistantInput({
    state,
    text: "create reminder: check water trough",
    role: "owner",
    actorId: "u-owner"
  });

  assert.match(first.text, /confirm\?/i);
  assert.equal(first.pendingAction.type, "create_reminder");

  const second = handleAssistantInput({
    state,
    text: "yes",
    role: "owner",
    actorId: "u-owner",
    pendingAction: first.pendingAction
  });

  assert.match(second.text, /Reminder created/i);
  assert.equal(second.pendingAction, null);
});

test("assistant can retrieve overdue care", () => {
  const state = createInitialState(new Date("2026-09-28T12:00:00Z"));

  const result = handleAssistantInput({
    state,
    text: "show overdue care",
    role: "manager",
    actorId: "u-manager"
  });

  assert.match(result.text, /Overdue now:/);
  assert.equal(result.confidence, "high");
  assert.deepEqual(result.groundedOn, ["care_events"]);
});
