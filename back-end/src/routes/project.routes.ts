import { Router } from 'express';
import { 
    createProject, 
    getMyProjects, 
    getProjectById, 
    deleteProject 
} from '../controllers/project.controller';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

// RUTE PENTRU GESTIONAREA PROIECTELOR (PROJECT MANAGEMENT)
// Majoritatea rutelor sunt accesibile DOAR rolului 'MANAGER'.

// 1. CREATE - Creare proiect nou
// POST /api/v1/projects
router.post('/projects',
    authorize(['MANAGER']), // doar un manager poate crea proiecte
    createProject
);


// 2. READ - Listarea proiectelor proprii (ale managerului logat)
// GET /api/v1/projects
router.get('/projects',
    authorize(['MANAGER']),
    getMyProjects
);


// 3. READ DETAILS - Vizualizarea unui proiect specific (si a task-urilor lui)
// GET /api/v1/projects/:id
// ":id" este un parametru dinamic (ID-ul proiectului cautat)
// Aici au acces si Executantii pentru a vedea ce au de lucru in proiect
router.get('/projects/:id',
    authorize(['MANAGER', 'EXECUTANT']), 
    getProjectById
);


// 4. DELETE - Stergerea unui proiect
// DELETE /api/v1/projects/:id
// Atentie: Se poate sterge doar daca proiectul nu are task-uri active
router.delete('/projects/:id',
    authorize(['MANAGER']),
    deleteProject
);

export default router;