// FriendMarket prototype — screens.

// ---------- AUTH ----------
const FM_PW_RULES = [
  { label: 'At least 8 characters',         test: (p) => p.length >= 8 },
  { label: 'At least one uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'At least one number',            test: (p) => /[0-9]/.test(p) },
  { label: 'At least one special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRules({ password }) {
  if (!password) return null;
  return (
    <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {FM_PW_RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            color: ok ? 'var(--accent-2)' : 'var(--muted)' }}>
            <span style={{ fontSize: 10, lineHeight: 1 }}>{ok ? '✔' : '○'}</span>
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input className="fm-input" type={show ? 'text' : 'password'} value={value}
        placeholder={placeholder} style={{ paddingRight: 38 }}
        onChange={onChange} />
      <button type="button" onClick={() => setShow((s) => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--muted)', fontSize: 15, lineHeight: 1 }}
        aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? '🙈' : '👁'}
      </button>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = React.useState('register');
  const [step, setStep] = React.useState('form'); // 'form' | 'check-email' | 'forgot' | 'forgot-sent'
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const pwValid = FM_PW_RULES.every((r) => r.test(password));

  const submitForm = async (e) => {
    e.preventDefault();
    setErr('');
    const u = username.trim();
    const em = email.trim();

    if (mode === 'signin') {
      if (!em || !password) { setErr('Enter your email and password.'); return; }
      setLoading(true);
      const { data, error } = await window.FM_SB.auth.signInWithPassword({ email: em, password });
      setLoading(false);
      if (error) { setErr(error.status === 429 ? 'Too many attempts — please wait a few minutes and try again.' : error.message); return; }
      const meta = data.user.user_metadata;
      onAuth({ username: meta.username || em, email: em, presence: 'online', status: meta.status || '' });
      return;
    }

    // register
    if (!u) { setErr('Pick a username.'); return; }
    if (/\s/.test(u)) { setErr('No spaces — use letters, numbers or _'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setErr('Enter a valid email address.'); return; }
    if (!pwValid) { setErr('Please meet all password requirements.'); return; }

    setLoading(true);
    const { error } = await window.FM_SB.auth.signUp({
      email: em, password,
      options: {
        data: { username: u, status: '' },
        emailRedirectTo: 'https://konekote.github.io/friendmarket',
      },
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setStep('check-email');
  };

  const resend = async () => {
    setErr('');
    await window.FM_SB.auth.resend({ type: 'signup', email: email.trim() });
    setErr('Resent! Check your inbox.');
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setErr('');
    const em = email.trim();
    if (!em) { setErr('Enter your email address.'); return; }
    setLoading(true);
    await window.FM_SB.auth.resetPasswordForEmail(em, {
      redirectTo: 'https://konekote.github.io/friendmarket',
    });
    setLoading(false);
    setStep('forgot-sent');
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

        {step === 'forgot-sent' ? (
          <div className="fm-fields" style={{ textAlign: 'center', gap: 12 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Check your email</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
              We sent a password reset link to <b style={{ color: 'var(--ink)' }}>{email}</b>.<br />
              Click it to choose a new password.
            </p>
            <button type="button" className="fm-linkbtn" onClick={() => { setStep('form'); setMode('signin'); setErr(''); }}>Back to sign in</button>
          </div>
        ) : step === 'forgot' ? (
          <form className="fm-fields" onSubmit={sendReset}>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--muted)' }}>Enter your email and we will send you a reset link.</p>
            <div>
              <label>Email</label>
              <input className="fm-input" type="email" value={email} autoFocus placeholder="you@email.com"
                onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
            </div>
            {err && <p className="fm-err">{err}</p>}
            <button className="fm-btn fm-btn--primary" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" className="fm-linkbtn" style={{ textAlign: 'center' }}
              onClick={() => { setStep('form'); setMode('signin'); setErr(''); }}>Back to sign in</button>
          </form>
        ) : step === 'check-email' ? (
          <div className="fm-fields" style={{ textAlign: 'center', gap: 12 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Check your email</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
              We sent a confirmation link to <b style={{ color: 'var(--ink)' }}>{email}</b>.<br />
              Click it to activate your account, then come back and sign in.
            </p>
            {err && <p className="fm-err" style={{ textAlign: 'center' }}>{err}</p>}
            <button type="button" className="fm-linkbtn" onClick={resend}>Resend email</button>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}> · </span>
            <button type="button" className="fm-linkbtn" onClick={() => { setStep('form'); setMode('signin'); setErr(''); }}>Back to sign in</button>
          </div>
        ) : (
          <React.Fragment>
            <div className="fm-tabs">
              <button className={mode === 'register' ? 'is-on' : ''} onClick={() => { setMode('register'); setErr(''); }}>Create account</button>
              <button className={mode === 'signin' ? 'is-on' : ''} onClick={() => { setMode('signin'); setErr(''); }}>Sign in</button>
            </div>
            <form className="fm-fields" onSubmit={submitForm}>
              {mode === 'register' && (
                <div>
                  <label>Username</label>
                  <input className="fm-input" value={username} autoFocus placeholder="e.g. dialup_dusk"
                    onChange={(e) => { setUsername(e.target.value); setErr(''); }} />
                </div>
              )}
              <div>
                <label>Email</label>
                <input className="fm-input" type="email" value={email} autoFocus={mode === 'signin'} placeholder="you@email.com"
                  onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
              </div>
              <div>
                <label>Password</label>
                <PasswordInput value={password} placeholder={mode === 'register' ? 'create a password' : 'your password'}
                  onChange={(e) => { setPassword(e.target.value); setErr(''); }} />
                {mode === 'register' && <PasswordRules password={password} />}
              </div>
              {err && <p className="fm-err">{err}</p>}
              <button className="fm-btn fm-btn--primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Please wait…' : (mode === 'register' ? 'Create account' : 'Sign in')}
              </button>
              {mode === 'signin' && (
                <button type="button" className="fm-linkbtn" style={{ textAlign: 'center', marginTop: 2 }}
                  onClick={() => { setStep('forgot'); setErr(''); }}>Forgot password?</button>
              )}
            </form>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ---------- ME BAR ----------
function MeBar({ account, onSetStatus, onSetPresence }) {
  const [val, setVal] = React.useState(account.status || '');
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef(null);
  React.useEffect(() => { setVal(account.status || ''); }, [account.status]);
  React.useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  const commit = () => { onSetStatus(val.trim()); setEditing(false); };
  return (
    <div className="fm-mebar">
      <PresenceDropdown presence={account.presence} onChange={onSetPresence} />
      <span className="fm-me-name" style={{ color: window.fmColorFor(account.username) }}>{account.username}</span>
      {editing ? (
        <div className="fm-status-wrap is-editing">
          <input ref={inputRef} className="fm-status-edit" value={val} maxLength={50} placeholder="share a status message…"
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit()}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setVal(account.status || ''); e.target.blur(); } }} />
          <button className="fm-status-go fm-btn fm-btn--primary fm-btn--sm"
            onPointerDown={(e) => { e.preventDefault(); commit(); }}>Post</button>
        </div>
      ) : (
        <button className={'fm-status-show' + (val ? '' : ' is-empty')} onClick={() => setEditing(true)}>
          {val || 'share a status message…'}
        </button>
      )}
    </div>
  );
}

// ---------- COMPOSE MODAL ----------
function ComposeModal({ onPost, onClose, hidden, onMinimize }) {
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
    <div className={'fm-backdrop' + (hidden ? ' is-hidden' : '')}>
      <div className="fm-modal fm-win">
        <div className="fm-titlebar">
          <span className="fm-tb-title"><Hug size={15} /> Post a new topic</span>
          <WinButtons variant="popup" onMinimize={onMinimize} onClose={onClose} />
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
function TopicRow({ topic, onReach, onDelete, requested }) {
  const mine = topic.mine;
  const r = topic.replies || 0;
  return (
    <article className={'fm-row' + (mine ? ' is-mine' : '')}>
      <div className="fm-im-side">
        <HugAva />
        <Badge format={topic.format} />
        <span className="fm-im-time">{window.fmTimeLabel(topic.ts)}</span>
      </div>
      <div className="fm-body-c">
        <div className="fm-meta">
          <IDot presence={topic.presence} />
          <UserName name={topic.name} />
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
      {mine && onDelete && (
        <button type="button" className="fm-btn fm-btn--ghost fm-btn--sm fm-btn--danger fm-cta" onClick={() => onDelete(topic.id)}>Delete</button>
      )}
      {!mine && (
        requested
          ? <span className="fm-cta fm-status-pill fm-status-pill--accepted">{'✔'} requested</span>
          : <button className="fm-btn fm-btn--primary fm-cta" onClick={() => onReach(topic)}>Let's talk!</button>
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
      <button className="nav" disabled={page === 1} onClick={() => onPage(page - 1)}>{'‹'} Prev</button>
      {nums.map((n, i) => n === '…'
        ? <span key={'e' + i} className="gap">…</span>
        : <button key={n} className={n === page ? 'is-on' : ''} onClick={() => onPage(n)}>{n}</button>)}
      <button className="nav" disabled={page === pages} onClick={() => onPage(page + 1)}>Next {'›'}</button>
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

function BrowseScreen({ topics, recentMine, onReach, onDelete, requestedTitles }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('All');
  const [sort, setSort] = React.useState('newest');
  const [showFilters, setShowFilters] = React.useState(false);
  const filtered = cat !== 'All' || sort !== 'newest';
  const recent = new Set(recentMine || []);

  let list = topics.filter((t) => (!t.mine || recent.has(t.id)) && window.fmDaysAgo(t.ts) <= window.FM_MAX_DAYS);
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
            <span className="ic">{'🔍'}</span>
            <input value={q} placeholder="Search topics, people, anything…" onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className={'fm-filter-toggle' + (filtered ? ' has-filters' : '')} onClick={() => setShowFilters((f) => !f)} aria-expanded={showFilters}>
            <span className="ic">{'≡'}</span> Filters{filtered && <span className="dot"></span>}
          </button>
          <div className={'fm-filters' + (showFilters ? ' is-open' : '')}>
            <select className="fm-native" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="All">All categories</option>
              {window.FM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="fm-native" value={sort} onChange={(e) => setSort(e.target.value)}>
              {FM_SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
        <PagedList items={list} perPage={FM_PER_PAGE} containerClass="fm-feed"
          resetKey={q + '|' + cat + '|' + sort}
          empty={<div className="fm-empty"><div className="big"><Hug /></div>No topics match. Try a different search or category.</div>}
          render={(t) => <TopicRow key={t.id} topic={t} onReach={onReach} onDelete={onDelete} requested={requestedTitles && requestedTitles.has(t.title)} />} />
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
            placeholder={"Hi " + topic.name + "! I'd love to talk about this because…"}
            onChange={(e) => setMsg(e.target.value)} />

          <label className="fm-field-label" style={{ marginTop: 14 }}>I also want to talk about… <span className="opt">(optional)</span></label>
          <input className="fm-input" value={also} placeholder="anything else you'd like to chat about"
            onChange={(e) => setAlso(e.target.value)} />

          <div className="fm-modal-foot">
            <button className="fm-btn fm-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="fm-btn fm-btn--accent" onClick={send} disabled={!msg.trim()}>Let's talk!</button>
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
      <div className="fm-im-side">
        <HugAva />
        <Badge format={req.format} />
        <span className="fm-im-time">{window.fmTimeLabel(req.ts)}</span>
      </div>
      <div className="fm-im-body">
        <span className="fm-time">{window.fmTimeLabel(req.ts)}</span>
        <div className="fm-meta">
          <IDot presence={req.presence} />
          <UserName name={req.name} />
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
      <div className="fm-im-side">
        <HugAva />
        <Badge format={req.format} />
        <span className="fm-im-time">{window.fmTimeLabel(req.ts)}</span>
      </div>
      <div className="fm-im-body">
        <span className="fm-time">{window.fmTimeLabel(req.ts)}</span>
        <div className="fm-meta">
          <IDot presence={req.presence} />
          <UserName name={req.name} />
        </div>
        <h3 className="fm-title">{req.topicTitle}</h3>

        <div className="fm-speech fm-speech--mine">{req.message}</div>

        {req.also && <div className="fm-im-also">I also want to talk about: <b>{req.also}</b></div>}

        <div className="fm-req-foot">
          <Badge format={req.format} />
          <span className="spacer"></span>
          {req.status === 'pending' && <span className="fm-status-pill fm-status-pill--pending">{'○'} waiting for reply</span>}
          {req.status === 'accepted' && req.convId && (
            <React.Fragment>
              <span className="fm-status-pill fm-status-pill--accepted">{'✔'} accepted</span>
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
        <div className="fm-meta fm-meta--wrap">
          <IDot presence={c.presence} />
          <UserName name={c.name} />
          {unread && <span className="fm-unread-badge">{c.unread} new {c.unread === 1 ? 'reply' : 'replies'}</span>}
          {c.outcome === 'success' && <span className="fm-status-pill fm-status-pill--accepted">{'✔'} connected</span>}
          {c.outcome === 'no' && <span className="fm-status-pill fm-status-pill--declined">didn't work out</span>}
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
              empty={<div className="fm-empty"><div className="big"><Hug /></div>No past chats yet — mark a conversation when you're done.</div>}
              render={(c) => <ChatCard key={c.id} c={c} onOpenChat={onOpenChat} past />} />
          )}
          {tab === 'sent' && (
            <PagedList items={sent} resetKey="sent"
              empty={<div className="fm-empty"><div className="big"><Hug /></div>You haven't reached out to anyone yet — head to Browse.</div>}
              render={(r) => <SentCard key={r.id} req={r} onOpenChat={onOpenChat} />} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- PROFILE ----------
function ProfileScreen({ account, topics, conversations, onReach, onDelete, theme, onSetTheme, onLogout }) {
  const mine = topics.filter((t) => t.mine);
  const convs = Object.values(conversations);
  const success = convs.filter((c) => c.outcome === 'success').length;
  return (
    <div className="fm-body">
      <div className="fm-scroll">
        <div className="fm-section">
          <div className="fm-profile-card" style={{ marginTop: 6 }}>
            <div className="fm-profile-head">
              <HugAva />
              <div className="fm-profile-who">
                <div className="fm-meta fm-profile-meta">
                  <IDot presence={account.presence} />
                  <span className="fm-name" style={{ color: window.fmColorFor(account.username), fontSize: 'var(--fs-h2)' }}>{account.username}</span>
                  <span className="fm-profile-status">{account.status ? '"' + account.status + '"' : 'no status yet'}</span>
                </div>
              </div>
            </div>
            <div className="fm-up-stats">
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
            <ThemeToggle theme={theme} onChange={onSetTheme} inNav />
          </div>
        </div>
        <div className="fm-section"><h3>Account</h3></div>
        <div className="fm-section">
          <div className="fm-appearance">
            <div>
              <div className="fm-appearance-title">Log out</div>
              <div className="fm-appearance-sub">Sign out of FriendMarket on this device.</div>
            </div>
            <button className="fm-btn fm-btn--danger" onClick={onLogout}>Log out</button>
          </div>
        </div>
        <div className="fm-section"><h3>Your topics</h3></div>
        <PagedList items={mine} perPage={FM_PER_PAGE} containerClass="fm-feed" resetKey="mine"
          empty={<div className="fm-empty" style={{ padding: 20 }}>You haven't posted a topic yet — try the Browse tab.</div>}
          render={(t) => <TopicRow key={t.id} topic={t} onReach={onReach || (() => {})} onDelete={onDelete} />} />
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

// ---------- USER PROFILE (someone else's) ----------
function UserProfileModal({ name, topics, requests, conversations, account, requestedTitles, onReach, onClose, hidden, onMinimize }) {
  // gather what we know about this person from the seed data
  const theirTopics = topics.filter((t) => t.name === name && !t.mine);
  const fromTopic = topics.find((t) => t.name === name);
  const fromReq = requests.find((r) => r.name === name);
  const fromConv = Object.values(conversations).find((c) => c.name === name);
  const presence = (fromTopic && fromTopic.presence) || (fromReq && fromReq.presence) || (fromConv && fromConv.presence) || 'offline';
  const isMe = account && account.username === name;
  const status = isMe ? (account.status || '') : ((fromTopic && fromTopic.status) || (fromReq && fromReq.senderStatus) || '');
  const convCount = Object.values(conversations).filter((c) => c.name === name).length;

  return (
    <div className={'fm-backdrop' + (hidden ? ' is-hidden' : '')} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fm-modal fm-win fm-userprofile">
        <div className="fm-titlebar">
          <span className="fm-tb-title"><Hug size={15} /> {isMe ? 'Your profile' : name + '’s profile'}</span>
          <WinButtons variant="popup" onMinimize={onMinimize} onClose={onClose} />
        </div>
        <div className="fm-modal-body">
          <div className="fm-up-head">
            <HugAva />
            <div className="fm-up-who">
              <div className="fm-up-name">
                <IDot presence={presence} />
                <span className="fm-name" style={{ color: window.fmColorFor(name), fontSize: 'var(--fs-h2)' }}>{name}</span>
              </div>
              <div className="fm-up-status">{status ? '“' + status + '”' : 'no status yet'}</div>
            </div>
          </div>
          <div className="fm-up-stats">
            <Stat n={theirTopics.length} label={theirTopics.length === 1 ? 'topic posted' : 'topics posted'} />
            <Stat n={convCount} label={convCount === 1 ? 'chat with you' : 'chats with you'} />
          </div>

          <div className="fm-up-section">{isMe ? 'Your topics' : 'Topics ' + name + ' posted'}</div>
          {theirTopics.length === 0 ? (
            <div className="fm-empty" style={{ padding: '14px 4px' }}>No open topics right now.</div>
          ) : (
            <div className="fm-feed" style={{ padding: '4px 0 2px' }}>
              {theirTopics.map((t) => (
                <TopicRow key={t.id} topic={isMe ? { ...t, mine: true } : t}
                  requested={requestedTitles && requestedTitles.has(t.title)}
                  onReach={(tp) => { onClose(); onReach(tp); }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- RESET PASSWORD ----------
function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const pwValid = FM_PW_RULES.every((r) => r.test(password));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!pwValid) { setErr('Please meet all password requirements.'); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setLoading(true);
    const { error } = await window.FM_SB.auth.updateUser({ password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    setTimeout(onDone, 2000);
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
        </div>
        {done ? (
          <div className="fm-fields" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-2)', fontWeight: 600 }}>Password updated! Signing you in…</p>
          </div>
        ) : (
          <form className="fm-fields" onSubmit={submit}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Choose a new password</h2>
            <div>
              <label>New password</label>
              <PasswordInput value={password} placeholder="create a password"
                onChange={(e) => { setPassword(e.target.value); setErr(''); }} />
              <PasswordRules password={password} />
            </div>
            <div>
              <label>Confirm password</label>
              <PasswordInput value={confirm} placeholder="repeat your password"
                onChange={(e) => { setConfirm(e.target.value); setErr(''); }} />
            </div>
            {err && <p className="fm-err">{err}</p>}
            <button className="fm-btn fm-btn--primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen, MeBar, ComposeModal, TopicRow, Pager, PagedList, BrowseScreen, ReachOutModal, ChatsScreen, ProfileScreen, Stat, UserProfileModal, ResetPasswordScreen });
