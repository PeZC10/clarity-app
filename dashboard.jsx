/* Clarity — dashboard, journal, and goal detail (with checklist) */

/* Pull current day-of-cycle from a goal (used for calendar grid + identity sentence) */
function dayNumberFromGoal(g) {
  const m = (g.days || '').match(/Day (\d+) of (\d+)/);
  return m ? { day: +m[1], total: +m[2] } : { day: 1, total: 30 };
}

/* Hand-curated identity sentences — change tone with progress, no AI calls */
const IDENTITY_LINES = {
  early: [   // day 1-7
    "You are someone who began.",
    "You are a person who finally said yes.",
    "You are someone who stopped waiting for Monday."
  ],
  rhythm: [  // day 8-15
    "You are someone who shows up — even on the days you don't feel like it.",
    "You are a person becoming the kind of person who finishes.",
    "You are someone whose mornings have a shape now."
  ],
  dip: [     // day 16-22
    "You are someone walking through the dip on purpose.",
    "You are a person who keeps going when the novelty is gone.",
    "You are someone who outlasts their own resistance."
  ],
  compound: [ // day 23-30
    "You are someone the work has changed.",
    "You are a person who can be counted on — by yourself.",
    "You are someone who proves it in the doing."
  ]
};

function identityLineFor(maxDay, name) {
  const phase = maxDay <= 7 ? 'early' : maxDay <= 15 ? 'rhythm' : maxDay <= 22 ? 'dip' : 'compound';
  const pool = IDENTITY_LINES[phase];
  // deterministic per day so it doesn't flicker on re-render
  return pool[(maxDay + (name?.length || 0)) % pool.length];
}

/* Calendar grid — 30 squares, current day highlighted, past filled, future hairline */
function CalendarGrid({ day, total = 30, accent = 'var(--primary)' }) {
  const cells = Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    const state = n < day ? 'done' : n === day ? 'today' : 'future';
    return { n, state };
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4 }}>
      {cells.map(c => (
        <div key={c.n} title={`Day ${c.n}`} style={{
          aspectRatio: '1 / 1',
          borderRadius: 2,
          background: c.state === 'done' ? accent
            : c.state === 'today' ? 'var(--ink)'
            : 'transparent',
          border: c.state === 'future' ? '0.5px solid var(--rule-2)'
            : c.state === 'today' ? '1.5px solid var(--ink)' : 'none',
          opacity: c.state === 'done' ? 0.85 : 1,
          transition: 'all 220ms var(--ease)'
        }} />
      ))}
    </div>
  );
}

function Dashboard({ user, goals, completed, onOpenGoal, onNewGoal, onJournal }) {
  const isMobile = useIsMobile();
  const totalActive = goals.length;
  const totalDone = completed.length;
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = today.getHours();
  const isMorning = hour < 14;
  const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  // The user's "deepest" goal (furthest along) — drives the identity sentence
  const maxDay = goals.length ? Math.max(...goals.map(g => dayNumberFromGoal(g).day)) : 1;
  const identity = identityLineFor(maxDay, user?.name);

  // "Today's one thing" — the next undone item in the most-active goal
  const focusGoal = goals.length ? [...goals].sort((a, b) => b.streak - a.streak)[0] : null;
  let focusItem = null;
  if (focusGoal) {
    for (const w of focusGoal.weeks) {
      const found = w.items.find(it => !it.done);
      if (found) { focusItem = { goal: focusGoal, week: w, text: found.text }; break; }
    }
  }

  return (
    <div className="fade-in">

      {/* IDENTITY — the single sentence */}
      <section style={{ padding: '60px 0 24px' }}>
        <div className="container">
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 14, letterSpacing: '0.18em' }}>
            {todayLabel.toUpperCase()} · {partOfDay.toUpperCase()}
          </div>
          <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5.2vw, 72px)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 1080 }}>
            {identity.split(/(\s—\s|, even|on purpose|the doing|when the novelty|finally said yes|finishes|shape now|outlasts|proves it|changed|counted on|finally said yes|finishes)/).map((part, i) => (
              <span key={i} style={ i % 2 ? { fontStyle: 'italic', color: 'var(--primary)' } : {}}>{part}</span>
            ))}
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 19, fontStyle: 'italic', color: 'var(--ink-3)', margin: '20px 0 0' }}>
            Hello, {user.name}. Day {maxDay} of the work.
          </p>
        </div>
      </section>

      {/* TODAY'S ONE THING — the hero block */}
      {focusItem && (
        <section style={{ padding: '32px 0 60px' }}>
          <div className="container">
            <div style={{
              border: '0.5px solid var(--ink)',
              borderRadius: 'var(--r-md)',
              padding: isMobile ? '24px 20px' : '40px 44px',
              background: 'var(--paper)',
              display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 40, alignItems: isMobile ? 'flex-start' : 'center'
            }}>
              <div>
                <div className="eyebrow primary" style={{ marginBottom: 14 }}>Today's one thing</div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 3.6vw, 40px)', lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                  {focusItem.text}
                </p>
                <div className="mono" style={{ color: 'var(--ink-3)', marginTop: 18 }}>
                  {focusItem.goal.title} · {focusItem.week.title.split(' — ')[0]}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => onOpenGoal(focusItem.goal.id)} style={{ flexShrink: 0 }}>
                Open the work —
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CLARITY SAYS — morning/evening dual, contextual */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div className="card-ink" style={{ padding: '30px 36px', borderRadius: 'var(--r-md)' }}>
            <div className="eyebrow gold" style={{ marginBottom: 12 }}>
              {isMorning ? 'Clarity says, this morning' : 'Clarity says, tonight'}
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 2.4vw, 26px)', lineHeight: 1.4, margin: 0, color: 'var(--paper)', letterSpacing: '-0.005em' }}>
              {isMorning
                ? (maxDay <= 7 ? "The first week is for one thing — proving to yourself that you'll show up. Don't be impressive. Be consistent."
                   : maxDay <= 15 ? "The novelty is gone. That's good. This is where compounding starts. Make today identical to yesterday."
                   : maxDay <= 22 ? "The dip is real. Walk through it. The version of you on day 30 is being built right now, in exactly this kind of moment."
                   : "Within reach. Don't get cute. Finish the way you started.")
                : (maxDay <= 7 ? "Did you show up today? That's the only question that matters this week. Sleep. Tomorrow is more important than today."
                   : maxDay <= 15 ? "Look at what you've built. Quiet, ordinary days. That's how it actually happens."
                   : maxDay <= 22 ? "It's heavy right now. Of course it is. Rest. Then keep going."
                   : "Almost. Don't write the ending in your head. Write it with your hands, tomorrow.")}
            </p>
          </div>
        </div>
      </section>

      {/* GOALS — calendar-grid cards */}
      <section style={{ padding: '24px 0 60px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="eyebrow primary" style={{ marginBottom: 10 }}>The shape of the work</div>
              <h2 className="h-2" style={{ fontSize: 36, margin: 0 }}>{totalActive} {totalActive === 1 ? 'goal' : 'goals'} in motion.</h2>
            </div>
            <button className="btn btn-ghost" onClick={onNewGoal}>+ New goal</button>
          </div>

          {goals.length === 0 ? (
            <EmptyState
              title="No goals in motion."
              sub="Set one. The rest follows."
              action="Begin"
              onAction={onNewGoal}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {goals.map(g => <GoalCard key={g.id} goal={g} onClick={() => onOpenGoal(g.id)} />)}
            </div>
          )}
        </div>
      </section>

      {/* BEHIND YOU — completed strip */}
      {completed.length > 0 && (
        <section style={{ padding: '32px 0 80px', borderTop: '0.5px solid var(--rule)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, marginTop: 24 }}>
              <div className="eyebrow accent">Behind you</div>
              <button className="btn-link" onClick={onJournal} style={{ fontSize: 12 }}>Open journal →</button>
            </div>
            <div style={{ borderTop: '0.5px solid var(--rule)' }}>
              {completed.map(c => (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: isMobile ? '1fr auto' : '60px 1fr auto auto', gap: isMobile ? 12 : 24,
                  alignItems: 'center', padding: '16px 0', borderBottom: '0.5px solid var(--rule)'
                }}>
                  {!isMobile && <div className="mono" style={{ color: 'var(--ok)' }}>DONE</div>}
                  <div style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? 16 : 19, color: 'var(--ink)' }}>{c.title}</div>
                  {!isMobile && <div className="mono" style={{ color: 'var(--ink-3)' }}>{c.category}</div>}
                  <div className="mono" style={{ color: 'var(--ink-3)', opacity: 0.75 }}>{c.date}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* GOAL CARD — calendar grid + identity, no % bar */
function GoalCard({ goal, onClick }) {
  const isMobile = useIsMobile();
  const { day, total } = dayNumberFromGoal(goal);
  const remaining = total - day + 1;
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', background: 'transparent', border: '0.5px solid var(--rule-2)',
        borderRadius: 'var(--r-md)', padding: isMobile ? '20px 18px' : '28px 32px', cursor: 'pointer',
        transition: 'all 200ms var(--ease)', fontFamily: 'var(--sans)',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? 16 : 36, alignItems: 'center'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.borderColor = 'var(--ink)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--rule-2)'; }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--primary)', lineHeight: 1 }}>{goal.icon}</span>
          <div className="mono" style={{ color: 'var(--ink-3)' }}>{goal.category}</div>
        </div>
        <h3 className="h-2" style={{ fontSize: 24, margin: 0, marginBottom: 14, lineHeight: 1.2, letterSpacing: '-0.005em' }}>{goal.title}</h3>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)', fontStyle: 'italic' }}>
            Day <strong style={{ fontStyle: 'normal', color: 'var(--primary)' }}>{day}</strong> of {total}
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--rule-2)' }} />
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{remaining} left</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--rule-2)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ok)' }} />
            {goal.streak}-day streak
          </span>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-2)' }}>
          <span className="mono" style={{ color: 'var(--ink-3)', marginRight: 10 }}>NOW</span>
          {goal.phase}
        </div>
      </div>
      {!isMobile && <div>
        <CalendarGrid day={day} total={total} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>D 01</span>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>D {String(total).padStart(2, '0')}</span>
        </div>
      </div>}
    </button>
  );
}

function EmptyState({ title, sub, action, onAction }) {
  return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <h3 className="h-2" style={{ fontSize: 36, margin: 0, marginBottom: 12 }}>{title}</h3>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 28 }}>{sub}</p>
      {action && <button className="btn btn-primary" onClick={onAction}>{action} —</button>}
    </div>
  );
}

/* Step workspace — activity card + notes textarea */
function StepWorkspace({ goal, week, item, wi, ii, onItemUpdate }) {
  const [guidance, setGuidance] = useState(item.guidance || null);
  const [loading, setLoading] = useState(!item.guidance);
  const [notes, setNotes] = useState(item.notes || '');
  const [saveState, setSaveState] = useState('idle');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (item.guidance) { setLoading(false); return; }
    fetch('/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: goal.title, category: goal.category, weekTitle: week.title, stepText: item.text })
    })
      .then(r => r.json())
      .then(data => { setGuidance(data); onItemUpdate(wi, ii, { guidance: data }); })
      .catch(() => setGuidance({ exercise: 'Take 15 minutes right now and reflect on this step. Write down the single next physical action you can take.', prompt: "What's the smallest version of this you could do today?", duration: '15 min' }))
      .finally(() => setLoading(false));
  }, []);

  function handleNotesChange(e) {
    const val = e.target.value;
    setNotes(val);
    setSaveState('saving');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onItemUpdate(wi, ii, { notes: val });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 800);
  }

  return (
    <div style={{ margin: '4px 0 20px 38px', animation: 'fadeUp 300ms var(--ease) both' }}>
      {loading ? (
        <div className="mono" style={{ color: 'var(--ink-3)', padding: '18px 0' }}>Generating activity…</div>
      ) : guidance && (
        <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-md)', padding: '24px 28px', color: 'var(--paper)', marginBottom: 14 }}>
          <div className="eyebrow gold" style={{ marginBottom: 14 }}>{guidance.duration} · do this now</div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.55, margin: '0 0 18px', letterSpacing: '-0.005em' }}>
            {guidance.exercise}
          </p>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.5, margin: 0, fontStyle: 'italic', color: 'var(--moss-light)' }}>
            {guidance.prompt}
          </p>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Write your notes here…"
          rows={5}
          style={{
            width: '100%', fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.6,
            color: 'var(--ink)', background: 'var(--paper-2)', border: '0.5px solid var(--rule-2)',
            borderRadius: 'var(--r-sm)', padding: '14px 16px', resize: 'vertical', outline: 'none',
            transition: 'border-color 180ms var(--ease)'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--ink)'}
          onBlur={e => e.target.style.borderColor = 'var(--rule-2)'}
        />
        {saveState !== 'idle' && (
          <div className="mono" style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'var(--ink-4)' }}>
            {saveState === 'saving' ? 'Saving…' : 'Saved'}
          </div>
        )}
      </div>
    </div>
  );
}

/* Goal detail with checklist + roadmap */
function GoalDetail({ goal, onBack, onUpdate, onComplete }) {
  const isMobile = useIsMobile();
  const [weeks, setWeeks] = useState(goal.weeks);
  const [expandedKey, setExpandedKey] = useState(null);
  const allItems = weeks.flatMap(w => w.items);
  const doneCount = allItems.filter(i => i.done).length;
  const pct = Math.round((doneCount / allItems.length) * 100);

  const currentWeekIdx = weeks.findIndex(w => w.items.some(i => !i.done));
  const phaseIdx = currentWeekIdx === -1 ? weeks.length - 1 : currentWeekIdx;

  function updateItem(wi, ii, patch) {
    const next = weeks.map((w, i) => i !== wi ? w : ({
      ...w,
      items: w.items.map((it, j) => j !== ii ? it : { ...it, ...patch })
    }));
    setWeeks(next);
    onUpdate({ ...goal, weeks: next, pct: Math.round((next.flatMap(w => w.items).filter(i => i.done).length / next.flatMap(w => w.items).length) * 100) });
  }

  function toggle(wi, ii) {
    updateItem(wi, ii, { done: !weeks[wi].items[ii].done });
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <section style={{ borderBottom: '0.5px solid var(--rule-2)', padding: '40px 0 36px' }}>
        <div className="container">
          <button className="btn-link" onClick={onBack} style={{ fontSize: 12, marginBottom: 28 }}>← Back to dashboard</button>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 280px', gap: isMobile ? 24 : 60, alignItems: 'end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--primary)' }}>{goal.icon}</span>
                <div className="mono" style={{ color: 'var(--ink-3)' }}>{goal.category}</div>
              </div>
              <h1 className="h-1" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: 0, lineHeight: 1.05 }}>
                {goal.title}
              </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 16, alignItems: isMobile ? 'center' : 'flex-end' }}>
              <ProgressRing pct={pct} size={140} />
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ color: 'var(--ink-3)' }}>{goal.days || `${doneCount} of ${allItems.length} done`}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section style={{ padding: '48px 0', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="container">
          <div className="eyebrow accent" style={{ marginBottom: 24 }}>The 30-day arc</div>
          <Roadmap weeks={weeks} currentIdx={phaseIdx} />
        </div>
      </section>

      {/* Clarity says */}
      <section style={{ padding: '40px 0', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="container">
          <div className="card-ink" style={{ padding: '32px 36px', borderRadius: 'var(--r-md)' }}>
            <div className="eyebrow gold" style={{ marginBottom: 14 }}>Clarity says, today</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.35, margin: 0, color: 'var(--paper)', letterSpacing: '-0.005em' }}>
              {pct < 25 ? "You started. That's the hardest single step. Now — make today identical to yesterday."
                : pct < 50 ? "The novelty is gone. That's good. This is where compounding starts."
                : pct < 75 ? "You're past the dip. Don't coast. The version of you on day 30 is being built right now."
                : pct < 100 ? "Within reach. Don't get cute. Finish the way you started."
                : "Done. Capture what you learned. Then write the next 30 days."}
            </p>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="eyebrow primary" style={{ marginBottom: 12 }}>The work</div>
              <h2 className="h-2" style={{ fontSize: 36, margin: 0 }}>{doneCount} done · {allItems.length - doneCount} left</h2>
            </div>
            {pct === 100 && (
              <button className="btn btn-primary" onClick={() => onComplete(goal)}>Mark goal achieved —</button>
            )}
          </div>

          <div style={{ borderTop: '0.5px solid var(--rule-2)' }}>
            {weeks.map((w, wi) => {
              const wDone = w.items.filter(i => i.done).length;
              const wTotal = w.items.length;
              const isCurrent = wi === phaseIdx;
              return (
                <div key={wi} style={{ borderBottom: '0.5px solid var(--rule)', padding: '32px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 18 }}>
                    <span className="mono" style={{ color: isCurrent ? 'var(--primary)' : (wDone === wTotal ? 'var(--ok)' : 'var(--ink-3)') }}>
                      WK {String(w.week).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0, letterSpacing: '-0.005em', flex: 1 }}>{w.title}</h3>
                    <span className="mono" style={{ color: 'var(--ink-3)' }}>{wDone}/{wTotal}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {w.items.map((it, ii) => {
                      const key = `${wi}-${ii}`;
                      const isOpen = expandedKey === key;
                      return (
                        <li key={ii} style={{ borderTop: ii > 0 ? '0.5px solid var(--rule)' : 'none' }}>
                          <div
                            style={{
                              display: 'flex', gap: 16, padding: '12px 0', alignItems: 'flex-start',
                              opacity: it.done ? 0.5 : 1, cursor: 'pointer'
                            }}
                            onClick={() => setExpandedKey(isOpen ? null : key)}
                          >
                            <span
                              style={{
                                width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                                border: '1.5px solid ' + (it.done ? 'var(--ok)' : 'var(--rule-2)'),
                                background: it.done ? 'var(--ok)' : 'transparent',
                                color: 'var(--paper)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, marginTop: 1,
                                transition: 'all 180ms var(--ease)'
                              }}
                              onClick={e => { e.stopPropagation(); toggle(wi, ii); }}
                            >
                              {it.done && '✓'}
                            </span>
                            <span style={{
                              flex: 1, fontSize: 15.5, lineHeight: 1.55,
                              color: it.done ? 'var(--ink-3)' : 'var(--ink-2)',
                              textDecoration: it.done ? 'line-through' : 'none'
                            }}>
                              {it.text}
                            </span>
                            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4, flexShrink: 0 }}>
                              {isOpen ? '▲' : '▼'}
                            </span>
                          </div>
                          {isOpen && (
                            <StepWorkspace
                              goal={goal}
                              week={w}
                              item={it}
                              wi={wi}
                              ii={ii}
                              onItemUpdate={updateItem}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgressRing({ pct, size = 120 }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-3)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 600ms var(--ease)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: size * 0.32, lineHeight: 1, fontFeatureSettings: '"lnum"' }}>{pct}<span style={{ fontSize: size * 0.16, color: 'var(--ink-3)' }}>%</span></div>
      </div>
    </div>
  );
}

function Roadmap({ weeks, currentIdx }) {
  const phases = weeks.map((w, i) => ({
    label: w.title.split(' — ')[0],
    week: w.week,
    days: w.days,
    state: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'future'
  }));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + phases.length + ', 1fr)', gap: 0, position: 'relative' }}>
      {/* connector line */}
      <div style={{ position: 'absolute', top: 16, left: '12.5%', right: '12.5%', height: 1, background: 'var(--rule-2)' }} />
      {phases.map((p, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px', position: 'relative' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--paper)',
            border: '2px solid ' + (p.state === 'done' ? 'var(--ok)' : p.state === 'current' ? 'var(--primary)' : 'var(--rule-2)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 11,
            color: p.state === 'done' ? 'var(--ok)' : p.state === 'current' ? 'var(--primary)' : 'var(--ink-3)',
            zIndex: 2
          }}>
            {p.state === 'done' ? '✓' : String(p.week).padStart(2, '0')}
          </div>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <div className="mono" style={{ color: p.state === 'current' ? 'var(--primary)' : 'var(--ink-3)', marginBottom: 4 }}>
              {p.days}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.005em' }}>
              {p.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Journal */
function Journal({ goals, completed, onOpenGoal, onBack }) {
  const isMobile = useIsMobile();
  const all = [
    ...goals.map(g => ({ ...g, status: 'active' })),
    ...completed.map(c => ({ ...c, status: 'done' }))
  ];
  return (
    <div className="fade-in">
      <section style={{ padding: '60px 0 32px', borderBottom: '0.5px solid var(--rule-2)' }}>
        <div className="container">
          <button className="btn-link" onClick={onBack} style={{ fontSize: 12, marginBottom: 24 }}>← Dashboard</button>
          <div className="eyebrow primary" style={{ marginBottom: 16 }}>Journal</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(48px, 7vw, 96px)', margin: 0 }}>
            Every goal.<br /><em style={{ color: 'var(--primary)' }}>Every chapter.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-3)', marginTop: 24, maxWidth: 540 }}>
            The work you've done, the bets you've placed, the things you've finished. All of it.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 0 100px' }}>
        <div className="container">
          <div style={{ borderTop: '0.5px solid var(--rule-2)' }}>
            {all.map(item => (
              <button
                key={item.id}
                onClick={() => item.status === 'active' && onOpenGoal(item.id)}
                style={{
                  width: '100%', display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr auto' : '90px 1fr 200px 100px 80px',
                  gap: isMobile ? 12 : 24, padding: isMobile ? '18px 0' : '28px 0', alignItems: 'center',
                  borderBottom: '0.5px solid var(--rule)', textAlign: 'left',
                  background: 'none', border: 0, borderBottom: '0.5px solid var(--rule)',
                  cursor: item.status === 'active' ? 'pointer' : 'default',
                  fontFamily: 'var(--sans)'
                }}
                onMouseEnter={e => { if (item.status === 'active') e.currentTarget.style.background = 'var(--paper-2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {!isMobile && <div className="mono" style={{ color: item.status === 'done' ? 'var(--ok)' : 'var(--primary)' }}>
                  {item.status === 'done' ? 'DONE' : 'IN MOTION'}
                </div>}
                <div>
                  {isMobile && <div className="mono" style={{ color: item.status === 'done' ? 'var(--ok)' : 'var(--primary)', marginBottom: 4, fontSize: 10 }}>{item.status === 'done' ? 'DONE' : 'IN MOTION'}</div>}
                  <div style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? 18 : 22, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{item.title}</div>
                  {isMobile && <div className="mono" style={{ color: 'var(--ink-3)', marginTop: 4 }}>{item.category}</div>}
                </div>
                {!isMobile && <div className="mono" style={{ color: 'var(--ink-3)' }}>{item.category}</div>}
                {!isMobile && <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'right' }}>
                  {item.status === 'done' ? item.date : item.days}
                </div>}
                <div style={{ textAlign: 'right' }}>
                  {item.status === 'active' ? (
                    <span style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? 18 : 24, color: 'var(--primary)' }}>{item.pct}<span style={{ fontSize: 13, color: 'var(--ink-3)' }}>%</span></span>
                  ) : (
                    <span className="mono" style={{ color: 'var(--ok)' }}>✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Dashboard, GoalDetail, Journal, ProgressRing, Roadmap, CalendarGrid, GoalCard, StepWorkspace });
