# Rutele Complete ale Aplicației de Task Management
## I. Rute Back-End 
- POST /auth/login: (Public) Autentificare cu email și parolă. Returnează Token JWT.
- GET /api/v1/users: (Doar Admin) Afișează lista tuturor utilizatorilor 
- POST /api/v1/users: (Doar Admin) Creează un utilizator nou, specificând rolul (Manager sau Executant)
- PUT /api/v1/users/:id: (Doar Admin) Editează detaliile unui utilizator existent
- DELETE /api/v1/users/:id: (Doar Admin) Șterge definitiv un utilizator
- GET /projects: (Manager) Afișează proiectele create de managerul curent
- POST /projects: (Manager) Creează un proiect nou.
- GET /projects/:id: (Manager + Executant) Afișează detaliile unui proiect și task-urile din el
- DELETE /projects/:id: (Manager) Șterge un proiect (doar dacă este gol)
- POST /projects/:projectId/tasks: (Manager) Creează un task nou în starea OPEN
- GET /projects/:projectId/tasks: (Manager) Listează task-urile dintr-un proiect
- GET /tasks/my: (Executant) Afișează task-urile alocate utilizatorului curent
- PATCH /tasks/:id/allocate: (Manager) Alocă task-ul unui executant (OPEN -> PENDING)
- PATCH /tasks/:id/finalize: (Executant) Marchează task-ul ca realizat (PENDING -> COMPLETED)
- PATCH /tasks/:id/close: (Manager) Confirmă și închide task-ul (COMPLETED -> CLOSED)
- DELETE /tasks/:id: (Manager) Șterge un task (doar dacă este OPEN)
- GET /history/my: (Executant) Afișează arhiva personală de task-uri finalizate (CLOSED)
- GET /history/subordinates/:userId: (Manager) Afișează istoricul task-urilor pentru un subordonat

## II.Rute Front-End 
- /login: Pagina principală de Login (acces public)
- /admin: Dashboard-ul Administratorului, folosit exclusiv pentru gestiunea utilizatorilor
- /executant: Dashboard-ul Executantului, unde utilizatorul vede task-urile care i-au fost alocate
- /history: Pagina pentru vizualizarea istoricului personal sau al echipei (accesibilă tuturor rolurilor)
- /task/new: Formularul de Creare Task (accesibil Managerilor)
- /task/:id: Pagina care afișează Detaliile unui Task specific (accesibilă în funcție de permisiunea asupra task-ului)
