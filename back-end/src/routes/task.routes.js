import { Router } from 'express';
import { 
    createTask,
    getTaskByProject,
    getMyTasks,
    allocateTask,
    completeTask,
    closeTask,
    deleteTask
} from '../controllers/task.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = Router();

// RUTE PENTRU GESTIONAREA TASK-URILOR

// --- CREARE ȘI VIZUALIZARE (Context: Proiect) ---
// 1. CREATE - Managerul adauga un task nou intr-un proiect
// POST /api/v1/projects/:projectId/tasks
router.post('/projects/:projectId/tasks', 
    authorize(['MANAGER']), 
    createTask
);

// 2. READ PROJECT TASKS - Managerul vede toate task-urile dintr-un proiect
// GET /api/v1/projects/:projectId/tasks
router.get('/projects/:projectId/tasks', 
    authorize(['MANAGER']), 
    getTaskByProject
);

// ---  VIZUALIZARE PERSONALĂ (Context: Executant) ---

// 3. READ MY TASKS - Executantul vede lista cu sarcinile LUI
// GET /api/v1/tasks/my
router.get('/tasks/my', 
    authorize(['EXECUTANT']), 
    getMyTasks
);

// --- FLUX DE LUCRU  ---

// 4. ALOCARE (OPEN -> PENDING)
// Managerul asigneaza task-ul unui executant
// PATCH /api/v1/tasks/:id/allocate
router.patch('/tasks/:id/allocate', 
    authorize(['MANAGER']), 
    allocateTask
);

// 5. FINALIZARE (PENDING -> COMPLETED)
// Executantul marcheaza task-ul ca terminat
// PATCH /api/v1/tasks/:id/finalize
router.patch('/tasks/:id/finalize', 
    authorize(['EXECUTANT']), 
    completeTask
);

// 6. INCHIDERE (COMPLETED -> CLOSED)
// Managerul confirma si inchide task-ul
// PATCH /api/v1/tasks/:id/close
router.patch('/tasks/:id/close', 
    authorize(['MANAGER']), 
    closeTask
);

// --- ADMINISTRARE ---

// 7. DELETE - Managerul sterge un task (Doar daca e OPEN)
// DELETE /api/v1/tasks/:id
router.delete('/tasks/:id', 
    authorize(['MANAGER']), 
    deleteTask
);

export default router;
