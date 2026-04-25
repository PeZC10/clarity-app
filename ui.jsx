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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  async function oauthSignIn(provider) {
    setLoading(true);
    setError('');
    try {
      const sb = await getSB();
      const { error: oauthErr } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (oauthErr) throw oauthErr;
      // browser redirects away — no further action
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const sb = await getSB();
      if (isSignup) {
        const { error: signUpErr } = await sb.auth.signUp({ email, password });
        if (signUpErr) throw signUpErr;
        const { data, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        onSubmit({ name: name || email.split('@')[0], email, user: data.user });
      } else {
        const { data, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        onSubmit({ name: data.user.user_metadata?.name || email.split('@')[0], email, user: data.user });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
          animation: 'fadeUp 350ms var(--ease)', maxHeight: '90vh', overflowY: 'auto'
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

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => oauthSignIn('google')}
            disabled={loading}
            style={{ justifyContent: 'center', gap: 12 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => oauthSignIn('apple')}
            disabled={loading}
            style={{ justifyContent: 'center', gap: 12 }}
          >
            <svg width="15" height="18" viewBox="0 0 15 18" fill="currentColor">
              <path d="M14.18 12.57c-.28.65-.62 1.25-1.01 1.79-.53.76-0.97 1.28-1.3 1.57-.52.48-1.08.72-1.68.73-.43 0-.95-.12-1.55-.37-.6-.25-1.15-.37-1.65-.37-.53 0-1.09.12-1.69.37-.6.25-1.09.38-1.47.39-.58.02-1.15-.23-1.7-.74-.36-.31-.82-.85-1.36-1.62C.17 13.53-.28 12.38-.28 11.18c0-1.12.24-2.08.73-2.88.38-.64.9-1.15 1.56-1.53.65-.38 1.36-.57 2.12-.58.42 0 .97.13 1.65.39.68.26 1.12.39 1.31.39.14 0 .62-.15 1.42-.46.76-.29 1.4-.41 1.93-.37 1.43.12 2.5.68 3.21 1.71-1.28.77-1.91 1.86-1.9 3.25.01 1.08.4 1.98 1.17 2.69.35.33.74.59 1.17.77l-.43 1.01zM10.8.36c0 .85-.31 1.64-.93 2.37-.74.87-1.64 1.37-2.62 1.29-.01-.1-.02-.21-.02-.32 0-.81.35-1.68.98-2.39.31-.36.71-.66 1.2-.9.48-.23.94-.36 1.37-.39.01.11.02.23.02.34z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ flex: 1, borderTop: '0.5px solid var(--rule)' }} />
          <span className="mono" style={{ color: 'var(--ink-4)', fontSize: 10 }}>OR</span>
          <div style={{ flex: 1, borderTop: '0.5px solid var(--rule)' }} />
        </div>

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
          {error && (
            <div style={{ color: '#b53b2a', fontSize: 13, padding: '10px 14px', background: '#f2dcd8', borderRadius: 8 }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, justifyContent: 'center' }}>
            {loading ? 'One moment…' : isSignup ? 'Begin —' : 'Sign in —'}
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
