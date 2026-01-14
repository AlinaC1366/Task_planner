# 📘 Documentație Tehnică - Task Planner 

Această documentație acoperă instalarea, configurarea și utilizarea aplicației **Task Planner**. Aplicația este de tip **Full Stack**, compusă dintr-un server (Backend) și o interfață client (Frontend).

" ``` "
# Structura Proiectului
└── alinac1366-task_planner/
    ├── README.md
    ├── database.md
    ├── Instructiuni.md
    ├── routing.md
    ├── back-end/
    │   ├── package.json
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── seed.js
    │   │   └── migrations/
    │   │       ├── migration_lock.toml
    │   │       └── 20260111175113_add_deadline_to_tasks/
    │   │           └── migration.sql
    │   └── src/
    │       ├── server.js
    │       ├── controllers/
    │       │   ├── auth.controller.js
    │       │   ├── history.controller.js
    │       │   ├── project.controller.js
    │       │   ├── task.controller.js
    │       │   └── user.controller.js
    │       ├── middleware/
    │       │   ├── auth.middleware.js
    │       │   └── errorHandler.middleware.js
    │       ├── routes/
    │       │   ├── auth.routes.js
    │       │   ├── history.routes.js
    │       │   ├── project.routes.js
    │       │   ├── task.routes.js
    │       │   └── user.routes.js
    │       └── services/
    │           └── prisma.service.js
    └── front-end/
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── vite.config.js
        ├── src/
        │   ├── App.jsx
        │   ├── main.jsx
        │   ├── pages/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── ExecutantDashboard.jsx
        │   │   ├── HistoryPage.jsx
        │   │   ├── Login.jsx
        │   │   └── ManagerDashboard.jsx
        │   ├── services/
        │   │   ├── api.js
        │   │   └── authService.js
        │   └── styles/
        │       ├── AdminDashboard.css
        │       ├── ExecutantDashboard.css
        │       ├── HistoryPage.css
        │       ├── Login.css
        │       ├── ManagerDashboard.css
        │       └── variables.css
        └── .vite/
            └── deps/
                ├── _metadata.json
                └── package.json

" ``` "

---

# 📝 1. Descriere Generală

 Logica de server (API REST) pentru aplicația *Task Planner*. Sistemul este construit pe o arhitectură modulară, separând responsabilitățile între Rute, Controllere și Servicii, și utilizează o bază de date relațională (SQLite) gestionată prin ORM-ul Prisma.

**Principalele funcționalități includ:**
* 🔐 **Securitate:** Autentificare robustă (JWT & Bcrypt).
* 👥 **Gestiune:** Roluri ierarhice (Admin, Manager, Executant).
* 🔄 **Workflow:** Mașină de stări pentru Task-uri (Open -> Closed).
* 📜 **Audit:** Istoric complet al modificărilor.

---

## 🛠️ 2. Cerințe de Sistem

Pentru rularea aplicației, mediul local trebuie să dispună de:
* 🟢 **Node.js**.
* 📦 **npm** (Inclus în pachetul Node.js).
* 🐈 **Git** (Pentru clonarea repository-ului).

---

## 🚀 3. Instalare și Configurare BACKEND

Deoarece fișierele de configurație și baza de date locală nu sunt stocate în repository din motive de securitate, este necesară configurarea manuală a mediului.

### 📌 Pasul 1: Instalarea Dependințelor

Navigați în directorul sursă și instalați pachetele necesare:

```bash
cd back-end
npm install
```

### 📌 Pasul 2: Configurarea Variabilelor de Mediu

Aplicația necesită un fișier ```.env``` pentru a rula. Creați un fișier nou cu numele ```.env``` în rădăcina folderului ```back-end``` și adăugați următoarele configurări:

```
# Portul pe care rulează serverul HTTP
PORT=3000

# Calea către baza de date locală (SQLite)
DATABASE_URL="file:./dev.db"

# Cheia privată pentru criptarea token-urilor JWT
JWT_SECRET="secret_key_licenta_2024"
```

### 📌 Pasul 3: Inițializarea Bazei de Date

Utilizați Prisma pentru a genera fișierul bazei de date (```dev.db```) pe baza schemei definite în proiect:

```
npx prisma db push
```

*Notă: Această comandă va crea tabelele necesare (User, Project, Task, TaskHistory).*

---

### 🌱 4. Inițializare Date (Seeding)

La prima rulare, baza de date este goală. Pentru a facilita testarea, proiectul include un script de populare automată (```seeding```) care creează un cont de Administrator implicit.

Rulați comanda:

```
npx prisma db seed
```

🔑 Credențiale generate:
* Email administrator (valoare generică în script care poate fii modificată)
* Parolă administrator (valoare generică în script care poate fii modificată)

Folosiți aceste date pentru a obține primul Token de acces prin ruta de Login.

---

### ▶️ 5. Pornirea Aplicației

Pentru a porni serverul în modul de dezvoltare:

```Bash
npm run dev
```

Serverul va fi activ la adresa: ``http://localhost:3000/api/v1```

---

## 🎨 Instalare și Configurare FRONTEND

Interfața grafică construită cu React și Vite.

### Pasul 1: Instalare dependințe
Deschideți un al doilea terminal (lăsați backend-ul să ruleze în primul), navigați către frontend:

```Bash
cd front-end
npm install
```

### Pasul 2: 
Verificați fișierul ```front-end/src/services/api.js```. Asigurați-vă că baseURL este setat corect:

```JavaScript
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});
```

### Pasul 3: Pornirea aplicatiei
Porniți interfața React:

```Bash
npm run dev
```

Aplicația se va deschide în browser la adresa: http://localhost:5173

# 🗺️ 6. Documentație API (Rute Disponibile)

Toate endpoint-urile sunt prefixate cu ```/api/v1.```

### 🔐 Modulul Autentificare

| Metodă | Rută | Acces | Descriere |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | 🌍 Public | Autentificare utilizator și emitere Token JWT. |

### 👥 Modulul Utilizatori

*Accesibil doar utilizatorilor cu rolul ADMIN.*

| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| `GET` | `/users` | Returnează lista completă a utilizatorilor. |
| `POST` | `/users` | Înregistrează un utilizator nou (Admin, Manager sau Executant). |
| `PUT` | `/users/:id` | Modifică datele unui utilizator existent. |
| `DELETE` | `/users/:id` | Șterge un utilizator din sistem. |

### 📁 Modulul Proiecte

*Accesibil utilizatorilor cu rolul MANAGER.*

| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| `POST` | `/projects` | Creează un proiect nou. |
| `GET` | `/projects` | Afișează proiectele proprii ale managerului. |
| `GET` | `/projects/:id` | Afișează detaliile unui proiect. (Accesibil și Executanților). |
| `DELETE` | `/projects/:id` | Șterge un proiect (doar dacă nu conține task-uri active). |

### ✅ Modulul Task-uri (Flux de Lucru)

*Gestionează ciclul de viață al sarcinilor.*

| Metodă | Rută | Rol Necesar | Acțiune (Status) |
| :--- | :--- | :--- | :--- |
| `POST` | `/projects/:id/tasks` | **Manager** | Creare task (**OPEN**). |
| `PATCH` | `/tasks/:id/allocate` | **Manager** | Alocare executant (**OPEN** -> **PENDING**). |
| `GET` | `/tasks/my` | **Executant** | Vizualizare sarcini proprii. |
| `PATCH` | `/tasks/:id/finalize` | **Executant** | Finalizare sarcină (**PENDING** -> **COMPLETED**). |
| `PATCH` | `/tasks/:id/close` | **Manager** | Confirmare și închidere (**COMPLETED** -> **CLOSED**). |

### 📜 Modulul Istoric

| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| `GET` | `/history/my` | (Executant) Istoric personal al task-urilor finalizate. |
| `GET` | `/history/subordinates/:id` | (Manager) Istoric activitate pentru un subordonat. |

---

## 🏗️ 7. Arhitectura Proiectului

Structura fișierelor respectă modelul MVC (Model-View-Controller) adaptat pentru API:
* ```src/server.ts``` - 🏁 Punctul de intrare al aplicației.
* ```src/routes/``` - 🚦 Definirea endpoint-urilor și rutarea cererilor.
* ```src/controllers/``` - 🧠 Logica de business și procesarea datelor.
* ```src/middleware/``` - 🛡️ Funcții intermediare (ex: validarea token-ului de securitate).
* ```src/services/``` - 🔌 Configurarea clientului de bază de date (Prisma Singleton).
* ```prisma/schema.prisma``` - 🗄️ Definirea modelului de date și a relațiilor.


## 📂 Explorarea Codului Sursă

Pentru a înțelege mai bine structura proiectului:

**1. Logica HTTP (GET/POST/PUT/DELETE):**
* 🎮 **[Controllers](./back-end/src/controllers)** – Aici se află logica de business (ce face efectiv fiecare funcție).
* 🚦 **[Routes](./back-end/src/routes)** – Aici sunt definite adresele URL și permisiunile de acces.

**2. Baza de Date și Servicii:**
* 🔌 **[Services](./back-end/src/services)** – Configurarea conexiunii la baza de date (Prisma Client).
* 🗄️ **[Database Schema](./back-end/prisma/schema.prisma)** – Definirea tabelelor și a relațiilor dintre ele.
```
