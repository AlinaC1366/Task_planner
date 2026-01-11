import prisma from '../services/prisma.service.js';


// --- 1. CREATE PROJECT ---
// Ruta: POST /api/v1/projects
// Acces: DOAR MANAGER
// SCOP: Permite unui manager sa creeze un proiect nou
// VALIDARI: Numele este obligatoriu. Proiectul se leaga automat de managerul logat
export const createProject = async (req, res, next) => {
    const { name, description } = req.body;

    // Extragem ID-ul managerului din token (req.user)
    const managerId = req.user.userId;

    if(!name){
        return next({ status: 400, message: 'Numele proiectului este obligatoriu.' });
    }
    try{
        const project = await prisma.project.create({
            data: {
                name,
                description,
                managerId: managerId // Legătura automata (Foreign Key)
            }
        });
        return res.status(201).json(project);
    }catch(error){
        console.error("❌ Eroare creare proiect:",error);
        next(error);
    }
};

// --- 2. GET MY PROJECTS ---
// Ruta: GET /api/v1/projects
// Acces: DOAR MANAGER
// SCOP: Returneaza lista de proiecte detinuta de managerul curent
// DETALII: Include si un numarator de task-uri pentru fiecare proiect
export const getMyProjects = async (req, res, next) => {
    const managerId=req.user.userId;

    try{
        const projects = await prisma.project.findMany({
            where:{
                managerId: managerId // Filtru de securitate (Doar ale mele)
            },
            include: {
                _count: { select : { tasks: true }} // Optimizare: numara task-urile direct din DB
            }
        });
        
        return res.status(200).json(projects);
    } catch(error){
        console.error("❌ Eroare afișare proiecte:",error);
        next(error);
    }
};

// --- 3. GET PROJECT DETAILS ---
// Ruta: GET /api/v1/projects/:id
// Acces: MANAGER + EXECUTANT
// SCOP: Afiseaza detaliile unui proiect specific si lista sa de task-uri
export const getProjectById = async (req, res, next) =>{
    const { id } = req.params;
    try{
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                tasks: true  // JOIN: Aducem si task-urile
            }
        });
        if(!project){
            return next({ status: 404, message: 'Proiectul nu exista.' });
        }

        return res.status(200).json(project);
    }catch (error){
        
        console.error(`❌ Eroare afișare cu id-ul ${id}`,error);
        next(error);
    }
};

// --- 4. DELETE PROJECT ---
// Ruta: DELETE /api/v1/projects/:id
// Acces: DOAR MANAGER
// LOGICA: Un proiect poate fi sters DOAR daca nu are task-uri active in el.
// projectController.js

export const deleteProject = async (req, res, next) => {
    const { id } = req.params;
    try{
        // 1. Verificăm existența
        const project = await prisma.project.findUnique({
            where: { id },
            include: { tasks: true }
        });
        
        if(!project){
            return next({ status: 404, message: 'Proiectul nu a fost gasit.' });
        }

        // 2. Validare Business: Nu ștergem dacă sunt task-uri în lucru
        const activeTasks = project.tasks.filter(task => 
            ['OPEN', 'PENDING'].includes(task.status)
        );

        if (activeTasks.length > 0) {
            return next({ 
                status: 400, 
                message: `Nu poți șterge proiectul! Există încă ${activeTasks.length} task-uri active.` 
            });
        }

        // 3. ȘTERGEM DOAR PROIECTUL
        // Prisma va șterge automat: Proiect -> Task-uri -> Istoric
        await prisma.project.delete({ where: { id } });

        return res.status(204).send();

    } catch (error){
        console.error('❌ Eroare ștergere proiect:', error);
        next(error);
    }
};