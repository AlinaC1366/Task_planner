import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ManagerDashboard.css';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [executants, setExecutants] = useState([]);
  
  // State pentru form-ul global de proiecte
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  // State pentru titlul task-ului nou (specific per proiect)
  const [newTaskTitle, setNewTaskTitle] = useState({});
  // State pentru executantul selectat (specific per task)
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    fetchProjects();
    fetchExecutants();
  }, []);

  const fetchProjects = async () => {
    try {
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
      setError('Eroare la încărcarea proiectelor.');
    }
  };

  const fetchExecutants = async () => {
    try {
      const response = await api.get('/users');
      const users = response.data || [];
      setExecutants(users.filter((u) => u.role === 'EXECUTANT'));
    } catch (err) {
      console.error("Nu s-au putut încărca executanții");
    }
  };

  // --- ACTIUNI TASK-URI ---

  const handleCreateTask = async (projectId) => {
    const title = newTaskTitle[projectId];
    if (!title) return alert("Introdu un titlu pentru task!");
    
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, description: "Task creat de manager" });
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" }); 
      fetchProjects(); 
    } catch (err) {
      alert("Eroare la creare task.");
    }
  };

  const handleAllocate = async (taskId) => {
    const userId = selectedUser[taskId];
    if (!userId) return alert("Te rog selectează un executant din listă!");
    
    try {
      await api.patch(`/tasks/${taskId}/allocate`, { assignedToId: userId });
      fetchProjects();
    } catch (err) {
      alert("Eroare la alocare.");
    }
  };

  const handleClose = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/close`);
      fetchProjects();
    } catch (err) {
      alert("Doar task-urile COMPLETED pot fi închise!");
    }
  };

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
    e.preventDefault();
    if (!name) return setError('Numele proiectului este obligatoriu.');
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); 
      fetchProjects();
    } catch (err) { setError('Eroare la crearea proiectului.'); }
  };

  const handleDeleteProject = async (id, taskCount) => {
    if (taskCount > 0) return alert('Nu poți șterge un proiect cu task-uri active!');
    
    if (window.confirm('Ești sigur că vrei să ștergi proiectul?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects();
      } catch (e) {
        alert("Eroare la ștergere proiect.");
      }
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
                    + Task
                </button>
              </div>

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