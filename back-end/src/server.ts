
import 'dotenv/config'; 
import express, { Application } from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes'; 
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import historyRoutes from './routes/history.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

// --- CONFIGURARE INIȚIALA ---
const app: Application = express();
const PORT = process.env.PORT || 3000; 


// --- 1. MIDDLEWARE-URI GLOBALE ---
// Cerearea trece prin ciclul:
// I. Pregatire (CORS, JSON) -> II. Rute (Logica) -> II. Erori (Final)


// 1.1 CORS: Permite cererile de la Front-End (React) 
// Previne erorile de securitate inter-domeniu
app.use(cors());        


// 1.2 JSON Parser: Permite Express sa citească datele JSON 
// trimise in corpul cererilor (req.body) pentru POST/PUT/PATCH
app.use(express.json()); 



// --- 2. MONTAREA RUTELOR ---

// Montam routerul pentru utilizatori, toate adresele din user.routes.ts vor fi prefixate cu '/api/v1'
app.use('/api/v1', userRoutes); 

// Montam routerul de autentificare
app.use('/api/v1', authRoutes);

// Montam routerul de proiecte
// Aici sunt definite regulile de acces pentru Manageri (creare/stergere) si Executanti (vizualizare).
app.use('/api/v1', projectRoutes);

// Montam routerul de task-uri
//Aici sunt definite starile prin care trece un task, crearea de catre Manager
app.use('/api/v1', taskRoutes);

//Montam routerul pentru task-urile CLOSED
app.use('/api/v1', historyRoutes);

// --- 3. MIDDLEWARE GLOBAL PENTRU ERORI ---
app.use(errorHandler);


// --- 4. PORNIREA SERVERULUI ---

app.listen(PORT, () => {
    
    
    console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);

    console.log("Aplicația Task Planner Back-End este gata.");
});