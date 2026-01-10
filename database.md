# MODELUL BAZEI DE DATE ȘI RELAȚII

## I.Tabela Users
- id - Identificator unic
- name - Numele complet al utilizatorului
- email - Adresa de email
- passwordHash - Hash-ul parolei (criptat)
- role - Rolul utilizatorului: ('ADMIN', 'MANAGER', 'EXECUTANT')
- managerId - Managerul direct al Executantului (NULL pentru Manageri/Admin)


## II.Tabela Tasks 
- id - Identificator unic al Task-ului
- title - Titlul Task-ului
- description - Descrierea detaliată
- status - Starea curentă: ('OPEN', 'PENDING', 'COMPLETED', 'CLOSED')
- creatorId - Cheie Externă (FK) la Users(id). Managerul care a creat Task-ul
- assignedToId - Cheie Externă (FK) la Users(id). Executantul căruia i s-a alocat Task-ul
- createdAt - Data creării
- closedAt - Data închiderii finale (când devine CLOSED)

## III.Tabela TaskHistory
- id - Cheie Primară (PK). Identificator unic al evenimentului
- taskId - Cheie Externă (FK) la Tasks(id). Task-ul modificat
- oldStatus - Starea anterioară
- changedById - Cheie Externă (FK) la Users(id). Utilizatorul care a efectuat tranziția
- changedAt - Momentul schimbării

## Tabela Projects
- id - Cheie Primară (PK), identificator unic al Proiectului
- name - Numele Proiectului
- description - Descriere opțională
- managerId: (UUID) Cheie Externă (FK) la Users(id), indicând Managerul responsabil cu Proiectul
- createdAt: (TIMESTAMP) Momentul creării


##  Interpretarea Relațiilor Cheie

### 1. Relația Ierarhică (Users ⟳ Users)
* **Tip:** `1:N` (One-to-Many) Auto-referențială.
* **Descriere:** Un Manager poate avea mai mulți subordonați (Executanți), dar un Executant are un singur Manager direct.

### 2. Relația de Apartenență (Projects ➡ Tasks)
* **Tip:** `1:N` (One-to-Many).
* **Descriere:** Un Proiect conține mai multe Task-uri. Un Task aparține obligatoriu unui singur Proiect.

### 3. Relațiile de Responsabilitate (Users ➡ Tasks)
Avem două relații distincte între utilizatori și task-uri:
* **Creator:** (Managerul) care definește task-ul.
* **Assignee:** (Executantul) care trebuie să îl rezolve.

### 4. Relația de Audit (Tasks ➡ TaskHistory)
* **Tip:** `1:N`.
* **Descriere:** Un Task poate avea o istorie lungă de modificări (mai multe intrări în History), permițând reconstituirea completă a fluxului de lucru.

