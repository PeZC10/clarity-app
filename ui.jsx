/* Clarity — shared UI: topbar, logo, marquee, primitives */

const { useState, useEffect, useRef, useMemo } = React;

function Logo({ size = 24, dark = false }) {
  return (
    <div className="topbar-logo" style={{ fontSize: size }}>
      <span
        className="topbar-logo-mark"
        style={{
          width: size * 0.9, height: size * 0.9,
          background: dark ? 'var(--paper)' : 'var(--ink)'
        }}
      />
      <span style={{ color: dark ? 'var(--paper)' : 'var(--ink)' }}>Clarity</span>
    </div>
  );
}

function Topbar({ view, setView, user, onSignOut, onAuth }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'journal',   label: 'Journal' },
    { id: 'new',       label: 'Start a goal' }
  ];
  return (
    <header className="topbar">
      <button onClick={() => setView(user ? 'dashboard' : 'landing')} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
        <Logo />
      </button>
      <nav className="topbar-nav">
        {user && links.map(l => (
          <button
            key={l.id}
            className={'topbar-link ' + (view === l.id ? 'active' : '')}
            onClick={() => setView(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>
      <div className="topbar-actions">
        {!user ? (
          <>
            <button className="btn btn-ghost" onClick={() => onAuth('signin')}>Sign in</button>
            <button className="btn btn-primary" onClick={() => onAuth('signup')}>Begin</button>
          </>
        ) : (
          <div className="user-pill">
            <div className="user-avatar">{user.name?.[0] || 'P'}</div>
            <span className="user-email">{user.email}</span>
            <button className="topbar-link" onClick={onSignOut} style={{ fontSize: 11 }}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function Marquee({ lines = [] }) {
  // duplicate so the loop is seamless
  const items = [...lines, ...lines];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {items.map((l, i) => (
          <span key={i} className="marquee-item">{l}</span>
        ))}
      </div>
    </div>
  );
}

/* Numeric / editorial display number */
function BigNumber({ value, label, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        className="h-display"
        style={{
          fontSize: 'clamp(56px, 8vw, 96px)',
          color: accent ? 'var(--primary)' : 'var(--ink)',
          fontFeatureSettings: '"lnum"'
        }}
      >
        {value}
      </div>
      {label && <div className="eyebrow">{label}</div>}
    </div>
  );
}

/* Hairline section header — eyebrow + title + optional rule */
function SectionHead({ eyebrow, title, sub, eyebrowColor = 'primary', align = 'left' }) {
  return (
    <div style={{ textAlign: align, marginBottom: 28 }}>
      {eyebrow && <div className={`eyebrow ${eyebrowColor}`} style={{ marginBottom: 14 }}>{eyebrow}</div>}
      {title && (
        <h2 className="h-2" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', margin: 0, marginBottom: sub ? 14 : 0 }}>
          {title}
        </h2>
      )}
      {sub && (
        <p style={{ color: 'var(--ink-3)', fontSize: 16, lineHeight: 1.55, maxWidth: align === 'center' ? 540 : 600, margin: align === 'center' ? '0 auto' : 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* Inline confirm chip — used for accountability moments */
function CommitChip({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: 'var(--primary)',
      background: 'var(--primary-soft)',
      padding: '5px 12px', borderRadius: 999
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
      {children}
    </span>
  );
}

/* Auth modal */
function AuthModal({ mode, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const isSignup = mode === 'signup';

  function submit(e) {
    e.preventDefault();
    onSubmit({ email, password, name: name || email.split('@')[0] });
  }
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(24,23,21,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, animation: 'fadeIn 250ms var(--ease)', padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          width: 460, maxWidth: '100%', padding: '40px 36px',
          animation: 'fadeUp 350ms var(--ease)'
        }}
      >
        <div className="eyebrow primary" style={{ marginBottom: 14 }}>
          {isSignup ? 'Begin' : 'Welcome back'}
        </div>
        <h2 className="h-2" style={{ fontSize: 36, margin: 0, marginBottom: 8 }}>
          {isSignup ? <>The work is <em style={{ color: 'var(--primary)' }}>yours</em>.</> : 'Pick up where you left off.'}
        </h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.55, marginBottom: 28, marginTop: 8 }}>
          {isSignup
            ? "We'll hold the structure. You'll do the showing up."
            : "Your goals are still waiting."}
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isSignup && (
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>What should we call you?</label>
              <input type="text" placeholder="First name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
            {isSignup ? 'Begin —' : 'Sign in —'}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-3)', textAlign: 'center' }}>
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <button
            className="btn-link"
            onClick={() => onSubmit({ switch: isSignup ? 'signin' : 'signup' })}
            style={{ fontSize: 13 }}
          >
            {isSignup ? 'Sign in' : 'Begin'}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Logo, Topbar, Marquee, BigNumber, SectionHead, CommitChip, AuthModal });
