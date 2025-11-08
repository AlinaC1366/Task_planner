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


## Interpretarea Relațiilor Cheie

### Relația Ierarhică (Users —> Users):
Relația Ierarhică (Users —> Users): 
- Tip: 1:N Auto-referențială (pe câmpul managerId)
- Funcție: Definește cine pe cine supraveghează

### Relațiile de Task (Tasks —>Users):
- Două relații N:1 (pe creatorId și assignedToId)
- Funcție: Definește proprietarul (creatorul, care este întotdeauna un Manager) și responsabilul cu execuția (Executantul alocat)

### Relația de Istoric (TaskHistory —> Tasks / Users):
- Tip: Două relații N:1
- Funcție: Leagă fiecare schimbare de stare la Task-ul afectat și la Utilizatorul care a inițiat acea schimbare, asigurând urmărirea tuturor schimbărilor
