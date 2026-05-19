# 🏆 FitTrack - Gold Challenge Presentation Guide

Acest document conține instrucțiunile complete despre cum să pornești aplicația și scenariul exact (ce să îi spui și ce să îi arăți profesorului) pentru a valida **Gold Challenge-ul**. Nu am putut să scriu direct peste formatul de `.pdf` pe care îl aveai (întrucât necesită conversie și pierderea designului tău vizual), așa că îți las materialul aici ca să îl poți adăuga ușor ca o pagină nouă în PDF, Word sau PowerPoint.

---

## 💻 Partea 1: Cum să rulezi aplicația corect

Înainte să pui pe ecran aplicația la prezentare, asigură-te că ambele componente (Server și Client) sunt pornite corespunzător.

1. **Pornește Backend-ul (Server-ul Node.js)**
   - Deschide un Terminal și navighează în folderul asistent (folderul serverului).
   - Rulează comanda: `cd server`
   - Apoi pornește-l folosind: `npm start`
   - *Verificare:* Trebuie să vezi în consolă: 
     `Server running on port 3000`
     `GraphQL endpoint available at http://localhost:3000/graphql`

2. **Pornește Frontend-ul (React/Vite)**
   - Deschide un al Doilea (Nou) Terminal aflat în folderul principal al proiectului (`d:\UBB\Anul2\Sem2\MPP\FitTrack`).
   - Rulează comanda: `npm run dev`
   - *Verificare:* Deschide linkul pe care ți-l dă, de regula `http://localhost:5174/` și mergi pe pagina `/dashboard`.

---

## 🎤 Partea 2: Scenariul de Prezentare (Ce îi arăți Prof-ului)

Când domnul profesor îți spune: *"Ok, arată-mi te rog ce ai implementat pentru provocarea Gold!"*, vei trece prin cei 3 pași vitali ai prezentării:

### Pasul 1: Be Ambitious! (Server Reimplementat cu GraphQL)
**Ce îi spui:** 
> "Primul pas a fost rescrierea modului de comunicare pe Backend. Am înlocuit designul clasic de REST cu o arhitectură **GraphQL**, folosind Apollo Server. Prin acest procedeu, expunem fix aceeași logică din proiect, dar frontend-ul își alege singur exact ce date vrea prin Queries și Mutations (ex: getWorkouts, addWorkout)."

**Ce îi arăți practic:**
- 🖥️ Mergi în browser la adresa: `http://localhost:3000/graphql`.
- Se va deschide interfața **Apollo GraphQL Studio** (sandbox-ul unde testezi cererile de GraphQL live).
- Dacă vrea dovada codului, îi poți arăta în surse fișierele: de backend (`server/src/schema.js`) sau apelurile noi din react, cu hook-urile `@apollo/client` (`useQuery`, `useMutation`), de pe fișierul `src/pages/Dashboard.jsx`.

### Pasul 2: Be Responsive! (Infinite Scroll în Frontend)
**Ce îi spui:**
> "La nivelul structurii vizuale de Dashboard, pentru a reduce folosirea infrastructurii de rețea prin request-uri mici non-stop și fără paginarea aia cu butoane vechi, am folosit paginare cu Infinite Scroll folosind `react-intersection-observer` sub capotă. Este corelat curat cu parametrul 'offset' de la capătul backend."

**Ce îi arăți practic:**
- 🖥️ Deschizi tabelul din Frontend (`/dashboard`) și te duci cu mouse-ul pe zona de "Recent Workouts".
- Când scrollezi în jos până la final, tabelul va încărca automat încă `n` rezultate cu smooth-fetching fără să îți dai măcar seama sau să apeși pe un buton (vei vedea cum scroll bar-ul devine mai mic).

### Pasul 3: Be Diligent! (Relația de structură 1-to-many acoperită full-stack)
**Ce îi spui:**
> "În arhitectura domain-ului, a trebuit să creăm o structură rațională full-stack 'One to Many'. Am decis ca **`Un Antrenament (Workout) -> să poată conține mai multe -> Exerciții Individuale (Exercises)`**. Așadar, antrenamentul este Parintele, la care putem atașa oricâte Exerciții (nume, număr de repetări, număr de seturi)."

**Ce îi arăți practic:**
- 🖥️ Dă click pe logoul cu ochiul **(👁 View)** al oricărui Workout din tabelul dashboard-ului.
- Se va deschide pagina unui anumit Antrenament (`/workouts/:id`). 
- Aici, arată-i interfața nouă care conține rubrica distinctă din mijloc **"Exercises (1-to-many relation)"**.
- Apasă pebutonul albastru **"+ Add Exercise"**. Introdu datele unui exercițiu inventat ("Bench Press", 4 Sets, 12 Reps) și salvează-l (Create Backend + View Frontend Update).
- Arată-i că îl poți și șterge folosind coșulețul de gunoi pus lângă fiecare element conectat. Evidențiere CRUD complet 1-la-N.
