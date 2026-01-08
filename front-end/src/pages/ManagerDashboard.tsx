import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ManagerDashboard.css'; // Asigură-te că ai fișierul CSS de la pasul 2
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  status: 'OPEN' | 'PENDING' | 'COMPLETED' | 'CLOSED';
  assignedTo?: {
    name: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks?: Task[]; 
  _count?: { tasks: number; };
}

interface User {
  id: string;
  name: string;
  role: string;
}

const ManagerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [executants, setExecutants] = useState<User[]>([]);
  // State pentru form-ul global de proiecte
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  // State pentru titlul task-ului nou (specific per proiect)
  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  // State pentru executantul selectat (specific per task)
  const [selectedUser, setSelectedUser] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProjects();
    fetchExecutants();
  }, []);

  const fetchProjects = async () => {
    try {
      // 1. Cerem lista de proiecte (care vine DOAR cu numărătoarea, fără task-uri efective)
      const projectsResponse = await api.get('/projects');
      const projectsData = projectsResponse.data;

      // 2. Pentru fiecare proiect, facem o cerere separată să-i aducem task-urile
      // Folosim Promise.all ca să le încărcăm pe toate în paralel (mai rapid)
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project: Project) => {
          try {
            // Accesăm ruta din task.controller pe care o ai deja: GET /projects/:id/tasks
            const tasksResponse = await api.get(`/projects/${project.id}/tasks`);
            
            // Returnăm proiectul vechi combinat cu lista nouă de task-uri
            return { ...project, tasks: tasksResponse.data };
          } catch (error) {
            console.error(`Nu s-au putut încărca task-urile pentru proiectul ${project.id}`);
            // Dacă apare o eroare la un proiect, îl returnăm cu lista de task-uri goală
            return { ...project, tasks: [] };
          }
        })
      );

      // 3. Salvăm în state proiectele COMPLETE (cu tot cu task-uri)
      setProjects(projectsWithTasks);
    } catch (err: any) {
      setError('Eroare la încărcarea proiectelor.');
    }
  };

  const fetchExecutants = async () => {
    try {
      const response = await api.get('/users');
      // Filtrăm doar executanții pentru dropdown [cite: 3428]
      setExecutants(response.data.filter((u: User) => u.role === 'EXECUTANT'));
    } catch (err: any) {
      console.error("Nu s-au putut încărca executanții");
    }
  };

  // --- ACTIUNI TASK-URI ---

  // 1. Creare Task (Status devine OPEN) [cite: 3008]
  const handleCreateTask = async (projectId: string) => {
    const title = newTaskTitle[projectId];
    if (!title) return alert("Introdu un titlu pentru task!");
    
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, description: "Task creat de manager" });
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" }); // Reset input
      fetchProjects(); // Reîmprospătăm lista
    } catch (err) {
      alert("Eroare la creare task.");
    }
  };

  // 2. Alocare Executant (Status devine PENDING) [cite: 3108]
  const handleAllocate = async (taskId: string) => {
    const userId = selectedUser[taskId];
    if (!userId) return alert("Te rog selectează un executant din listă!");
    
    try {
      await api.patch(`/tasks/${taskId}/allocate`, { assignedToId: userId });
      fetchProjects();
    } catch (err) {
      alert("Eroare la alocare. Verifică logurile.");
    }
  };

  // 3. Închidere Task (Status devine CLOSED) [cite: 3185]
  const handleClose = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}/close`);
      fetchProjects();
    } catch (err) {
      alert("Doar task-urile COMPLETED pot fi închise!");
    }
  };

  // 4. Ștergere Task (Doar dacă e OPEN) [cite: 3225]
  const handleDeleteTask = async (taskId: string) => {
      if(!window.confirm("Ștergi acest task?")) return;
      try {
          await api.delete(`/tasks/${taskId}`);
          fetchProjects();
      } catch (err) {
          alert("Poți șterge doar task-uri OPEN!");
      }
  }

  // --- ACTIUNI PROIECTE ---

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError('Numele proiectului este obligatoriu.');
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); fetchProjects();
    } catch (err) { setError('Eroare la crearea proiectului.'); }
  };

  const handleDeleteProject = async (id: string, taskCount: number) => {
    // Backend-ul interzice ștergerea dacă există task-uri 
    if (taskCount > 0) return alert('Nu poți șterge un proiect care are task-uri active! Șterge task-urile întâi.');
    
    if (window.confirm('Ești sigur că vrei să ștergi proiectul?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <h2>Manager Dashboard</h2>
        <button onClick={handleLogout} className="btn-logout">Log Out</button>
      </nav>

      <div className="main-content">
        {/* FORMULAR ADAUGARE PROIECT */}
        <div className="create-project-container">
            <h3>Adaugă un Proiect Nou</h3>
            <form onSubmit={handleCreateProject} className="project-form">
                <input 
                    type="text" 
                    placeholder="Numele Proiectului" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                />
                <input 
                    type="text" 
                    placeholder="O scurtă descriere..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                />
                <button type="submit" className="btn-create">Creează Proiect</button>
            </form>
            {error && <p className="error-text">{error}</p>}
        </div>

        <div className="divider"></div>

        <h3 className="section-title">Proiectele Mele</h3>
        
        {/* GRID PROIECTE - STILIZAT CA IN IMAGINE */}
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              
              {/* HEADER CARD: Titlu + Badge */}
              <div className="card-header">
                <h4 className="project-title">{project.name}</h4>
                <span className="task-badge">
                    {project._count?.tasks || 0} Task-uri
                </span>
              </div>
              
              <p className="project-desc">{project.description}</p>

              <hr className="card-divider"/>

              {/* LISTA TASK-URI EXISTENTE */}
              <div className="tasks-list">
                 {project.tasks && project.tasks.length > 0 ? (
                    project.tasks.map(task => (
                        <div key={task.id} className={`task-item status-${task.status.toLowerCase()}`}>
                            <div className="task-info">
                                <strong>{task.title}</strong>
                                <span className={`status-pill ${task.status}`}>{task.status}</span>
                            </div>
                            
                            {/* LOGICA DE ALOCARE / ACTIUNI */}
                            <div className="task-actions">
                                {/* Daca e OPEN -> Selectam executant + Aloca */}
                                {task.status === 'OPEN' && (
                                    <div className="allocate-box">
                                        <select 
                                            className="select-executant"
                                            onChange={(e) => setSelectedUser({...selectedUser, [task.id]: e.target.value})}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Alege Executant</option>
                                            {executants.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button className="btn-small btn-allocate" onClick={() => handleAllocate(task.id)}>
                                            ➤
                                        </button>
                                    </div>
                                )}

                                <button className="btn-small btn-delete-task" onClick={() => handleDeleteTask(task.id)}>
                                            🗑️
                                </button>

                                {/* Daca e PENDING -> Aratam cine lucreaza */}
                                {task.status === 'PENDING' && (
                                    <small className="assigned-info">
                                        Alocat lui: <strong>{task.assignedTo?.name || 'Unknown'}</strong>
                                    </small>
                                )}

                                {/* Daca e COMPLETED -> Managerul inchide */}
                                {task.status === 'COMPLETED' && (
                                    <button className="btn-small btn-close" onClick={() => handleClose(task.id)}>
                                        Închide Task ✅
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                 ) : (
                     <p className="no-tasks">Nu există task-uri.</p>
                 )}
              </div>

              <hr className="card-divider"/>

              {/* ADAUGARE TASK NOU (Ca in imagine) */}
              <div className="add-task-area">
                <input 
                    type="text" 
                    className="input-new-task"
                    placeholder="Titlu task nou..."
                    value={newTaskTitle[project.id] || ''}
                    onChange={(e) => setNewTaskTitle({...newTaskTitle, [project.id]: e.target.value})}
                />
                <button 
                    className="btn-create-task"
                    onClick={() => handleCreateTask(project.id)}
                >
                    Creează Task OPEN
                </button>
              </div>

              {/* STERGE PROIECT (Ca in imagine) */}
              <button 
                className="btn-delete-project"
                onClick={() => handleDeleteProject(project.id, project._count?.tasks || 0)}
              >
                Șterge Proiect
              </button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;