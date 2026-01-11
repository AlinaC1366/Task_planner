import prisma from '../services/prisma.service.js';

// 1. CREATE TASK (Manager)
// Ruta: POST /api/v1/projects/:projectId/tasks
// Acces: DOAR MANAGER
// SCOP: Managerul creeaza un task nou intr-un proiect specific.
// LOGICA:
// - Task-ul porneste automat cu starea 'OPEN'.
// - Trebuie sa verificam dacă Managerul detine proiectul in care vrea sa scrie

export const createTask = async (req, res, next) => {
    const { title, description } = req.body;
    const { projectId } = req.params; // ID-ul proiectului din URL

    // Identificăm managerul logat prin Token
    const managerId = req.user.userId;

    if(!title){
        return next({ status: 400, message: 'Titlul este obligatoriu.' });
    }

    // [SECURITATE] Verificam dreptul de proprietate
    // Cautam proiectul si verificam daca managerId-ul lui corespunde cu cel al userului logat
    try{
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if(!project || project.managerId !== managerId){
            return next({ status: 404, message: 'Proiectul nu exista sau nu aveti drepturi asupra lui. '});
        }

        // [DB] Crearea Task-ului
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: 'OPEN', // Hardcodat: Orice task incepe ca OPEN
                projectId: projectId,
                creatorId: managerId,
                deadline: deadline ? new Date(deadline) : null

            }
        });

        // [ISTORIC] Opțional: Notam crearea in istoric
        await prisma.taskHistory.create({
            data: {
                taskId: task.id,
                oldStatus: 'OPEN',
                newStatus: 'OPEN',
                changedById: managerId
            }
        });

        return res.status(201).json(task);
    }catch(error){
        console.error("❌ Eroare creare task:", error);
        next(error);
    }
};


// 2. GET TASKS FOR PROJECT (Manager)
// Ruta: GET /api/v1/projects/:projectId/tasks
// SCOP: Vizualizarea tuturor task-urilor dintr-un proiect
// DETALII: Facem JOIN cu utilizatorul asignat pentru a vedea cine lucreaza la task
export const getTaskByProject = async (req, res, next) => {
    const { projectId } = req.params;
    try{
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                // Aducem doar numele și emailul executantului, nu tot obiectul user (fara parola!)
                assignedTo: { select: { name: true, email: true } }
            }
        });
        return res.status(200).json(tasks);
    }catch(error){
        console.error(`❌ Eroare listare task-uri din proiectul cu id-ul ${projectId}:`, error);
        next(error);
    }
}


// 3. GET MY TASKS (Executant)
// RUTA: GET /api/v1/tasks/my
// SCOP: Executantul vede lista cu sarcinile alocate LUI
export const getMyTasks = async (req, res, next) => {
    const userId=req.user.userId;

    try{
        const tasks = await prisma.task.findMany({
            where: { assignedToId: userId }, // Filtru: Sarcinile mele 
            include: {
                project: { select: { name: true}} // Context: Proiectul din care face parte task-ul
            }
        });
        return res.status(200).json(tasks);
    }catch(error){
        console.error(" ❌ Eroare listare task-uri proprii:",error);
        next(error);
    }
};


// 4. ALLOCATE TASK (Manager -> PENDING)
// RUTA: PATCH /api/v1/tasks/:id/allocate
// SCOP: Tranzitie de stare OPEN -> PENDING.
// LOGICA: Managerul alege un executant si ii da task-ul.
export const allocateTask = async (req, res, next) => {
    const { id } = req.params; // ID Task
    const { assignedToId } = req.body; // ID Executant (venit din dropdown-ul din frontend)
    const managerId = req.user.userId;

    try{
        // 1. Luam task-ul vechi pentru a sti statusul anterior
        const currentTask= await prisma.task.findUnique({where: { id }});
        if(!currentTask){
            return next({ status: 404, message: 'Task negasit,' });
        }

        // 2. Actualizam Task-ul în DB
        const updateTask = await prisma.task.update({
            where: { id },
            data: {
                assignedToId,
                status: 'PENDING',
                allocatedAt: new Date()
            }
        });

        // 3. Inregistram schimbarea in ISTORIC 
        await prisma.taskHistory.create({
            data: {
                taskId: id,
                oldStatus: currentTask.status, // EX: OPEN
                newStatus: 'PENDING',          // EX: PENDING 
                changedById: managerId         // Cine a facut schimbarea (Managerul) 
            }
        });

        return res.status(200).json(updateTask);

    }catch(error){
        console.error(" ❌ Eroare alocare task:",error);
        next(error);
    }
};


// 5. FINALIZE TASK (Executant -> COMPLETED)
// Ruta: PATCH /api/v1/tasks/:id/finalize
// SCOP: Tranzitie de stare PENDING -> COMPLETED.
// SECURITATE: Doar executantul proprietar are voie sa termine task-ul
export const completeTask = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try{
        const currentTask = await prisma.task.findUnique({ where: { id }});

        // Validare : Daca utilizatorul este cu adevarat proprietarul task-ului
        if(!currentTask || currentTask.assignedToId !== userId){
            return next({ status: 403, message: 'Nu poti finaliza un task care nu e al tau.' });
        }

        // Update status
        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        // Modificare Istoric
        await prisma.taskHistory.create({
            data: {
                taskId: id,
                oldStatus: currentTask.status,
                newStatus: 'COMPLETED',
                changedById: userId  // Cine a facut schimbarea (Executantul)
            }
        });

        return res.status(200).json(updatedTask);
    }catch(error){
        console.error('❌ Eroare la completarea task-ului',error);
        next(error);
    }
};


// 6. CLOSE TASK (Manager -> CLOSED)
// Ruta: PATCH /api/v1/tasks/:id/close
// SCOP: Tranzitie finala COMPLETED -> CLOSED.
// LOGICA: Managerul verifica munca si inchide task-ul
export const closeTask = async (req, res, next) => {
    const { id } =req.params;
    const managerId = req.user.userId;

    try{
        const currentTask = await prisma.task.findUnique({ where : { id }});

        if(!currentTask){
            return next({ status: 404, message: 'Task negasit.' });
        }

        // [VALIDARE LOGICA] Nu poti inchide un task neterminat
        if(currentTask.status !== 'COMPLETED'){
            return next({ status: 400, message: 'Poti inchide doar task-urile care sunt COMPLETED.' });
        }

        // Update Status
        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                status: 'CLOSED',
                closedAt: new Date()
            }
        });

        // Istoric final
        await prisma.taskHistory.create({
            data: {
                taskId: id,
                oldStatus: 'COMPLETED',
                newStatus: 'CLOSED',
                changedById: managerId
            }
        });

        return res.status(200).json(updatedTask);

    }catch(error){
        next(error);
    }
};


// 7. DELETE TASK (Manager)
// SCOP: Stergerea unui task gresit
// RESTRICTIE: Se poate sterge doar daca e 'OPEN'
// Daca s-a inceput lucrul la el, nu se mai sterge.
export const deleteTask = async (req, res, next) => {
    const { id } = req.params;

    try{
        const task = await prisma.task.findUnique({ where: { id }});
        
        if(!task){
            return next({ status: 404, message: 'Task negasit.' });
        }

        if(task.status !== 'OPEN' && task.status !== 'CLOSED'){
            return next({ 
                status: 400, 
                message: 'Poti sterge doar task-uri OPEN sau CLOSED. Cele PENDING/COMPLETED sunt in lucru.'
            });
        }

        // [CURATENIE] Stergem intai istoricul asociat (Foreign Key Constraint)
        await prisma.taskHistory.deleteMany({ where: { taskId: id}});

        // Stergem task-ul efectiv
        await prisma.task.delete({ where: { id }});

        return res.status(204).send();
    }catch(error){
        
        next(error);
    }
};