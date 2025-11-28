
import { Request, Response,NextFunction  } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma.service'; 

// Tipul de date pentru a valida ce primim în req.body
// Folosim ENUM-ul UserRole definit in schema Prisma
type UserRole = 'ADMIN' | 'MANAGER' | 'EXECUTANT';

// Numărul de runde de hash-uire, cu cât e mai mare, cu atât e mai sigur
const saltRounds = 10;



// --- 1. CREATE ALL USERS ---
//    Ruta: POST /api/v1/users
//    Acces: DOAR ADMIN
   
//    SCOP:
//    - Creeaza un utilizator nou în sistem (Admin / Manager / Executant)
//    - Cripteaza parola înainte de salvare (bcrypt)
//    - Dacă rolul este EXECUTANT → trebuie atasat un manager
//    - Adminul creeaza absolut orice utilizator (conform cerintei temei)

//    VALIDARI:
//    - email, password si role sunt obligatorii
//    - daca rolul este EXECUTANT, trebuie sa existe managerId
//    - email trebuie sa fie unic → daca nu, Prisma arunca P2002


export const createUser = async (req: Request, res: Response, next: NextFunction) => {

    const { name, email, password, role, managerId } = req.body;

    if (!email || !password || !role) {
         return next({ status: 400, message: "Toate campurile sunt obligatorii." });
    }

    try {
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash, 
                role: role as UserRole,
                managerId: role === 'EXECUTANT' ? managerId : null, 
            },
            
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                managerId: true,
            }
        });

        return res.status(201).json(newUser);

    } catch (error : any) {

        console.error("❌ Eroare în createUser:", error);
        if (error.code === 'P2002') {
            return next({ status: 409, message: "Email deja înregistrat." });
        }

    next(error);
    }
};


// --- 2. GET ALL USERS ---
// Ruta: GET /api/v1/users
//    Acces: DOAR ADMIN
   
//    SCOP:
//    - Permite administratorului sa vada toti utilizatorii existenti din sistem
//    - Include si numele managerului fiecarui utilizator (JOIN prin Prisma)

//    EXPLICATIE:
//    - findMany returneaza toti utilizatorii
//    - select foloseste doar campurile necesare (fara passwordHash)

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const users= await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                manager: {
                    select: { name: true}
                }
            }
        });
        
        return res.status(200).json(users);

    }catch(error){

        console.error("❌ Eroare în getAllUsers:", error);
        next(error);
    }
};



// --- 3. UPDATE USER ---
// Ruta: PUT /api/v1/users/:id
//    Acces: DOAR ADMIN
//    SCOP:
//    - Modifica datele unui utilizator: nume, rol, manager alocat
//    - Daca modificam rolul si devine EXECUTANT → trebuie manager
//    - Daca devine MANAGER/ADMIN → managerId devine null
//    VALIDARI:
//    - utilizatorul nu isi poate seta managerId ca fiind propriul ID (logica business)
//    - managerId se aplica doar la EXECUTANT

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, role, managerId } = req.body;

    if(managerId === id){
        return next({ status: 400, message: "Un utilizator nu poate fi propriul manager." });
    }

    try{
        const updatedUser = await prisma.user.update({
            where: { id : id },
            data: {
                name,
                role: role as UserRole,
                managerId: role === 'EXECUTANT' ? managerId : null
            },
            select: {
                id: true,
                name: true,
                role: true,
                managerId:true
            }
        })

        return res.status(200).json(updatedUser);

    }catch(error){

        console.error(`❌ Eroare în updateUser pentru ID ${id}:`,error);
        next(error);
    }

};




// --- 4. DELETE USER ---
// Ruta: DELETE /api/v1/users/:id
//    Acces: DOAR ADMIN

//    SCOP:
//    - Permite administratorului sa stearga complet un utilizator
//    - Daca userul are taskuri asociate → FK constraint va declansa eroare
//    - Nu permitem unui admin sa se steargă pe el însusi (logica safety)

export const deleteUser = async (req: Request, res: Response, next : NextFunction) => {
    const { id } = req.params;
    const currentAdminId = (req as any).user.userId;

    if(id === currentAdminId){
        return next({ status: 400, message: "Nu te poți șterge singur." });
    }

    try{
        await prisma.user.delete({
            where: { id: id }
        });

        return res.status(204).send();

    }catch(error){

        console.error(`❌ Eroare în deleteUser pentru ID ${id}:`, error);
        next(error);
    }
};



