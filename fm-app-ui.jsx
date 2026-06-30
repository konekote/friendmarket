// FriendMarket prototype — small UI atoms + the floating ChatWindow.

function Hug({ size }) {
  return <span className="fm-hug" style={size ? { fontSize: size } : undefined}>{'\uD83E\uDEC2'}</span>;
}

function HugAva({ className }) {
  return <div className={'fm-ava ' + (className || '')}><Hug /></div>;
}

function IDot({ presence }) {
  return <span className={'fm-idot fm-idot--' + presence} title={presence}></span>;
}

// A username that opens that person's profile when clicked.
function UserName({ name, className, style }) {
  return (
    <button type="button" className={'fm-name fm-uname ' + (className || '')}
      style={{ color: window.fmColorFor(name), ...(style || {}) }}
      onClick={(e) => { e.stopPropagation(); if (window.fmOpenUser) window.fmOpenUser(name); }}>{name}</button>
  );
}

function Badge({ format }) {
  const f = window.FM_FMT[format];
  if (!f) return null;
  return <span className={'fm-badge fm-badge--' + format}><span className="g">{f.glyph}</span>{f.label}</span>;
}

// variant: 'main' (all dead) | 'popup' (minimize + close live, maximize dead)
function WinButtons({ variant, onMinimize, onClose }) {
  const main = variant === 'main';
  const canMin = !main && !!onMinimize;
  return (
    <span className="fm-tb-dots">
      <button className={'tb-min' + (!canMin ? ' dead' : '')} title={canMin ? 'Minimize' : ''} tabIndex={-1}
        onClick={canMin ? onMinimize : undefined}>_</button>
      <button className="tb-max dead" title="" tabIndex={-1}>{'\u25A1'}</button>
      <button className={'tb-close' + (main ? ' dead' : '')} title={main ? '' : 'Close'} tabIndex={-1}
        onClick={main ? undefined : onClose}>{'\u00D7'}</button>
    </span>
  );
}

const FM_PRES_LABEL = { online: 'Online', away: 'Away', offline: 'Invisible' };

function ThemeToggle({ theme, resolvedDark, onCycle, inNav }) {
  const glyph = resolvedDark ? '\u263E' : '\u2600'; // moon / sun
  const label = theme === 'auto' ? 'Auto' : (theme === 'dark' ? 'Dark' : 'Light');
  const title = 'Theme: ' + label + (theme === 'auto' ? ' (following system)' : '') + ' — click to change';
  return (
    <button className={'fm-theme-toggle' + (inNav ? ' in-nav' : ' floating')} onClick={onCycle} title={title} aria-label={title}>
      <span className="ic">{glyph}</span>
      <span className="lbl">{label}</span>
    </button>
  );
}

function PresenceDropdown({ presence, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="fm-presdd" ref={ref}>
      <button className="fm-presdd-btn" onClick={() => setOpen((o) => !o)} title={FM_PRES_LABEL[presence]} aria-label={'Presence: ' + FM_PRES_LABEL[presence]}>
        <span className={'fm-dot fm-dot--' + presence}></span>
        <span className="caret">{'\u25BE'}</span>
      </button>
      {open && (
        <div className="fm-presdd-menu">
          {['online', 'away', 'offline'].map((k) => (
            <button key={k} className={k === presence ? 'is-on' : ''} onClick={() => { onChange(k); setOpen(false); }}>
              <span className={'fm-dot fm-dot--' + k}></span>{FM_PRES_LABEL[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FmtToggle({ value, onChange }) {
  return (
    <div className="fm-fmt-toggle">
      {['written', 'audio', 'video'].map((k) => (
        <button key={k} type="button" className={'fm-fmt' + (value === k ? ' is-on' : '')} onClick={() => onChange(k)}>
          <span>{window.FM_FMT[k].glyph}</span>{window.FM_FMT[k].label}
        </button>
      ))}
    </div>
  );
}

// ---- Chat window (draggable, Yahoo-IM style) ----
function ChatWindow({ conv, myName, index, minimized, onMinimize, onClose, onSend, onMark }) {
  const startPos = {
    left: Math.max(16, window.innerWidth - 380 - (index % 3) * 30),
    top: 90 + (index % 3) * 34,
  };
  const [pos, setPos] = React.useState(startPos);
  const [draft, setDraft] = React.useState('');
  const [markOpen, setMarkOpen] = React.useState(false);
  const logRef = React.useRef(null);
  const drag = React.useRef(null);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [conv.messages.length, minimized]);

  const onTitleDown = (e) => {
    if (e.target.closest('button')) return;
    drag.current = { dx: e.clientX - pos.left, dy: e.clientY - pos.top };
    const move = (ev) => {
      if (!drag.current) return;
      setPos({
        left: Math.min(window.innerWidth - 80, Math.max(-80, ev.clientX - drag.current.dx)),
        top: Math.min(window.innerHeight - 60, Math.max(0, ev.clientY - drag.current.dy)),
      });
    };
    const up = () => { drag.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    onSend(conv.id, t);
  };

  const scrollToEnd = () => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; };

  const myColor = window.fmColorFor(myName);

  return (
    <div className={'fm-chat fm-win' + (minimized ? ' is-min' : '')} style={{ left: pos.left, top: pos.top }}>
      <div className="fm-titlebar" onPointerDown={onTitleDown}>
        <span className="fm-tb-title"><Hug size={15} /><span className="ellip">{conv.name}</span></span>
        <WinButtons variant="popup" onMinimize={() => onMinimize(conv.id)} onClose={() => onClose(conv.id)} />
      </div>
      <div className="fm-chat-sub">
        <IDot presence={conv.presence} />
        <span>talking about <b>{conv.topicTitle}</b></span>
      </div>
      <div className="fm-chat-log" ref={logRef}>
        {conv.messages.map((m, i) => (
          m.from === 'sys'
            ? <div key={i} className="fm-msg sys">{m.text}</div>
            : (
              <div key={i} className="fm-msg">
                <span className="who" style={{ color: m.mine ? myColor : window.fmColorFor(conv.name) }}>{m.mine ? myName : conv.name}:</span>
                <span className="txt">{m.text}</span>
              </div>
            )
        ))}
      </div>
      <div className="fm-chat-note">
        <span>{'\u2139'}</span>
        <span>FriendMarket doesn’t host calls — swap Skype / Discord here when you’re both ready.</span>
      </div>

      {conv.outcome ? (
        <div className={'fm-ribbon fm-ribbon--' + (conv.outcome === 'success' ? 'success' : 'no')}>
          {conv.outcome === 'success' ? '\u2714 Marked a successful connection!' : '— Marked: didn’t work out'}
        </div>
      ) : (
        <React.Fragment>
          <div className="fm-chat-input">
            <input value={draft} placeholder="Type a message…" onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setTimeout(scrollToEnd, 300)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
            <button className="fm-btn fm-btn--primary fm-btn--sm" onClick={send}>Send</button>
          </div>
          <div className="fm-chat-bar">
            <span className="spacer"></span>
            <button className="fm-btn fm-btn--ghost fm-btn--sm" onClick={() => setMarkOpen((o) => !o)}>
              Mark interaction {'\u25BE'}
            </button>
            {markOpen && (
              <div className="fm-mark-menu">
                <button onClick={() => { setMarkOpen(false); onMark(conv.id, 'success'); }}><span>{'\u2714'}</span> Successful connection</button>
                <button onClick={() => { setMarkOpen(false); onMark(conv.id, 'no'); }}><span>{'—'}</span> Didn’t work out</button>
              </div>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { Hug, HugAva, IDot, UserName, Badge, WinButtons, PresenceDropdown, FmtToggle, ChatWindow, FM_PRES_LABEL, ThemeToggle });
