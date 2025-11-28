

import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import prisma from '../services/prisma.service'; 


// Citim cheia secreta din fisierul .env.
const JWT_SECRET = process.env.JWT_SECRET;

// Validare critica: Dacă nu avem cheia, oprim executia pentru a pastrarea securitatii
if (!JWT_SECRET) {
   
    throw new Error('Variabila de mediu JWT_SECRET lipsește! Asigură-te că ai setat-o în fișierul .env.');
}

// --- LOGIN CONTROLLER ---
// Functia pentru POST /api/v1/auth/login
// Folosim async pentru ca aplicatia asteapta un raspuns de la baza de date
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
   
    const { email, password } = req.body;

    if (!email || !password) {
        return next({ status: 400, message: 'Emailul și parola sunt obligatorii.' });
    }

    try {
        

        // Cautam userul
        const user = await prisma.user.findUnique({
            where: { email },
           
            select: { 
                id: true, 
                email: true, 
                passwordHash: true, 
                role: true,
                name: true, 
            }
        });

        // Verifica daca utilizatorul exista
        if (!user) {
        
            return next({ status: 401, message: 'Credențiale invalide.' });
        }

        // Verifiare parola, foloseste bcrypt pentru a compara parola trimisa de utilizator cu hash-ul stocat în DB.
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        
        if (!isPasswordValid) {
           
            return next({ status: 401, message: 'Credențiale invalide.' });
        }

        // Generam Token-ul JWT (Legitimatia)
        // Semneaza un token care va contine ID-ul utilizatorului si Rolul
        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        // Raspuns Succes 
        //Trimitem token-ul si datele userului 
        return res.status(200).json({ 
            message: 'Autentificare reușită',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
       
        console.error("❌ Eroare la autentificare:", error);
        next(error);
    }
};