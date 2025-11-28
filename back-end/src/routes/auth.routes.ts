


import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';

const router = Router();

// Endpoint-ul POST /auth/login:
// Definim adresa '/auth/login'.
// Metoda POST este folosita pentru a trimite date de login (email, parola).
// Nu are nevoie de Middleware de securitate, deoarece este punctul de intrare in sistem.
router.post('/auth/login', loginUser); 

export default router;