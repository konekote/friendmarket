# Handoff: FriendMarket

## Overview
FriendMarket is a social "topic board" web app with a nostalgic Yahoo-Messenger-flavored desktop aesthetic (aqua-blue gloss, faux OS windows, period web-safe type). Users sign in, post **topics** they want to talk about, browse other people's topics, **reach out** to start a conversation, and chat in floating IM-style windows. There's a presence/status system (online / away / invisible), incoming & outgoing requests, active & past conversations, and a light/dark/auto theme.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a working prototype demonstrating the intended look, copy, and behavior. They are **not** production code to copy verbatim. The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns, component library, and state/data conventions. If no environment exists yet, pick the most appropriate framework and implement there.

The prototype runs with zero build step: `FriendMarket.html` pulls in React 18 + Babel from a CDN and loads three JSX files plus one CSS file. JSX is transpiled in the browser. Components are shared between files via `Object.assign(window, {...})` (a prototype shortcut — in a real codebase use normal imports/exports).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, gloss treatments, and interactions are all specified. Recreate the UI faithfully, mapping the tokens below onto the codebase's own system where one exists.

## Screens / Views
The app is a single faux-desktop with one main application window. `view` state switches the body between three screens; floating chat windows, a compose popup, and a reach-out popup layer on top.

### Auth screen (`AuthScreen`)
- **Purpose**: pick a username + status, "sign in" (no real auth — sets `account`).
- Shown when `account` is null. On submit, sets account and switches to Browse.

### Top bar (persistent chrome, all screens)
- **Title bar**: glossy blue gradient strip with the FriendMarket mark + window buttons (decorative minimize/maximize, functional-looking close).
- **Header**: brand lockup on the left (logomark + "Friend**Market**" wordmark, accent-green "Market"; tagline "find someone to talk to"). On the right, the **nav**: `Browse`, `Chats` (with unread count badge), `My Account`, and a primary **Post topic** button (blue, opens compose popup).
- **Me bar** (`MeBar`): presence dropdown (online/away/invisible), your colored username, and an inline editable status message.

### Browse (`BrowseScreen`) — default view
- **Purpose**: discover topics and reach out.
- **Layout**: scrollable column. Toolbar row = search input + category `<select>` + sort `<select>`. Below, a paginated list (10/page) of topic rows.
- **Topic row** (`TopicRow`): avatar, presence dot, colored name, status text, topic title (`h3`), description, format badge (Written/Audio/Video), reply count ("N friends reached out"), relative timestamp, and a **Let's talk!** primary button (or a "✔ requested" pill if already requested). Your own posts get an `is-mine` green tint and no button.

### Chats (`ChatsScreen`)
- **Purpose**: manage requests and conversations. Tabbed: **Incoming** / **Sent** / **Active** / **Past**.
- Incoming request cards (`IncomingCard`): Accept & chat / Delete.
- Sent cards (`SentCard`): show pending ("waiting for reply") or accepted ("Open chat").
- Chat cards (`ChatCard`): last message preview, unread badge, open/read button.

### My Account (`ProfileScreen`)
- **Purpose**: profile summary + settings + your posted topics.
- Profile card: avatar, presence, name, status, and three stats (topics posted / conversations / successful).
- **Appearance** section: a row labeled "Light / dark mode" with subcopy and the **theme toggle** (cycles Light → Dark → Auto). *(This was recently moved here from the top nav.)*
- "Your topics": paginated list of the user's own `TopicRow`s.

### Compose popup (`ComposeModal`)
- **Purpose**: post a new topic. Opens from the **Post topic** button in the top bar.
- A faux-window modal over a dim backdrop. Title bar "Post a new topic" with a close (X) button — **there is no Cancel button; the X closes it.**
- Fields: title (required, autofocus), optional detail line, format toggle (Written/Audio/Video), category `<select>` (required). Footer: single **Post it** primary button, disabled until title + category are filled. On post, prepends the topic to the board and closes.

### Reach-out popup (`ReachOutModal`)
- **Purpose**: send a request against a topic. Faux-window modal, **minimizable** (docks to a chip bottom-right so the draft is preserved). Fields: message (required) + optional "I also want to talk about…". Sends request; the prototype auto-simulates the other person accepting after ~2.6s.

### Chat windows (`ChatWindow`)
- Floating IM windows (multiple can be open; minimizing docks them bottom-right). Message log, text input, and a "mark outcome" control (successful connection / didn't work out). Other party auto-replies ~1.2s after you send (from `FM_REPLIES`).

## Interactions & Behavior
- **Navigation**: nav buttons set `view`. Active button gets `is-active` styling.
- **Post topic**: top-bar button → `ComposeModal` → `onPost` prepends to `topics`, fires a toast "Your topic is live on the board!", closes modal.
- **Reach out**: `Let's talk!` → `ReachOutModal` → `onSendRequest` adds an outgoing request + increments the topic's reply count + toast; then a `setTimeout` simulates acceptance, creating a conversation and opening its chat window.
- **Accept incoming**: creates a conversation, opens its chat window, switches to the Active tab.
- **Theme**: `theme` ∈ {light, dark, auto}; persisted to `localStorage`. `auto` follows `prefers-color-scheme` via a live `matchMedia` listener. Resolved value sets `data-theme="dark|light"` on the root `.fmw`, which drives the dark-mode CSS block.
- **Toasts**: transient bottom notifications, auto-dismiss after 4.2s.
- **Minimized popups/chats** dock as chips bottom-right; click to restore, X to close.
- **Reset demo**: clears state back to seed.
- **Animations**: backdrops fade in (`fm-fade`); buttons have `:hover` brightness and `:active` press (translateY + inset shadow). Keep transitions subtle.

## State Management
Single root `App` holds all state (prototype uses `useState` + a `patch` reducer-ish updater; the whole state object is persisted to `localStorage` on every change). Key state:
- `account`: `{ username, email, presence, status } | null`
- `view`: `'browse' | 'requests' | 'profile'`
- `topics[]`: `{ id, name, presence, status, title, desc, format, category, replies, ts, mine }`
- `requests[]`: incoming/outgoing — `{ id, ts, dir, name, presence, topicTitle, category, format, message, also, status, convId?, senderStatus? }`
- `conversations{}`: keyed by id — `{ id, name, presence, topicTitle, outcome, unread?, messages:[{from,text,mine}] }`
- `openChats[]`: conversation ids with an open window
- UI-local (not persisted): `composeOpen`, `reachTopic`, `reachMin`, `minChats[]`, `reqTab`, `toasts[]`, `theme`, `systemDark`
- Topics expire after `FM_MAX_DAYS` (10 days); timestamps render as today / yesterday / N days ago.

In a real app, replace the `localStorage` blob with proper data fetching/mutations and move the simulated auto-accept / auto-reply timers to real backend events.

## Design Tokens
CSS custom properties on `.fmw` (light), overridden under `.fmw[data-theme="dark"]`.

**Colors — light**
- `--panel` #ffffff · `--ink` #143040 · `--muted` #5d7c8d
- `--line` #cbe6f6 · `--line-2` #e3f1fa
- `--accent` #1391d8 · `--accent-d` #0f7bbb · `--accent-2` #5aa800 (green)
- presence: `--online` #34b233 · `--away` #e8a13a · `--offline` #9aa7af

**Colors — dark**
- `--panel` #1b2733 · `--ink` #e7f0f6 · `--muted` #9fb4c2 · `--line` #324453 · `--line-2` #283643
- `--accent` #3aa6e6 · `--accent-d` #2f8fcc · `--accent-2` #8cd24f
- presence: `--online` #42c63e · `--away` #e3a13a · `--offline` #7c8a94

**Signature gradients / gloss**
- Title bar: `linear-gradient(#5aa6e6 0%, #2f88d6 48%, #1f74c4 54%, #2f88d6 100%)`, white text with `text-shadow: 0 1px 1px rgba(8,40,70,.55)`.
- Primary button (`fm-btn--primary`): `linear-gradient(#5ec0f5 0%,#1f9be4 50%,#1382cc 51%,#2aa0e8 100%)`, border #1183c4, white text, pill radius 999px. **"Let's talk!", "Post it", and the "Post topic" nav button all share this exact fill.** (Note: nav `button` base styles otherwise strip it — the nav button re-asserts the gradient at `.fm-nav button.fm-nav-post` specificity.)
- Accent button (`fm-btn--accent`): green gloss `linear-gradient(#9ad94a 0%,#74c200 50%,#67ad00 51%,#84cf16 100%)`.
- Ghost button (`fm-btn--ghost`): white fill, `--line` border, muted text.
- Desktop background: radial light-blue glow over `linear-gradient(#bfe6ff, #d9f1ff 45%, #eafaff 100%)`, with a soft green wash on the bottom 38%.

**Typography**
- Font stack: `'Trebuchet MS','Segoe UI',Verdana,sans-serif` (`--font`). Web-safe, intentionally period-appropriate — no Google Font needed.
- Buttons/nav ~13px, weight 700. Topic title `h3` ~15px. Status/meta ~12px, muted. Logo ~24px.

**Radius / shadow**
- Windows: `border-radius: 9px 9px 7px 7px`; `box-shadow: 0 18px 50px rgba(20,70,110,.28), inset 0 2px 0 rgba(255,255,255,.6)`.
- Cards/rows/inputs: ~9–11px radius, `--line` borders. Pills/buttons: 999px.
- Name colors are hashed per-username from `FM_NAME_COLORS` (8 colors) via `fmColorFor(name)`.

**Format glyphs** (`FM_FMT`): Written ✎, Audio ♪, Video ▶.
**Categories** (`FM_CATEGORIES`): Music, Movies & TV, Gaming, Animals, Books, Technology, Food, Art, Languages, Lifestyle.

## Assets
No external image/icon assets — all iconography is Unicode glyphs (e.g. the "Hug" mark, presence dots, format glyphs, sun/moon for theme) and CSS gradients. No fonts to bundle (web-safe stack). If recreating in a codebase with an icon library, swap the Unicode glyphs for equivalent icons.

## Files
Included in this handoff (copies of the live prototype):
- `FriendMarket.html` — app shell: CDN script tags, root `App` component, top bar, view switching, modal/chat/toast/dock rendering, theme resolution.
- `fm-app-data.jsx` — seed data, categories, name-color hashing, relative-time helpers, simulated requests/replies, `localStorage` persistence (`fmLoad`/`fmSave`).
- `fm-app-ui.jsx` — UI primitives: `Hug`, `HugAva`, `IDot`, `Badge`, `WinButtons`, `PresenceDropdown`, `FmtToggle`, `ChatWindow`, `ThemeToggle`.
- `fm-app-screens.jsx` — `AuthScreen`, `MeBar`, `ComposeModal`, `TopicRow`, `Pager`/`PagedList`, `BrowseScreen`, `ReachOutModal`, `ChatsScreen` (+ `IncomingCard`/`SentCard`/`ChatCard`), `ProfileScreen`, `Stat`.
- `fm-app.css` — all styling, including the dark-mode block (`.fmw[data-theme="dark"] …`) and responsive tweaks (≤640px).

To run the reference: open `FriendMarket.html` in a browser (it fetches React/Babel from CDN, so it needs network access on first load).
