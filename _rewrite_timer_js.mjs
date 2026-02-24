import { readFileSync, writeFileSync } from 'fs'

let js = readFileSync('src/main.js', 'utf8')

const startMarker = '// ============================================\n// POMODORO TIMER\n// ============================================'
const endMarker   = '// ============================================\n// MEL THE CAT'

const startIdx = js.indexOf(startMarker)
const endIdx   = js.indexOf(endMarker)
if (startIdx === -1 || endIdx === -1) { console.error('Markers not found'); process.exit(1) }

const newTimerJS = `// ============================================
// POMODORO TIMER — full-screen, professional
// ============================================
const MODES = {
  study: { label: 'Stai studiando',  emoji: '📖', minutes: 25, color: '#eab308', nextMode: 'auto' },
  short: { label: 'Pausa breve',     emoji: '☕', minutes: 5,  color: '#facc15', nextMode: 'study' },
  long:  { label: 'Pausa lunga',     emoji: '🛌', minutes: 15, color: '#a16207', nextMode: 'study' },
}
const SESSIONS_BEFORE_LONG = 4   // long break every 4 study sessions
const CIRCUMFERENCE = 2 * Math.PI * 130  // r=130 matches SVG

let timerMode     = 'study'
let timerRunning  = false
let timerInterval = null
let timerSeconds  = MODES.study.minutes * 60
let totalSeconds  = MODES.study.minutes * 60
let autoCountdown = null
let wakeLock      = null

// session count — reset daily
let sessionCount  = parseInt(localStorage.getItem('sessionCount') || '0')
const today       = new Date().toDateString()
if (localStorage.getItem('lastSessionDate') !== today) {
  sessionCount = 0
  localStorage.setItem('sessionCount', '0')
  localStorage.setItem('lastSessionDate', today)
}

// DOM refs
const timerDisplayEl  = document.getElementById('timer-display')
const timerEmojiEl    = document.getElementById('timer-phase-emoji')
const timerLabelEl    = document.getElementById('timer-phase-label')
const timerProgressEl = document.getElementById('timer-progress')
const sessionCountEl  = document.getElementById('session-count')
const sessionDotsEl   = document.getElementById('session-dots')
const autoBanner      = document.getElementById('timer-auto-banner')
const autoText        = document.getElementById('timer-auto-text')
const playIcon        = document.getElementById('btn-play-icon')
const pauseIcon       = document.getElementById('btn-pause-icon')

// ── Web Audio API bell sound ──────────────────────────────────────
function playBell(type = 'end') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const patterns = {
      end:   [[0, 880, 0.6, 'sine'], [0.3, 660, 0.4, 'sine'], [0.6, 440, 0.3, 'sine']],
      tick:  [[0, 1200, 0.05, 'sine']],
      start: [[0, 660, 0.15, 'sine'], [0.12, 880, 0.12, 'sine']],
    }
    const notes = patterns[type] || patterns.end
    notes.forEach(([time, freq, gain, shape]) => {
      const osc = ctx.createOscillator()
      const vol = ctx.createGain()
      osc.connect(vol); vol.connect(ctx.destination)
      osc.type = shape; osc.frequency.value = freq
      vol.gain.setValueAtTime(gain, ctx.currentTime + time)
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.8)
      osc.start(ctx.currentTime + time)
      osc.stop(ctx.currentTime + time + 0.9)
    })
  } catch(e) {}
}

// ── Screen Wake Lock ─────────────────────────────────────────────
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen')
  } catch(e) {}
}
async function releaseWakeLock() {
  try { if (wakeLock) { await wakeLock.release(); wakeLock = null } } catch(e) {}
}

// ── UI helpers ───────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60)
  return String(m).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0')
}

function setPlayPauseIcon(running) {
  if (!playIcon || !pauseIcon) return
  playIcon.classList.toggle('hidden', running)
  pauseIcon.classList.toggle('hidden', !running)
}

function updateRing() {
  if (!timerProgressEl) return
  const ratio = timerSeconds / totalSeconds
  timerProgressEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio)
}

function updateTimerUI() {
  if (timerDisplayEl) timerDisplayEl.textContent = formatTime(timerSeconds)
  updateRing()
}

function updateSessionDots() {
  if (!sessionDotsEl) return
  const shown  = Math.min(sessionCount, 8)
  const isLong = shown > 0 && shown % SESSIONS_BEFORE_LONG === 0
  sessionDotsEl.innerHTML = Array.from({ length: shown }, (_, i) => {
    const cls = (i + 1) % SESSIONS_BEFORE_LONG === 0 ? 'session-dot long-break filled' : 'session-dot filled'
    return '<div class="' + cls + '"></div>'
  }).join('')
  if (sessionCountEl) sessionCountEl.textContent = sessionCount
}

function showBanner(text) {
  if (!autoBanner || !autoText) return
  autoText.textContent = text
  autoBanner.classList.remove('hidden')
}
function hideBanner() {
  if (autoBanner) autoBanner.classList.add('hidden')
}

// ── Mode switching ────────────────────────────────────────────────
function setMode(mode, silent = false) {
  clearInterval(timerInterval);  timerInterval = null
  clearInterval(autoCountdown);  autoCountdown = null
  timerRunning = false
  timerMode = mode
  const m = MODES[mode]
  timerSeconds = m.minutes * 60
  totalSeconds = m.minutes * 60
  if (timerProgressEl) timerProgressEl.style.stroke = m.color
  if (timerLabelEl)    timerLabelEl.textContent = 'Tocca per iniziare'
  if (timerEmojiEl)    timerEmojiEl.textContent = m.emoji
  setPlayPauseIcon(false)
  hideBanner()
  updateTimerUI()
  document.querySelectorAll('.tmode-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === mode))
  if (!silent) releaseWakeLock()
}

// ── Start / Pause ─────────────────────────────────────────────────
function startTimer() {
  clearInterval(autoCountdown); autoCountdown = null; hideBanner()

  if (timerRunning) {
    // pause
    timerRunning = false
    clearInterval(timerInterval); timerInterval = null
    setPlayPauseIcon(false)
    if (timerLabelEl) timerLabelEl.textContent = 'In pausa ⏸'
    releaseWakeLock()
    return
  }

  // start
  timerRunning = true
  setPlayPauseIcon(true)
  const m = MODES[timerMode]
  if (timerLabelEl) timerLabelEl.textContent = m.label
  requestWakeLock()
  playBell('start')

  timerInterval = setInterval(() => {
    timerSeconds--
    updateTimerUI()
    // tick sound last 5 seconds
    if (timerSeconds <= 5 && timerSeconds > 0) playBell('tick')
    if (timerSeconds <= 0) {
      clearInterval(timerInterval); timerInterval = null
      timerRunning = false
      onTimerComplete()
    }
  }, 1000)
}

// ── Timer complete ────────────────────────────────────────────────
function onTimerComplete() {
  playBell('end')
  vibrate([100, 60, 100, 60, 200])
  setPlayPauseIcon(false)
  releaseWakeLock()

  if (timerMode === 'study') {
    sessionCount++
    localStorage.setItem('sessionCount', String(sessionCount))
    updateSessionDots()
    launchConfetti()
    // determine next break
    const nextMode = sessionCount % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short'
    const nextLabel = nextMode === 'long' ? 'Pausa lunga (15 min)' : 'Pausa breve (5 min)'
    if (timerLabelEl) timerLabelEl.textContent = '🎉 Sessione completata!'
    autoAdvance(nextMode, nextLabel, 'Ottimo lavoro!')
  } else {
    if (timerLabelEl) timerLabelEl.textContent = 'Pausa finita!'
    autoAdvance('study', 'Studio (25 min)', 'Pausa finita, forza!')
  }

  timerSeconds = 0
  updateTimerUI()
}

// ── Auto-advance with countdown ───────────────────────────────────
function autoAdvance(nextMode, nextLabel, msgPrefix) {
  let countdown = 5
  showBanner(msgPrefix + ' — ' + nextLabel + ' in ' + countdown + 's')
  autoCountdown = setInterval(() => {
    countdown--
    if (countdown <= 0) {
      clearInterval(autoCountdown); autoCountdown = null
      hideBanner()
      setMode(nextMode, true)
      startTimer()       // auto-start next phase
    } else {
      showBanner(msgPrefix + ' — ' + nextLabel + ' in ' + countdown + 's')
    }
  }, 1000)
}

// ── Event listeners ───────────────────────────────────────────────
document.getElementById('timer-start')?.addEventListener('click', startTimer)
document.getElementById('timer-ring-wrap')?.addEventListener('click', (e) => {
  if (!e.target.closest('#timer-reset') && !e.target.closest('#timer-skip') && !e.target.closest('#timer-start')
      && !e.target.closest('.tmode-btn')) startTimer()
})
document.getElementById('timer-reset')?.addEventListener('click', (e) => {
  e.stopPropagation(); setMode(timerMode)
})
document.getElementById('timer-skip')?.addEventListener('click', (e) => {
  e.stopPropagation()
  clearInterval(timerInterval); timerInterval = null
  clearInterval(autoCountdown); autoCountdown = null
  timerRunning = false
  hideBanner()
  // act as if complete
  if (timerMode === 'study') {
    const nextMode = sessionCount % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short'
    setMode(nextMode, true); startTimer()
  } else {
    setMode('study', true); startTimer()
  }
})
document.querySelectorAll('.tmode-btn').forEach(btn =>
  btn.addEventListener('click', (e) => { e.stopPropagation(); setMode(btn.dataset.mode) })
)

// ── Init ──────────────────────────────────────────────────────────
if (timerProgressEl) {
  timerProgressEl.style.strokeDasharray  = CIRCUMFERENCE
  timerProgressEl.style.strokeDashoffset = 0
  timerProgressEl.style.stroke = MODES.study.color
}
updateTimerUI()
updateSessionDots()

`

js = js.slice(0, startIdx) + newTimerJS + js.slice(endIdx)
writeFileSync('src/main.js', js, 'utf8')
console.log('main.js timer rewritten successfully')
