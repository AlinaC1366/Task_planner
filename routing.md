# Rutele Complete ale Aplicației de Task Management
## I. Rute Back-End 
- POST /api/v1/auth/login: (Public) Permite oricui să se autentifice și să primească token-ul de acces
- GET /api/v1/users: (Doar Admin) Afișează lista tuturor utilizatorilor 
- POST /api/v1/users: (Doar Admin) Creează un utilizator nou, specificând rolul (Manager sau Executant)
- PUT /api/v1/users/:id: (Doar Admin) Editează detaliile unui utilizator existent
- DELETE /api/v1/users/:id: (Doar Admin) Șterge definitiv un utilizator
- PUT /api/v1/users/:id/manager: (Doar Admin) Oferă sau modifică managerul unui Executant
- GET /api/v1/users/me: (Autentificat) Afișează detaliile profilului utilizatorului curent
- POST /api/v1/tasks: (Doar Manager) Creează o sarcină nouă, care începe automat în starea OPEN
- GET /api/v1/tasks/all: (Doar Manager) Permite vizualizarea tuturor task-urilor din sistem
- GET /api/v1/tasks/my: (Doar Executant) Afișează task-urile care sunt alocate direct Executantului care face cererea
- GET /api/v1/tasks/:id: (Manager, Executant) Vizualizează detaliile unui task specific
- DELETE /api/v1/tasks/:id: (Doar Manager) Șterge definitiv un task (doar dacă acesta este în starea OPEN)
- PATCH /api/v1/tasks/:id/allocate: (Doar Manager) Alocă task-ul unui executant
- PATCH /api/v1/tasks/:id/finalize: (Doar Executant) Executantul marchează task-ul ca fiind gata
- PATCH /api/v1/tasks/:id/confirm-closure: (Doar Manager) Managerul confirmă că task-ul finalizat este bun
- GET /api/v1/history/my: (Doar Executant) Afișează toate task-urile CLOSED finalizate de utilizatorul curent
- GET /api/v1/history/subordinates/:userId: (Doar Manager) Afișează task-urile CLOSED finalizate de un anumit executant subordonat

## II.Rute Front-End 
- /login: Pagina principală de Login (acces public)
- /admin: Dashboard-ul Administratorului, folosit exclusiv pentru gestiunea utilizatorilor
- /executant: Dashboard-ul Executantului, unde utilizatorul vede task-urile care i-au fost alocate
- /history: Pagina pentru vizualizarea istoricului personal sau al echipei (accesibilă tuturor rolurilor)
- /task/new: Formularul de Creare Task (accesibil Managerilor)
- /task/:id: Pagina care afișează Detaliile unui Task specific (accesibilă în funcție de permisiunea asupra task-ului)
