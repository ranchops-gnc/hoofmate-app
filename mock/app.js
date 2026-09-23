const replies = [
  {
    test: /ride|ready/i,
    text: "Leoti looks ride-ready. No lameness notes in the last 14 days, last ride was an easy 45-minute trail loop. Ground is firm after yesterday’s freeze-thaw — keep her on the packed road if you go out before 9 AM."
  },
  {
    test: /farrier|pack|shoe/i,
    text: "Farrier checklist for Thursday: halter + lead, old shoes if Jake wants them, note on the left front that felt a little close last cycle, treats, and a dry towel. Jake is booked 9:30 AM at the barn aisle."
  },
  {
    test: /weather|risk|storm/i,
    text: "Mock forecast: mid-50s and partly cloudy through Friday. Overnight lows near 38. No storm watch. Watch the north pasture gate — it ices first."
  },
  {
    test: /feed|hay|grain/i,
    text: "Current ration: 18 lb grass mix AM/PM split, 1 lb ration balancer, salt block free choice. No grain increase recommended unless she drops below 1,050 lb."
  },
  {
    test: /vaccine|shot|coggins/i,
    text: "Fall combo is scheduled Oct 5 with Dr. Megan Lee. Coggins is current through May. No fever or swelling flagged in the last health log."
  }
];

const fallback = "Mock mode only. I can talk about Leoti’s care calendar, ride readiness, farrier prep, feed, or weather. Live model wiring is off.";

const chat = document.getElementById("chat");
const form = document.getElementById("askForm");
const input = document.getElementById("askInput");

function add(text, who) {
  const el = document.createElement("div");
  el.className = "bubble " + who;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function answer(q) {
  const hit = replies.find((r) => r.test.test(q));
  add(hit ? hit.text : fallback, "bot");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (!q) return;
  add(q, "user");
  input.value = "";
  setTimeout(() => answer(q), 280);
});

document.querySelectorAll(".chips button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.q;
    add(q, "user");
    setTimeout(() => answer(q), 280);
  });
});

document.getElementById("logRide").addEventListener("click", () => {
  add("Logged a mock ride: 42 minutes, walk/trot, no heat in legs. Saved locally only.", "bot");
});
