

import { Request, Response, NextFunction } from 'express';// Importă tipurile de bază de la Express pentru funcțiile middleware

import jwt, { JwtPayload } from 'jsonwebtoken';// Importă jwt și JwtPayload pentru a lucra cu token-uri


const JWT_SECRET = process.env.JWT_SECRET;// Importă cheia secretă din mediul de rulare (obligatoriu pentru securitate)

if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET lipsește din .env");
}


// Functia "Paznic" (Middleware)
//Ea preia cererea inainte de a ajunge la Controller și valideaza accesul în 3 pași:

//  1. AUTENTIFICARE (Verificare Token):
//  - Verifica daca clientul a trimis un "bilet" (Token JWT) valid in header.
//  - Confirma ca token-ul a fost cel creat de noi (folosind semnatura cu JWT_SECRET)

//  2. IDENTIFICARE (Atasare User):
//  - Daca token-ul este valid, decriptează datele din el (ID, Rol).
//  - Le atașează la `req.user` pentru ca serverul să știe "Cine face cererea?"

//  3. AUTORIZARE (Verificare Rol):
//  - Daca ruta este destinata doar anumitor roluri (ex: doar ADMIN), 
//  - verifica daca utilizatorul are privilegiile necesare
export const authorize = (allowedRoles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        // 1. Verificam daca exista token-ul
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acces refuzat. Token lipsă.' });
        }

        const token = authHeader.split(' ')[1];

        try {
            // 2. Verificam Token-ul (SIMPLIFICAT CU 'as any')
            const decoded = jwt.verify(token,JWT_SECRET) as any;
            
            // 3. Atasam userul (TypeScript nu mai comenteaza acum)
            (req as any).user = decoded;

            // 4. Verificam Rolul
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Acces interzis. Nu ai rolul necesar.' });
            }

            next();

        } catch (error) {
            console.error("❌ Eroare validare token:", error);
            return res.status(401).json({ error: 'Autentificare eșuată.' });
        }
    };
};