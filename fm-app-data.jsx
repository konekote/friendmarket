// FriendMarket prototype — seed data, helpers, persistence.

window.FM_FMT = {
  written: { glyph: '\u270e', label: 'Written' },
  audio: { glyph: '\u266a', label: 'Audio' },
  video: { glyph: '\u25b6', label: 'Video' },
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
        { from: 'me', text: 'lol ok i\u2019m listening. sell me on the VMU', mine: true },
      ],
    },
    cva: { id: 'cva', name: 'midori_tron', presence: 'away', topicTitle: 'Practicing conversational Japanese', outcome: null, unread: 2, messages: [
      { from: 'me', text: 'hi! happy to go slow. want to start with self-intros?', mine: true },
      { from: 'midori_tron', text: 'yes! よろしく おねがいします ～', mine: false },
      { from: 'midori_tron', text: 'should we pick a time to do a quick call this week?', mine: false },
    ] },
    cvb: { id: 'cvb', name: 'fern_gully', presence: 'online', topicTitle: 'First-time houseplant panic', outcome: null, unread: 1, messages: [
      { from: 'me', text: 'ok deep breath — how often are you watering it?', mine: true },
      { from: 'fern_gully', text: 'maybe… every other day? is that bad? that's bad isn't it', mine: false },
    ] },
  };
  pastDefs.forEach((d, i) => { conversations['cp' + i] = conv('cp' + i, d[0], d[1], d[2], d[3]); });

  return {
    account: null, // { username, email, presence, status }
    view: 'browse',
    topics: [
      { id: 'tp1', name: 'skin_collector99', presence: 'online', status: 'llama whippin\u2019 again', title: 'The golden age of Winamp skins', desc: 'I miss customizing everything down to the EQ sliders. Swap favorites and talk skinning culture?', format: 'written', category: 'Technology', replies: 3, ts: daysBack(0), mine: false },
      { id: 'tp2', name: 'midori_tron', presence: 'away', status: '\u9811\u5f35\u3063\u3066\u307e\u3059 \u00b7 trying my best', title: 'Practicing conversational Japanese', desc: 'Hovering around N4. Looking for relaxed, slow chats \u2014 no pressure, lots of patience.', format: 'audio', category: 'Languages', replies: 1, ts: daysBack(0), mine: false },
      { id: 'tp3', name: 'blue_swirl', presence: 'online', status: 'defending the VMU 4 life', title: 'Is the Dreamcast underrated?', desc: 'Hot takes welcome. I\u2019ll go first: it was a full decade ahead of its time. Change my mind.', format: 'video', category: 'Gaming', replies: 5, ts: daysBack(1), mine: false },
      { id: 'tp4', name: 'fern_gully', presence: 'online', status: 'overwatering, probably', title: 'First-time houseplant panic', desc: 'My pothos is yellowing and I need a calm friend to talk me down off the ledge.', format: 'written', category: 'Lifestyle', replies: 0, ts: daysBack(2), mine: false },
      { id: 'tp5', name: 'reverb_kid', presence: 'away', status: '\ud83c\udfa7 turned up loud', title: 'Trade dream-pop & shoegaze deep cuts', desc: 'Give me your foggiest, most reverbed recommendations and I\u2019ll give you mine.', format: 'audio', category: 'Music', replies: 2, ts: daysBack(4), mine: false },
      { id: 'tp6', name: 'flux_core', presence: 'online', status: 'smells like rosin', title: 'Anyone else learning to solder?', desc: 'Building a tiny synth and would love a buddy to troubleshoot with over video.', format: 'video', category: 'Technology', replies: 4, ts: daysBack(7), mine: false },
      { id: 'tp7', name: 'paws_and_reflect', presence: 'online', status: 'three cats, zero regrets', title: 'Adopting a senior cat \u2014 worth it?', desc: 'Thinking of adopting an older rescue. Want to hear from people who have. The good and the hard parts.', format: 'written', category: 'Animals', replies: 6, ts: daysBack(3), mine: false },
    ],
    requests: [
      // incoming (a few)
      { id: 'rq1', ts: hrsBack(1), dir: 'incoming', name: 'aqua_nora', presence: 'online', senderStatus: 'patch cables everywhere, send help', topicTitle: 'Anyone else learning to solder?', category: 'Technology', format: 'video', message: 'saw your post \u2014 i\u2019m obsessed with synths too! wanna trade patch ideas while we solder sometime?', also: 'eurorack + ambient stuff', status: 'pending' },
      { id: 'rq2', ts: hrsBack(20), dir: 'incoming', name: 'pixel_pete', presence: 'away', senderStatus: 'collecting cat gifs since 1999', topicTitle: 'First-time houseplant panic', category: 'Lifestyle', format: 'written', message: 'oh no, the pothos panic is real \u2014 i killed three before one survived. happy to talk you down off the ledge!', also: '', status: 'pending' },
      { id: 'rq3', ts: daysBack(2), dir: 'incoming', name: 'tape_hiss', presence: 'online', senderStatus: 'side B is always better', topicTitle: 'Trade dream-pop & shoegaze deep cuts', category: 'Music', format: 'audio', message: 'i have a folder literally named \u201cfoggiest\u201d. this is my moment. let\u2019s swap.', also: 'field recordings + tape loops', status: 'pending' },
      { id: 'rq4', ts: daysBack(5), dir: 'incoming', name: 'byte_betty', presence: 'away', senderStatus: 'GG no re', topicTitle: 'Is the Dreamcast underrated?', category: 'Gaming', format: 'video', message: 'the VMU defense starts NOW. i\u2019m ready to hear everything.', also: '', status: 'pending' },
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
      { id: 'sq1', ts: hrsBack(3), dir: 'outgoing', name: 'blue_swirl', presence: 'online', topicTitle: 'Is the Dreamcast underrated?', category: 'Gaming', format: 'video', message: 'ok you win, the VMU was genius. let\u2019s do a proper call?', status: 'accepted', convId: 'cv0' },
      { id: 'sq2', ts: hrsBack(26), dir: 'outgoing', name: 'flux_core', presence: 'online', topicTitle: 'Anyone else learning to solder?', category: 'Technology', format: 'video', message: 'total beginner here but i have a fresh iron and big dreams. teach me?', status: 'pending', ts: hrsBack(26) },
      { id: 'sq3', ts: daysBack(3), dir: 'outgoing', name: 'reverb_kid', presence: 'away', topicTitle: 'Trade dream-pop & shoegaze deep cuts', category: 'Music', format: 'audio', message: 'i will trade you my entire 2007 playlist, no take-backs.', status: 'pending', ts: daysBack(3) },
    );
    return s;
  };
})();

window.FM_REPLIES = [
  'oh totally, go on', 'haha yes exactly', 'wait that\u2019s such a good point',
  'ok we should definitely take this to a call sometime', 'i could talk about this for hours tbh',
  'sending you my discord in a sec', ':)) you get it',
];

// ---- persistence ----
window.FM_STORE_KEY = 'friendmarket:proto:v7';
window.fmLoad = function () {
  try { const raw = localStorage.getItem(window.FM_STORE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return window.fmSeed();
};
window.fmSave = function (state) {
  try { localStorage.setItem(window.FM_STORE_KEY, JSON.stringify(state)); } catch (e) {}
};
