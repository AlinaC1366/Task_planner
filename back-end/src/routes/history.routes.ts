import { Router } from 'express';
import { getMyHistory, getSubordinateHistory } from '../controllers/history.controller';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

// RUTE PENTRU ISTORIC (Arhiva task-uri)

// 1. ISTORIC PERSONAL
// GET /api/v1/history/my
// Acces: EXECUTANT (sa vada ce a terminat) si MANAGER
router.get('/history/my',
    authorize(['EXECUTANT', 'MANAGER']),
    getMyHistory
);


// 2. ISTORIC SUBORDONAT
// GET /api/v1/history/subordinates/:userId
// Acces: DOAR MANAGER (sa verifice activitatea unui angajat)
router.get('/history/subordinates/:userId',
    authorize(['MANAGER']),
    getSubordinateHistory
);

export default router;