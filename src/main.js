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
// POMODORO TIMER
// ============================================
const MODES = {
  study: { label: 'Studio',       minutes: 25, color: '#eab308' },
  short: { label: 'Pausa',        minutes: 5,  color: '#facc15' },
  long:  { label: 'Pausa lunga',  minutes: 15, color: '#a16207' },
}

let timerMode = 'study'
let timerRunning = false
let timerInterval = null
let timerSeconds = 25 * 60
let totalSeconds = 25 * 60
let sessionCount = parseInt(localStorage.getItem('sessionCount') || '0')
const today = new Date().toDateString()
if (localStorage.getItem('lastSessionDate') !== today) {
  sessionCount = 0
  localStorage.setItem('sessionCount', '0')
  localStorage.setItem('lastSessionDate', today)
}

const timerDisplayEl  = document.getElementById('timer-display')
const timerLabelEl    = document.getElementById('timer-phase-label')
const timerProgressEl = document.getElementById('timer-progress')
const sessionCountEl  = document.getElementById('session-count')
const sessionDotsEl   = document.getElementById('session-dots')
const CIRCUMFERENCE   = 2 * Math.PI * 88

function formatTime(s) {
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
}

function updateTimerUI() {
  if (timerDisplayEl) timerDisplayEl.textContent = formatTime(timerSeconds)
  if (timerProgressEl) timerProgressEl.style.strokeDashoffset = CIRCUMFERENCE * (timerSeconds / totalSeconds)
}

function updateSessionDots() {
  if (!sessionDotsEl) return
  const shown = Math.min(sessionCount, 8)
  sessionDotsEl.innerHTML = Array.from({ length: shown }, () =>
    '<div class="session-dot filled"></div>'
  ).join('')
  if (sessionCountEl) sessionCountEl.textContent = sessionCount
}

function setMode(mode) {
  timerMode = mode
  timerRunning = false
  clearInterval(timerInterval)
  timerInterval = null
  const m = MODES[mode]
  timerSeconds = m.minutes * 60
  totalSeconds = m.minutes * 60
  if (timerProgressEl) timerProgressEl.style.stroke = m.color
  if (timerLabelEl) timerLabelEl.textContent = 'Pronta?'
  const startBtn = document.getElementById('timer-start')
  if (startBtn) startBtn.textContent = '▶️ Start'
  updateTimerUI()
  document.querySelectorAll('.timer-tab').forEach(tab =>
    tab.classList.toggle('active', tab.dataset.mode === mode)
  )
}

function startTimer() {
  if (timerRunning) {
    timerRunning = false
    clearInterval(timerInterval)
    timerInterval = null
    const btn = document.getElementById('timer-start')
    if (btn) btn.textContent = '▶️ Continua'
    if (timerLabelEl) timerLabelEl.textContent = 'In pausa ⏸️'
    return
  }
  timerRunning = true
  const btn = document.getElementById('timer-start')
  if (btn) btn.textContent = '⏸️ Pausa'
  if (timerLabelEl) timerLabelEl.textContent = timerMode === 'study' ? 'Stai studiando 📖' : 'In pausa ☕'
  timerInterval = setInterval(() => {
    timerSeconds--
    updateTimerUI()
    if (timerSeconds <= 0) {
      clearInterval(timerInterval)
      timerInterval = null
      timerRunning = false
      onTimerComplete()
    }
  }, 1000)
}

function onTimerComplete() {
  vibrate([100, 50, 100, 50, 200])
  if (timerMode === 'study') {
    sessionCount++
    localStorage.setItem('sessionCount', String(sessionCount))
    updateSessionDots()
    if (timerLabelEl) timerLabelEl.textContent = '🎉 Sessione completata!'
    launchConfetti()
  } else {
    if (timerLabelEl) timerLabelEl.textContent = '✅ Pausa finita, forza!'
  }
  timerSeconds = 0
  updateTimerUI()
  const btn = document.getElementById('timer-start')
  if (btn) btn.textContent = '▶️ Start'
}

document.getElementById('timer-start')?.addEventListener('click', startTimer)
document.getElementById('timer-reset')?.addEventListener('click', () => setMode(timerMode))
document.querySelectorAll('.timer-tab').forEach(tab =>
  tab.addEventListener('click', () => setMode(tab.dataset.mode))
)

if (timerProgressEl) {
  timerProgressEl.style.strokeDasharray = CIRCUMFERENCE
  timerProgressEl.style.strokeDashoffset = '0'
  timerProgressEl.style.stroke = MODES.study.color  // amber-400
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
