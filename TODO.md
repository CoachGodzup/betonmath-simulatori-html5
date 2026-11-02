# TODO / Roadmap

## Layout mobile dedicato (priorità alta)

Il sito **regge** il responsive (nessuno scroll orizzontale a 390/768/1280 px),
ma **non è pensato per il mobile**: prima di arrivare al gioco c'è troppa
informazione in cima (header + barra "modulo/slide/scheda" + intro + statistiche).
Da rivedere:

- [ ] **Header compatto** su mobile: logo più piccolo, titolo su una riga,
      navigazione in una riga separata (o menu a scomparsa).
- [ ] **Barra lezione** (`Modulo · Slide · Scheda · Lezione`) più leggera:
      collassabile o con sole icone/etichette brevi.
- [ ] Portare **il gioco sopra la piega** (sopra il fold) e spostare
      statistiche e grafici sotto.
- [ ] Ridurre tipografia e spaziature su viewport `< 600px`.
- [ ] Verificare i target di tocco (≥ 44 px) su bottoni e controlli.

## Altre idee

- [ ] PWA / service worker per l'uso in aula senza rete.
- [ ] Accessibilità: contrasti, focus visibile, `aria-label` sui pulsanti,
      navigazione da tastiera.
- [ ] Valutare un tema scuro per l'uso con proiettore/aula buia.
