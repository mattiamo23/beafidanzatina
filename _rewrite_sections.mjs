import { readFileSync, writeFileSync } from 'fs'

let html = readFileSync('index.html', 'utf8')
const navbarEnd = html.indexOf('</nav>') + '</nav>'.length
const particlesStart = html.indexOf('    <!-- Particle Container -->')

const newSections = `

    <div id="app" class="relative z-10">

      <!-- ======= HOME ======= -->
      <section id="home" class="snap-section text-center">
        <div class="w-full max-w-lg mx-auto">
          <div class="inline-block relative mb-4">
            <div class="text-6xl sm:text-8xl animate-bounce-slow">📚</div>
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold font-['Fredoka'] mb-3 leading-tight"
              style="background: linear-gradient(90deg,#eab308,#facc15,#fde047); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            Ciao Bea! 🌸
          </h1>
          <p class="text-base sm:text-lg text-gray-600 font-medium mx-auto mb-8">
            Il tuo angolino per sopravvivere al bando da assistente sociale ✨
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <div class="mood-badge" style="--c:#fde68a;">☀️ Bando mode on</div>
            <div class="mood-badge" style="--c:#fef08a;">🐈‍⬛ Mel approva</div>
            <div class="mood-badge" style="--c:#fef9c3;">💛 Futura AS</div>
            <div class="mood-badge" style="--c:#fcd34d;">✨ Ce la fai</div>
          </div>
        </div>
      </section>

      <!-- ======= TIMER POMODORO ======= -->
      <section id="timer" class="snap-section">
        <div class="card-section w-full max-w-lg mx-auto">
          <h2 class="section-title">⏱️ Timer Pomodoro</h2>
          <p class="text-gray-500 text-sm mb-4 text-center">25 min sul bando, poi pausa meritata! 🍵</p>
          <div class="flex flex-wrap justify-center gap-2 mb-4">
            <button class="timer-tab active" data-mode="study" data-minutes="25">📖 Studio</button>
            <button class="timer-tab" data-mode="short" data-minutes="5">☕ Pausa</button>
            <button class="timer-tab" data-mode="long" data-minutes="15">🛌 Pausa lunga</button>
          </div>
          <div class="flex flex-col items-center gap-4">
            <div class="timer-circle">
              <svg class="timer-ring" viewBox="0 0 200 200">
                <circle class="timer-ring-bg" cx="100" cy="100" r="88"/>
                <circle id="timer-progress" class="timer-ring-fill" cx="100" cy="100" r="88"/>
              </svg>
              <div class="timer-time-display">
                <div id="timer-display" class="text-5xl sm:text-6xl font-bold font-['Fredoka'] text-yellow-600">25:00</div>
                <div id="timer-phase-label" class="text-sm text-yellow-400 font-medium mt-1">Pronta?</div>
              </div>
            </div>
            <div class="flex gap-3 w-full">
              <button id="timer-start" class="btn-purple flex-1 py-3 text-lg">▶️ Start</button>
              <button id="timer-reset" class="btn-outline px-6 py-3 text-lg">↺ Reset</button>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">Sessioni oggi:</span>
              <div id="session-dots" class="flex gap-1.5"></div>
              <span id="session-count" class="text-sm font-bold text-yellow-600">0</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= FRASI MOTIVAZIONALI ======= -->
      <section id="frasi" class="snap-section">
        <div class="card-section w-full max-w-lg mx-auto">
          <h2 class="section-title">💬 Frasi del Giorno</h2>
          <p class="text-gray-500 text-sm mb-4 text-center">Un po' di carica per le fatiche del bando ⚡</p>
          <div id="quote-card" class="quote-card">
            <div id="quote-text" class="text-lg sm:text-xl font-semibold text-center leading-relaxed text-gray-700 mb-3">
              Premi il pulsante! 👇
            </div>
            <div id="quote-author" class="text-sm text-gray-400 text-center italic"></div>
          </div>
          <div class="flex gap-3 mt-4">
            <button id="new-quote-btn" class="btn-pink flex-1 py-3 text-base">✨ Nuova frase</button>
            <button id="fav-quote-btn" class="btn-outline px-5 py-3 text-base">❤️</button>
          </div>
          <div class="mt-4">
            <div class="text-sm font-semibold text-gray-500 mb-2 text-center">Le tue preferite 💛</div>
            <div id="fav-quotes" class="space-y-2 max-h-32 overflow-y-auto"></div>
            <div id="fav-empty" class="text-center text-xs text-gray-400 italic">
              Clicca ❤️ per salvare una frase!
            </div>
          </div>
        </div>
      </section>

      <!-- ======= MEL ======= -->
      <section id="mel" class="snap-section text-center">
        <div class="card-section w-full max-w-lg mx-auto">
          <h2 class="section-title">🐱 La Divina Mel</h2>
          <p class="text-gray-500 text-sm mb-4">La tua tifosa numero uno per il bando 😻</p>
          <div id="mel-display" class="text-8xl sm:text-9xl mb-4 cursor-pointer select-none transition-transform hover:scale-110 active:scale-95 inline-block" title="Tocca Mel!">
            😺
          </div>
          <div id="mel-message" class="text-base font-semibold text-yellow-700 mb-4 min-h-[2rem]">
            Ciao! Ti guardo studiare 👀
          </div>
          <button id="mel-btn" class="btn-purple w-full py-4 text-xl mb-3">
            Accarezza Mel! 🐾
          </button>
          <div class="text-sm text-gray-500 mt-1">
            Coccole date: <span id="mel-count" class="font-bold text-yellow-600">0</span>
          </div>
          <p class="text-yellow-600/50 text-xs mt-6">Made with 💛 per la futura AS più brava del mondo</p>
        </div>
      </section>

    </div>

`

html = html.slice(0, navbarEnd) + newSections + '    ' + html.slice(particlesStart)
writeFileSync('index.html', html, 'utf8')
console.log('index.html rewritten successfully')
