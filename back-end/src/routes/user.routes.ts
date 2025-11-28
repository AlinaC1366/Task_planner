

import { Router } from 'express';
import { createUser,
       getAllUsers,
       updateUser,
       deleteUser
 } from '../controllers/user.controller'; 
import { authorize } from '../middleware/auth.middleware';
const router = Router();

// RUTE PENTRU ADMINISTRAREA UTILIZATORILOR (USER MANAGEMENT)
// Toate aceste rute sunt protejate si accesibile DOAR rolului 'ADMIN'.

// 1. CREATE - Creare utilizator nou
// POST /api/v1/users
router.post('/users',
       authorize(['ADMIN']), //verificarea rolului pentru accesare
       createUser); 



// 2. READ - Listarea tuturor utilizatorilor
// GET /api/v1/users
router.get('/users', 
    authorize(['ADMIN','MANAGER']), 
    getAllUsers
);


// 3. UPDATE - Modificarea unui utilizator existent
// PUT /api/v1/users/:id
// ":id" este un parametru dinamic. Express il va captura (ex: /users/5 -> req.params.id = 5)
router.put('/users/:id',
       authorize(['ADMIN']),
       updateUser
);

// 4. DELETE - Stergerea unui utilizator
// DELETE /api/v1/users/:id
router.delete('/users/:id',
       authorize(['ADMIN']),
       deleteUser
);


export default router;