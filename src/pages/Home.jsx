// ─────────────────────────────────────────────────────────────────────────────
// Home page — the public-facing marketing / landing page for BrainBoost.
//
// Sections:
//   1. Navbar (brand + auth buttons)
//   2. Hero    (headline, sub-copy, hero image)
//   3. Stats strip  (3 key numbers)
//   4. How it works (3 steps + 4 domain cards)
//   5. Final CTA    (sign-up button)
//   6. Footer
//
// Auth states:
//   SignedOut → shows Sign In / Get Started buttons and a "Try as guest" link.
//   SignedIn  → shows "Open App" button and the Clerk UserButton (avatar).
// ─────────────────────────────────────────────────────────────────────────────
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { getOrCreateGuestId } from '../utils/guestAuth'
import './Home.css'

// Domain card data — displayed in the "What we measure" section.
// Each entry maps to one of the four brain-health domains measured by the questionnaire.
// color: foreground text/icon colour; bg: soft background tint for the card.
const DOMAINS = [
  { label: 'Sleep Rhythm', desc: 'How your rest patterns shape daily energy and focus.', color: '#1a6fa8', bg: '#e0f0ff' },
  { label: 'Move Mode', desc: 'How movement habits build resilience and mental clarity.', color: '#1a7a5e', bg: '#dcf5ec' },
  { label: 'Cognitive Strain', desc: 'How screen time and mental load affect your concentration.', color: '#b45309', bg: '#fef3c7' },
  { label: 'Social Energy', desc: 'How social connections fuel or drain your overall wellbeing.', color: '#6b2fa0', bg: '#f3e8ff' },
]

function Home() {
  const navigate = useNavigate()

  // Decides where to send a signed-in user who clicks "Open App" or "Get Started".
  // If a snapshot already exists in localStorage (i.e. they've done onboarding before),
  // go straight to the dashboard; otherwise start the onboarding flow.
  function handleGoToApp() {
    const snapshot = JSON.parse(localStorage.getItem('brainboostSnapshot') || '{}')
    if (snapshot && Object.keys(snapshot).length > 0) navigate('/dashboard')
    else navigate('/onboarding')
  }

  // Sets up a guest session and redirects to the onboarding questionnaire.
  // getOrCreateGuestId() creates a random stable ID and persists it in localStorage.
  // Setting 'bb_is_guest' = 'true' activates guest-mode UI throughout the app.
  function handleGuestLogin() {
    getOrCreateGuestId()
    localStorage.setItem('bb_is_guest', 'true')
    navigate('/onboarding')
  }

  return (
    <div className="home-page">
      {/* Subtle grain texture overlay for visual depth */}
      <div className="home-grain" />

      {/* ── Top navigation bar ──────────────────────────────────────────────── */}
      <nav className="home-nav">
        <div className="home-logo">Brain<span>Boost</span></div>
        <div className="home-nav-links">
          {/* Signed-out state: show modal Sign In and Sign Up buttons */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="nav-link-btn">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="nav-cta-btn">Get Started</button>
            </SignUpButton>
          </SignedOut>
          {/* Signed-in state: show "Open App" shortcut and the Clerk user avatar */}
          <SignedIn>
            <button className="nav-cta-btn" onClick={handleGoToApp}>Go to Dashboard</button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* ── Hero section ───────────────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Free to use &nbsp;·&nbsp; No app needed &nbsp;·&nbsp; 5 minutes
          </div>
          <h1 className="hero-title">
            Your brain on<br />
            <span className="hero-title-accent">autopilot?</span>
          </h1>
          <p className="hero-sub">
            Find out how sleep, movement, screen time, and social habits are quietly shaping your focus in under 5 minutes.
          </p>
          <div className="hero-actions">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-main">Get my snapshot →</button>
              </SignUpButton>
              <button className="btn-ghost-link" onClick={handleGuestLogin}>Try as guest</button>
            </SignedOut>
            <SignedIn>
              <button className="btn-main" onClick={handleGoToApp}>Go to Dashboard →</button>
            </SignedIn>
          </div>
          <div className="hero-floating-badges">
            <span className="hero-badge">🧠 Brain snapshot</span>
            <span className="hero-badge">🎮 5 mini games</span>
            <span className="hero-badge">📈 Progress tracking</span>
            <span className="hero-badge">🏆 Leaderboard</span>
          </div>
        </div>
        <div className="hero-right">
          <img
            className="hero-img"
            src="https://blog.medicalert.org/wp-content/uploads/2025/03/Brain-Fog-Header-Image.jpg"
            alt="Brain health"
          />
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      {/* Three attention-grabbing statistics that establish credibility and urgency */}
      <div className="stats-strip">
        <div className="stat-item">
          <span className="stat-big">1<em>in 3</em></span>
          <span className="stat-desc">students struggle with focus daily</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-big">5<em>min</em></span>
          <span className="stat-desc">to get your personalised score</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-big">4<em>domains</em></span>
          <span className="stat-desc">of brain health measured</span>
        </div>
      </div>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="how-section">
        <div className="how-label">How it works</div>
        {/* Three-step process cards — rendered from an inline array for conciseness */}
        <div className="how-steps">
          {[
            { n: '01', t: 'Answer honestly', d: '5 questions about your real daily habits.' },
            { n: '02', t: 'Get your snapshot', d: 'A personalised score across 4 brain health domains.' },
            { n: '03', t: 'Read what matters', d: 'Articles and tips targeted at your lowest scores.' },
          ].map((step) => (
            <div key={step.n} className="how-step">
              <div className="step-n">{step.n}<em>step</em></div>
              <div className="step-t">{step.t}</div>
              <div className="step-d">{step.d}</div>
            </div>
          ))}
        </div>

        <div className="how-domains-label">What we measure</div>
        {/* Domain cards — CSS custom properties (--dc, --dbg) drive the accent colours */}
        <div className="how-domain-cards">
          {DOMAINS.map((domain) => (
            <div key={domain.label} className="how-domain-card" style={{ '--dc': domain.color, '--dbg': domain.bg }}>
              <div className="how-domain-card-label">{domain.label}</div>
              <div className="how-domain-card-desc">{domain.desc}</div>
            </div>
          ))}
        </div>
      </section>


      {/* ── Features section ────────────────────────────────────────────────── */}
      <section className="features-section">
        <div className="features-label">Everything you need</div>
        <h2 className="features-title">A complete brain health toolkit</h2>
        <p className="features-sub">Six interconnected tools that work together to help you understand and improve your mental performance.</p>

        <div className="features-grid">
          {[
            {
              icon: '🧠',
              color: '#2563eb',
              bg: '#eff6ff',
              title: 'Brain Snapshot',
              desc: 'A personalised score across 4 domains — Sleep, Movement, Screen Time, and Social Energy — generated from 5 honest questions.',
              tag: 'Onboarding',
            },
            {
              icon: '📊',
              color: '#7c3aed',
              bg: '#f5f3ff',
              title: 'Smart Dashboard',
              desc: 'Your pet Brainy reacts to your habits in real time. See domain vitals, priority focus areas, and personalised brain boosts.',
              tag: 'Dashboard',
            },
            {
              icon: '📋',
              color: '#0891b2',
              bg: '#e0f9ff',
              title: 'Daily Habit Tracker',
              desc: 'Log your sleep, screen time, and activity each day. Charts show patterns over time so you can spot what's actually helping.',
              tag: 'Habit Tracker',
            },
            {
              icon: '🎮',
              color: '#16a34a',
              bg: '#f0fdf4',
              title: 'Cognitive Mini Games',
              desc: 'Five science-backed games — Reaction Test, Memory Match, Stroop Test, Visual Pattern, and Mental Math — with a global leaderboard.',
              tag: 'Mini Games',
            },
            {
              icon: '📚',
              color: '#b45309',
              bg: '#fef3c7',
              title: 'Personalised Article Hub',
              desc: 'Reads recommended from your weakest domains. Sleep dragging? You'll see sleep articles first. Focus broken? Screen tips appear.',
              tag: 'Article Hub',
            },
            {
              icon: '🏆',
              color: '#dc2626',
              bg: '#fef2f2',
              title: 'Progress & Achievements',
              desc: 'Track streaks, unlock 30 game achievements, and watch your scores improve over time with detailed performance charts.',
              tag: 'Progress',
            },
          ].map((f) => (
            <div key={f.title} className="feature-card" style={{ '--fc': f.color, '--fb': f.bg }}>
              <div className="feature-card-icon">{f.icon}</div>
              <div className="feature-card-tag">{f.tag}</div>
              <div className="feature-card-title">{f.title}</div>
              <div className="feature-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof strip ───────────────────────────────────────────────── */}
      <section className="proof-section">
        <div className="proof-label">Built for students, by students</div>
        <div className="proof-cards">
          {[
            { emoji: '😴', quote: 'I didn't realise how much my sleep was affecting my focus until I saw my score.', name: 'University student' },
            { emoji: '📱', quote: 'The screen time domain was a wake-up call. My cognitive strain score was 20/100.', name: 'Undergraduate' },
            { emoji: '🏃', quote: 'After tracking for two weeks my energy score went from 40 to 80. The charts don't lie.', name: 'Postgraduate student' },
          ].map((p, i) => (
            <div key={i} className="proof-card">
              <div className="proof-emoji">{p.emoji}</div>
              <p className="proof-quote">"{p.quote}"</p>
              <div className="proof-name">— {p.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="final-cta">
        <div className="final-cta-inner">
          <p className="final-cta-kicker">Ready?</p>
          <h2 className="final-cta-title">Understand what's<br />draining your brain.</h2>
          {/* Signed-out: open the Clerk sign-up modal */}
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn-main btn-main-lg">Start my snapshot</button>
            </SignUpButton>
          </SignedOut>
          {/* Signed-in: go to dashboard or onboarding depending on snapshot state */}
          <SignedIn>
            <button className="btn-main btn-main-lg" onClick={handleGoToApp}>Get Started!</button>
          </SignedIn>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="home-logo">Brain<span>Boost</span></div>
        <p className="home-trust-note">
          BrainBoost only uses your responses to personalise insights, habit tracking, progress, and recommendations. We do not sell user data or use it for advertising.
        </p>
        <details className="home-privacy-card">
          <summary>
            <span className="privacy-summary-main">Data & Privacy Disclaimer</span>
            <span className="privacy-summary-sub">How BrainBoost uses data responsibly</span>
          </summary>
          <div className="home-privacy-content">
            <div className="privacy-intro">
              <div className="privacy-intro-badge">Research-informed questions</div>
              <p>
                BrainBoost is a student wellbeing and brain-health habit app developed for educational purposes. It helps users reflect on lifestyle habits such as sleep, screen time, physical activity, and social wellbeing. Each questionnaire area is informed by published journal research and translated into simple habit-range questions for reflection.
              </p>
            </div>

            <div className="privacy-principles" aria-label="Privacy principles">
              <span>Transparency</span>
              <span>Purpose limitation</span>
              <span>Data minimisation</span>
              <span>Privacy by design</span>
            </div>

            <div className="privacy-grid">
              <section className="privacy-info-card">
                <h3>What we may collect</h3>
                <p>
                  Research-informed onboarding responses, daily check-ins, sleep range, screen-time range, physical activity response, article interaction patterns, progress history, and basic account or guest-session identifiers.
                </p>
              </section>

              <section className="privacy-info-card">
                <h3>Why we use it</h3>
                <p>
                  To generate your brain-health snapshot, personalise dashboard insights, recommend relevant articles, track habit progress, calculate streaks, and improve the prototype experience.
                </p>
              </section>

              <section className="privacy-info-card">
                <h3>Guest and signed-in use</h3>
                <p>
                  Guest information may be stored locally in your browser or linked to a temporary guest ID. Signed-in users may use Clerk authentication to protect accounts and connect progress to a user profile.
                </p>
              </section>

              <section className="privacy-info-card">
                <h3>Recommendation transparency</h3>
                <p>
                  Article recommendations are based on your onboarding snapshot and lower-scoring habit domains. They are educational only and should not be interpreted as medical advice, clinical assessment, or diagnosis.
                </p>
              </section>
            </div>

            <div className="privacy-commitments">
              <div>
                <strong>We collect only what the app needs.</strong>
                <span>Where possible, BrainBoost uses general habit ranges rather than highly detailed health records.</span>
              </div>
              <div>
                <strong>We do not sell your data.</strong>
                <span>Your data is not used for advertising or unrelated purposes.</span>
              </div>
              <div>
                <strong>You stay in control.</strong>
                <span>You may choose not to provide certain information, use guest mode where available, or stop using the app at any time.</span>
              </div>
            </div>

            <div className="privacy-support-note">
              BrainBoost is not a medical, psychological, or diagnostic tool and does not replace advice from a qualified health professional. If you are experiencing serious stress, sleep problems, mental health concerns, or medical symptoms, seek support from a qualified health professional or trusted support service.
            </div>
          </div>
        </details>
      </footer>
    </div>
  )
}

export default Home
