# Issues — Piattaforma Retrospettiva Agile MVP

Vertical slices (tracer bullets) derivati dal PRD v1.0.

## Dipendenze

```
0 ──┐
    ├── 3 ── 4 ── 5 ── 6 ── 8
1 ──┘         
2 ──┘
7 ──────────────────────────── 8
0 ──────────────────────────── 9
6 ──────────────────────────── 9
```

Tracce parallele disponibili da subito: **0, 1, 7**.

---

## Slice 0 — Realtime Technology Decision

**Tipo:** HITL  
**Blocked by:** nessuno

### What to build

Decisione architetturale sulla tecnologia realtime da adottare (Socket.io, Supabase Realtime, Pusher o soluzione custom). La scelta deve considerare costo, scalabilità orizzontale, complessità operativa e gestione connessioni persistenti.

### Acceptance criteria

- [ ] Tecnologia selezionata e documentata con motivazione
- [ ] Implicazioni di scalabilità orizzontale valutate
- [ ] Costo operativo stimato
- [ ] Decisione condivisa con il team tecnico e archiviata (ADR o equivalente)

---

## Slice 1 — Team Management

**Tipo:** AFK  
**Blocked by:** nessuno  
**User stories:** US-01, US-02, US-03, US-04, US-05, US-06, US-07

### What to build

CRUD completo dei team: creazione con nome, aggiunta e rimozione di membri selezionati dalla lista utenti registrati, rinomina. Schema many-to-many `user ↔ team` implementato dal day 1. Un utente può appartenere a più team; la lista dei propri team è visibile dalla dashboard.

### Acceptance criteria

- [ ] Team leader può creare un team con nome
- [ ] Team leader può aggiungere e rimuovere membri
- [ ] Team leader può rinominare il team in qualsiasi momento
- [ ] Uno stesso utente può appartenere a più team contemporaneamente
- [ ] Ogni utente vede la lista dei team a cui appartiene
- [ ] Solo il team leader può gestire il team (validazione ruolo lato server)

---

## Slice 2 — Session Launch & Join

**Tipo:** AFK  
**Blocked by:** Slice 1  
**User stories:** US-08, US-09, US-10, US-11

### What to build

Il team leader lancia una nuova retrospettiva per uno dei suoi team con un singolo click e assegna un titolo (es. "Retro Sprint 24"). I membri del team vedono la sessione attiva sulla dashboard e possono entrarvi con un click. La sessione viene inizializzata nella fase `collection`.

### Acceptance criteria

- [ ] Team leader lancia sessione con un click su un team preconfigurato
- [ ] Sessione creata con titolo assegnato e fase iniziale `collection`
- [ ] Membri del team vedono indicatore "sessione attiva" sulla dashboard
- [ ] Partecipante entra nella sessione attiva con un click senza configurazioni aggiuntive
- [ ] Non è possibile avere più sessioni attive contemporaneamente sullo stesso team

---

## Slice 3 — Phase 1: Post-it Collection with Anonymity

**Tipo:** AFK  
**Blocked by:** Slice 0, Slice 2  
**User stories:** US-12, US-13, US-14, US-15, US-16, US-17

### What to build

Il facilitatore apre la fase di raccolta. I partecipanti scrivono post-it nelle colonne Start, Stop, Continue; i propri post-it sono visibili solo a sé stessi e al facilitatore (con autore), invisibili agli altri partecipanti. I partecipanti possono modificare o eliminare i propri post-it durante la fase. Le azioni si propagano in realtime. Il facilitatore chiude manualmente la fase per avanzare.

### Acceptance criteria

- [ ] Facilitatore apre la fase di raccolta
- [ ] Partecipante crea post-it in Start, Stop o Continue
- [ ] Post-it visibili solo all'autore e al facilitatore durante la raccolta
- [ ] Autore visibile al facilitatore, nascosto agli altri partecipanti
- [ ] Partecipante modifica o elimina i propri post-it durante la raccolta
- [ ] Facilitatore vede in realtime tutti i post-it con autore
- [ ] Facilitatore chiude la fase e la sessione avanza alla successiva
- [ ] **Test — Session Lifecycle:** transizioni valide `launch → collection`; transizioni non valide respinte; solo il facilitatore può avanzare
- [ ] **Test — Realtime Sync:** i subscriber ricevono eventi postit; non-membri non ricevono broadcast

---

## Slice 4 — Phase 2: Reveal & Dot Voting + Phase 3: Discussion View

**Tipo:** AFK  
**Blocked by:** Slice 3  
**User stories:** US-18, US-19, US-20, US-21, US-22, US-23, US-24, US-25, US-26, US-27

### What to build

All'apertura della fase di votazione tutti i post-it vengono rivelati con autore visibile a tutti. Ogni partecipante dispone di 3 voti distribuibili liberamente (anche più di uno sullo stesso post-it); può revocare un voto per riallocarlo. Il quarto voto viene respinto dal server. I conteggi si aggiornano in realtime. Il facilitatore chiude la votazione e avanza alla discussione: i post-it appaiono ordinati per voti decrescenti con autore e voti visibili. Il facilitatore avanza manualmente agli action items.

### Acceptance criteria

- [ ] Apertura fase votazione: tutti i post-it rivelati con autore
- [ ] Partecipante assegna fino a 3 voti totali, distribuibili liberamente
- [ ] Più voti dello stesso partecipante sullo stesso post-it consentiti entro budget
- [ ] Il quarto voto è respinto dal server con errore esplicito
- [ ] Partecipante revoca un voto e il budget torna disponibile
- [ ] Conteggio voti per post-it aggiornato in realtime per tutti
- [ ] Facilitatore chiude la votazione e avanza alla discussione
- [ ] Fase discussione: post-it ordinati per voti decrescenti, autore e voti visibili
- [ ] Facilitatore avanza manualmente dalla discussione agli action items
- [ ] **Test — Voting:** budget 3 voti; multi-voto stesso post-it; rifiuto voto 4; revoca; voti su post-it inesistenti respinti; conteggio aggregato coerente
- [ ] **Test — Session Lifecycle:** transizioni `collection → voting → discussion → action_items`; salto di fase respinto
- [ ] **Test — Realtime Sync:** eventi `postit-revealed`, `vote-updated` ricevuti dai subscriber

---

## Slice 5 — Phase 4: Action Items

**Tipo:** AFK  
**Blocked by:** Slice 4  
**User stories:** US-28, US-29, US-30, US-31

### What to build

Il facilitatore inserisce, modifica ed elimina action items in formato testo libero durante la fase finale. I partecipanti vedono gli action items aggiornarsi in realtime mentre il facilitatore scrive.

### Acceptance criteria

- [ ] Facilitatore aggiunge uno o più action items in testo libero
- [ ] Facilitatore modifica o elimina un action item prima della chiusura
- [ ] Partecipanti vedono gli action items in realtime mentre il facilitatore scrive
- [ ] **Test — Realtime Sync:** eventi `action-item-changed` ricevuti dai subscriber

---

## Slice 6 — Session Closure & Recap Composition

**Tipo:** AFK  
**Blocked by:** Slice 5, Slice 7 (meme placeholder sblocca)  
**User stories:** US-32, US-36, US-37, US-38 + parziale US-33, US-34, US-35

### What to build

Il facilitatore chiude esplicitamente la sessione. Il sistema compone il recap (post-it per colonna con autore e voti, top-3 più votati con tie-break per data creazione, action items, meme casuale dalla libreria). Il recap viene persistito e visualizzato in-app. La sessione viene archiviata nello storico del team in sola lettura, segregato per team.

### Acceptance criteria

- [ ] Facilitatore chiude la sessione con azione esplicita
- [ ] Recap generato con: data, partecipanti, post-it per colonna (autore + voti), top-3 più votati, action items, meme
- [ ] Post-it nel recap ordinati per voti decrescenti per colonna
- [ ] Top-3 gestisce i pareggi (tie-break: ordine cronologico di creazione)
- [ ] Recap visibile in-app a tutti i membri del team
- [ ] Sessione archiviata nello storico; consultabile in sola lettura
- [ ] Storico segregato per team (un team non vede le retro di un altro)
- [ ] **Test — Recap Composition:** tutti i campi presenti; ordinamento corretto; tie-break top-3; sessione vuota non genera errore; meme selezionato casualmente
- [ ] **Test — Session Lifecycle:** transizione `action_items → closed`; stato sessione persistente e recuperabile

---

## Slice 7 — Meme Library Curation

**Tipo:** HITL  
**Blocked by:** nessuno

### What to build

Curazione di 15–20 meme a tema agile/team. Decisione su: diritti d'uso delle immagini, modalità di hosting (inline base64 vs link esterno), modalità di inclusione nell'email (rilevante per Slice 8).

### Acceptance criteria

- [ ] Almeno 15 meme selezionati con diritti d'uso verificati
- [ ] Hosting deciso (interno vs link esterno)
- [ ] Modalità di inclusione nell'email definita (base64 inline vs link)
- [ ] Asset disponibili per l'integrazione nello Slice 6

---

## Slice 8 — Email Delivery

**Tipo:** HITL → AFK  
**Blocked by:** Slice 6, Slice 7, decisione tecnica delivery  
**User stories:** US-33, US-34, US-35

### What to build

**HITL:** IT + team tecnico decidono il meccanismo di consegna email (SMTP aziendale, Microsoft Graph API, Gmail API, provider esterno). Configurazione SPF/DKIM sul dominio aziendale. Stima del rate limit rispetto ai volumi previsti (picco lunedì post sprint review).

**AFK:** implementazione dell'invio del recap già composto (Slice 6) a tutti i partecipanti della sessione, incluso meme.

### Acceptance criteria

- [ ] Meccanismo di delivery selezionato e documentato
- [ ] SPF/DKIM configurato sul dominio aziendale
- [ ] Rate limit stimato e ritenuto adeguato ai volumi previsti
- [ ] Email inviata a tutti i partecipanti alla chiusura della sessione
- [ ] Email contiene: data, partecipanti, post-it per colonna con autore e voti, top-3, action items, meme
- [ ] Email non finisce in spam (verificato con strumento di deliverability)

---

## Slice 9 — Resilience & Late Join

**Tipo:** AFK  
**Blocked by:** Slice 0, Slice 6  
**User stories:** US-39, US-40

### What to build

Un partecipante che si disconnette e rientra trova lo stato completo (post-it scritti, voti dati, fase corrente) ricostruito dal server senza ricaricare manualmente. Un partecipante che entra in ritardo riceve lo stato attuale filtrato secondo le regole della fase corrente (anonimato in raccolta, reveal in votazione, ecc.).

### Acceptance criteria

- [ ] Partecipante che rientra dopo disconnessione vede post-it, voti e fase corrente invariati
- [ ] Late joiner riceve stato corretto filtrato per fase (es. post-it anonimi se fase è collection)
- [ ] Disconnessione di un client non degrada il servizio per gli altri partecipanti
- [ ] Utenti non membri del team non ricevono i broadcast della sessione
- [ ] **Test — Realtime Sync:** recovery dopo disconnessione; late join con stato coerente; isolamento non-membri
