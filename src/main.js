// ============================================
// MOTIVATIONAL QUOTES
// ============================================
const quotes = [
  { text: "Ce la fai, fidati. Hai già superato il 100% delle giornate difficili.", author: "📖 Saggio del divano" },
  { text: "Il bando non sa con chi ha a che fare. Spoiler: perde lui.", author: "🏆 La certezza assoluta" },
  { text: "Una pagina alla volta. Roma non fu studiata in un giorno.", author: "🏛️ Storico anonimo" },
  { text: "Ogni minuto di studio oggi è un minuto di sonno sereno stanotte.", author: "😴 Il Cuscino" },
  { text: "Sei bravissima. Non lo dico per farti sentire bene, è oggettivamente vero.", author: "💛 Il tuo ragazzo" },
  { text: "Pausa. Respira. Bevi acqua. Poi torna. Sei una macchina.", author: "🌿 Il buonsenso" },
  { text: "Non devi sapere tutto. Devi sapere abbastanza. E tu già lo sai.", author: "✨ La fiducia in te" },
  { text: "Anche Mel ti guarda con orgoglio. Sì, proprio adesso.", author: "😺 Mel" },
  { text: "La cosa più difficile è iniziare. Sei già oltre quel punto.", author: "🚀 Il momentum" },
  { text: "Ogni argomento che impari oggi è un pezzo di te che aiuterà qualcuno domani.", author: "🤝 La vocazione" },
  { text: "Non confrontarti con gli altri. Il tuo ritmo è il ritmo giusto.", author: "🌸 La gentilezza" },
  { text: "Assistente sociale Bea: ha un suono bellissimo, no?", author: "🌟 Il futuro" },
  { text: "Un giorno guarderai indietro e dirai: ce l'ho fatta. Già lo so.", author: "🔮 Il futuro Bea" },
  { text: "Studia bene e poi facciamo una bella passeggiata insieme. Promesso.", author: "💛 Io" },
  { text: "Il caffè è un diritto. Non una colpa. Bevi pure.", author: "☕ Il barista interiore" },
  { text: "Il bando è solo un cancello. Tu hai già la chiave, stai solo lucidandola.", author: "🔑 La metafora" },
  { text: "Ogni scheda che leggi ti avvicina al posto che meriti davvero.", author: "💛 Il tuo ragazzo ancora" },
]

let currentQuoteIndex = -1
let favQuotes = JSON.parse(localStorage.getItem('favQuotes') || '[]')

function getRandomQuote() {
  let idx
  do { idx = Math.floor(Math.random() * quotes.length) } while (idx === currentQuoteIndex && quotes.length > 1)
  currentQuoteIndex = idx
  return quotes[idx]
}

function renderFavQuotes() {
  const container = document.getElementById('fav-quotes')
  const empty = document.getElementById('fav-empty')
  if (!container) return
  if (favQuotes.length === 0) {
    container.innerHTML = ''
    if (empty) empty.style.display = 'block'
    return
  }
  if (empty) empty.style.display = 'none'
  container.innerHTML = favQuotes.map((q, i) => `
    <div class="fav-quote-item">
      <span class="flex-1 text-sm text-gray-600">"${q.text}"</span>
      <button class="remove-fav" data-idx="${i}">×</button>
    </div>
  `).join('')
  container.querySelectorAll('.remove-fav').forEach(btn => {
    btn.addEventListener('click', () => {
      favQuotes.splice(parseInt(btn.dataset.idx), 1)
      localStorage.setItem('favQuotes', JSON.stringify(favQuotes))
      renderFavQuotes()
    })
  })
}

document.getElementById('new-quote-btn')?.addEventListener('click', () => {
  const q = getRandomQuote()
  const textEl = document.getElementById('quote-text')
  const authorEl = document.getElementById('quote-author')
  const card = document.getElementById('quote-card')
  card?.classList.add('flip-out')
  setTimeout(() => {
    if (textEl) textEl.textContent = q.text
    if (authorEl) authorEl.textContent = `— ${q.author}`
    card?.classList.remove('flip-out')
    card?.classList.add('flip-in')
    setTimeout(() => card?.classList.remove('flip-in'), 400)
  }, 200)
  vibrate(30)
})

document.getElementById('fav-quote-btn')?.addEventListener('click', () => {
  if (currentQuoteIndex === -1) return
  const q = quotes[currentQuoteIndex]
  if (favQuotes.find(f => f.text === q.text)) return
  favQuotes.push(q)
  localStorage.setItem('favQuotes', JSON.stringify(favQuotes))
  renderFavQuotes()
  const btn = document.getElementById('fav-quote-btn')
  if (btn) {
    btn.textContent = '❤️ Salvata!'
    btn.classList.add('saved-flash')
    setTimeout(() => {
      btn.textContent = '❤️ Salva questa frase'
      btn.classList.remove('saved-flash')
    }, 1500)
  }
  vibrate(50)
})

renderFavQuotes()

// ============================================
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
let _sharedAudioCtx = null
function getAudioCtx() {
  if (!_sharedAudioCtx || _sharedAudioCtx.state === 'closed') {
    _sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (_sharedAudioCtx.state === 'suspended') _sharedAudioCtx.resume()
  return _sharedAudioCtx
}

function playBell(type = 'end') {
  try {
    const ctx = getAudioCtx()
    const patterns = {
      end:   [[0, 880, 0.7, 'sine'], [0.35, 660, 0.5, 'sine'], [0.7, 880, 0.6, 'sine'], [1.05, 440, 0.4, 'sine']],
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
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.9)
      osc.start(ctx.currentTime + time)
      osc.stop(ctx.currentTime + time + 1.0)
    })
  } catch(e) {}
}

// ── Repeating alarm (suoneria sveglia) ────────────────────────────
let _alarmInterval = null
let _alarmCount    = 0
const ALARM_REPEATS = 12  // ~24 secondi

function startAlarm() {
  stopAlarm()
  _alarmCount = 0
  playBell('end')
  _alarmInterval = setInterval(() => {
    _alarmCount++
    if (_alarmCount >= ALARM_REPEATS) { stopAlarm(); return }
    playBell('end')
    vibrate([150, 80, 150])
  }, 2100)
  // ferma l'allarme al primo tocco dell'utente
  const stopOnTouch = () => { stopAlarm(); document.removeEventListener('pointerdown', stopOnTouch) }
  document.addEventListener('pointerdown', stopOnTouch)
}

function stopAlarm() {
  if (_alarmInterval) { clearInterval(_alarmInterval); _alarmInterval = null }
}

// ── Web Notifications ─────────────────────────────────────────────
function askNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function fireTimerNotification(mode) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const msgs = {
    study: { title: '🎉 Sessione completata!', body: 'Bravissima Bea! Prenditi una pausa meritate.' },
    short: { title: '☕ Pausa finita!',        body: 'Forza, si riprende a studiare!' },
    long:  { title: '🛌 Pausa lunga finita!',  body: 'Riposata? Torna sui libri!' },
  }
  const m = msgs[mode] || msgs.study
  try { new Notification(m.title, { body: m.body, icon: '/assets/logo.svg', silent: false }) } catch(e) {}
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
  askNotificationPermission()
  // unlock AudioContext con il gesto utente (necessario per iOS)
  try { getAudioCtx() } catch(e) {}
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
  stopAlarm()
  startAlarm()                          // sveglia che si ripete
  vibrate([200, 100, 200, 100, 400])    // pattern lungo
  fireTimerNotification(timerMode)      // notifica sistema
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

// ============================================
// MEL THE CAT
// ============================================
const melMessages = [
  'Sono fiera di te 😻',
  'Stai andando benissimo! 🐾',
  'Miao! Continua così! ✨',
  'Sei la mia umana preferita 😺',
  'Futura assistente sociale! 🏆',
  'Posso avere le crocchette dopo? 🐟',
  'Ti guardo studiare con ammirazione 👁️',
  'Il bando non ha speranze! 💛',
  'Vai Bea vai!! 🎉',
  'Ogni pagina ti avvicina al tuo sogno 📚',
  'Devo dormire, ma tu studia. È equo? 😴',
  'Mrroww significa: ce la fai! 🌟',
  'Assistente sociale + Mel = squadra imbattibile 🐾',
]

const melEmojis = ['😺','😸','😹','😻','😼','😽','🙀','🐱','🐈']
let melCount = parseInt(localStorage.getItem('melCount') || '0')

const melDisplayEl = document.getElementById('mel-display')
const melMessageEl = document.getElementById('mel-message')
const melCountEl   = document.getElementById('mel-count')

if (melCountEl) melCountEl.textContent = melCount

function updateMelEmoji() {
  const emoji = melEmojis[Math.floor(Math.random() * melEmojis.length)]
  if (melDisplayEl) {
    melDisplayEl.textContent = emoji
    melDisplayEl.classList.add('mel-bounce')
    setTimeout(() => melDisplayEl.classList.remove('mel-bounce'), 400)
  }
}

function showMelMessage() {
  const msg = melMessages[Math.floor(Math.random() * melMessages.length)]
  if (melMessageEl) {
    melMessageEl.style.opacity = '0'
    setTimeout(() => {
      melMessageEl.textContent = msg
      melMessageEl.style.opacity = '1'
    }, 150)
  }
}

document.getElementById('mel-btn')?.addEventListener('click', (e) => {
  melCount++
  localStorage.setItem('melCount', String(melCount))
  if (melCountEl) melCountEl.textContent = melCount
  updateMelEmoji()
  showMelMessage()
  vibrate(40)
  spawnParticles(e.clientX, e.clientY, ['🐾','✨','💜','🌸'])
})

melDisplayEl?.addEventListener('click', (e) => {
  updateMelEmoji()
  showMelMessage()
  vibrate(30)
  spawnParticles(e.clientX, e.clientY, ['😺','💜','✨'])
})

setInterval(() => { if (Math.random() < 0.3) updateMelEmoji() }, 8000)

// ============================================
// PARTICLES
// ============================================
function spawnParticles(x, y, emojis = ['✨']) {
  const container = document.getElementById('particles')
  if (!container) return
  const count = Math.min(emojis.length * 3, 10)
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const p = document.createElement('div')
      p.className = 'particle'
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)]
      p.style.left = x + (Math.random() - 0.5) * 60 + 'px'
      p.style.top  = y + (Math.random() - 0.5) * 40 + 'px'
      p.style.fontSize = Math.random() * 12 + 16 + 'px'
      container.appendChild(p)
      setTimeout(() => p.remove(), 1800)
    }, i * 60)
  }
}

function launchConfetti() {
  const container = document.getElementById('particles')
  if (!container) return
  const emojis = ['🎊','⭐','✨','🌟','💜','🎉','🌸']
  const count = window.innerWidth < 640 ? 18 : 35
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const p = document.createElement('div')
      p.className = 'confetti-piece'
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)]
      p.style.left = Math.random() * window.innerWidth + 'px'
      p.style.top = '-30px'
      p.style.fontSize = Math.random() * 14 + 14 + 'px'
      container.appendChild(p)
      setTimeout(() => p.remove(), 3000)
    }, i * 80)
  }
}

// ============================================
// UTILS
// ============================================
function vibrate(pattern = 50) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault()
    const target = document.querySelector(a.getAttribute('href'))
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

// ============================================
// SCROLL ENTRANCE ANIMATIONS
// ============================================
const snapSections = document.querySelectorAll('.snap-section')
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible')
    } else {
      // rimuovi la classe quando la sezione esce, così rianima al ritorno
      entry.target.classList.remove('is-visible')
    }
  })
}, {
  threshold: 0.45,
  rootMargin: '0px'
})
snapSections.forEach(s => observer.observe(s))
// la home è già visibile all'avvio
document.querySelector('#home')?.classList.add('is-visible')

// ============================================
// EXTRA MOBILE EFFECTS
// ============================================

// ── 1. SECTION DOT NAVIGATOR (right side) ────────────────────────
const sectionIds    = ['home', 'timer', 'frasi', 'mel']
const dotsNav       = document.createElement('div')
dotsNav.className   = 'section-nav-dots'
sectionIds.forEach(id => {
  const dot       = document.createElement('button')
  dot.className   = 's-dot'
  dot.dataset.target = id
  dot.setAttribute('aria-label', id)
  dot.addEventListener('click', () =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  )
  dotsNav.appendChild(dot)
})
document.body.appendChild(dotsNav)

const allDots = Array.from(dotsNav.querySelectorAll('.s-dot'))
const dotObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = sectionIds.indexOf(entry.target.id)
      allDots.forEach((d, i) => d.classList.toggle('active', i === idx))
    }
  })
}, { threshold: 0.5 })
sectionIds.forEach(id => {
  const el = document.getElementById(id)
  if (el) dotObserver.observe(el)
})

// ── 2. GYROSCOPE PARALLAX ON HOME BLOBS ──────────────────────────
if ('ontouchstart' in window) {
  const blobs = document.querySelectorAll('.blob')
  let tiltX = 0, tiltY = 0

  const handleOrientation = (e) => {
    tiltX = Math.min(Math.max((e.gamma || 0) / 25, -1), 1)
    tiltY = Math.min(Math.max(((e.beta  || 0) - 45) / 40, -1), 1)
  }

  const startGyro = () => {
    window.addEventListener('deviceorientation', handleOrientation, { passive: true })
    ;(function animateBlobs() {
      blobs.forEach((b, i) => {
        const f = (i + 1) * 14
        b.style.transform = `translate(${tiltX * f}px, ${tiltY * f * 0.5}px)`
      })
      requestAnimationFrame(animateBlobs)
    })()
  }

  if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
    // iOS 13+ — asks permission on first tap of home section
    document.getElementById('home')?.addEventListener('touchend', async () => {
      try { await DeviceOrientationEvent.requestPermission(); startGyro() } catch(e) {}
    }, { once: true })
  } else {
    startGyro()
  }
}

// ── 3. SHIMMER GOLDEN RIPPLE ON CARD TOUCH ───────────────────────
document.querySelectorAll('.card-section, .quote-card').forEach(card => {
  if (getComputedStyle(card).position === 'static') card.style.position = 'relative'
  card.style.overflow = 'hidden'
  card.addEventListener('touchstart', e => {
    const rect  = card.getBoundingClientRect()
    const t     = e.touches[0]
    const ripple = document.createElement('div')
    ripple.className = 'shimmer-ripple'
    ripple.style.left = (t.clientX - rect.left) + 'px'
    ripple.style.top  = (t.clientY - rect.top)  + 'px'
    card.appendChild(ripple)
    setTimeout(() => ripple.remove(), 700)
  }, { passive: true })
})

// ── 4. MOOD BADGES STAGGERED POP-IN ──────────────────────────────
const badgeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const badges = entry.target.querySelectorAll('.mood-badge')
    if (entry.isIntersecting) {
      badges.forEach((b, i) => {
        b.style.transitionDelay = (0.25 + i * 0.1) + 's'
        b.classList.add('badge-visible')
      })
    } else {
      badges.forEach(b => {
        b.style.transitionDelay = '0s'
        b.classList.remove('badge-visible')
      })
    }
  })
}, { threshold: 0.45 })
const homeSection = document.getElementById('home')
if (homeSection) badgeObserver.observe(homeSection)

// ── 5. SHAKE DETECTION → MEL SURPRISE ────────────────────────────
if ('ontouchstart' in window && typeof DeviceMotionEvent !== 'undefined') {
  let lastAcc   = { x: 0, y: 0, z: 0 }
  let shakeLock = false

  const startShakeDetect = () => {
    window.addEventListener('devicemotion', e => {
      const acc = e.accelerationIncludingGravity
      if (!acc || shakeLock) return
      const delta = Math.abs((acc.x||0) - lastAcc.x) +
                    Math.abs((acc.y||0) - lastAcc.y) +
                    Math.abs((acc.z||0) - lastAcc.z)
      lastAcc = { x: acc.x||0, y: acc.y||0, z: acc.z||0 }
      if (delta > 28) {
        shakeLock = true
        const melEl = document.getElementById('mel-display')
        if (melEl) {
          const emojis = ['😺','😸','😹','😻','🐾']
          melEl.textContent = emojis[Math.floor(Math.random() * emojis.length)]
          melEl.classList.remove('mel-shake')
          void melEl.offsetWidth  // reflow to restart animation
          melEl.classList.add('mel-shake')
          setTimeout(() => melEl.classList.remove('mel-shake'), 700)
        }
        showMelMessage()
        vibrate([40, 20, 40])
        spawnParticles(
          window.innerWidth / 2,
          window.innerHeight / 2,
          ['😺','⭐','💛','🐾','✨']
        )
        setTimeout(() => { shakeLock = false }, 1800)
      }
    }, { passive: true })
  }

  if (typeof DeviceMotionEvent?.requestPermission === 'function') {
    document.getElementById('mel')?.addEventListener('touchend', async () => {
      try { await DeviceMotionEvent.requestPermission(); startShakeDetect() } catch(e) {}
    }, { once: true })
  } else {
    startShakeDetect()
  }
}

// ── EASTER EGG: 6 tap su 📊 in 10s → tutti i timer a 2 secondi ────
;(function() {
  const statsBtn = document.getElementById('timer-stats-btn')
  if (!statsBtn) return
  let taps = 0
  let firstTap = 0
  statsBtn.addEventListener('click', e => {
    e.stopPropagation()
    const now = Date.now()
    if (taps === 0) firstTap = now
    if (now - firstTap > 10000) { taps = 0; firstTap = now }  // finestra 10s
    taps++
    if (taps >= 6) {
      taps = 0
      // 1. porta il timer principale a 2 secondi
      if (!timerRunning) startTimer()       // avvia se era fermo
      timerSeconds = 2
      totalSeconds = Math.max(totalSeconds, 2)
      updateTimerUI()
      // 2. se c'è un auto-countdown attivo, portalo a 1 secondo
      if (autoCountdown) {
        clearInterval(autoCountdown)
        autoCountdown = null
        // rilancia con 1 tick rimanente così scatta subito
        let cd = 1
        autoCountdown = setInterval(() => {
          cd--
          if (cd <= 0) {
            clearInterval(autoCountdown); autoCountdown = null
            hideBanner()
            const next = timerMode === 'study'
              ? (sessionCount % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short')
              : 'study'
            setMode(next, true)
            startTimer()
          }
        }, 1000)
      }
      vibrate([30, 20, 30, 20, 30])
      // flash leggero sul bottone
      statsBtn.style.transition = 'opacity 0.1s'
      statsBtn.style.opacity = '0.2'
      setTimeout(() => { statsBtn.style.opacity = '1' }, 200)
    }
  })
})()

// ── EASTER EGG: 5 tap sul 📚 → timer a 2 secondi ──────────────────
;(function() {
  const logoBook = document.getElementById('logo-book')
  if (!logoBook) return
  let taps = 0
  let lastTap = 0
  logoBook.style.cursor = 'pointer'
  logoBook.addEventListener('click', () => {
    const now = Date.now()
    if (now - lastTap > 3000) taps = 0   // resetta se passa >3s
    lastTap = now
    taps++
    if (taps >= 5) {
      taps = 0
      // porta il timer a 2 secondi rimanenti
      if (!timerRunning) startTimer()     // avvia se fermo
      timerSeconds = 2
      totalSeconds = Math.max(totalSeconds, 2)
      updateTimerUI()
      vibrate([30, 20, 30, 20, 30])
      // piccolo flash visivo sul ring
      const ring = document.getElementById('timer-ring-wrap')
      if (ring) {
        ring.style.transition = 'opacity 0.1s'
        ring.style.opacity = '0.3'
        setTimeout(() => { ring.style.opacity = '1' }, 150)
      }
    }
  })
})()
