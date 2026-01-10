import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ManagerDashboard.css';
import { useNavigate } from 'react-router-dom';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // State pentru titlul task-ului nou (per proiect)
  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});
  // State pentru executantul selectat (per task)
  const [selectedUser, setSelectedUser] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProjects();
    fetchExecutants();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err: any) {
      setError('Eroare la încărcarea proiectelor.');
    }
  };

  const fetchExecutants = async () => {
    try {
      const response = await api.get('/users');
      setExecutants(response.data.filter((u: User) => u.role === 'EXECUTANT'));
    } catch (err: any) {
      console.error("Nu s-au putut încărca executanții");
    }
  };

  // 1. Creare Task (Devine automat OPEN) 
  const handleCreateTask = async (projectId: string) => {
    const title = newTaskTitle[projectId];
    if (!title) return alert("Introdu un titlu!");
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, description: "" });
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" });
      fetchProjects();
    } catch (err) {
      alert("Eroare la creare task");
    }
  };

  // 2. Alocare Executant (Devine PENDING) 
  const handleAllocate = async (taskId: string) => {
    const userId = selectedUser[taskId];
    if (!userId) return alert("Selectează un executant!");
    try {
      await api.patch(`/tasks/${taskId}/allocate`, { assignedToId: userId });
      fetchProjects();
    } catch (err) {
      alert("Eroare la alocare");
    }
  };

  // 3. Închidere Task (Devine CLOSED) [cite: 1070]
  const handleClose = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}/close`);
      fetchProjects();
    } catch (err) {
      alert("Doar task-urile COMPLETED pot fi închise!");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError('Numele proiectului este obligatoriu.');
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); fetchProjects();
    } catch (err) { setError('Eroare la crearea proiectului.'); }
  };

  const handleDeleteProject = async (id: string, taskCount: number) => {
    if (taskCount > 0) return alert('Nu poți șterge un proiect cu task-uri active! [cite: 519]');
    if (window.confirm('Ștergi proiectul?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
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
                <input 
                  type="text" placeholder="Titlu task nou..."
                  value={newTaskTitle[project.id] || ''}
                  onChange={(e) => setNewTaskTitle({...newTaskTitle, [project.id]: e.target.value})}
                />
                <button className="btn-add-task" onClick={() => handleCreateTask(project.id)}>
                  Creează Task OPEN
                </button>
              </div>

              <button className="delete-btn" onClick={() => handleDeleteProject(project.id, project._count?.tasks || 0)}>
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