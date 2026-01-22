# beafidanzatina 💛

Sito semplice creato per Bea con Vite + Tailwind + Vanilla JS.

Caratteristiche principali
- Colori caldi e gialli, font amichevole (Poppins)
- Sezioni interattive con frasi che cambiano
- Popup a sorpresa con foto di gatti neri che chiedono: "Sono più belli della Mel?"
- Effetti divertenti: confetti, emoji, animazioni leggere
- Ottimizzato per smartphone (specialmente Android)

Installazione
1. Assicurati di avere Node.js (>=16) e npm installati
2. Apri terminale nella cartella del progetto

```bash
npm install
npm run dev
```

Nota sulle immagini
- Le immagini de "i gatti neri" sono collegate da Unsplash per comodità; se vuoi aggiungere foto personali, sostituisci gli URL in `src/main.js` con i tuoi file locali o link.

Personalizza
- Modifica frasi in `src/main.js` (array `phrases`)
- Cambia colori in `tailwind.config.cjs` e `src/style.css`

Anteprima su smartphone 📱
- Avvia Vite esponendo l'host: `npm run dev -- --host`
- Apri sul telefono (stessa rete Wi‑Fi): `http://172.20.10.8:5173/`
- Scansiona il QR generato: apri `http://172.20.10.8:5173/qr.html` sul tuo PC e scansiona l'immagine col telefono

Pubblicazione su GitHub Pages 🌐
- Ho aggiunto un workflow GitHub Action (`.github/workflows/deploy.yml`) che automaticamente compila (`npm run build`) e pubblica la cartella `dist` su `gh-pages` quando fai push su `main`.
- Ho aggiornato `CNAME` a `www.beafidanzatina.it` per il dominio personalizzato. Assicurati che il record DNS `CNAME www` punti a `mattiamo23.github.io` oppure segui le istruzioni del tuo provider per il dominio apex (A record a indirizzi GitHub Pages) e poi abilita HTTPS nelle impostazioni GitHub Pages.
- Dopo il primo deploy, GitHub Pages impiega qualche minuto per attivare il sito e generare il certificato HTTPS.

Buon divertimento e manda feedback a Mattia (o direttamente alla Bea 💛)!