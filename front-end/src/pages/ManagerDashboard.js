import React, { useState, useEffect } from 'react';
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
=======
import api from '../services/api';
import '../styles/ManagerDashboard.css';
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ManagerDashboard.css';

<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [executants, setExecutants] = useState([]);
  
  // State pentru form-ul global de proiecte
=======
interface Task {
  id: string;
  title: string;
  status: 'OPEN' | 'PENDING' | 'COMPLETED' | 'CLOSED';
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks?: Task[]; // Adăugăm lista de task-uri [cite: 479]
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
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
  // State pentru titlul task-ului nou (specific per proiect)
  const [newTaskTitle, setNewTaskTitle] = useState({});
  // State pentru executantul selectat (specific per task)
  const [selectedUser, setSelectedUser] = useState({});
=======
  // State pentru titlul task-ului nou (per proiect)
  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  // State pentru executantul selectat (per task)
  const [selectedUser, setSelectedUser] = useState<{ [key: string]: string }>({});
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx

  useEffect(() => {
    fetchProjects();
    fetchExecutants();
  }, []);

  const fetchProjects = async () => {
    try {
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
      // 1. Luăm proiectele
      const projectsResponse = await api.get('/projects');
      const projectsData = projectsResponse.data || [];

      // 2. Luăm task-urile pentru fiecare proiect
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasksResponse = await api.get(`/projects/${project.id}/tasks`);
            return { ...project, tasks: tasksResponse.data || [] };
          } catch (error) {
            console.error(`Eroare task-uri proiect ${project.id}`);
            return { ...project, tasks: [] };
          }
        })
      );

      setProjects(projectsWithTasks);
    } catch (err) {
=======
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err: any) {
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
      setError('Eroare la încărcarea proiectelor.');
    }
  };

  const fetchExecutants = async () => {
    try {
      const response = await api.get('/users');
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
      const users = response.data || [];
      setExecutants(users.filter((u) => u.role === 'EXECUTANT'));
    } catch (err) {
=======
      setExecutants(response.data.filter((u: User) => u.role === 'EXECUTANT'));
    } catch (err: any) {
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
      console.error("Nu s-au putut încărca executanții");
    }
  };

<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
  // --- ACTIUNI TASK-URI ---

  const handleCreateTask = async (projectId) => {
=======
  // 1. Creare Task (Devine automat OPEN) 
  const handleCreateTask = async (projectId: string) => {
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
    const title = newTaskTitle[projectId];
    if (!title) return alert("Introdu un titlu!");
    try {
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
      await api.post(`/projects/${projectId}/tasks`, { title, description: "Task creat de manager" });
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" }); 
      fetchProjects(); 
=======
      await api.post(`/projects/${projectId}/tasks`, { title, description: "" });
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" });
      fetchProjects();
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
    } catch (err) {
      alert("Eroare la creare task");
    }
  };

<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
  const handleAllocate = async (taskId) => {
=======
  // 2. Alocare Executant (Devine PENDING) 
  const handleAllocate = async (taskId: string) => {
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
    const userId = selectedUser[taskId];
    if (!userId) return alert("Selectează un executant!");
    try {
      await api.patch(`/tasks/${taskId}/allocate`, { assignedToId: userId });
      fetchProjects();
    } catch (err) {
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
      alert("Eroare la alocare.");
    }
  };

  const handleClose = async (taskId) => {
=======
      alert("Eroare la alocare");
    }
  };

  // 3. Închidere Task (Devine CLOSED) [cite: 1070]
  const handleClose = async (taskId: string) => {
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
    try {
      await api.patch(`/tasks/${taskId}/close`);
      fetchProjects();
    } catch (err) {
      alert("Doar task-urile COMPLETED pot fi închise!");
    }
  };

<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
  const handleDeleteTask = async (taskId) => {
      if(!window.confirm("Ștergi acest task?")) return;
      try {
          await api.delete(`/tasks/${taskId}`);
          fetchProjects();
      } catch (err) {
          alert("Poți șterge doar task-uri OPEN!");
      }
  };

  // --- ACTIUNI PROIECTE ---

  const handleCreateProject = async (e) => {
=======
  const handleCreateProject = async (e: React.FormEvent) => {
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
    e.preventDefault();
    if (!name) return setError('Numele proiectului este obligatoriu.');
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); 
      fetchProjects();
    } catch (err) { setError('Eroare la crearea proiectului.'); }
  };

<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
  const handleDeleteProject = async (id, taskCount) => {
    if (taskCount > 0) return alert('Nu poți șterge un proiect cu task-uri active!');
    
    if (window.confirm('Ești sigur că vrei să ștergi proiectul?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects();
      } catch (e) {
        alert("Eroare la ștergere proiect.");
      }
=======
  const handleDeleteProject = async (id: string, taskCount: number) => {
    if (taskCount > 0) return alert('Nu poți șterge un proiect cu task-uri active! [cite: 519]');
    if (window.confirm('Ștergi proiectul?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard Manager</h1>
          <p>Rol: MANAGER</p>
        </div>
        
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              
              <div className="card-header">
                <h4 className="project-title">{project.name}</h4>
                <span className="task-badge">
                    {project._count?.tasks || 0} Task-uri
                </span>
              </div>
              
              <p className="project-desc">{project.description}</p>
              <hr className="card-divider"/>

              {/* LISTA TASK-URI */}
              <div className="tasks-list">
                 {project.tasks && project.tasks.length > 0 ? (
                    project.tasks.map(task => (
                        <div key={task.id} className={`task-item status-${task.status ? task.status.toLowerCase() : 'open'}`}>
                            <div className="task-info">
                                <strong>{task.title}</strong>
                                <span className={`status-pill ${task.status}`}>{task.status}</span>
                            </div>
                            
                            <div className="task-actions">
                                {/* Alocare Executant */}
                                {task.status === 'OPEN' && (
                                    <div className="allocate-box">
                                        <select 
                                            className="select-executant"
                                            onChange={(e) => setSelectedUser({...selectedUser, [task.id]: e.target.value})}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Alege...</option>
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

                                {task.status === 'PENDING' && (
                                    <small className="assigned-info">
                                        Alocat lui: <strong>{task.assignedTo?.name || 'Unknown'}</strong>
                                    </small>
                                )}

                                {task.status === 'COMPLETED' && (
                                    <button className="btn-small btn-close" onClick={() => handleClose(task.id)}>
                                        Închide ✅
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

              {/* Input Task Nou */}
              <div className="add-task-area">
=======
        {/* BUTONUL DE LOG OUT */}
        <button 
          onClick={handleLogout} 
          className="logout-btn"
          style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </header>


      {error && <div className="error-message">{error}</div>}

      {/* Secțiunea ta originală de creare proiect */}
      <section className="new-project-section">
        <h2>Creare Proiect Nou</h2>
        <form onSubmit={handleCreateProject} className="project-form">
          <input type="text" placeholder="Nume Proiect" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea placeholder="Descriere" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit">Adaugă Proiect</button>
        </form>
      </section>

      {/* Grid-ul tău original de proiecte */}
      <section className="projects-list-section">
        <h2>Proiectele Mele</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className="task-count-badge">{project._count?.tasks || 0} Task-uri</span>
              </div>
              <p>{project.description || 'Fără descriere'}</p>

              {/* LISTA DE TASK-URI EXISTENTE IN CARD */}
              <div className="tasks-container-list">
                {project.tasks?.map(task => (
                  <div key={task.id} className="task-row">
                    <span>{task.title}</span>
                    <span className={`status-badge status-${task.status.toLowerCase()}`}>
                      {task.status}
                    </span>
                    
                    {/* UI pentru Alocare daca e OPEN */}
                    {task.status === 'OPEN' && (
                      <div style={{marginTop: '5px'}}>
                        <select onChange={(e) => setSelectedUser({...selectedUser, [task.id]: e.target.value})}>
                          <option value="">Cui aloci?</option>
                          {executants.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <button onClick={() => handleAllocate(task.id)}>Alocă</button>
                      </div>
                    )}

                    {/* UI pentru Inchidere daca e COMPLETED */}
                    {task.status === 'COMPLETED' && (
                      <button onClick={() => handleClose(task.id)} style={{backgroundColor: '#dc3545', color: 'white'}}>Închide</button>
                    )}
                  </div>
                ))}
              </div>

              {/* INPUT PENTRU TASK NOU (OPEN) */}
              <div className="add-task-container" style={{marginTop: '20px'}}>
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
                <input 
                  type="text" placeholder="Titlu task nou..."
                  value={newTaskTitle[project.id] || ''}
                  onChange={(e) => setNewTaskTitle({...newTaskTitle, [project.id]: e.target.value})}
                />
<<<<<<< HEAD:front-end/src/pages/ManagerDashboard.js
                <button 
                    className="btn-create-task"
                    onClick={() => handleCreateTask(project.id)}
                >
                    + Task
                </button>
              </div>

              <button 
                className="btn-delete-project"
                onClick={() => handleDeleteProject(project.id, project._count?.tasks || 0)}
              >
=======
                <button className="btn-add-task" onClick={() => handleCreateTask(project.id)}>
                  Creează Task OPEN
                </button>
              </div>

              <button className="delete-btn" onClick={() => handleDeleteProject(project.id, project._count?.tasks || 0)}>
>>>>>>> main:front-end/src/pages/ManagerDashboard.tsx
                Șterge Proiect
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ManagerDashboard;