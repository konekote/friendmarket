// FriendMarket prototype — screens.

// ---------- AUTH (register → confirm code, or sign in) ----------
function AuthScreen({ onAuth }) {
  const [mode, setMode] = React.useState('register');
  const [step, setStep] = React.useState('form'); // 'form' | 'confirm'
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState('');
  const sent = React.useRef('');

  const genCode = () => { sent.current = String(Math.floor(100000 + Math.random() * 900000)); };

  const submitForm = (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u) { setErr('Pick a username.'); return; }
    if (/\s/.test(u)) { setErr('No spaces — use letters, numbers or _'); return; }
    if (mode === 'signin') {
      if (!password) { setErr('Enter your password.'); return; }
      onAuth({ username: u, email: '', presence: 'online', status: '' });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr('Enter a valid email address.'); return; }
    if (password.length < 6) { setErr('Password should be at least 6 characters.'); return; }
    genCode(); setErr(''); setCode(''); setStep('confirm');
  };

  const confirm = (e) => {
    e.preventDefault();
    if (code.trim() !== sent.current) { setErr('That code doesn’t match — check the demo hint below.'); return; }
    onAuth({ username: username.trim(), email: email.trim(), presence: 'online', status: '' });
  };

  return (
    <div className="fm-auth fm-win">
      <div className="fm-titlebar">
        <span className="fm-tb-title"><Hug size={15} /> FriendMarket</span>
        <WinButtons variant="main" />
      </div>
      <div className="fm-auth-body">
        <div className="fm-auth-hero">
          <div className="mark"><Hug size={40} /></div>
          <h1>Friend<b>Market</b></h1>
          <p>Find someone to talk to about anything.</p>
        </div>

        {step === 'form' ? (
          <React.Fragment>
            <div className="fm-tabs">
              <button className={mode === 'register' ? 'is-on' : ''} onClick={() => { setMode('register'); setErr(''); }}>Create account</button>
              <button className={mode === 'signin' ? 'is-on' : ''} onClick={() => { setMode('signin'); setErr(''); }}>Sign in</button>
            </div>
            <form className="fm-fields" onSubmit={submitForm}>
              <div>
                <label>Username</label>
                <input className="fm-input" value={username} autoFocus placeholder="e.g. dialup_dusk"
                  onChange={(e) => { setUsername(e.target.value); setErr(''); }} />
              </div>
              {mode === 'register' && (
                <div>
                  <label>Email</label>
                  <input className="fm-input" type="email" value={email} placeholder="you@email.com"
                    onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
                </div>
              )}
              <div>
                <label>Password</label>
                <input className="fm-input" type="password" value={password} placeholder={mode === 'register' ? 'at least 6 characters' : 'your password'}
                  onChange={(e) => { setPassword(e.target.value); setErr(''); }} />
              </div>
              {err && <p className="fm-err">{err}</p>}
              <button className="fm-btn fm-btn--primary" type="submit" style={{ marginTop: 4 }}>
                {mode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </form>
            <p className="fm-auth-note">This is a prototype — your account lives only in this browser.</p>
          </React.Fragment>
        ) : (
          <form className="fm-fields" onSubmit={confirm}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Check your email</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>We sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>{email}</b></p>
            </div>
            <input className="fm-code-input" value={code} autoFocus inputMode="numeric" maxLength={6} placeholder="······"
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setErr(''); }} />
            {err && <p className="fm-err" style={{ textAlign: 'center' }}>{err}</p>}
            <button className="fm-btn fm-btn--primary" type="submit">Confirm &amp; enter</button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="fm-linkbtn" onClick={() => { genCode(); setErr(''); }}>Resend code</button>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}> · </span>
              <button type="button" className="fm-linkbtn" onClick={() => { setStep('form'); setErr(''); }}>Back</button>
            </div>
            <div className="fm-demo-hint">Demo: no real email is sent. Your code is <b>{sent.current}</b></div>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------- ME BAR ----------
function MeBar({ account, onSetStatus, onSetPresence }) {
  const [val, setVal] = React.useState(account.status || '');
  React.useEffect(() => { setVal(account.status || ''); }, [account.status]);
  return (
    <div className="fm-mebar">
      <PresenceDropdown presence={account.presence} onChange={onSetPresence} />
      <span className="fm-me-name" style={{ color: window.fmColorFor(account.username) }}>{account.username}</span>
      <input className="fm-status-edit" value={val} placeholder="share a status message…"
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSetStatus(val.trim())}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setVal(account.status || ''); e.target.blur(); } }} />
    </div>
  );
}

// ---------- COMPOSE MODAL ----------
function ComposeModal({ onPost, onClose }) {
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [format, setFormat] = React.useState('written');
  const [category, setCategory] = React.useState('');
  const post = () => {
    const t = title.trim();
    if (!t || !category) return;
    onPost({ title: t, desc: desc.trim() || 'Reach out if this sounds like your kind of chat.', format, category });
    onClose();
  };

  return (
    <div className="fm-backdrop">
      <div className="fm-modal fm-win">
        <div className="fm-titlebar">
          <span className="fm-tb-title"><Hug size={15} /> Post a new topic</span>
          <WinButtons variant="popup" onClose={onClose} />
        </div>
        <div className="fm-modal-body">
          <div className="fm-compose-fields">
            <div>
              <label className="fm-clabel">What do you want to talk about? <i className="req">*</i></label>
              <input className="fm-input" value={title} autoFocus placeholder="Give your topic a clear title" onChange={(e) => setTitle(e.target.value)} />
            </div>
            <input className="fm-input" value={desc} placeholder="Add a little detail (optional)" onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="fm-compose-foot">
            <FmtToggle value={format} onChange={setFormat} />
            <select className="fm-native fm-native--accent" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Pick a category… *</option>
              {window.FM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="fm-modal-foot">
            <button className="fm-btn fm-btn--primary" onClick={post} disabled={!title.trim() || !category}>Post it</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- TOPIC ROW ----------
function TopicRow({ topic, onReach, requested }) {
  const mine = topic.mine;
  const r = topic.replies || 0;
  return (
    <article className={'fm-row' + (mine ? ' is-mine' : '')}>
      <HugAva />
      <div className="fm-body-c">
        <div className="fm-meta">
          <IDot presence={topic.presence} />
          <span className="fm-name" style={{ color: window.fmColorFor(topic.name) }}>{topic.name}</span>
          <span className="fm-mstatus">{topic.status}</span>
        </div>
        <h3 className="fm-title">{topic.title}</h3>
        <p className="fm-desc">{topic.desc}</p>
        <div className="fm-foot">
          <Badge format={topic.format} />
          <span className="fm-replies"><b>{r}</b> {r === 1 ? 'friend reached out' : 'friends reached out'}</span>
        </div>
      </div>
      <span className="fm-time">{window.fmTimeLabel(topic.ts)}</span>
      {!mine && (
        requested
          ? <span className="fm-cta fm-status-pill fm-status-pill--accepted">{'\u2714'} requested</span>
          : <button className="fm-btn fm-btn--primary fm-cta" onClick={() => onReach(topic)}>Let’s talk!</button>
      )}
    </article>
  );
}

// ---------- PAGINATION ----------
function Pager({ page, pages, onPage }) {
  if (pages <= 1) return null;
  // windowed page numbers with ellipsis
  const nums = [];
  const push = (n) => nums.push(n);
  const win = 1;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - win && i <= page + win)) push(i);
    else if (nums[nums.length - 1] !== '…') push('…');
  }
  return (
    <div className="fm-pager">
      <button className="nav" disabled={page === 1} onClick={() => onPage(page - 1)}>{'\u2039'} Prev</button>
      {nums.map((n, i) => n === '…'
        ? <span key={'e' + i} className="gap">…</span>
        : <button key={n} className={n === page ? 'is-on' : ''} onClick={() => onPage(n)}>{n}</button>)}
      <button className="nav" disabled={page === pages} onClick={() => onPage(page + 1)}>Next {'\u203A'}</button>
    </div>
  );
}

function PagedList({ items, perPage, render, empty, containerClass, resetKey }) {
  const size = perPage || 10;
  const [page, setPage] = React.useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  React.useEffect(() => { setPage(1); }, [resetKey]);
  React.useEffect(() => { if (page > pages) setPage(pages); }, [pages, page]);
  if (items.length === 0) return empty;
  const slice = items.slice((page - 1) * size, page * size);
  return (
    <React.Fragment>
      <div className={containerClass || 'fm-reqs tail'}>{slice.map(render)}</div>
      <Pager page={page} pages={pages} onPage={setPage} />
    </React.Fragment>
  );
}

// ---------- BROWSE ----------
const FM_SORTS = [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['most', 'Most replies'], ['least', 'Least replies']];
const FM_PER_PAGE = 10;

function BrowseScreen({ topics, onReach, requestedTitles }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('All');
  const [sort, setSort] = React.useState('newest');

  let list = topics.filter((t) => !t.mine && window.fmDaysAgo(t.ts) <= window.FM_MAX_DAYS);
  if (cat !== 'All') list = list.filter((t) => t.category === cat);
  if (q.trim()) {
    const s = q.toLowerCase();
    list = list.filter((t) => (t.title + ' ' + t.desc + ' ' + t.name + ' ' + t.category).toLowerCase().includes(s));
  }
  list = [...list].sort((a, b) => {
    if (sort === 'newest') return b.ts - a.ts;
    if (sort === 'oldest') return a.ts - b.ts;
    if (sort === 'most') return (b.replies || 0) - (a.replies || 0);
    return (a.replies || 0) - (b.replies || 0);
  });

  return (
    <div className="fm-body">
      <div className="fm-scroll">
        <div className="fm-toolbar">
          <div className="fm-search">
            <span className="ic">{'\uD83D\uDD0D'}</span>
            <input value={q} placeholder="Search topics, people, anything…" onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="fm-native" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="All">All categories</option>
            {window.FM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="fm-native" value={sort} onChange={(e) => setSort(e.target.value)}>
            {FM_SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <PagedList items={list} perPage={FM_PER_PAGE} containerClass="fm-feed"
          resetKey={q + '|' + cat + '|' + sort}
          empty={<div className="fm-empty"><div className="big"><Hug /></div>No topics match. Try a different search or category.</div>}
          render={(t) => <TopicRow key={t.id} topic={t} onReach={onReach} requested={requestedTitles && requestedTitles.has(t.title)} />} />
      </div>
    </div>
  );
}

// ---------- REACH-OUT MODAL ----------
function ReachOutModal({ topic, hidden, onMinimize, onClose, onSend }) {
  const [msg, setMsg] = React.useState('');
  const [also, setAlso] = React.useState('');
  const send = () => { if (!msg.trim()) return; onSend({ message: msg.trim(), also: also.trim() }); };
  return (
    <div className={'fm-backdrop' + (hidden ? ' is-hidden' : '')}>
      <div className="fm-modal fm-win">
        <div className="fm-titlebar">
          <span className="fm-tb-title"><Hug size={15} /> Reach out to {topic.name}</span>
          <WinButtons variant="popup" onMinimize={onMinimize} onClose={onClose} />
        </div>
        <div className="fm-modal-body">
          <div className="fm-modal-topic">
            <HugAva />
            <div>
              <h3 className="fm-title">{topic.title}</h3>
              <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
                by <span style={{ color: window.fmColorFor(topic.name), fontWeight: 700 }}>{topic.name}</span>
                <Badge format={topic.format} />
              </div>
            </div>
          </div>

          <label className="fm-field-label">Your message</label>
          <textarea className="fm-textarea" rows={3} autoFocus value={msg}
            placeholder={'Hi ' + topic.name + '! I’d love to talk about this because…'}
            onChange={(e) => setMsg(e.target.value)} />

          <label className="fm-field-label" style={{ marginTop: 14 }}>I also want to talk about… <span className="opt">(optional)</span></label>
          <input className="fm-input" value={also} placeholder="anything else you’d like to chat about"
            onChange={(e) => setAlso(e.target.value)} />

          <div className="fm-modal-foot">
            <button className="fm-btn fm-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="fm-btn fm-btn--accent" onClick={send} disabled={!msg.trim()}>Let’s talk!</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- CHATS (tabbed) ----------
// Incoming request — styled like a Yahoo Messenger conversation snippet.
function IncomingCard({ req, onAccept, onDelete }) {
  return (
    <div className="fm-req fm-im">
      <HugAva />
      <div className="fm-im-body">
        <span className="fm-time">{window.fmTimeLabel(req.ts)}</span>
        <div className="fm-meta">
          <IDot presence={req.presence} />
          <span className="fm-name" style={{ color: window.fmColorFor(req.name) }}>{req.name}</span>
          {req.senderStatus && <span className="fm-mstatus">{req.senderStatus}</span>}
        </div>
        <h3 className="fm-title">{req.topicTitle}</h3>

        <div className="fm-speech">{req.message}</div>

        {req.also && <div className="fm-im-also">I also want to talk about: <b>{req.also}</b></div>}

        <div className="fm-req-foot">
          <Badge format={req.format} />
          <span className="spacer"></span>
          <button className="fm-btn fm-btn--ghost fm-btn--sm fm-btn--danger" onClick={() => onDelete(req.id)}>Delete</button>
          <button className="fm-btn fm-btn--accent fm-btn--sm" onClick={() => onAccept(req.id)}>Accept &amp; chat</button>
        </div>
      </div>
    </div>
  );
}

function SentCard({ req, onOpenChat }) {
  return (
    <div className="fm-req fm-im">
      <HugAva />
      <div className="fm-im-body">
        <span className="fm-time">{window.fmTimeLabel(req.ts)}</span>
        <div className="fm-meta">
          <IDot presence={req.presence} />
          <span className="fm-name" style={{ color: window.fmColorFor(req.name) }}>{req.name}</span>
        </div>
        <h3 className="fm-title">{req.topicTitle}</h3>

        <div className="fm-speech fm-speech--mine">{req.message}</div>

        {req.also && <div className="fm-im-also">I also want to talk about: <b>{req.also}</b></div>}

        <div className="fm-req-foot">
          <Badge format={req.format} />
          <span className="spacer"></span>
          {req.status === 'pending' && <span className="fm-status-pill fm-status-pill--pending">{'\u25CB'} waiting for reply</span>}
          {req.status === 'accepted' && req.convId && (
            <React.Fragment>
              <span className="fm-status-pill fm-status-pill--accepted">{'\u2714'} accepted</span>
              <button className="fm-btn fm-btn--primary fm-btn--sm" onClick={() => onOpenChat(req.convId)}>Open chat</button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatCard({ c, onOpenChat, past }) {
  const unread = !past && c.unread > 0;
  const last = c.messages[c.messages.length - 1];
  return (
    <div className={'fm-req fm-im' + (unread ? ' is-unread' : '')}>
      <HugAva />
      <div className="fm-im-body">
        <div className="fm-meta">
          <IDot presence={c.presence} />
          <span className="fm-name" style={{ color: window.fmColorFor(c.name) }}>{c.name}</span>
          {unread && <span className="fm-unread-badge">{c.unread} new {c.unread === 1 ? 'reply' : 'replies'}</span>}
          {c.outcome === 'success' && <span className="fm-status-pill fm-status-pill--accepted">{'\u2714'} connected</span>}
          {c.outcome === 'no' && <span className="fm-status-pill fm-status-pill--declined">didn’t work out</span>}
        </div>
        <h3 className="fm-title">{c.topicTitle}</h3>
        {last && (
          <div className={'fm-lastmsg' + (unread ? ' is-unread' : '')}>
            <span className="who">{last.mine ? 'You' : c.name}:</span> {last.text}
          </div>
        )}
        <div className="fm-req-foot">
          <span className="spacer"></span>
          <button className={'fm-btn fm-btn--sm ' + (past ? 'fm-btn--ghost' : 'fm-btn--primary')} onClick={() => onOpenChat(c.id)}>
            {past ? 'View chat' : (unread ? 'Read & reply' : 'Open chat')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatsScreen({ requests, conversations, tab, setTab, onAccept, onDelete, onOpenChat }) {
  const incoming = requests.filter((r) => r.dir === 'incoming' && r.status === 'pending');
  const sent = requests.filter((r) => r.dir === 'outgoing');
  const convs = Object.values(conversations);
  const active = convs.filter((c) => !c.outcome);
  const past = convs.filter((c) => c.outcome);

  const tabs = [
    ['incoming', 'Incoming', incoming.length],
    ['active', 'Active', active.length],
    ['past', 'Past', past.length],
    ['sent', 'Sent', sent.length],
  ];

  return (
    <div className="fm-body">
      <div className="fm-scroll">
        <div className="fm-rtabs">
          {tabs.map(([k, label, count]) => (
            <button key={k} className={'fm-rtab' + (tab === k ? ' is-on' : '')} onClick={() => setTab(k)}>
              {label}{k === 'incoming' && count > 0 && <span className="fm-count">{count}</span>}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 14 }}>
          {tab === 'incoming' && (
            <PagedList items={incoming} resetKey="incoming"
              empty={<div className="fm-empty"><div className="big"><Hug /></div>No incoming requests right now.</div>}
              render={(r) => <IncomingCard key={r.id} req={r} onAccept={onAccept} onDelete={onDelete} />} />
          )}
          {tab === 'active' && (
            <PagedList items={active} resetKey="active"
              empty={<div className="fm-empty"><div className="big"><Hug /></div>No active chats yet. Accept a request or reach out from Browse.</div>}
              render={(c) => <ChatCard key={c.id} c={c} onOpenChat={onOpenChat} />} />
          )}
          {tab === 'past' && (
            <PagedList items={past} resetKey="past"
              empty={<div className="fm-empty"><div className="big"><Hug /></div>No past chats yet — mark a conversation when you’re done.</div>}
              render={(c) => <ChatCard key={c.id} c={c} onOpenChat={onOpenChat} past />} />
          )}
          {tab === 'sent' && (
            <PagedList items={sent} resetKey="sent"
              empty={<div className="fm-empty"><div className="big"><Hug /></div>You haven’t reached out to anyone yet — head to Browse.</div>}
              render={(r) => <SentCard key={r.id} req={r} onOpenChat={onOpenChat} />} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- PROFILE ----------
function ProfileScreen({ account, topics, conversations, onReach, theme, resolvedDark, onCycleTheme }) {
  const mine = topics.filter((t) => t.mine);
  const convs = Object.values(conversations);
  const success = convs.filter((c) => c.outcome === 'success').length;
  return (
    <div className="fm-body">
      <div className="fm-scroll">
        <div className="fm-section">
          <div className="fm-req" style={{ marginTop: 6 }}>
            <div className="fm-req-top">
              <HugAva />
              <div className="fm-req-who">
                <div className="line1">
                  <IDot presence={account.presence} />
                  <span className="fm-name" style={{ color: window.fmColorFor(account.username), fontSize: 16 }}>{account.username}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{window.FM_PRES_LABEL[account.presence]}</span>
                </div>
                <div className="fm-req-topic" style={{ fontStyle: 'italic' }}>
                  {account.status ? '“' + account.status + '”' : 'no status yet'}
                </div>
              </div>
            </div>
            <div className="fm-req-foot" style={{ gap: 18 }}>
              <Stat n={mine.length} label="topics posted" />
              <Stat n={convs.length} label="conversations" />
              <Stat n={success} label="successful" />
            </div>
          </div>
        </div>
        <div className="fm-section"><h3>Appearance</h3></div>
        <div className="fm-section">
          <div className="fm-appearance">
            <div>
              <div className="fm-appearance-title">Light / dark mode</div>
              <div className="fm-appearance-sub">Choose Light, Dark, or Auto (follows your system).</div>
            </div>
            <ThemeToggle theme={theme} resolvedDark={resolvedDark} onCycle={onCycleTheme} inNav />
          </div>
        </div>
        <div className="fm-section"><h3>Your topics</h3></div>
        <PagedList items={mine} perPage={FM_PER_PAGE} containerClass="fm-feed" resetKey="mine"
          empty={<div className="fm-empty" style={{ padding: 20 }}>You haven’t posted a topic yet — try the Browse tab.</div>}
          render={(t) => <TopicRow key={t.id} topic={t} onReach={onReach || (() => {})} />} />
      </div>
    </div>
  );
}
function Stat({ n, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}

Object.assign(window, { AuthScreen, MeBar, ComposeModal, TopicRow, Pager, PagedList, BrowseScreen, ReachOutModal, ChatsScreen, ProfileScreen, Stat });
