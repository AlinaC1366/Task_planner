import { Request, Response, NextFunction } from 'express';
import prisma from '../services/prisma.service';

// --- GET MY HISTORY (Executant) ---
// Ruta: GET /api/v1/history/my
// SCOP: Executantul vede toate task-urile pe care le-a dus la bun sfarsit (CLOSED)
export const getMyHistory = async (req: Request, res: Response, next:NextFunction) => {
    const userId = (req as any).user.userId;

    try{
        const closedTasks= await prisma.task.findMany({
            where: {
                assignedToId: userId, // Task-urile executantului logat
                status: 'CLOSED'// Doar cele inchise definitiv
            },
            include: {
                project: { select: { name: true } }, // Detalii despre proiectul in care se gaseste task-ul
                historyEntries: true
            },
            orderBy: {
                closedAt: 'desc'
            }
        });

        return res.status(200).json(closedTasks);

    }catch(error){
        console.error("❌ Eroare istoric personal:",error);
        next(error);
    }
};


// --- GET SUBORDINATE HISTORY (Manager) ---
// Ruta: GET /api/v1/history/subordinates/:userId
// SCOP: Managerul vede ce a muncit un anumit angajat al lui
export const getSubordinateHistory = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;// Id-ul angajatului pentru care se verifica progresul
    const managerId = (req as any).user.userId;

    try{
        const targetUser = await prisma.user.findUnique({
            where: { id : userId}
        });

        //Verificam daca user-ul transmis este subordonat managerului sau daca macar utilizatorul exista
        if(!targetUser){
            return next({ status:404, message: 'Utilizatorul nu exista. ' });
        }

        const closedTasks = await prisma.task.findMany({
            where: {
                assignedToId: userId,
                status: 'CLOSED'
            },
            include: {
                project: { select: { name: true } }
            },
            orderBy: {
                closedAt: 'desc'
            }
        });

        return res.status(200).json(closedTasks);

    }catch(error){
        console.error("❌ Eroare istoric subordonat:",error);
        next(error);
    }
};
