# IDAL · Italiana Distribuzione Alimenti

Sito di **I.D.AL srl**, Benevento: *food, our family passion*.

Segue il layout della presentazione (Home, Chi siamo, Prodotti, Certificazioni, Contatti) con i testi originali, e mostra le **307 referenze a marchio IDAL** del Catalogo 2026 (solo i codici `IDA…`; le altre marche del catalogo sono escluse).

| Sezione | Cosa succede |
|---|---|
| **Bilancia** | All'apertura una bilancia digitale pesa 1.700.000 kg (i kg movimentati in un anno), poi una tenda tricolore si apre. Solo alla prima visita della sessione |
| **Home** | "**I**taliana **D**istribuzione **Al**imenti": le iniziali entrano nei colori del logo e le parole si srotolano. Le due foto del layout (caseari e salumi) e alcuni prodotti veri fluttuano con il mouse |
| **Le 8 tessere** | Le icone colorate del layout: al passaggio si allargano e mostrano quante referenze ha la linea; un clic filtra il catalogo |
| **Nastro trasportatore** | Due file di prodotti veri che scorrono in versi opposti e accelerano quando scorri la pagina |
| **IDAL in breve** | Il Marchio, lo Stabilimento (mappa della Campania con Benevento) e i dati societari, come nella slide 2 |
| **La nostra storia** | Una mappa d'Italia che segue il racconto: Durazzano e il latte negli anni '50, i siti produttivi in tutta Italia, il 1988 e i formaggi DOP, gli 8 comparti, i 2.700 punti vendita in Campania, Molise, Puglia e Basilicata |
| **I numeri** | Contatori animati e un contatore dal vivo: "da quando sei qui IDAL ha movimentato X kg", paragonati a prodotti veri del catalogo |
| **La nostra filosofia** | Il testo si accende parola per parola scorrendo; Produttore → IDAL → Consumatore |
| **Prodotti** | Le 7 linee scorrono in orizzontale, ognuna nel suo colore, con il testo del layout e quattro prodotti |
| **Catalogo** | Ricerca per nome o codice, filtri per linea e tipologia, scheda prodotto (frecce ← → per sfogliare) |
| **La mia lista** | Un punto vendita può raccogliere referenze e inviare una richiesta di informazioni già compilata, o copiare l'elenco |
| **Certificazioni** | Il sigillo ISO 9001:2015 che ruota e le fasi certificate |
| **Contatti** | Numero verde, modulo che apre la posta già compilata, mappa Google caricata solo su richiesta |

In più: scrivendo **idal** sulla tastiera, cliccando 5 volte il logo o premendo il pulsante rosso nel footer (che dice di non premerlo) piovono prodotti.

Niente framework e niente build: HTML, CSS e JavaScript puri. Funziona da telefono, con la tastiera e con `prefers-reduced-motion`.

## Sicurezza e velocità

- **Content Security Policy** rigida (nel `<meta>` di `index.html`): script, stili, font e immagini solo dal sito stesso; nessuno script o stile inline; nessun invio di moduli verso l'esterno. L'unica eccezione è l'iframe di Google Maps, che si carica solo se l'utente lo chiede, in un iframe isolato (`sandbox`).
- **Nessuna richiesta a terze parti** all'apertura: i font sono serviti dal sito (`assets/fonts/`), non da Google Fonts.
- Tutto il testo inserito nella pagina passa da `esc()`; la lista salvata nel browser viene ricontrollata a ogni apertura (solo codici esistenti).
- Ogni parte del sito si avvia da sola: se una si rompe, le altre continuano a funzionare. Senza JavaScript la pagina resta leggibile.
- Animazioni continue in pausa quando non si vedono, un solo gestore di scroll, immagini in due misure (`prodotti/s/` per le griglie).
- Dopo una modifica a CSS o JS, aumentare il numero `?v=` in `index.html`, così i browser scaricano la versione nuova.

## Struttura

```
index.html
assets/css/style.css
assets/js/main.js        logica del sito
assets/js/prodotti.js    le 307 referenze IDAL (codice, nome, formato, linea, tipologia, origine)
assets/js/mappa.js       confini regionali semplificati per le mappe
assets/img/              logo, icone delle linee, foto, prodotti/IDAxxxx.webp (+ miniature in prodotti/s/)
assets/fonts/            font serviti dal sito
tools/                   script usati per estrarre i dati dal catalogo PDF e dalla presentazione
```

## Aggiornare il catalogo

I prodotti sono in `assets/js/prodotti.js`, uno per riga:

```js
{"c":"IDA0150","n":"Insalata Iceberg","f":"250g × 6","k":"ortofrutta","s":"IV Gamma"}
```

- `c` codice · `n` nome · `f` formato · `k` linea (`caseari`, `salumi`, `pasta`, `forno`, `ortofrutta`, `conserve`, `ittico`) · `s` tipologia · `o` origine (facoltativa)
- La foto va in `assets/img/prodotti/<codice>.webp` (max 420 px) e la miniatura in `assets/img/prodotti/s/<codice>.webp` (280 px). Se manca, aggiungere `"x":1` e verrà mostrata l'icona della linea.

Per rigenerare tutto da un nuovo PDF del catalogo, gli script in `tools/` vanno lanciati in ordine (`parse.py`, `crop.py`, `prod.py`) passando la cartella di lavoro con il PDF renderizzato (`pdftotext -bbox` e `pdftoppm -r 220`).

## Pubblicare

È un sito statico: basta GitHub Pages (Settings → Pages → branch e cartella `/`) o qualsiasi hosting statico.

---

Confini regionali: [openpolis/geojson-italy](https://github.com/openpolis/geojson-italy) (CC BY 4.0). Font: Fraunces, Manrope e JetBrains Mono (SIL Open Font License), serviti dal sito.
