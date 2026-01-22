
import '../src/style.css'
// SVG ora serviti da public/assets

// --- content & assets ---
const phrases = [
  "Sei il mio raggio di sole ☀️",
  "Con te ogni giorno è una festa 🎉",
  "Bea, il tuo sorriso vale più di mille stelle ✨",
  "Sei la mia canzone preferita 🎶",
  "Il mio posto felice è accanto a te 💛",
  "Ogni tuo messaggio è un piccolo tesoro 💌",
  "Sii sempre te stessa, sei perfetta così 🌼"
]

const blackCats = [
  // immagini da Unsplash (liberamente linkabili)
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=3d3b64f6c1f9cd5ef4b6d7a2fc4c9b66',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=7f69b3b5d131b8d5f9c4f6aaa30f2a9d',
  'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=7a8f5c0d3e9d6b2be4d1f2f6d3a2b4c5'
]

// --- DOM ---
const phraseEl = document.getElementById('phrase')
const magicBtn = document.getElementById('magic-btn')
const randomBtn = document.getElementById('random-btn')
const sweetMeterInner = document.querySelector('#sweet-meter > div')
const colorBtn = document.getElementById('color-btn')
const emojiBtn = document.getElementById('emoji-btn')
const confettiBtn = document.getElementById('confetti-btn')
const complimentBtn = document.getElementById('compliment-btn')
const modal = document.getElementById('modal')
const modalImg = document.getElementById('modal-img')
const modalYes = document.getElementById('modal-yes')
const modalNo = modal.querySelector('button[aria-hidden]')
const modalNo2 = document.getElementById('modal-no') // fallback

let sweetLevel = 40 // percent

function pickPhrase(){
  return phrases[Math.floor(Math.random()*phrases.length)]
}

function animatePhrase(text){
  phraseEl.classList.remove('opacity-0')
  phraseEl.style.opacity = 0
  phraseEl.textContent = text
  phraseEl.animate([{opacity:0, transform:'translateY(6px)'}, {opacity:1, transform:'translateY(0)'}], {duration:360, easing:'ease-out'})
}

function updateSweetMeter(){
  sweetMeterInner.style.width = Math.min(100, sweetLevel) + '%'
}



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
  mario.src = '/assets/mario.png'
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

let gameInterval = null
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
  if(!gameInterval) return
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

function startGame(){
  if(!gameArea || !catSprite) return
  resetGame()
  catSprite.style.display = 'block'
  placeCatRandom()
  gameStart.disabled = true
  gameScore = 0
  gameScoreEl.textContent = gameScore
  remaining = gameDuration
  gameTimerEl.textContent = remaining
  spawnRate = 900
  moveInterval = setInterval(placeCatRandom, spawnRate)
  gameInterval = setInterval(()=>{
    remaining--
    gameTimerEl.textContent = remaining
    if(remaining <= 0){
      endGame()
    }
  },1000)
}

function endGame(){
  clearInterval(gameInterval)
  clearInterval(moveInterval)
  moveInterval = null
  gameInterval = null
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

function resetGame(){
  clearInterval(gameInterval)
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

if(gameStart) gameStart.addEventListener('click', startGame)
if(gameReset) gameReset.addEventListener('click', resetGame)
if(catSprite) catSprite.addEventListener('pointerdown', onCatHit)

// make sure the game resizes nicely on orientation change
window.addEventListener('orientationchange', ()=>{ if(gameInterval) placeCatRandom() })
