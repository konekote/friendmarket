// Demo data — replace with API calls once backend is live
const DEMO_OFFERS = [
  { id: 1, topic: "History of jazz", description: "Love talking about bebop, Miles Davis, the whole arc.", formats: ["written", "audio"], interests: "cooking, sci-fi", responses: 3 },
  { id: 2, topic: "Stoic philosophy", description: "Reading Meditations for the third time. Want to discuss.", formats: ["written"], interests: "hiking, history", responses: 7 },
  { id: 3, topic: "Learning Spanish", description: "B1 level, looking for a tandem partner or just a chat.", formats: ["audio", "video"], interests: "travel, photography", responses: 2 },
  { id: 4, topic: "Indie game dev", description: "Making a tiny RPG in Godot, want to swap notes.", formats: ["written", "video"], interests: "pixel art, retro games", responses: 5 },
];

function renderOffers(offers) {
  const grid = document.getElementById("browse");
  if (!grid) return;

  grid.innerHTML = offers.map(o => `
    <div class="offer-card" data-id="${o.id}">
      <h3>${escHtml(o.topic)}</h3>
      <p>${escHtml(o.description)}</p>
      <div class="offer-formats">${o.formats.map(f => `<span>${f}</span>`).join("")}</div>
      ${o.interests ? `<div class="offer-meta">Also into: ${escHtml(o.interests)}</div>` : ""}
      <div class="offer-meta">${o.responses} response${o.responses !== 1 ? "s" : ""}</div>
      <button class="btn-primary" style="margin-top:0.75rem;font-size:0.85rem;padding:0.4rem 1rem"
        onclick="openChat(${o.id})">Reach out</button>
    </div>
  `).join("");
}

function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function openChat(id) {
  // Placeholder — will route to chat.html?offer=id
  alert("Chat coming soon! (offer #" + id + ")");
}

// Handle new offer form
const form = document.getElementById("offer-form");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const formats = form.querySelectorAll('input[name="format"]:checked');
    const newOffer = {
      id: Date.now(),
      topic: data.topic,
      description: data.description || "",
      formats: [...formats].map(f => f.value),
      interests: data.interests || "",
      responses: 0,
    };
    DEMO_OFFERS.unshift(newOffer);
    renderOffers(DEMO_OFFERS);
    form.reset();
    document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
  });
}

renderOffers(DEMO_OFFERS);
