import '../src/style.css'

// ============================================
// STATE & DATA
// ============================================
let melCount = 0
let tricksScore = 0
let glowLevel = 0
let tunaBannedCount = 0
let starsCollected = 0
let gameTime = 30
let gameActive = false
let gameInterval = null

const catEmojis = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐱', '🐈']

// ============================================
// UTILITY FUNCTIONS
// ============================================
function createParticle(x, y, emoji, color = null) {
  const particle = document.createElement('div')
  particle.textContent = emoji
  particle.className = 'particle'
  particle.style.left = x + 'px'
  particle.style.top = y + 'px'
  particle.style.fontSize = Math.random() * 15 + 15 + 'px'
  if (color) particle.style.color = color
  particle.style.willChange = 'transform, opacity'
  
  document.getElementById('particles').appendChild(particle)
  
  setTimeout(() => particle.remove(), 2000)
}

function createConfetti(x, y) {
  const colors = ['#FCD34D', '#FCA5A5', '#A78BFA', '#6EE7B7', '#F472B6', '#FB923C']
  const isMobile = window.innerWidth < 640
  const confettiCount = isMobile ? 15 : 30
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div')
      confetti.className = 'confetti-piece'
      confetti.style.left = x + (Math.random() - 0.5) * 100 + 'px'
      confetti.style.top = y + 'px'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.animationDelay = Math.random() * 0.5 + 's'
      confetti.style.willChange = 'transform, opacity'
      
      document.getElementById('particles').appendChild(confetti)
      
      setTimeout(() => confetti.remove(), 3000)
    }, i * 20)
  }
}

function randomPosition() {
  return {
    x: Math.random() * (window.innerWidth - 100),
    y: Math.random() * (window.innerHeight - 100)
  }
}

// ============================================
// MEL THE CAT ZONE
// ============================================
// Haptic feedback helper
function vibrate(duration = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}

document.getElementById('mel-btn')?.addEventListener('click', function(e) {
  melCount++
  document.querySelector('#mel-counter span').textContent = melCount
  vibrate()
  
  // Create flying cat
  const cat = document.createElement('div')
  cat.className = 'floating-cat'
  cat.textContent = catEmojis[Math.floor(Math.random() * catEmojis.length)]
  cat.style.left = Math.random() * window.innerWidth + 'px'
  cat.style.top = Math.random() * 300 + 'px'
  
  document.getElementById('floating-cats').appendChild(cat)
  
  setTimeout(() => cat.remove(), 5000)
  
  // Particles at button location
  const rect = e.target.getBoundingClientRect()
  createParticle(rect.left + rect.width / 2, rect.top, '✨', '#FCD34D')
  createParticle(rect.left + rect.width / 2, rect.top, '🐱', '#F59E0B')
})

// ============================================
// AERIAL TRICKS SIMULATOR
// ============================================
document.querySelectorAll('.trick-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    tricksScore++
    document.getElementById('tricks-score').textContent = tricksScore
    vibrate()
    
    const trick = this.dataset.trick
    
    // Animate button
    this.classList.add('pulse-glow')
    setTimeout(() => this.classList.remove('pulse-glow'), 600)
    
    // Create particles
    const rect = this.getBoundingClientRect()
    createParticle(rect.left + rect.width / 2, rect.top, '⭐', '#FCD34D')
    createParticle(rect.left + rect.width / 2, rect.top, '✨', '#F59E0B')
    
    // Add floating emoji
    const emojiMap = { 'Inversion': '🤸‍♀️', 'Drop': '🎪', 'Splits': '⭐' }
    const emoji = document.createElement('div')
    emoji.textContent = emojiMap[trick]
    emoji.className = 'particle'
    emoji.style.left = rect.left + rect.width / 2 + 'px'
    emoji.style.top = rect.top + 'px'
    emoji.style.fontSize = '60px'
    document.getElementById('particles').appendChild(emoji)
    setTimeout(() => emoji.remove(), 2000)
  })
})

// ============================================
// MARIO 64 DS MINI GAME
// ============================================
let marioX = 50 // percentage
let marioY = 20 // pixels from bottom
let stars = []

function createStar() {
  const star = {
    id: Math.random(),
    x: Math.random() * 90 + 5, // percentage
    y: Math.random() * 80 + 10, // percentage
    collected: false
  }
  stars.push(star)
  
  const starEl = document.createElement('div')
  starEl.className = 'star'
  starEl.textContent = '⭐'
  starEl.dataset.starId = star.id
  starEl.style.left = star.x + '%'
  starEl.style.top = star.y + '%'
  
  starEl.addEventListener('click', () => collectStar(star.id))
  
  document.getElementById('stars-container').appendChild(starEl)
  
  return starEl
}

function collectStar(starId) {
  const star = stars.find(s => s.id === starId)
  if (!star || star.collected) return
  
  star.collected = true
  starsCollected++
  vibrate(20)
  
  document.querySelector(`[data-star-id="${starId}"]`)?.remove()
  document.getElementById('star-count').textContent = `${starsCollected} / 10`
  
  // Sound effect (visual)
  createParticle(window.innerWidth / 2, window.innerHeight / 2, '✨', '#FCD34D')
  
  if (starsCollected >= 10) {
    endGame(true)
  }
}

function startGame() {
  if (gameActive) return
  
  gameActive = true
  starsCollected = 0
  gameTime = 30
  stars = []
  
  document.getElementById('star-count').textContent = '0 / 10'
  document.getElementById('game-timer').textContent = gameTime
  document.getElementById('stars-container').innerHTML = ''
  
  // Create 10 stars
  for (let i = 0; i < 10; i++) {
    createStar()
  }
  
  // Start timer
  gameInterval = setInterval(() => {
    gameTime--
    document.getElementById('game-timer').textContent = gameTime
    
    if (gameTime <= 0) {
      endGame(false)
    }
  }, 1000)
}

function endGame(won) {
  gameActive = false
  clearInterval(gameInterval)
  
  if (won) {
    alert('🎉 HAI VINTO! Tutte le stelle raccolte! Sei una campionessa! 🌟')
    createConfetti(window.innerWidth / 2, window.innerHeight / 2)
  } else {
    alert('⏰ Tempo scaduto! Riprova! 🎮')
  }
}

function resetGame() {
  gameActive = false
  clearInterval(gameInterval)
  starsCollected = 0
  gameTime = 30
  stars = []
  
  document.getElementById('star-count').textContent = '0 / 10'
  document.getElementById('game-timer').textContent = '30'
  document.getElementById('stars-container').innerHTML = ''
}

// Mario movement
let isDragging = false

// Mouse events
document.getElementById('mario-player')?.addEventListener('mousedown', () => {
  isDragging = true
})

document.addEventListener('mouseup', () => {
  isDragging = false
})

// Touch events
document.getElementById('mario-player')?.addEventListener('touchstart', (e) => {
  e.preventDefault()
  isDragging = true
}, { passive: false })

document.addEventListener('touchend', () => {
  isDragging = false
})

function handleMove(clientX, clientY) {
  if (!isDragging || !gameActive) return
  
  const canvas = document.getElementById('mario-canvas')
  const rect = canvas.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  
  const mario = document.getElementById('mario-player')
  mario.style.left = x + 'px'
  mario.style.bottom = (rect.height - y) + 'px'
  
  // Check collision with stars
  stars.forEach(star => {
    if (star.collected) return
    
    const starEl = document.querySelector(`[data-star-id="${star.id}"]`)
    if (!starEl) return
    
    const starRect = starEl.getBoundingClientRect()
    const marioRect = mario.getBoundingClientRect()
    
    if (
      marioRect.left < starRect.right &&
      marioRect.right > starRect.left &&
      marioRect.top < starRect.bottom &&
      marioRect.bottom > starRect.top
    ) {
      collectStar(star.id)
    }
  })
}

document.getElementById('mario-canvas')?.addEventListener('mousemove', (e) => {
  handleMove(e.clientX, e.clientY)
})

document.getElementById('mario-canvas')?.addEventListener('touchmove', (e) => {
  e.preventDefault()
  if (e.touches.length > 0) {
    handleMove(e.touches[0].clientX, e.touches[0].clientY)
  }
}, { passive: false })

document.getElementById('start-game')?.addEventListener('click', startGame)
document.getElementById('reset-game')?.addEventListener('click', resetGame)

// ============================================
// TUNA BAN ZONE
// ============================================
document.getElementById('ban-tuna-btn')?.addEventListener('click', function(e) {
  tunaBannedCount++
  document.querySelector('#tuna-banned span').textContent = tunaBannedCount
  vibrate(100)
  
  this.classList.add('shake')
  setTimeout(() => this.classList.remove('shake'), 500)
  
  // Create explosion of anti-tuna particles
  const rect = e.target.getBoundingClientRect()
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      createParticle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        ['🚫', '✨', '💥', '⚡'][Math.floor(Math.random() * 4)],
        '#EF4444'
      )
    }, i * 50)
  }
})

// ============================================
// SKINCARE & YEPODA ZONE
// ============================================
document.querySelectorAll('.skincare-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    glowLevel = Math.min(glowLevel + 25, 100)
    vibrate(30)
    
    document.getElementById('glow-meter').style.width = glowLevel + '%'
    document.getElementById('glow-percentage').textContent = glowLevel + '%'
    
    const rect = this.getBoundingClientRect()
    createParticle(rect.left + rect.width / 2, rect.top, '✨', '#A855F7')
    createParticle(rect.left + rect.width / 2, rect.top, '💎', '#EC4899')
    
    if (glowLevel >= 100) {
      setTimeout(() => {
        alert('💫 GLOW MASSIMO RAGGIUNTO! Sei letteralmente luminosa! ✨')
        createConfetti(window.innerWidth / 2, 200)
      }, 300)
    }
  })
})

// ============================================
// FUN ZONE
// ============================================
document.getElementById('confetti-btn')?.addEventListener('click', function(e) {
  const rect = e.target.getBoundingClientRect()
  createConfetti(rect.left + rect.width / 2, rect.top)
  
  // Multiple confetti explosions
  setTimeout(() => createConfetti(Math.random() * window.innerWidth, 100), 300)
  setTimeout(() => createConfetti(Math.random() * window.innerWidth, 100), 600)
  setTimeout(() => createConfetti(Math.random() * window.innerWidth, 100), 900)
})

document.getElementById('rainbow-btn')?.addEventListener('click', function() {
  document.body.classList.toggle('rainbow-mode')
  
  setTimeout(() => {
    document.body.classList.remove('rainbow-mode')
  }, 5000)
})

document.getElementById('party-btn')?.addEventListener('click', function() {
  const isMobile = window.innerWidth < 640
  const catCount = isMobile ? 5 : 10
  
  // Spawn random floating cats
  for (let i = 0; i < catCount; i++) {
    setTimeout(() => {
      const cat = document.createElement('div')
      cat.className = 'floating-cat'
      cat.textContent = catEmojis[Math.floor(Math.random() * catEmojis.length)]
      cat.style.left = Math.random() * window.innerWidth + 'px'
      cat.style.top = Math.random() * window.innerHeight + 'px'
      
      document.getElementById('floating-cats').appendChild(cat)
      
      setTimeout(() => cat.remove(), 5000)
    }, i * 200)
  }
  
  // Party confetti
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createConfetti(Math.random() * window.innerWidth, Math.random() * 300)
    }, i * 300)
  }
})

// ============================================
// AMBIENT EFFECTS
// ============================================
// Random floating cats every 10 seconds
setInterval(() => {
  const cat = document.createElement('div')
  cat.className = 'floating-cat'
  cat.textContent = catEmojis[Math.floor(Math.random() * catEmojis.length)]
  cat.style.left = Math.random() * window.innerWidth + 'px'
  cat.style.top = Math.random() * 200 + 'px'
  cat.style.opacity = '0.6'
  
  document.getElementById('floating-cats').appendChild(cat)
  
  setTimeout(() => cat.remove(), 5000)
}, 10000)

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c💛 Ciao! Hai trovato la console! 🐱', 'font-size: 20px; color: #FCD34D; font-weight: bold;')
console.log('%cQuesta pagina è stata fatta con amore per una persona speciale! ✨', 'font-size: 14px; color: #F59E0B;')
console.log('%cP.S. Il tonno in scatola è ancora bandito anche qui 🚫', 'font-size: 12px; color: #EF4444;')



magicBtn.addEventListener('click', ()=>{
  const p = pickPhrase()
  animatePhrase(p)
  sweetLevel += 8 + Math.floor(Math.random()*8)
  updateSweetMeter()
  magicBtn.classList.add('pulse-once')
  // Effetto: gatto nero stilizzato animato
  const rect = magicBtn.getBoundingClientRect()
  const cat = document.createElement('img')
  cat.src = '/assets/cat.svg'
  cat.alt = 'Gatto magico'
  cat.className = 'magic-cat-effect'
  cat.style.position = 'fixed'
  cat.style.left = (rect.left + rect.width/2 - 32) + 'px'
  cat.style.top = (rect.top - 48) + 'px'
  cat.style.width = '64px'
  cat.style.height = '64px'
  cat.style.pointerEvents = 'none'
  document.body.appendChild(cat)
  setTimeout(()=>{
    cat.classList.add('jump')
    setTimeout(()=>cat.remove(), 1200)
  }, 30)
  setTimeout(()=>magicBtn.classList.remove('pulse-once'), 600)
  // show cat modal occasionally
  if(Math.random() < 0.16) showCatModal()
})



randomBtn.addEventListener('click', ()=>{
  const extra = Math.random() < 0.6 ? pickPhrase() : 'Ti penso sempre 💭'
  animatePhrase(extra)
  sweetLevel += 4
  updateSweetMeter()
  // Effetto Mario animato
  const rect = randomBtn.getBoundingClientRect()
  const mario = document.createElement('img')
  mario.src = '/assets/mario.svg'
  mario.alt = 'Mario Sorpresa'
  mario.className = 'magic-mario-effect'
  mario.style.position = 'fixed'
  mario.style.left = (rect.left + rect.width/2 - 48) + 'px'
  mario.style.top = (rect.top - 64) + 'px'
  mario.style.width = '96px'
  mario.style.height = '96px'
  mario.style.pointerEvents = 'none'
  mario.style.opacity = '1'
  document.body.appendChild(mario)
  setTimeout(()=>{
    mario.classList.add('jump')
    setTimeout(()=>mario.remove(), 1800)
  }, 30)
  // Frase visibile più a lungo
  phraseEl.classList.remove('opacity-0')
  phraseEl.style.transition = 'opacity 0.7s'
  setTimeout(()=>{ phraseEl.style.opacity = 0 }, 4000)
  if(Math.random() < 0.22) showCatModal()
})


colorBtn.addEventListener('click', ()=>{
  const body = document.body
  const variants = [
    'bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-50',
    'bg-gradient-to-b from-yellow-200 via-yellow-100 to-yellow-50',
    'bg-gradient-to-b from-yellow-100 via-yellow-200 to-yellow-100',
    'bg-gradient-to-b from-yellow-50 via-yellow-300 to-yellow-100',
    'bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-200',
    'bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200'
  ]
  let current = variants.findIndex(v => body.className.includes(v.split(' ')[1]))
  if(current === -1) current = 0
  const next = (current + 1) % variants.length
  body.className = variants[next] + ' text-slate-800'
})



emojiBtn.addEventListener('click', ()=>{
  // Stella molto grande
  spawnEmoji('⭐', 4200, '4.5rem')
  // Cuore in dissolvenza
  setTimeout(()=>{
    spawnEmoji('❤️', 3200, '3.2rem', true)
  }, 1200)
})


complimentBtn.addEventListener('click', ()=>{
  animatePhrase('Sei incredibile, non dimenticarlo 💌')
  sweetLevel += 6
  updateSweetMeter()
  // Frase visibile più a lungo
  phraseEl.classList.remove('opacity-0')
  phraseEl.style.transition = 'opacity 0.7s'
  setTimeout(()=>{ phraseEl.style.opacity = 0 }, 3200)
})

// --- emoji helper ---


function spawnEmoji(ch, duration=2600, fontSize='2.5rem', fade=false){
  const el = document.createElement('div')
  el.textContent = ch
  el.className = 'emoji-pop'
  el.style.fontSize = fontSize
  el.style.left = (20 + Math.random()*60)+'%'
  el.style.bottom = '20px'
  if(fade){
    el.style.opacity = '0'
    el.animate([
      {opacity:0, transform:'translateY(0) scale(1.2)'},
      {opacity:1, transform:'translateY(-40px) scale(1.3)'},
      {opacity:0, transform:'translateY(-120px) scale(1.1)'}
    ], {duration:duration, easing:'ease-in-out'})
    setTimeout(()=>el.remove(), duration)
  } else {
    document.body.appendChild(el)
    setTimeout(()=>el.remove(), duration)
  }
}

// --- modal ---
function showCatModal(){
  const src = blackCats[Math.floor(Math.random()*blackCats.length)]
  modalImg.src = src
  modal.style.display = 'flex'
  modal.setAttribute('aria-hidden', 'false')
}

function closeModal(){
  modal.style.display = 'none'
  modal.setAttribute('aria-hidden', 'true')
}

modal.addEventListener('click', (e)=>{
  if(e.target === modal) closeModal()
})

modalYes.addEventListener('click', ()=>{
  animatePhrase('Scegli bene: i gatti vincono sempre 😻')
  sweetLevel += 5
  updateSweetMeter()
  closeModal()
})

if(modalNo2) modalNo2.addEventListener('click', ()=>{
  animatePhrase('Eh già... la Mel ha la sua bellezza speciale 😅')
  closeModal()
})

// --- confetti ---
const confettiCanvas = document.getElementById('confetti-canvas')
const ctx = confettiCanvas.getContext('2d')
let confettiParticles = []

function resizeCanvas(){
  confettiCanvas.width = window.innerWidth
  confettiCanvas.height = window.innerHeight
}
window.addEventListener('resize', resizeCanvas)
resizeCanvas()

confettiBtn.addEventListener('click', ()=>{
  launchConfetti(80)
})

function launchConfetti(count=60){
  const colors = ['#FFD95A','#F7C248','#F6B200','#FFD6A6','#FFF3CC']
  for(let i=0;i<count;i++){
    confettiParticles.push({
      x: Math.random()*confettiCanvas.width,
      y: -10 - Math.random()*200,
      size: 6 + Math.random()*8,
      speedX: -2 + Math.random()*4,
      speedY: 2 + Math.random()*5,
      rotation: Math.random()*360,
      color: colors[Math.floor(Math.random()*colors.length)],
      tilt: Math.random()*20
    })
  }
  if(!confettiAnimating) animateConfetti()
}

let confettiAnimating = false
function animateConfetti(){
  confettiAnimating = true
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height)
  confettiParticles.forEach((p,i)=>{
    p.x += p.speedX
    p.y += p.speedY
    p.rotation += p.speedX
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation * Math.PI/180)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6)
    ctx.restore()
    if(p.y > confettiCanvas.height + 20) confettiParticles.splice(i,1)
  })
  if(confettiParticles.length>0) requestAnimationFrame(animateConfetti)
  else confettiAnimating = false
}

// initial state
updateSweetMeter()

// small accessibility: enable keyboard action
magicBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') magicBtn.click() })

// quick warm welcome on load
window.addEventListener('load', ()=>{
  animatePhrase('Benvenuta, Bea! Premi un pulsante 💛')
})

// --- Cat minigame ---
const gameArea = document.getElementById('game-area')
const catSprite = document.getElementById('cat-sprite')
const minigameSprites = [
  '/assets/cat.svg',
  '/assets/yoshi.svg'
]
const gameStart = document.getElementById('game-start')
const gameReset = document.getElementById('game-reset')
const gameTimerEl = document.getElementById('game-timer')
const gameScoreEl = document.getElementById('game-score')
const gameBestEl = document.getElementById('game-best')

let catGameInterval = null
let moveInterval = null
let spawnRate = 900
const gameDuration = 20
let remaining = gameDuration
let gameScore = 0

function safeNumber(v){ return Number(v) || 0 }
const storedBest = safeNumber(localStorage.getItem('bea_cat_best'))
if(gameBestEl) gameBestEl.textContent = storedBest

function placeCatRandom(){
  if(!gameArea || !catSprite) return
  // Alterna sprite tra gatto e Yoshi
  const sprite = minigameSprites[Math.floor(Math.random()*minigameSprites.length)]
  catSprite.src = sprite
  catSprite.alt = sprite.includes('yoshi') ? 'Yoshi' : 'Gatto realistico'
  const areaRect = gameArea.getBoundingClientRect()
  const catW = catSprite.offsetWidth || 64
  const catH = catSprite.offsetHeight || 64
  const padding = 8
  const maxLeft = Math.max(0, areaRect.width - catW - padding)
  const maxTop = Math.max(0, areaRect.height - catH - padding)
  const left = Math.round(Math.random() * maxLeft) + padding
  const top = Math.round(Math.random() * maxTop) + padding
  catSprite.style.left = left + 'px'
  catSprite.style.top = top + 'px'
  catSprite.style.transform = `scale(1) rotate(${Math.random()*20-10}deg)`
}

function onCatHit(e){
  e.preventDefault()
  if(!catGameInterval) return
  gameScore++
  gameScoreEl.textContent = gameScore
  catSprite.classList.add('cat-pop')
  setTimeout(()=>catSprite.classList.remove('cat-pop'), 320)
  placeCatRandom()
  // speed up a bit
  spawnRate = Math.max(350, 900 - gameScore*20)
  if(moveInterval) clearInterval(moveInterval)
  moveInterval = setInterval(placeCatRandom, spawnRate)
  // small celebration
  launchConfetti(14)
}

function startCatGame(){
  if(!gameArea || !catSprite) return
  resetCatGame()
  catSprite.style.display = 'block'
  placeCatRandom()
  gameStart.disabled = true
  gameScore = 0
  gameScoreEl.textContent = gameScore
  remaining = gameDuration
  gameTimerEl.textContent = remaining
  spawnRate = 900
  moveInterval = setInterval(placeCatRandom, spawnRate)
  catGameInterval = setInterval(()=>{
    remaining--
    gameTimerEl.textContent = remaining
    if(remaining <= 0){
      endCatGame()
    }
  },1000)
}

function endCatGame(){
  clearInterval(catGameInterval)
  clearInterval(moveInterval)
  moveInterval = null
  catGameInterval = null
  catSprite.style.display = 'none'
  gameStart.disabled = false
  const prevBest = safeNumber(localStorage.getItem('bea_cat_best'))
  if(gameScore > prevBest){
    localStorage.setItem('bea_cat_best', gameScore)
    if(gameBestEl) gameBestEl.textContent = gameScore
    animatePhrase(`Nuovo record: ${gameScore} 😻`)
  } else {
    animatePhrase(`Tempo! Hai fatto ${gameScore} punti 💛`)
  }
}

function resetCatGame(){
  clearInterval(catGameInterval)
  clearInterval(moveInterval)
  catSprite && (catSprite.style.display = 'none')
  gameStart && (gameStart.disabled = false)
  gameScore = 0
  gameScoreEl && (gameScoreEl.textContent = 0)
  remaining = gameDuration
  gameTimerEl && (gameTimerEl.textContent = remaining)
  const stored = safeNumber(localStorage.getItem('bea_cat_best'))
  if(gameBestEl) gameBestEl.textContent = stored
}

if(gameStart) gameStart.addEventListener('click', startCatGame)
if(gameReset) gameReset.addEventListener('click', resetCatGame)
if(catSprite) catSprite.addEventListener('pointerdown', onCatHit)

// make sure the game resizes nicely on orientation change
window.addEventListener('orientationchange', ()=>{ if(catGameInterval) placeCatRandom() })
