// FriendMarket prototype — seed data, helpers, persistence.

window.FM_FMT = {
  written: { glyph: '✎', label: 'Written' },
  audio:   { glyph: '♪', label: 'Audio' },
  video:   { glyph: '▶', label: 'Video' },
};

window.FM_CATEGORIES = ['Music', 'Movies & TV', 'Gaming', 'Animals', 'Books', 'Technology', 'Food', 'Art', 'Languages', 'Lifestyle'];

window.FM_NAME_COLORS = ['#1a6dd4', '#1f9e3f', '#e07b00', '#8a3ffc', '#d6336c', '#0a9ea6', '#c2410c', '#6d28d9'];

window.fmColorFor = function (name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return window.FM_NAME_COLORS[h % window.FM_NAME_COLORS.length];
};

window.fmUid = (() => { let n = 1000; return () => 'id' + (++n) + '_' + Math.floor(Math.random() * 1e4); })();

// ---- relative time (today / yesterday / N days ago); posts expire after 10 days ----
const FM_DAY = 86400000;
window.FM_MAX_DAYS = 10;
window.fmDaysAgo = (ts) => Math.floor((Date.now() - ts) / FM_DAY);
window.fmTimeLabel = (ts) => {
  const d = window.fmDaysAgo(ts);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  return d + ' days ago';
};
const daysBack = (d) => Date.now() - d * FM_DAY - 3600000;
const hrsBack = (h) => Date.now() - h * 3600000;

// ---- seed ----
window.fmSeed = function () {
  // helper: a finished/active conversation
  const conv = (id, name, presence, topicTitle, outcome) => ({
    id, name, presence, topicTitle, outcome,
    messages: [
      { from: name, text: 'hey! thanks for chatting about ' + topicTitle.toLowerCase().replace(/[?.!]+$/, '') + ' :)', mine: false },
      { from: 'me', text: 'likewise — that was a good one!', mine: true },
    ],
  });

  // past chats (enough to paginate at 10/page)
  const pastDefs = [
    ['reverb_kid', 'away', 'Trade dream-pop & shoegaze deep cuts', 'success'],
    ['paws_and_reflect', 'online', 'Adopting a senior cat', 'success'],
    ['neon_moth', 'online', 'Late-night city photography', 'no'],
    ['crt_glow', 'away', 'Restoring old CRT TVs', 'success'],
    ['dial_tone', 'online', 'The lost art of the mixtape', 'success'],
    ['vellum_void', 'away', 'Favorite fountain pens', 'no'],
    ['soft_static', 'online', 'Ambient albums to fall asleep to', 'success'],
    ['gilded_gif', 'online', 'Pixel art starter tips', 'success'],
    ['modem_hymn', 'away', 'BBS nostalgia', 'no'],
    ['byte_betty', 'online', 'Speedrunning for beginners', 'success'],
    ['tape_hiss', 'away', 'Cassette culture revival', 'success'],
    ['ferro_fluid', 'online', 'Desk-toy obsessions', 'no'],
  ];

  const conversations = {
    // active chats (no outcome yet)
    cv0: {
      id: 'cv0', name: 'blue_swirl', presence: 'online', topicTitle: 'Is the Dreamcast underrated?', outcome: null,
      messages: [
        { from: 'blue_swirl', text: 'heyy thanks for accepting! so. the Dreamcast.', mine: false },
        { from: 'blue_swirl', text: 'underrated or MOST underrated, no in between', mine: false },
        { from: 'me', text: "lol ok i'm listening. sell me on the VMU", mine: true },
      ],
    },
    cva: { id: 'cva', name: 'midori_tron', presence: 'away', topicTitle: 'Practicing conversational Japanese', outcome: null, unread: 2, messages: [
      { from: 'me', text: 'hi! happy to go slow. want to start with self-intros?', mine: true },
      { from: 'midori_tron', text: 'yes! よろしく おねがいします ～', mine: false },
      { from: 'midori_tron', text: 'should we pick a time to do a quick call this week?', mine: false },
    ] },
    cvb: { id: 'cvb', name: 'fern_gully', presence: 'online', topicTitle: 'First-time houseplant panic', outcome: null, unread: 1, messages: [
      { from: 'me', text: 'ok deep breath — how often are you watering it?', mine: true },
      { from: 'fern_gully', text: "maybe… every other day? is that bad? that's bad isn't it", mine: false },
    ] },
  };
  pastDefs.forEach((d, i) => { conversations['cp' + i] = conv('cp' + i, d[0], d[1], d[2], d[3]); });

  return {
    account: null, // { username, email, presence, status }
    view: 'browse',
    topics: [
      { id: 'tp1', name: 'skin_collector99', presence: 'online', status: "llama whippin' again", title: 'The golden age of Winamp skins', desc: 'I miss customizing everything down to the EQ sliders. Swap favorites and talk skinning culture?', format: 'written', category: 'Technology', replies: 3, ts: daysBack(0), mine: false },
      { id: 'tp2', name: 'midori_tron', presence: 'away', status: '頑張ってます · trying my best', title: 'Practicing conversational Japanese', desc: 'Hovering around N4. Looking for relaxed, slow chats — no pressure, lots of patience.', format: 'audio', category: 'Languages', replies: 1, ts: daysBack(0), mine: false },
      { id: 'tp3', name: 'blue_swirl', presence: 'online', status: 'defending the VMU 4 life', title: 'Is the Dreamcast underrated?', desc: "Hot takes welcome. I'll go first: it was a full decade ahead of its time. Change my mind.", format: 'video', category: 'Gaming', replies: 5, ts: daysBack(1), mine: false },
      { id: 'tp4', name: 'fern_gully', presence: 'online', status: 'overwatering, probably', title: 'First-time houseplant panic', desc: 'My pothos is yellowing and I need a calm friend to talk me down off the ledge.', format: 'written', category: 'Lifestyle', replies: 0, ts: daysBack(2), mine: false },
      { id: 'tp5', name: 'reverb_kid', presence: 'away', status: '🎧 turned up loud', title: 'Trade dream-pop & shoegaze deep cuts', desc: "Give me your foggiest, most reverbed recommendations and I'll give you mine.", format: 'audio', category: 'Music', replies: 2, ts: daysBack(4), mine: false },
      { id: 'tp6', name: 'flux_core', presence: 'online', status: 'smells like rosin', title: 'Anyone else learning to solder?', desc: 'Building a tiny synth and would love a buddy to troubleshoot with over video.', format: 'video', category: 'Technology', replies: 4, ts: daysBack(7), mine: false },
      { id: 'tp7', name: 'paws_and_reflect', presence: 'online', status: 'three cats, zero regrets', title: 'Adopting a senior cat — worth it?', desc: 'Thinking of adopting an older rescue. Want to hear from people who have. The good and the hard parts.', format: 'written', category: 'Animals', replies: 6, ts: daysBack(3), mine: false },
      { id: 'dp1', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Anyone moved abroad alone? How was month 1?', desc: 'Just landed in a new country with two suitcases and a lot of questions. Would love to compare notes with others who have done this.', format: 'written', category: 'Lifestyle', replies: 4, ts: daysBack(0), mine: false },
      { id: 'dp2', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Favorite city for solo travel that felt totally safe?', desc: 'Not looking for adventure — looking for ease. Walkable, friendly, good food. Tell me where you felt immediately at home.', format: 'written', category: 'Travel', replies: 7, ts: daysBack(1), mine: false },
      { id: 'dp3', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Let us swap film photography shots', desc: "Shooting on a beat-up Olympus OM-1. Happy to share scans and talk process, grain, and all the mistakes.", format: 'audio', category: 'Art', replies: 2, ts: daysBack(2), mine: false },
      { id: 'dp4', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Recs for books that feel like a warm hug', desc: 'Need something cozy, not sad. Character-driven, slow-burn, ideally set somewhere with good food. No thriller vibes please.', format: 'written', category: 'Books', replies: 9, ts: daysBack(3), mine: false },
      { id: 'dp5', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Learning to cook from scratch — where to start?', desc: 'I can boil pasta and that is it. Want to build actual skills, not just follow recipes blindly. Happy to video call while cooking.', format: 'video', category: 'Food', replies: 5, ts: daysBack(4), mine: false },
      { id: 'dp6', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Talk me through your creative block cures', desc: "I design for a living and I am completely dry. What snaps you back? Looking for anything that is not 'just take a walk'.", format: 'audio', category: 'Art', replies: 3, ts: daysBack(5), mine: false },
      { id: 'dp7', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Best album you discovered this year?', desc: 'Not necessarily new — just new to you. I want the one that made you stop what you were doing and just sit with it.', format: 'written', category: 'Music', replies: 11, ts: daysBack(6), mine: false },
      { id: 'dp8', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Does anyone else journal? What is your system?', desc: 'I have started and abandoned roughly forty journals. Looking for a method that actually sticks — analog, digital, voice memos, anything.', format: 'written', category: 'Lifestyle', replies: 6, ts: daysBack(7), mine: false },
      { id: 'dp9', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Retro gaming night over video call?', desc: 'Looking for someone to stream old-school JRPG sessions. No commentary needed — just companionable silence and occasional gasps.', format: 'video', category: 'Gaming', replies: 2, ts: daysBack(8), mine: false },
      { id: 'dp10', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Learning Spanish — want a casual practice buddy', desc: 'B1ish. Want weekly low-stakes conversation where mistakes are welcome and nobody is grading anything.', format: 'audio', category: 'Languages', replies: 4, ts: daysBack(10), mine: false },
      { id: 'dp11', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'What does your perfect Sunday morning look like?', desc: 'Tell me the ritual — coffee order, playlist, reading material, window or no window. I am curating inspiration.', format: 'written', category: 'Lifestyle', replies: 13, ts: daysBack(11), mine: false },
      { id: 'dp12', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Graphic novel recommendations — where do I start?', desc: 'I have read Maus and Persepolis. I liked both for different reasons. Open to anything except superheroes.', format: 'written', category: 'Books', replies: 8, ts: daysBack(14), mine: false },
      { id: 'dp13', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Thoughts on the 4-day work week — real or hype?', desc: 'My company is trialing it and I have feelings. Would love to hear from people who have actually done it longer term.', format: 'written', category: 'Lifestyle', replies: 5, ts: daysBack(16), mine: false },
      { id: 'dp14', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Horror movie watch-along — slow burn preferred', desc: 'Not gore, not jump scares — give me dread. Looking for someone to watch over video call and debrief after.', format: 'video', category: 'Movies', replies: 3, ts: daysBack(19), mine: false },
      { id: 'dp15', name: 'dusk_pilot', presence: 'online', status: 'perpetually between timezones', title: 'Share your most niche hobby — no judgment', desc: "I collect train timetables from the 1970s. Your turn. The weirder the better. Let's bond over it.", format: 'written', category: 'Lifestyle', replies: 17, ts: daysBack(21), mine: false },
    ],
    requests: [
      // incoming (a few)
      { id: 'rq1', ts: hrsBack(1), dir: 'incoming', name: 'aqua_nora', presence: 'online', senderStatus: 'patch cables everywhere, send help', topicTitle: 'Anyone else learning to solder?', category: 'Technology', format: 'video', message: "saw your post — i'm obsessed with synths too! wanna trade patch ideas while we solder sometime?", also: 'eurorack + ambient stuff', status: 'pending' },
      { id: 'rq2', ts: hrsBack(20), dir: 'incoming', name: 'pixel_pete', presence: 'away', senderStatus: 'collecting cat gifs since 1999', topicTitle: 'First-time houseplant panic', category: 'Lifestyle', format: 'written', message: 'oh no, the pothos panic is real — i killed three before one survived. happy to talk you down off the ledge!', also: '', status: 'pending' },
      { id: 'rq3', ts: daysBack(2), dir: 'incoming', name: 'tape_hiss', presence: 'online', senderStatus: 'side B is always better', topicTitle: 'Trade dream-pop & shoegaze deep cuts', category: 'Music', format: 'audio', message: "i have a folder literally named \"foggiest\". this is my moment. let's swap.", also: 'field recordings + tape loops', status: 'pending' },
      { id: 'rq4', ts: daysBack(5), dir: 'incoming', name: 'byte_betty', presence: 'away', senderStatus: 'GG no re', topicTitle: 'Is the Dreamcast underrated?', category: 'Gaming', format: 'video', message: "the VMU defense starts NOW. i'm ready to hear everything.", also: '', status: 'pending' },
    ],
    conversations,
    openChats: [],
  };
};

// sent requests get appended after seed so they can reference an active conv id
(function () {
  const base = window.fmSeed;
  window.fmSeed = function () {
    const s = base();
    s.requests.push(
      { id: 'sq1', ts: hrsBack(3), dir: 'outgoing', name: 'blue_swirl', presence: 'online', topicTitle: 'Is the Dreamcast underrated?', category: 'Gaming', format: 'video', message: "ok you win, the VMU was genius. let's do a proper call?", status: 'accepted', convId: 'cv0' },
      { id: 'sq2', ts: hrsBack(26), dir: 'outgoing', name: 'flux_core', presence: 'online', topicTitle: 'Anyone else learning to solder?', category: 'Technology', format: 'video', message: 'total beginner here but i have a fresh iron and big dreams. teach me?', status: 'pending' },
      { id: 'sq3', ts: daysBack(3), dir: 'outgoing', name: 'reverb_kid', presence: 'away', topicTitle: 'Trade dream-pop & shoegaze deep cuts', category: 'Music', format: 'audio', message: 'i will trade you my entire 2007 playlist, no take-backs.', status: 'pending' },
    );
    return s;
  };
})();

window.FM_REPLIES = [
  'oh totally, go on', 'haha yes exactly', "wait that's such a good point",
  'ok we should definitely take this to a call sometime', 'i could talk about this for hours tbh',
  'sending you my discord in a sec', ':)) you get it',
];

// ---- persistence ----
window.FM_STORE_KEY = 'friendmarket:proto:v9';
window.fmLoad = function () {
  try { const raw = localStorage.getItem(window.FM_STORE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return window.fmSeed();
};
window.fmSave = function (state) {
  try { localStorage.setItem(window.FM_STORE_KEY, JSON.stringify(state)); } catch (e) {}
};
