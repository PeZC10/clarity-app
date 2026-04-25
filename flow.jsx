/* Clarity — goal creation flow + action plan + checklist */

async function callClaude(system, userMessage, maxTokens = 800, model = 'claude-haiku-4-5-20251001') {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data.content[0].text.trim();
}

function parseJSON(raw) {
  const clean = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(clean);
}

function GoalFlow({ onComplete, onBack }) {
  const [step, setStep] = useState(0); // 0 threshold, 1 cat, 2 focus, 3 describe, 4 clarify, 5 assess, 6 plan
  const [cat, setCat] = useState(null);
  const [sub, setSub] = useState(null);
  const [customSub, setCustomSub] = useState('');
  const [goal, setGoal] = useState('');
  const [signature, setSignature] = useState('');
  const [clarify, setClarify] = useState('');
  const [thinking, setThinking] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [plan, setPlan] = useState(null);

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  function next() { setStep(s => Math.min(s + 1, totalSteps - 1)); }
  function back() { if (step === 0) onBack(); else setStep(s => s - 1); }

  function submitDescribe() { next(); }

  async function submitClarify() {
    setThinking(true);
    const firstName = signature.trim().split(' ')[0] || 'them';
    try {
      const raw = await callClaude(
        `You are Clarity — a direct, unflinching personal advisor. No fluff, no generic coaching language. You give people the honest read that a trusted mentor who actually knows them would give. You reference specifics from what they've told you. You use their name. You do not give pep talks.

Return ONLY a valid JSON object with exactly these keys:
- verdict: 2-4 words, specific and honest (not "achievable with work" — something like "doable, but not yet real" or "the gap is internal")
- reading: 2-3 sentences that reference their specific goal and what they said about why it hasn't happened. Be direct and personal.
- truth: 1-2 sentences of uncomfortable specificity — the thing they actually need to hear, not a platitude. Reference what they told you.
- bet: 1-2 sentences on what actually becomes possible if they commit for 30 days. Make it concrete to their goal.
- chips: array of exactly 4 short lowercase tags that describe this person's specific situation (not generic tags like "high effort" — think "avoidance pattern" or "external blocker" or "identity gap")

No markdown. No extra text. Just the JSON object.`,
        `Name: ${firstName}. Goal: "${goal}". Life area: ${cat?.label}. Specific focus: ${sub || customSub}. In their own words, why this hasn't happened yet: "${clarify}".`,
        1000,
        'claude-sonnet-4-6'
      );
      setAssessment(parseJSON(raw));
    } catch(e) {
      setAssessment(MOCK_ASSESSMENT(goal));
    }
    setThinking(false);
    next();
  }

  async function submitAssessment() {
    setThinking(true);
    const firstName = signature.trim().split(' ')[0] || 'them';
    try {
      const raw = await callClaude(
        `You are Clarity. You've assessed someone's goal and now need to build their actual 30-day plan. The plan must be built around THEIR specific goal — not generic advice that could apply to anyone. Each action should be concrete enough that they know exactly what to do, specific enough that it couldn't be copy-pasted onto someone else's goal. Think about the real actions that move the needle for this particular person and goal.

Return ONLY a valid JSON array of exactly 4 week objects. Each object:
{
  "week": number (1-4),
  "title": string (a short evocative title specific to where they are that week — not generic like "build habits"),
  "days": string (e.g. "Days 1–7"),
  "items": array of exactly 5 strings (concrete, specific actions — not "stay consistent", but the actual thing to do)
}

No markdown. No extra text. Just the JSON array.`,
        `Name: ${firstName}. Goal: "${goal}". Life area: ${cat?.label}. Focus: ${sub || customSub}. Why it hasn't happened: "${clarify}". Clarity's verdict on them: "${assessment?.verdict}". Reading: "${assessment?.reading}".`,
        1800,
        'claude-sonnet-4-6'
      );
      setPlan(parseJSON(raw));
    } catch(e) {
      setPlan(MOCK_PLAN);
    }
    setThinking(false);
    next();
  }

  function acceptPlan() {
    const finalPlan = plan || MOCK_PLAN;
    onComplete({
      title: goal,
      category: cat?.label,
      catId: cat?.id,
      icon: cat?.icon,
      sub: sub || customSub,
      assessment,
      weeks: finalPlan.map(w => ({
        ...w,
        items: w.items.map(it => ({ text: typeof it === 'string' ? it : it.text, done: false }))
      }))
    });
  }

  return (
    <div className="fade-in" style={{ minHeight: 'calc(100vh - 73px)', display: 'flex', flexDirection: 'column' }}>
      {/* Progress strip */}
      <div style={{ borderBottom: '0.5px solid var(--rule)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px' }}>
          <button className="btn-link" onClick={back} style={{ fontSize: 12 }}>← Back</button>
          <div style={{ flex: 1, margin: '0 24px', height: 1, background: 'var(--rule)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: 1, background: 'var(--primary)', width: `${progress}%`, transition: 'width 500ms var(--ease)' }} />
          </div>
          <div className="mono" style={{ color: 'var(--ink-3)' }}>
            {String(step + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="container-narrow" style={{ padding: '60px 24px 80px', flex: 1 }}>
        {step === 0 && <StepThreshold signature={signature} setSignature={setSignature} onNext={() => signature.trim().length > 1 && next()} />}
        {step === 1 && <StepCategory cat={cat} setCat={(c) => { setCat(c); }} onNext={() => cat && next()} />}
        {step === 2 && <StepFocus cat={cat} sub={sub} setSub={setSub} customSub={customSub} setCustomSub={setCustomSub} onNext={() => (sub || customSub) && next()} />}
        {step === 3 && <StepDescribe goal={goal} setGoal={setGoal} sub={sub || customSub} cat={cat} onNext={submitDescribe} />}
        {step === 4 && <StepClarify goal={goal} sub={sub || customSub} cat={cat} signature={signature} clarify={clarify} setClarify={setClarify} thinking={thinking} onNext={submitClarify} />}
        {step === 5 && <StepAssessment assessment={assessment} signature={signature} thinking={thinking} onNext={submitAssessment} />}
        {step === 6 && <StepPlan goal={goal} signature={signature} plan={plan} thinking={thinking} onAccept={acceptPlan} />}
      </div>
    </div>
  );
}

/* Steps */

function StepThreshold({ signature, setSignature, onNext }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <div className="fade-up" style={{ paddingTop: 20 }}>
      <div className="eyebrow primary" style={{ marginBottom: 18, letterSpacing: '0.22em' }}>The threshold — Day Zero</div>
      <h1 className="h-1" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: 0, marginBottom: 28, lineHeight: 1.05 }}>
        Before we begin,<br />sign your <em style={{ color: 'var(--primary)' }}>own name.</em>
      </h1>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--ink-2)', marginBottom: 40, maxWidth: 540, letterSpacing: '-0.005em' }}>
        Not as paperwork. As a moment. The version of you on the other side of the next thirty days starts here, with you saying — out loud, to yourself — <span style={{ color: 'var(--ink)' }}>"I'm doing this."</span>
      </p>

      <div style={{ border: '0.5px solid var(--rule-2)', borderRadius: 'var(--r-md)', padding: '40px 36px', background: 'var(--paper)' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 8 }}>{today.toUpperCase()}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)', marginBottom: 28, fontStyle: 'italic', lineHeight: 1.5 }}>
          On this morning, I — the undersigned — am beginning. Not perfectly. Not loudly. Just beginning.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: '1px solid var(--ink)', paddingBottom: 8 }}>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>X</span>
          <input
            type="text"
            value={signature}
            onChange={e => setSignature(e.target.value)}
            placeholder="Your name"
            style={{ border: 0, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 32, color: 'var(--primary)', padding: 0, letterSpacing: '-0.005em', background: 'transparent' }}
            autoFocus
          />
        </div>
        <div className="mono" style={{ color: 'var(--ink-3)', marginTop: 12 }}>
          — Signature
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 36 }}>
        <button className="btn btn-primary" onClick={onNext} disabled={signature.trim().length < 2}>
          Cross the threshold —
        </button>
      </div>
    </div>
  );
}

function StepCategory({ cat, setCat, onNext }) {
  return (
    <div className="fade-up">
      <div className="eyebrow primary" style={{ marginBottom: 16 }}>Step 01 — Where</div>
      <h1 className="h-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: 0, marginBottom: 14 }}>
        What part of your life<br />needs to <em style={{ color: 'var(--primary)' }}>change?</em>
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 36, marginTop: 4, maxWidth: 540 }}>
        Pick the area that, if it shifted, would change everything else. Just one.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, border: '0.5px solid var(--rule)' }}>
        {CATEGORIES.map((c, i) => {
          const selected = cat?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c)}
              style={{
                background: selected ? 'var(--ink)' : 'transparent',
                color: selected ? 'var(--paper)' : 'var(--ink)',
                padding: '24px 22px',
                border: 0,
                borderRight: i % 2 === 0 ? '0.5px solid var(--rule)' : 'none',
                borderBottom: i < CATEGORIES.length - 2 ? '0.5px solid var(--rule)' : 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontFamily: 'var(--sans)',
                transition: 'all 200ms var(--ease)'
              }}
            >
              <span style={{
                fontFamily: 'var(--serif)', fontSize: 28,
                color: selected ? 'var(--gold)' : 'var(--primary)',
                width: 32, textAlign: 'center'
              }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 19, marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{c.subs.slice(0, 3).join(' · ')}…</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 36 }}>
        <button className="btn btn-primary" onClick={onNext} disabled={!cat}>
          Continue —
        </button>
      </div>
    </div>
  );
}

function StepFocus({ cat, sub, setSub, customSub, setCustomSub, onNext }) {
  return (
    <div className="fade-up">
      <div className="eyebrow primary" style={{ marginBottom: 16 }}>Step 02 — Narrow it</div>
      <h1 className="h-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: 0, marginBottom: 14 }}>
        Inside <em style={{ color: 'var(--primary)' }}>{cat.label.toLowerCase()}</em> —<br />what specifically?
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 36, marginTop: 4 }}>
        Pick one. Or write your own.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {cat.subs.map(s => {
          const selected = sub === s;
          return (
            <button
              key={s}
              onClick={() => { setSub(s); setCustomSub(''); }}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '0.5px solid ' + (selected ? 'var(--ink)' : 'var(--rule-2)'),
                background: selected ? 'var(--ink)' : 'transparent',
                color: selected ? 'var(--paper)' : 'var(--ink-2)',
                fontSize: 14,
                fontFamily: 'var(--sans)',
                cursor: 'pointer',
                transition: 'all 180ms var(--ease)'
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: '0.5px solid var(--rule)', paddingTop: 24 }}>
        <label className="eyebrow" style={{ display: 'block', marginBottom: 12 }}>Or — in your own words</label>
        <input
          type="text"
          value={customSub}
          onChange={e => { setCustomSub(e.target.value); if (e.target.value) setSub(null); }}
          placeholder="e.g. become the kind of person who exercises"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 36 }}>
        <button className="btn btn-primary" onClick={onNext} disabled={!sub && !customSub}>Continue —</button>
      </div>
    </div>
  );
}

function StepDescribe({ goal, setGoal, sub, cat, onNext }) {
  return (
    <div className="fade-up">
      <div className="eyebrow primary" style={{ marginBottom: 16 }}>Step 03 — In your words</div>
      <h1 className="h-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: 0, marginBottom: 14 }}>
        Write your goal<br />as <em style={{ color: 'var(--primary)' }}>one sentence.</em>
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 32, marginTop: 4, maxWidth: 540 }}>
        Be specific. Include what success looks like and when. The clearer this is, the better the plan.
      </p>

      <textarea
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder={`e.g. ${cat?.id === 'health' ? 'Run a half-marathon by October without injury' : 'I want to ship my first paid product by July 1st'}`}
        style={{ minHeight: 140, fontSize: 18, lineHeight: 1.55, fontFamily: 'var(--serif)', borderBottom: '1px solid var(--rule-2)', padding: '12px 0' }}
        autoFocus
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div className="mono" style={{ color: 'var(--ink-3)' }}>
          {goal.length} characters · {goal.split(/\s+/).filter(Boolean).length} words
        </div>
        <button className="btn btn-primary" onClick={onNext} disabled={goal.trim().length < 10}>
          Send to advisor —
        </button>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '24px 0', color: 'var(--ink-3)' }}>
      <span style={{ display: 'inline-flex', gap: 5 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
            animation: `pulseDot 1.4s ${i * 0.2}s infinite ease-in-out`
          }} />
        ))}
      </span>
      <span style={{ fontStyle: 'italic', fontSize: 14 }}>Clarity is reading…</span>
      <style>{`@keyframes pulseDot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.7); } 40% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

function StepClarify({ goal, sub, cat, signature, clarify, setClarify, thinking, onNext }) {
  const [question, setQuestion] = useState(null);
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    const firstName = signature.trim().split(' ')[0] || 'friend';
    callClaude(
      `You are Clarity — a direct, unflinching personal advisor. You ask the ONE question that cuts through to the real reason someone hasn't achieved their goal yet. Not the surface reason — the actual one. The question should feel like it comes from someone who knows them well and won't let them off the hook. It should be specific to their goal and situation, slightly uncomfortable, and impossible to answer with a easy yes or no. Return ONLY the question itself. No preamble, no label, no "here's my question:" — just the question.`,
      `Name: ${firstName}. Life area: ${cat?.label}. Specific focus: ${sub}. Their goal in their own words: "${goal}". Ask the one question that gets to the real blocker.`
    ).then(q => { setQuestion(q); setLoadingQ(false); })
     .catch(() => { setQuestion(MOCK_CLARIFY(goal, sub)); setLoadingQ(false); });
  }, []);

  const firstName = signature.trim().split(' ')[0] || 'friend';
  return (
    <div className="fade-up">
      <div className="eyebrow accent" style={{ marginBottom: 16 }}>Clarity says</div>

      <div className="card-ink" style={{ padding: '32px 36px', borderRadius: 'var(--r-md)', marginBottom: 24, color: 'var(--paper)' }}>
        <div className="eyebrow gold" style={{ marginBottom: 14 }}>{firstName}, one question first</div>
        {loadingQ ? <ThinkingDots /> : (
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.35, margin: 0, color: 'var(--paper)', letterSpacing: '-0.005em' }}>
            {question}
          </p>
        )}
      </div>

      <textarea
        value={clarify}
        onChange={e => setClarify(e.target.value)}
        placeholder="The honest answer. Even if it's the embarrassing one."
        style={{ minHeight: 140, fontSize: 16, lineHeight: 1.6 }}
        autoFocus
      />

      {thinking ? <ThinkingDots /> : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <div className="mono" style={{ color: 'var(--ink-3)' }}>This stays between you and Clarity.</div>
          <button className="btn btn-primary" onClick={onNext} disabled={clarify.trim().length < 10 || loadingQ}>
            Get the read —
          </button>
        </div>
      )}
    </div>
  );
}

function StepAssessment({ assessment, signature, thinking, onNext }) {
  if (thinking || !assessment) return <ThinkingDots />;
  const firstName = signature.trim().split(' ')[0] || 'friend';
  return (
    <div className="fade-up">
      <div className="eyebrow primary" style={{ marginBottom: 16 }}>{firstName} — the honest read</div>
      <h1 className="h-1" style={{ fontSize: 'clamp(40px, 6vw, 72px)', margin: 0, marginBottom: 32 }}>
        <em style={{ color: 'var(--primary)' }}>{assessment.verdict}</em>
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
        {assessment.chips.map(c => <CommitChip key={c}>{c}</CommitChip>)}
      </div>

      <div style={{ display: 'grid', gap: 0, borderTop: '0.5px solid var(--rule-2)' }}>
        {[
          { label: 'The reading', text: assessment.reading },
          { label: 'The truth', text: assessment.truth, accent: true },
          { label: 'The bet', text: assessment.bet },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '28px 0',
            borderBottom: '0.5px solid var(--rule)',
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 24
          }}>
            <div className={`eyebrow ${s.accent ? 'primary' : ''}`}>{s.label}</div>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 20, lineHeight: 1.5, margin: 0,
              color: s.accent ? 'var(--ink)' : 'var(--ink-2)',
              letterSpacing: '-0.005em'
            }}>
              {s.text}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 36 }}>
        <button className="btn btn-primary" onClick={onNext}>Show me the plan —</button>
      </div>
    </div>
  );
}

function StepPlan({ goal, signature, plan, thinking, onAccept }) {
  const [openWeek, setOpenWeek] = useState(0);
  const firstName = signature.trim().split(' ')[0] || 'you';
  if (thinking || !plan) return <ThinkingDots />;
  return (
    <div className="fade-up">
      <div className="eyebrow primary" style={{ marginBottom: 16 }}>{firstName}'s 30-day plan</div>
      <h1 className="h-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: 0, marginBottom: 14 }}>
        Four weeks.<br />
        <em style={{ color: 'var(--primary)' }}>Built for you.</em>
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 36, marginTop: 4, maxWidth: 540 }}>
        This is a draft. Accept it and it becomes your live checklist. We'll check in along the way.
      </p>

      <div style={{ borderTop: '0.5px solid var(--rule-2)' }}>
        {plan.map((w, i) => {
          const open = openWeek === i;
          return (
            <div key={i} style={{ borderBottom: '0.5px solid var(--rule)' }}>
              <button
                onClick={() => setOpenWeek(open ? -1 : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '24px 0', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--sans)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
                  <span className="mono" style={{ color: 'var(--primary)' }}>WK {String(w.week).padStart(2, '0')}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.005em' }}>{w.title}</span>
                </div>
                <span className="mono" style={{ color: 'var(--ink-3)' }}>{w.days} {open ? '−' : '+'}</span>
              </button>
              {open && (
                <ul className="fade-up" style={{ listStyle: 'none', padding: '0 0 24px', margin: 0 }}>
                  {w.items.map((it, j) => (
                    <li key={j} style={{
                      display: 'flex', gap: 16, padding: '10px 0',
                      fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)'
                    }}>
                      <span className="mono" style={{ color: 'var(--ink-3)', minWidth: 24, opacity: 0.7 }}>{String(j + 1).padStart(2, '0')}</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, gap: 16, flexWrap: 'wrap' }}>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)', margin: 0 }}>
          The plan is the easy part.
        </p>
        <button className="btn btn-primary" onClick={onAccept} style={{ fontSize: 15, padding: '14px 28px' }}>
          Begin Day 01 —
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { GoalFlow });
