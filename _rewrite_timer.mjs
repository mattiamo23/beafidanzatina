import { readFileSync, writeFileSync } from 'fs'

// ─── HTML SECTION ──────────────────────────────────────────────────────────
let html = readFileSync('index.html', 'utf8')

const oldTimer = html.indexOf('      <!-- ======= TIMER POMODORO ======= -->')
const oldTimerEnd = html.indexOf('      <!-- ======= FRASI MOTIVAZIONALI =')
if (oldTimer === -1 || oldTimerEnd === -1) { console.error('Timer section not found'); process.exit(1) }

const newTimerSection = `      <!-- ======= TIMER POMODORO ======= -->
      <section id="timer" class="snap-section timer-fullscreen">

        <!-- Mode tabs -->
        <div class="timer-mode-row">
          <button class="tmode-btn active" data-mode="study" data-minutes="25">📖 Studio</button>
          <button class="tmode-btn" data-mode="short" data-minutes="5">☕ Pausa</button>
          <button class="tmode-btn" data-mode="long" data-minutes="15">🛌 Lunga</button>
        </div>

        <!-- Ring + display -->
        <div id="timer-ring-wrap" class="timer-ring-wrap">
          <svg class="timer-svg" viewBox="0 0 300 300" fill="none">
            <circle class="t-track" cx="150" cy="150" r="130"/>
            <circle id="timer-progress" class="t-fill" cx="150" cy="150" r="130"/>
          </svg>
          <div class="timer-center-display">
            <div id="timer-phase-emoji" class="timer-phase-emoji">📖</div>
            <div id="timer-display" class="timer-big-time">25:00</div>
            <div id="timer-phase-label" class="timer-phase-label">Tocca per iniziare</div>
          </div>
        </div>

        <!-- Auto-advance banner -->
        <div id="timer-auto-banner" class="timer-auto-banner hidden">
          <span id="timer-auto-text"></span>
        </div>

        <!-- Controls -->
        <div class="timer-controls-row">
          <button id="timer-reset" class="tctrl-btn tctrl-secondary" title="Reset">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          <button id="timer-start" class="tctrl-btn tctrl-main">
            <svg id="btn-play-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <svg id="btn-pause-icon" class="hidden" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button id="timer-skip" class="tctrl-btn tctrl-secondary" title="Salta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5,4 15,12 5,20"/><line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
          </button>
        </div>

        <!-- Session progress -->
        <div class="timer-session-row">
          <div id="session-dots" class="flex gap-2"></div>
          <span class="timer-session-label">
            <span id="session-count">0</span> sessioni oggi
          </span>
        </div>

      </section>

`

html = html.slice(0, oldTimer) + newTimerSection + html.slice(oldTimerEnd)
writeFileSync('index.html', html, 'utf8')
console.log('HTML timer section rewritten')
