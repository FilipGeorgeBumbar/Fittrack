# FitTrack — Documentație Tehnică Completă
**Student: Filip Bumbar | Materie: MPP (Metode de Proiectare a Programelor)**

---

## Prezentare Generală

FitTrack este o aplicație web full-stack pentru monitorizarea antrenamentelor sportive. Sistemul permite utilizatorilor să creeze, editeze, și șteargă antrenamente, să adauge exerciții la fiecare antrenament, să vadă statistici în timp real, și să comunice între ei printr-un chat comunitar.

### Tehnologii utilizate (Stack Complet)

| Nivel | Tehnologie | Scop |
|-------|-----------|------|
| Frontend | React 18, Vite 8 | Interfața utilizator (SPA) |
| State Management | Apollo Client (InMemoryCache) | Gestionarea datelor și cache-ului GraphQL |
| Comunicare API | GraphQL (Apollo) | Interogări și mutații pentru date CRUD |
| Comunicare Real-time | Socket.io (WebSockets) | Chat în timp real |
| Backend Framework | Node.js, Express | Server HTTP și middleware |
| API Server | Apollo Server | Procesarea cererilor GraphQL |
| Bază de date relațională | SQLite | Persistența datelor de business |
| ORM | Prisma | Maparea obiect-relațional, migrații automate |
| Bază de date NoSQL | MongoDB (in-memory via mongodb-memory-server) | Persistența mesajelor de chat |
| ODM (NoSQL) | Mongoose | Schema și operații pentru MongoDB |
| Testare | Vitest | Teste unitare frontend și backend |

### Arhitectura de Sistem

Aplicația urmează un model **Client-Server** cu separare clară a responsabilităților:

- **Clientul (Frontend)** este o aplicație React servită de Vite. Comunică cu backend-ul prin două canale: GraphQL (pentru date CRUD) și WebSockets (pentru chat real-time).
- **Serverul (Backend)** este o aplicație Node.js cu Express care expune un endpoint GraphQL pe `/graphql`, rute REST pe `/auth` pentru autentificare, și un server Socket.io pentru comunicații bi-direcționale.
- **Bazele de date** sunt două: SQLite (relațională, pentru utilizatori, antrenamente, exerciții, log-uri de audit, roluri și permisiuni) și MongoDB (NoSQL, pentru mesajele de chat).

---

## Assignment 2 — Gold Challenge

### Cerința 1: Reimplementare cu GraphQL

Am înlocuit complet interfața REST API cu o interfață **GraphQL**, expusă pe endpoint-ul `/graphql`.

**Schema GraphQL** (fișierul `server/src/schema.js`) definește următoarele tipuri și operații:

- **Tipuri de date**: `Workout`, `Exercise`, `User`, `PaginatedWorkouts`
- **Queries** (citire):
  - `getWorkouts(offset, limit, filter, sort)` — returnează o listă paginată de antrenamente cu suport pentru filtrare (după tip, status) și sortare (după dată, durată, nume). Returnează și numărul total de rezultate pentru a ști câte pagini mai sunt.
  - `getWorkoutById(id)` — returnează un singur antrenament cu toate exercițiile asociate.
  - `getSuspiciousUsers` — returnează lista utilizatorilor marcați ca suspecți (folosit la Gold).
- **Mutations** (scriere):
  - `addWorkout`, `updateWorkout`, `deleteWorkout` — operații CRUD pentru antrenamente.
  - `addExercise`, `updateExercise`, `deleteExercise` — operații CRUD pentru exerciții.

**Pe frontend**, am integrat **Apollo Client** (fișierul `src/main.jsx`). Am configurat:
- Un `httpLink` care trimite cererile GraphQL către server.
- Un `authLink` care interceptează fiecare cerere și atașează automat ID-ul utilizatorului logat în header-ul `authorization`. Acest mecanism permite serverului să știe cine face cererea, fără ca utilizatorul să fie conștient de acest lucru.
- Un `InMemoryCache` cu politici de merge personalizate (`typePolicies`) care permit acumularea rezultatelor de la infinite scroll fără a pierde datele deja încărcate.

### Cerința 2: Infinite Scroll cu Prefetching

Am implementat un mecanism de **Infinite Scroll** pe pagina de Dashboard (fișierul `src/pages/Dashboard.jsx`).

Funcționarea este următoarea:
1. La prima încărcare, se face un query GraphQL cu `offset: 0` și `limit: 4` (se aduc primele 4 antrenamente).
2. Am folosit librăria `react-intersection-observer` pentru a detecta când ultimul element din listă devine vizibil pe ecran. Am configurat un `rootMargin` de `100px`, ceea ce înseamnă că detectarea se face cu 100 de pixeli înainte ca elementul să fie efectiv vizibil — acesta este mecanismul de **prefetching**.
3. Când observerul se activează, se apelează `fetchMore()` din Apollo Client cu un `offset` egal cu numărul de rezultate deja încărcate. Apollo concatenează automat noile rezultate cu cele existente datorită funcției `merge` definite în `typePolicies`.
4. Procesul se oprește automat când `paginatedWorkouts.length >= totalItems`.

Rezultatul: utilizatorul vede datele care se încarcă fluid, fără butoane de paginare și fără timpi de așteptare vizibili.

### Cerința 3: Relație 1-la-N (One-to-Many)

Am implementat o relație ierarhică între entitățile `Workout` și `Exercise`:
- Un **Workout** (antrenament) poate conține **mai multe Exercise** (exerciții).
- Relația este definită în schema Prisma cu `exercises Exercise[]` pe modelul Workout și `workout Workout @relation(...)` pe modelul Exercise, cu `onDelete: Cascade` (dacă se șterge un antrenament, se șterg automat și exercițiile asociate).
- Pe frontend, pagina `WorkoutDetail.jsx` permite vizualizarea și gestionarea exercițiilor unui antrenament specific.
- Toate operațiile CRUD (adăugare, editare, ștergere) funcționează complet fullstack, de la interfață prin GraphQL până la baza de date.

---

## Assignment 3 — Bronze (Persistența Datelor)

### 1. Baza de Date Relațională

Am tranziționat de la stocarea datelor în memorie (array-uri JavaScript) la o bază de date **SQLite** persistentă. Am ales SQLite pentru simplitate (nu necesită un server de baze de date separat) și compatibilitate cu Prisma ORM.

**Schema bazei de date** (fișierul `server/prisma/schema.prisma`) conține 5 tabele:

| Tabelă | Câmpuri principale | Scop |
|--------|-------------------|------|
| **Workout** | id (UUID, PK), name, type, date, duration, status, notes | Antrenamentele utilizatorilor |
| **Exercise** | id (UUID, PK), name, sets, reps, weight, workoutId (FK → Workout) | Exercițiile din fiecare antrenament |
| **User** | id (UUID, PK), name, email (unique), password, isSuspicious, roleId (FK → Role) | Conturile utilizatorilor |
| **Role** | id (UUID, PK), name (unique: "Admin" / "Normal User") | Rolurile disponibile |
| **Permission** | id (UUID, PK), name (unique: "READ", "WRITE", "DELETE", "ALL") | Permisiunile granulare |
| **AuditLog** | id (UUID, PK), userId, action, entity, timestamp | Jurnalizarea acțiunilor |

**Relații între tabele:**
- `Workout` → `Exercise`: relație **1-la-N** (un antrenament are mai multe exerciții).
- `Role` → `User`: relație **1-la-N** (un rol poate fi atribuit mai multor utilizatori).
- `Role` ↔ `Permission`: relație **N-la-N** (un rol poate avea mai multe permisiuni și o permisiune poate aparține mai multor roluri, implementată prin tabela intermediară `_RoleToPermission`).

**Normalizare 3NF**: Baza de date respectă forma normală a treia. Nu există dependențe tranzitive — fiecare coloană non-cheie depinde exclusiv de cheia primară a tabelului în care se află. De exemplu, informațiile despre roluri nu sunt stocate direct în tabela User (ar fi redundanță), ci sunt referențiate prin `roleId`.

### 2. Prisma ORM și Migrații

Am utilizat **Prisma** ca ORM (Object-Relational Mapping). Prisma oferă:
- **Generare automată a clientului**: Din schema declarativă (`schema.prisma`), Prisma generează automat un client TypeScript/JavaScript cu metode tipizate (`prisma.workout.findMany()`, `prisma.user.create()`, etc.).
- **Sistem de migrații**: Structura bazei de date nu a fost creată manual prin SQL. Am folosit comanda `npx prisma migrate dev` care compară schema declarativă cu starea actuală a bazei de date și generează automat scripturile SQL de migrare. Fiecare migrare este salvată în folderul `server/prisma/migrations/`.

### 3. Operații CRUD pe Backend

Toate operațiile de bază de date sunt centralizate în fișierul `server/src/data/repository.js`. Fiecare funcție utilizează Prisma Client:
- `getAllWorkouts(offset, limit, filter, sort)` — interogare cu paginare, filtrare dinamică și sortare.
- `createWorkout(workout, userId)` — inserare cu logare automată a acțiunii.
- `updateWorkout(id, fields, userId)` — actualizare parțială cu logare.
- `deleteWorkout(id, userId)` — ștergere cu logare.
- Funcții echivalente pentru `Exercise`.
- `getStats()` — statistici agregate calculate direct în baza de date (`prisma.workout.aggregate`).

### 4. Testare

Am implementat teste unitare folosind **Vitest** care acoperă:
- Validarea operațiilor CRUD (creare, citire, actualizare, ștergere).
- Verificarea comportamentului componentelor frontend (WorkoutForm, WorkoutTable, StatsCards, Navbar, Landing page).
- Rularea testelor: `npm test` (frontend) și `npm test` (în folderul server pentru backend).

### 5. Deployment pe Mașini Diferite

Serverul este configurat să asculte pe adresa `0.0.0.0` (toate interfețele de rețea), permițând accesul de pe orice dispozitiv din aceeași rețea locală. Frontend-ul este servit de Vite cu flag-ul `--host`. Adresa serverului este centralizată în fișierul `src/services/api.js`, permițând schimbarea rapidă a IP-ului.

---

## Assignment 3 — Silver (Securitate și Real-time)

### 1. Sistem de Autentificare

Am implementat un sistem complet de autentificare cu două rute REST (fișierul `server/src/routes/auth.js`):

**Înregistrare** (`POST /auth/register`):
- Primește numele, email-ul, parola și rolul dorit.
- Verifică dacă email-ul este deja folosit.
- Creează utilizatorul în baza de date cu rolul selectat (Admin sau Normal User).
- Returnează obiectul utilizator complet (inclusiv informațiile despre rol).

**Autentificare** (`POST /auth/login`):
- Primește email-ul, parola și rolul cu care dorește să se autentifice.
- Verifică existența utilizatorului și corectitudinea parolei.
- Verifică dacă rolul solicitat corespunde cu rolul real al utilizatorului (un Normal User nu se poate loga ca Admin și invers).
- La succes, returnează obiectul utilizator cu rolul asociat.

**Persistența sesiunii pe Frontend**:
- După login, obiectul utilizator (inclusiv ID, nume, email, rol) este salvat în `localStorage`.
- La fiecare cerere GraphQL, un `authLink` (definit în `main.jsx`) citește automat acest obiect și atașează ID-ul utilizatorului în header-ul HTTP `authorization`.
- Pe server, middleware-ul Apollo citește acest header și îl pune în `context`, făcându-l disponibil tuturor resolver-elor.

### 2. Controlul Accesului pe Bază de Roluri (RBAC)

Infrastructura de baze de date pentru roluri și permisiuni include:
- Tabela **Role** cu valorile `Admin` și `Normal User`.
- Tabela **Permission** cu valorile `READ`, `WRITE`, `DELETE`, `ALL`.
- Relație **many-to-many** între Role și Permission.

**Diferențele de acces pe Frontend**:
- Componenta `Navbar.jsx` verifică rolul utilizatorului curent. Dacă este Admin, se afișează un buton suplimentar **"🛡️ Admin Panel"** care duce către pagina dedicată de administrare (`/admin`). Utilizatorii normali nu văd acest buton.
- Pagina `AdminDashboard.jsx` verifică la montare dacă utilizatorul este Admin. Dacă nu este, este redirecționat automat către Dashboard-ul normal.
- Query-urile sensibile (`getAllUsers`, `getAuditLogs`, `getSuspiciousUsers`) sunt apelate doar din pagina de Admin.

### 3. Chat Real-Time cu Bază de Date NoSQL

Am implementat un sistem de chat comunitar care permite utilizatorilor autentificați să comunice în timp real.

**Backend — WebSockets și MongoDB** (fișierul `server/src/socket.js`):

La pornirea serverului:
1. Se creează o instanță de **MongoDB in-memory** folosind `mongodb-memory-server`. Aceasta oferă o bază de date MongoDB complet funcțională fără a necesita o instalare separată.
2. Se conectează **Mongoose** la această instanță și se definește schema pentru mesaje: `senderId`, `senderName`, `role`, `text`, `timestamp`.
3. Se inițializează serverul **Socket.io** pe același server HTTP.

Fluxul de mesaje:
1. Când un client se conectează, serverul trimite automat istoricul chat-ului (ultimele 100 de mesaje) prin evenimentul `chat_history`.
2. Când un utilizator trimite un mesaj, clientul emite evenimentul `chat_message` cu datele mesajului.
3. Serverul primește mesajul, îl salvează în MongoDB prin Mongoose (`newMsg.save()`), apoi face **broadcast** către toți clienții conectați (`io.emit('chat_message', newMsg)`).

**Frontend — Componenta Chat** (fișierul `src/components/Chat.jsx`):

- Chat-ul este un widget fix în colțul din dreapta-jos al ecranului, vizibil doar pentru utilizatorii autentificați.
- Fiecare mesaj este afișat diferit în funcție de expeditor:
  - Mesajele proprii sunt aliniate la dreapta, cu fundal portocaliu și eticheta "You".
  - Mesajele celorlalți sunt aliniate la stânga, cu fundal gri și eticheta "NumeUtilizator (Rol)" (ex: "Filip Bumbar (Admin)").
- Scroll-ul automat către ultimul mesaj este implementat cu un `useRef` și `scrollIntoView`.

---

## Assignment 3 — Gold (Audit și Detecție Comportament Malițios)

### 1. Infrastructura de Logging (Audit Trail)

Am creat tabela **AuditLog** în baza de date relațională care stochează automat fiecare acțiune critică:

| Câmp | Tip | Descriere |
|------|-----|-----------|
| id | UUID | Identificator unic al intrării |
| userId | String | ID-ul utilizatorului care a efectuat acțiunea |
| action | String | Tipul operației: "CREATE", "UPDATE" sau "DELETE" |
| entity | String | Entitatea afectată: "Workout" sau "Exercise" |
| timestamp | DateTime | Momentul exact al acțiunii (generat automat de server) |

**Mecanism de logare**: Am implementat funcția `logAction(userId, action, entity)` în fișierul `repository.js`. Această funcție este apelată automat la finalul fiecărei operații CRUD. De exemplu, după `prisma.workout.create()` se apelează `logAction(userId, 'CREATE', 'Workout')`. Utilizatorul nu este notificat și nu are nicio indicație vizuală că acțiunile sale sunt înregistrate.

**Injectarea contextului**: ID-ul utilizatorului ajunge la funcția de logare prin contextul GraphQL. În `main.jsx`, un `authLink` atașează ID-ul utilizatorului la fiecare cerere. În `index.js` (server), middleware-ul Apollo extrage acest ID din header (`req.headers.authorization`) și îl pune în obiectul `context` care este transmis resolver-elor. Resolver-ele apoi transmit `context.userId` funcțiilor din repository.

### 2. Algoritmul de Detecție a Comportamentului Malițios

Imediat după logarea unei acțiuni, funcția `logAction` execută și verificarea de securitate:

1. **Interogare temporală**: Se numără câte acțiuni de același tip (`action`) a efectuat utilizatorul curent (`userId`) în ultimele **60 de secunde** (o fereastră temporală glisantă). Interogarea folosește `prisma.auditLog.count()` cu filtrul `timestamp: { gte: oneMinuteAgo }`.

2. **Evaluarea pragului**: Dacă numărul de acțiuni similare depășește pragul de **5 pe minut**, se declanșează mecanismul de marcare.

3. **Verificare rol**: Înainte de marcare, sistemul verifică dacă utilizatorul are rolul de Admin. Administratorii nu sunt niciodată marcați ca suspecți, deoarece acțiunile lor în masă pot fi legitime (ex: curățarea bazei de date).

4. **Marcarea automată**: Dacă utilizatorul nu este Admin și a depășit pragul, câmpul `isSuspicious` este setat pe `true` în tabela User. Serverul emite și un avertisment în consolă.

### 3. Admin Dashboard — Pagina Dedicată de Administrare

Am creat o pagină separată de administrare (fișierul `src/pages/AdminDashboard.jsx`, accesibilă la ruta `/admin`) care oferă administratorului o vedere completă asupra întregului sistem. Pagina conține trei secțiuni distincte:

#### Secțiunea 1: 👥 All Registered Users (Toți Utilizatorii)

Afișează un tabel complet cu toți utilizatorii înregistrați în sistem (atât Admin cât și Normal User). Datele sunt preluate prin query-ul GraphQL `getAllUsers` care returnează utilizatorii cu rolurile lor incluse (`include: { role: true }`). Tabelul se actualizează automat la fiecare 10 secunde (`pollInterval: 10000`).

Coloanele tabelului:
- **Name** — numele complet al utilizatorului
- **Email** — adresa de email
- **Role** — rolul utilizatorului, afișat ca un badge colorat:
  - **Portocaliu** (`#ff9500`) = Admin
  - **Verde** (`#34c759`) = Normal User
- **Status** — starea contului:
  - **"✓ Clean"** (verde) = contul nu are activitate suspectă
  - **"⚠️ FLAGGED"** (roșu) = contul a fost marcat automat ca suspect de sistemul de detecție

Rândurile utilizatorilor suspecți au un fundal ușor roșu pentru a fi identificați rapid.

#### Secțiunea 2: 📋 Audit Log (Jurnalul Complet de Acțiuni)

Afișează un tabel scrollabil cu ultimele 100 de acțiuni efectuate de toți utilizatorii din sistem. Datele sunt preluate prin query-ul GraphQL `getAuditLogs(limit: 100)` și se actualizează automat la fiecare 5 secunde (`pollInterval: 5000`).

Coloanele tabelului:
- **Timestamp** — data și ora exactă a acțiunii, afișată în format românesc (zi/lună/an oră:minut:secundă), cu font monospace
- **User** — numele utilizatorului care a efectuat acțiunea (rezolvat din ID prin corelarea cu lista de utilizatori)
- **Action** — tipul operației, afișat ca un badge colorat:
  - **Verde** (`#34c759`) = CREATE (creare element nou)
  - **Portocaliu** (`#ff9500`) = UPDATE (modificare element existent)
  - **Roșu** (`#ff3b30`) = DELETE (ștergere element)
- **Entity** — entitatea afectată: "Workout" sau "Exercise"

Tabelul are un header sticky (rămâne fix în partea de sus când se dă scroll), permițând navigarea ușoară prin volume mari de log-uri.

#### Secțiunea 3: 🚨 Observation List (Lista de Observație)

Afișează utilizatorii care au fost marcați automat ca suspecți de algoritmul de detecție. Datele sunt preluate prin query-ul `getSuspiciousUsers` cu actualizare la fiecare 5 secunde.

- Dacă **există utilizatori suspecți**: secțiunea are fundal roșu, titlu roșu cu iconița 🚨, și fiecare utilizator este afișat într-un card individual cu numele, email-ul și un badge **"⚠️ SUSPICIOUS"** cu animație de pulsare CSS (`@keyframes pulse`).
- Dacă **nu există utilizatori suspecți**: secțiunea are fundal verde, titlu verde cu iconița ✅, și afișează mesajul "No suspicious activity detected" cu subtextul "The system monitors all user actions in real-time".

**Navigarea către Admin Dashboard**: În bara de navigare (`Navbar.jsx`), când un utilizator cu rolul Admin este logat, apare automat un buton **"🛡️ Admin Panel"** cu fundal portocaliu semi-transparent. Utilizatorii normali nu văd acest buton. Dacă un utilizator normal încearcă să acceseze direct URL-ul `/admin`, este redirecționat automat către `/dashboard`.

---

## Structura Fișierelor Proiectului

```
FitTrack/
├── src/                          # Frontend (React)
│   ├── main.jsx                  # Entry point, configurare Apollo Client + authLink
│   ├── App.jsx                   # Routing, conexiune Socket.io
│   ├── services/api.js           # Configurare IP server (centralizată)
│   ├── graphql/                  # Queries și Mutations GraphQL
│   ├── pages/
│   │   ├── Landing.jsx           # Pagina de start
│   │   ├── Login.jsx             # Autentificare
│   │   ├── Register.jsx          # Înregistrare cont
│   │   ├── Dashboard.jsx         # Pagina principală + Infinite Scroll
│   │   ├── AdminDashboard.jsx    # Pagina de administrare (Users + Logs + Observation)
│   │   ├── WorkoutDetail.jsx     # Detalii antrenament + exerciții (1-to-Many)
│   │   ├── Statistics.jsx        # Pagina de statistici
│   │   └── Bazinga.jsx           # Pagina de recomandări
│   └── components/
│       ├── Chat.jsx              # Widget chat real-time (WebSockets)
│       ├── Navbar.jsx            # Bară de navigare (cu buton Admin Panel condiționat)
│       ├── DashboardOverview.jsx  # Grafice + statistici live
│       ├── WorkoutForm.jsx       # Formular CRUD antrenamente
│       ├── WorkoutTable.jsx      # Tabel antrenamente
│       └── *.test.jsx            # Teste unitare componente
│
├── server/                       # Backend (Node.js)
│   ├── src/
│   │   ├── index.js              # Entry point server, Apollo + Express + Socket.io
│   │   ├── schema.js             # Schema GraphQL (types, queries, mutations, resolvers)
│   │   ├── socket.js             # Configurare MongoDB + Socket.io (Chat NoSQL)
│   │   ├── simulation.js         # Simulare generare date
│   │   ├── data/repository.js    # Toate operațiile DB + logAction + detecție Gold
│   │   └── routes/auth.js        # Rute REST pentru autentificare
│   └── prisma/
│       ├── schema.prisma         # Schema bazei de date (modele, relații)
│       ├── migrations/           # Migrații auto-generate
│       └── dev.db                # Fișierul bazei de date SQLite
```
