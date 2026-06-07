// EU-legal analytics — no cookies, no personal data, aggregate only.
// Tracks: page views, referrer (origin only), offer interactions.
// Replace endpoint with your actual analytics backend.

const ANALYTICS_ENDPOINT = null; // set to your backend URL when ready

function track(event, props = {}) {
  const payload = {
    event,
    path: location.pathname,
    referrer_origin: document.referrer ? new URL(document.referrer).origin : "direct",
    ts: Date.now(),
    ...props,
  };
  if (ANALYTICS_ENDPOINT) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
  } else {
    console.debug("[analytics]", payload);
  }
}

track("pageview");

// Track outbound offer interactions (delegated)
document.addEventListener("click", e => {
  const card = e.target.closest(".offer-card");
  if (card && e.target.tagName === "BUTTON") {
    track("offer_reach_out", { offer_id: card.dataset.id });
  }
});
