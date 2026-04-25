/* Clarity — landing page (soul rewrite: dawn, threshold, before/after) */

function Landing({ onAuth, onStart }) {
  const isMobile = useIsMobile();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

  return (
    <div className="fade-in">

      {/* DAWN HERO — forest morning. Deep canopy to misty light. */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0d1410 0%, #141d16 30%, #1c281c 60%, #2d3a28 88%, #4a5d3e 100%)',
        color: '#f4efe6',
        padding: '40px 0 0'
      }}>
        {/* Soft sun-through-canopy glow — warm light filtering through forest */}
        <div style={{
          position: 'absolute',
          left: '50%', bottom: '-260px', transform: 'translateX(-50%)',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,184,106,0.32) 0%, rgba(168,194,144,0.18) 40%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        {/* Bottom scrim — protects the date row */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 180, background: 'linear-gradient(180deg, transparent 0%, rgba(13,20,16,0.55) 100%)', pointerEvents: 'none' }} />
        {/* Faint horizon line */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '8%', height: 1, background: 'rgba(244,239,230,0.18)' }} />

        {/* Top — date + time */}
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16 }}>
            <div className="mono" style={{ color: 'rgba(244,239,230,0.78)', letterSpacing: '0.18em' }}>
              {fmtDate(now).toUpperCase()} · {fmtTime(now)}
            </div>
            <div className="mono" style={{ color: 'rgba(244,239,230,0.62)', letterSpacing: '0.18em' }}>
              CLARITY · 01
            </div>
          </div>
        </div>

        {/* Center — the invitation */}
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: isMobile ? '32px 20px' : '40px 32px' }}>
          <div style={{ maxWidth: 1100 }}>
            <div className="eyebrow" style={{ color: '#A8C290', letterSpacing: '0.22em', marginBottom: 36, fontSize: 11 }}>
              ⌛ Day Zero — the morning of —
            </div>

            <h1 className="h-display" style={{
              fontSize: 'clamp(48px, 8.5vw, 132px)',
              margin: 0,
              color: '#f4efe6',
              lineHeight: 1.04,
              letterSpacing: '-0.025em'
            }}>
              Somewhere<br />
              inside you,<br />
              there's a <span style={{ fontStyle: 'italic', color: '#A8C290' }}>quieter version</span><br />
              already <span style={{ fontStyle: 'italic', color: '#A8C290' }}>doing it.</span>
            </h1>

            <div style={{ marginTop: 72, maxWidth: 580 }}>
              <p style={{
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.45,
                color: 'rgba(244,239,230,0.86)', margin: 0,
                letterSpacing: '-0.005em'
              }}>
                Clarity is where you meet that person —<br />
                and start walking toward them.
              </p>
            </div>

            <div style={{ marginTop: 56, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={onStart}
                style={{
                  background: '#f4efe6', color: '#181715',
                  border: 'none', borderRadius: 999,
                  padding: '18px 32px', fontSize: 15, fontWeight: 500,
                  fontFamily: 'var(--sans)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 14,
                  transition: 'all 200ms var(--ease)'
                }}
                onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)';e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';}}
                onMouseLeave={(e) => {e.currentTarget.style.transform = '';e.currentTarget.style.boxShadow = '';}}>
                
                Cross the threshold
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>→</span>
              </button>
              <button
                onClick={() => onAuth('signin')}
                style={{
                  background: 'transparent', color: 'rgba(244,239,230,0.92)',
                  border: 0, padding: '8px 0', cursor: 'pointer',
                  fontSize: 14, fontFamily: 'var(--sans)',
                  borderBottom: '1px solid rgba(244,239,230,0.55)'
                }}>
                
                I've already begun
              </button>
            </div>
          </div>
        </div>

        {/* Bottom — before/after dates */}
        <div className="container" style={{ position: 'relative', zIndex: 3, paddingBottom: 36, opacity: "1" }}>
          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr', gap: isMobile ? 12 : 32,
            alignItems: 'center', paddingTop: 24, opacity: "1"
          }}>
            <div>
              <div className="mono" style={{ color: 'rgba(244,239,230,0.62)', marginBottom: 4 }}>YOU — TODAY</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', color: '#f4efe6', letterSpacing: '-0.005em' }}>
                {fmtDate(now)}
              </div>
            </div>
            {!isMobile && <div className="mono" style={{ color: '#A8C290', letterSpacing: '0.3em' }}>
              ─── 30 DAYS ───
            </div>}
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ color: 'rgba(244,239,230,0.62)', marginBottom: 4 }}>YOU — DIFFERENT</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', color: '#A8C290', letterSpacing: '-0.005em' }}>
                {fmtDate(day30)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE LETTER — a personal letter, not marketing copy */}
      <section style={{ padding: isMobile ? '64px 0 56px' : '120px 0 100px' }}>
        <div className="container-narrow">
          <div className="eyebrow primary" style={{ marginBottom: 24, textAlign: 'center' }}>From Clarity, to you</div>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(20px, 2.4vw, 26px)',
            lineHeight: 1.55,
            color: 'var(--ink-2)',
            letterSpacing: '-0.005em'
          }}>
            <p style={{ margin: '0 0 22px' }}>
              Most days, you tell yourself you'll start tomorrow.
            </p>
            <p style={{ margin: '0 0 22px' }}>
              The thing you want — the body, the book, the calmer mind, the conversation — has been sitting there for a while now. Patient. Not going anywhere.
            </p>
            <p style={{ margin: '0 0 22px' }}>
              You don't need a louder reason. You need <em style={{ color: 'var(--primary)' }}>a structure</em> — and one honest voice that won't cheerlead, won't shame you, and won't let the day go quiet.
            </p>
            <p style={{ margin: '0 0 22px' }}>
              That's what we are.
            </p>
            <p style={{ margin: '0 0 22px' }}>
              We can't do the work for you. No one can. But for the next thirty days, you don't have to figure it out alone.
            </p>
            <p style={{ margin: '0', color: 'var(--ink)', fontStyle: 'italic' }}>
              When you're ready, begin. We'll be here. — <span style={{ fontStyle: 'normal', fontFamily: 'var(--serif)', color: 'var(--primary)' }}>Clarity</span>
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE — accountability heartbeat */}
      <Marquee lines={[
      'The work is yours',
      'Today is the only day that exists',
      'You already know what to do',
      'Showing up is the whole job',
      'Your future self is watching',
      'The quiet version of you is waiting']
      } />

      {/* HOW IT WORKS — quiet, ceremonial */}
      <section style={{ padding: isMobile ? '56px 0' : '120px 0', background: 'var(--paper-2)' }}>
        <div className="container">
          <div style={{ maxWidth: 720, marginBottom: 80 }}>
            <div className="eyebrow accent" style={{ marginBottom: 18 }}>What happens, in order</div>
            <h2 className="h-2" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: 0, lineHeight: 1.05 }}>
              Four small ceremonies.<br />
              <em style={{ color: 'var(--primary)' }}>Then thirty days.</em>
            </h2>
          </div>

          <div style={{ borderTop: '0.5px solid var(--rule-2)' }}>
            {[
            { n: 'I', t: 'You name it', d: 'You write the goal in your own words. One sentence. The kind you\'d say out loud only to a person you trusted.', moment: 'The naming' },
            { n: 'II', t: 'We listen', d: 'Clarity asks you the question you\'ve been avoiding. You answer honestly — or not. We work with whatever you give us.', moment: 'The honest read' },
            { n: 'III', t: 'You receive your plan', d: 'A 30-day arc, drawn around your specific life. Four weeks: foundations, rhythm, the dip, the compound.', moment: 'The map' },
            { n: 'IV', t: 'You begin', d: 'Day by day. We\'ll keep the structure. We\'ll ask the right questions. The showing up is the part only you can do.', moment: 'The walk' }].
            map((s, i) =>
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '120px minmax(0, 1fr) 1fr',
              gap: isMobile ? 12 : 40,
              padding: '40px 0',
              borderBottom: '0.5px solid var(--rule)',
              alignItems: 'baseline'
            }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 56, color: 'var(--primary)', lineHeight: 1, fontStyle: 'italic' }}>
                  {s.n}
                </div>
                <div>
                  <h3 className="h-2" style={{ fontSize: 32, margin: 0, marginBottom: 10, lineHeight: 1.1 }}>{s.t}</h3>
                  <div className="mono" style={{ color: 'var(--ink-3)' }}>— {s.moment}</div>
                </div>
                <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{s.d}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* WHO YOU'LL BECOME — before/after, the protagonist */}
      <section style={{ padding: isMobile ? '56px 0' : '120px 0', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div className="container">
          <div className="eyebrow primary" style={{ marginBottom: 24, color: '#A8C290' }}>The bet</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(44px, 6.5vw, 92px)', margin: 0, marginBottom: 80, color: 'var(--paper)', lineHeight: 1.02 }}>
            Same body. Same hours.<br />
            Same kid you were yesterday.<br />
            <em style={{ color: '#A8C290' }}>Just thirty more days of practice.</em>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 60px 1fr', gap: isMobile ? 28 : 32, alignItems: 'stretch', borderTop: '0.5px solid rgba(244,239,230,0.18)', paddingTop: isMobile ? 32 : 56 }}>
            <div>
              <div className="mono" style={{ color: 'rgba(244,239,230,0.62)', marginBottom: 18 }}>TODAY · WHO YOU ARE</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(244,239,230,0.78)' }}>
                "I keep meaning to start. I know what I should do. I haven't yet. Something always comes up. I'm not sure why this would be different."
              </div>
            </div>
            {!isMobile && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 1, flex: 1, background: 'rgba(244,239,230,0.2)' }} />
              <span className="mono" style={{ color: '#A8C290' }}>→</span>
              <div style={{ width: 1, flex: 1, background: 'rgba(244,239,230,0.2)' }} />
            </div>}
            <div>
              <div className="mono" style={{ color: '#A8C290', marginBottom: 18 }}>DAY 30 · WHO YOU'RE BECOMING</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', lineHeight: 1.5, color: '#C5D8B0' }}>
                "I'm a person who does this now. Not perfectly. Not always. But the showing up has become the kind of thing I do."
              </div>
            </div>
          </div>

          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '0.5px solid rgba(244,239,230,0.18)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', color: 'rgba(244,239,230,0.85)', margin: 0, letterSpacing: '-0.005em' }}>
              That's the whole bet. Thirty days. Same you. Different identity.
            </p>
          </div>
        </div>
      </section>

      {/* VOICES — three real-feeling quotes */}
      <section style={{ padding: isMobile ? '56px 0' : '120px 0' }}>
        <div className="container">
          <div style={{ marginBottom: isMobile ? 40 : 64, maxWidth: 640 }}>
            <div className="eyebrow primary" style={{ marginBottom: 18 }}>People who crossed</div>
            <h2 className="h-2" style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', margin: 0 }}>
              Three goals.<br />Three different lives.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 40 : 40 }}>
            {[
            { quote: "I'd been trying to start running for three years. Clarity just made me start, on a Tuesday, in clothes I already had.", who: 'Adaeze · 34', what: 'First 5K — Day 23' },
            { quote: "It didn't tell me I was special. It told me what I'd been avoiding. Somehow that was the kindest thing.", who: 'Mateo · 41', what: 'Quit drinking — Day 30 + 90' },
            { quote: "I finished the first draft of a book I'd carried for seven years. Day by day. Same person. Just one who showed up.", who: 'Reza · 28', what: 'First book — Day 38' }].
            map((t, i) =>
            <figure key={i} style={{ margin: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 56, color: 'var(--primary)', lineHeight: 0.6, marginBottom: 12, fontStyle: 'italic' }}>"</div>
                <blockquote style={{
                margin: 0, marginBottom: 28,
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: 22, lineHeight: 1.45, letterSpacing: '-0.005em',
                color: 'var(--ink)'
              }}>
                  {t.quote}
                </blockquote>
                <figcaption style={{ borderTop: '0.5px solid var(--rule-2)', paddingTop: 14 }}>
                  <div className="mono" style={{ color: 'var(--ink)' }}>{t.who}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{t.what}</div>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* FINAL — the second invitation */}
      <section style={{
        padding: isMobile ? '72px 0 64px' : '140px 0 120px',
        background: 'linear-gradient(180deg, #f4efe6 0%, #e8eadf 50%, #d4dcc6 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Soft moss-light */}
        <div style={{
          position: 'absolute', left: '50%', bottom: '-220px', transform: 'translateX(-50%)',
          width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,194,144,0.55) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div className="eyebrow primary" style={{ marginBottom: 28 }}>One sentence. One day. Begin.</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(48px, 8vw, 124px)', margin: 0, marginBottom: 40, lineHeight: 0.98 }}>
            Today is the morning<br />
            <em style={{ color: 'var(--primary)' }}>of something.</em>
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-2)', maxWidth: 520, margin: '0 auto 40px' }}>
            You'll never have less time, fewer reasons, or a better day than this one.
          </p>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '18px 36px' }} onClick={onStart}>
            Set my first goal —
          </button>
          <div style={{ marginTop: 18, fontSize: 13, color: 'var(--ink-3)' }}>
            Two minutes · Free during beta · No card
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 0', borderTop: '0.5px solid var(--rule)', background: 'var(--paper)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Logo size={20} />
          <div className="mono" style={{ color: 'var(--ink-3)' }}>© 2026 — Built by Pe Z</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--ink-3)' }}>
            <span>Privacy</span><span>Terms</span><span>Contact</span>
          </div>
        </div>
      </footer>
    </div>);

}

Object.assign(window, { Landing });