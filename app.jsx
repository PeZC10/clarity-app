/* Clarity — main app shell */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewport": "desktop",
  "accentHue": "moss",
  "showMarquee": true
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  moss:    { primary: '#2C4A2A', primary2: '#4A6B43', primarySoft: '#DCE5D4' },
  ink:     { primary: '#2E3A4A', primary2: '#5A6B82', primarySoft: '#E2E5EA' },
  oxblood: { primary: '#8E2A1F', primary2: '#B53B2A', primarySoft: '#F2DCD8' },
  ochre:   { primary: '#7A5A1E', primary2: '#A07530', primarySoft: '#F1E4CD' }
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const p = ACCENT_PRESETS[t.accentHue] || ACCENT_PRESETS.moss;
    document.documentElement.style.setProperty('--primary', p.primary);
    document.documentElement.style.setProperty('--primary-2', p.primary2);
    document.documentElement.style.setProperty('--primary-soft', p.primarySoft);
  }, [t.accentHue]);

  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [goals, setGoals] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const loggedInRef = useRef(false);

  /* Restore session on load + handle OAuth redirect callbacks */
  useEffect(() => {
    let authSub;
    async function init() {
      try {
        const sb = await getSB();

        // Subscribe before getSession so OAuth redirects are caught reliably
        const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user && !loggedInRef.current) {
            loggedInRef.current = true;
            await loginUser(session.user);
            setSessionLoading(false);
          }
        });
        authSub = subscription;

        const { data: { session } } = await sb.auth.getSession();
        if (session?.user && !loggedInRef.current) {
          loggedInRef.current = true;
          await loginUser(session.user);
        }
      } catch (e) {
        console.error('Auth init failed:', e);
      }
      setSessionLoading(false);
    }
    init();
    return () => authSub?.unsubscribe();
  }, []);

  async function loginUser(sbUser) {
    const name = sbUser.user_metadata?.name || sbUser.email.split('@')[0];
    setUser({ name, email: sbUser.email, id: sbUser.id });
    try {
      const [active, done] = await Promise.all([
        loadGoals(sbUser.id),
        loadCompleted(sbUser.id)
      ]);
      setGoals(active);
      setCompleted(done);
    } catch (e) {
      console.error('Failed to load goals:', e);
    }
    setView('dashboard');
  }

  async function handleAuth(payload) {
    if (payload.switch) { setAuthMode(payload.switch); return; }
    setAuthMode(null);
    await loginUser(payload.user);
  }

  async function signOut() {
    try {
      const sb = await getSB();
      await sb.auth.signOut();
    } catch (e) { console.error(e); }
    setUser(null);
    setGoals([]);
    setCompleted([]);
    setView('landing');
  }

  function startNew() { setView('new'); }

  async function completeFlow(g) {
    const id = 'g' + Date.now();
    const newGoal = {
      id, title: g.title, category: g.category, catId: g.catId, icon: g.icon,
      pct: 0, phase: 'Week 1 — Foundations', days: 'Day 1 of 30', streak: 0,
      started: new Date().toISOString().slice(0, 10), weeks: g.weeks
    };
    setGoals(gs => [newGoal, ...gs]);
    setActiveGoalId(id);
    setView('goal');
    if (user?.id) {
      try { await saveGoal(user.id, newGoal); } catch (e) { console.error('Save goal failed:', e); }
    }
  }

  async function updateGoal(g) {
    setGoals(gs => gs.map(x => x.id === g.id ? g : x));
    if (user?.id) {
      try { await saveGoal(user.id, g); } catch (e) { console.error('Update goal failed:', e); }
    }
  }

  async function completeGoal(g) {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setCompleted(c => [{ id: g.id, title: g.title, category: g.category, date }, ...c]);
    setGoals(gs => gs.filter(x => x.id !== g.id));
    setView('dashboard');
    if (user?.id) {
      try { await markGoalComplete(user.id, g); } catch (e) { console.error('Complete goal failed:', e); }
    }
  }

  const activeGoal = goals.find(g => g.id === activeGoalId);

  if (sessionLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'inline-flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)',
                animation: `pulseDot 1.4s ${i * 0.2}s infinite ease-in-out`, display: 'block' }} />
            ))}
          </div>
          <style>{`@keyframes pulseDot { 0%,80%,100%{opacity:.3;transform:scale(.7)}40%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      </div>
    );
  }

  const body = (
    <div className="app-shell">
      <Topbar view={view} setView={setView} user={user} onSignOut={signOut} onAuth={(m) => setAuthMode(m)} />
      {view === 'landing' || !user ? <Landing onAuth={(m) => setAuthMode(m)} onStart={startNew} /> :
       view === 'new' ? <GoalFlow onComplete={completeFlow} onBack={() => setView('dashboard')} /> :
       view === 'dashboard' ? <Dashboard user={user} goals={goals} completed={completed}
          onOpenGoal={(id) => { setActiveGoalId(id); setView('goal'); }}
          onNewGoal={startNew} onJournal={() => setView('journal')} /> :
       view === 'journal' ? <Journal goals={goals} completed={completed}
          onOpenGoal={(id) => { setActiveGoalId(id); setView('goal'); }}
          onBack={() => setView('dashboard')} /> :
       view === 'goal' && activeGoal ? <GoalDetail goal={activeGoal} onBack={() => setView('dashboard')}
          onUpdate={updateGoal} onComplete={completeGoal} /> :
       <Landing onAuth={(m) => setAuthMode(m)} onStart={startNew} />}
    </div>
  );

  return (
    <>
      {t.viewport === 'mobile' ? (
        <div style={{ background: 'var(--paper-2)', minHeight: '100vh', padding: '20px 0' }}>
          <div style={{ width: 420, maxWidth: '94vw', margin: '0 auto', border: '12px solid var(--ink)',
            borderRadius: 44, overflow: 'hidden', height: 'calc(100vh - 40px)', background: 'var(--paper)',
            boxShadow: '0 30px 80px rgba(24,23,21,0.18)' }}>
            <div style={{ height: '100%', overflowY: 'auto' }}>{body}</div>
          </div>
        </div>
      ) : body}

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSubmit={handleAuth} />}

      <TweaksPanel title="Clarity tweaks">
        <TweakSection label="Viewport" />
        <TweakRadio label="Surface" value={t.viewport}
          options={['desktop', 'mobile']}
          onChange={(v) => setTweak('viewport', v)} />
        <TweakSection label="Accent" />
        <TweakRadio label="Hue" value={t.accentHue}
          options={['oxblood', 'ink', 'moss', 'ochre']}
          onChange={(v) => setTweak('accentHue', v)} />
        <TweakSection label="Decoration" />
        <TweakToggle label="Marquee strip" value={t.showMarquee}
          onChange={(v) => setTweak('showMarquee', v)} />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
