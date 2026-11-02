# BetOnMath — simulatori didattici da Android a HTML5

Conversione in **HTML5** delle app Android del progetto **BetOnMath**
(Politecnico di Milano / MOX), non più compatibili con le versioni recenti di
Android. Le app girano oggi in qualsiasi browser, su computer e smartphone,
senza installazione.

> Conversione realizzata a partire dalle APK originali, con l'autorizzazione dei
> gestori del sito BetOnMath.

---

## Provenienza degli APK (traccia)

Le APK sono state scaricate dalla pagina **«Materiale didattico»** del sito:

- Pagina di origine: <https://betonmath.polimi.it/?p=2972>

URL diretti dei file (cartella `wp-content/apps/`):

| App | URL originale |
|-----|---------------|
| Testa o Croce? | <https://betonmath.polimi.it/wp-content/apps/testacroce.apk> |
| Gratta e Perdi | <https://betonmath.polimi.it/wp-content/apps/grattaeperdi.apk> |
| Gioco Equo | <https://betonmath.polimi.it/wp-content/apps/giocoequo.apk> |
| Open Slot | <https://betonmath.polimi.it/wp-content/apps/openslot.apk> |
| Legge dei Grandi Numeri | <https://betonmath.polimi.it/wp-content/apps/grandinumeri.apk> |

I file scaricati sono conservati in [`apk/`](apk/) per tracciabilità.

App correlate sul sito:

- Testa o Croce (versione online): <https://betonmath.polimi.it/?page_id=1951>
- Slide dei moduli e schede di gruppo: sezione «Materiale didattico»
  (<https://betonmath.polimi.it/?p=2972>)

---

## Contenuto del repository

```
betonmath/
├── apk/                    # le 5 APK originali scaricate dal sito
├── html5/                  # la conversione HTML5 (il risultato)
│   ├── index.html          # pagina indice: simulatori + moduli/schede
│   ├── style.css           # CSS centralizzato (tutte le pagine)
│   ├── assets/             # immagini condivise (logo, footer MOX/Polisocial/FDS)
│   ├── screenshots/        # screenshot di riferimento
│   ├── testacroce/         # index.html + app.js + assets/
│   ├── grandinumeri/       # index.html + app.js + assets/
│   ├── grattaeperdi/       # index.html + app.js + assets/
│   ├── giocoequo/          # index.html + app.js + assets/
│   └── openslot/           # index.html + app.js + assets/
├── README.md
└── .gitignore
```

Ogni app è composta da `index.html` (markup), `app.js` (logica) e una cartella
`assets/` con le immagini estratte dall'APK. **Nessun CSS o JavaScript è
inline**: tutto lo stile è in `html5/style.css`, tutta la logica nei rispettivi
`app.js`.

---

## Le app

| App | Modulo | Cosa fa |
|-----|--------|---------|
| **Testa o Croce?** (`testacroce`) | 1 · Messaggi insidiosi | Due monete; tre giocatori scommettono su *2 Teste*, *2 Croci*, *1 Testa e 1 Croce*. Le frequenze convergono a 25% / 25% / 50%. |
| **Legge dei Grandi Numeri** (`grandinumeri`) | 10 · Misconcetti matematici | Una moneta lanciata molte volte: la frequenza tende al 50%, mentre la differenza teste−croci cresce come √N. |
| **Gratta e Perdi** (`grattaeperdi`) | 4 · Premio medio | Biglietti gratta e vinci con la distribuzione reale dei premi. Include la schermata *Sommario*. |
| **Gioco Equo** (`giocoequo`) | 5 · Gioco equo | Due dadi e una tabella di premi modificabile. Un gioco è equo quando Σ(premio × probabilità) = costo. |
| **Open Slot** (`openslot`) | 6 · Combinatoria I | Slot machine a tre rulli; il ritorno atteso è circa il 73%. |

Ogni pagina è collegata alla **lezione** (categoria del modulo) e ai materiali:
slide del modulo e, dove prevista, scheda di gruppo. La pagina indice contiene
anche la tabella completa dei 10 moduli con i collegamenti a slide e schede.

---

## Stile

Il foglio `html5/style.css` è allineato al tema del sito originale:

- font **Open Sans** (testo) e **Bitter** (titoli);
- link in rosso scuro `#8b1813` sottolineati;
- intestazione `#f6f6f6`, corpo bianco su contorno 960 px;
- **footer originale riciclato** (`#bfbfbf`): Sostenuto da *Polisocial*,
  In collaborazione con **MOX — Politecnico di Milano** e *FDS*.

---

## Note tecniche sulla ricostruzione

Le APK sono state prodotte con **MIT App Inventor** (package
`appinventor.ai_nicoparo.*`). La logica a blocchi è compilata in Scheme (Kawa)
dentro `classes.dex`; il comportamento è stato ricostruito decompilando il
codice (androguard) e leggendo costanti, componenti e immagini.

**Dati recuperati con certezza dall'APK:**

- **Testa o Croce**: due monete, tre esiti; conteggi e percentuali.
- **Legge dei Grandi Numeri**: una moneta; % teste/croci; differenza T−C.
- **Gratta e Perdi**: distribuzione **esatta** dei premi su 30.000.000 di
  biglietti (0 € → 18.452.220; 5 € → 8.610.000; …; 500.000 € → 5). Valore
  atteso = **3,5 €**; P(vincita) ≈ **38,5%**. Costo biglietto **5 €**
  (confermato dall'asset `0euro.png`, che recita «perdi 5 euro»): ritorno 70%.
- **Gioco Equo**: due dadi, categorie di somma, equità stimata/teorica.
- **Open Slot**: tre rulli, 1/9 di probabilità di lingotto per rullo; premi
  1 € / 10 € / 100 €; ritorno atteso = (192·1 + 24·10 + 1·100)/729 ≈ **73%**.

**Scelte dichiarate (non univoche nell'APK):**

- **Gioco Equo**: tabella premi predefinita *equa* (equità = 1), coerente col
  nome del gioco; i premi restano modificabili e «Rendi equo» ricalcola.
- **Gratta e Perdi**: costo del biglietto modificabile (predefinito 5 €).
- I totali persistenti che nell'originale usavano *TinyDB* non sono replicati:
  i contatori ripartono da zero a ogni apertura.

---

## Uso e pubblicazione

Nessun server richiesto: aprire `html5/index.html` in un browser. Per la
pubblicazione è sufficiente copiare la cartella `html5/` su un web server
statico; ogni app funziona anche da sola, purché si mantenga la sua cartella
`assets/` e il riferimento a `../style.css`.

---

## Crediti

Materiale didattico del progetto **BetOnMath** — Politecnico di Milano
(<https://betonmath.polimi.it/>), in collaborazione con **MOX** e **FDS**.
Conversione HTML5 realizzata a partire dalle APK originali, con autorizzazione
dei gestori del sito.
