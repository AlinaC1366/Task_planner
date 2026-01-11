import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ManagerDashboard.css'; 
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [executants, setExecutants] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [newTaskTitle, setNewTaskTitle] = useState({});
  const [newTaskDesc, setNewTaskDesc] = useState({});
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    fetchProjects();
    fetchExecutants();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsResponse = await api.get('/projects');
      const projectsData = projectsResponse.data;
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasksResponse = await api.get(`/projects/${project.id}/tasks`);
            return { ...project, tasks: tasksResponse.data };
          } catch (error) {
            return { ...project, tasks: [] };
          }
        })
      );
      setProjects(projectsWithTasks);
    } catch (err) { setError('Eroare la încărcarea proiectelor.'); }
  };

  const fetchExecutants = async () => {
    try {
      const response = await api.get('/users');
      setExecutants(response.data.filter((u) => u.role === 'EXECUTANT'));
    } catch (err) { console.error("Error loading users"); }
  }; 

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name) return setError('Numele proiectului este obligatoriu.');
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); setError('');
      fetchProjects();
    } catch (err) { setError('Eroare la crearea proiectului.'); }
  };

  const handleDeleteProject = async (id, tasks) => {
      if (window.confirm('Ești sigur că vrei să ștergi proiectul?')) {
          try {
              await api.delete(`/projects/${id}`);
              fetchProjects();
          } catch (err) { alert("Eroare la ștergere."); }
      }
  };

  const handleCreateTask = async (projectId) => {
    const title = newTaskTitle[projectId];
    const desc = newTaskDesc[projectId];
    if (!title || !desc) return alert("Atât titlul cât și descrierea sunt obligatorii!");
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, description: desc });
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" }); 
      setNewTaskDesc({ ...newTaskDesc, [projectId]: "" }); 
      fetchProjects();
    } catch (err) { alert("Eroare la creare task."); }
  };

  const handleAllocate = async (taskId) => {
    const userId = selectedUser[taskId];
    if (!userId) return alert("Selectează un executant!");
    try {
      await api.patch(`/tasks/${taskId}/allocate`, { assignedToId: userId });
      fetchProjects();
    } catch (err) { alert("Eroare la alocare."); }
  };

  const handleClose = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/close`);
      fetchProjects();
    } catch (err) { alert("Doar task-urile COMPLETED pot fi închise!"); }
  };

  const handleDeleteTask = async (taskId) => {
      if (!window.confirm("Ștergi acest task?")) return;
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchProjects();
      } catch (err) { 
        const mesajServer = err.response?.data?.message || "Eroare necunoscută";
        alert(`Nu s-a putut șterge: ${mesajServer}`); 
      }
    };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="manager-dashboard-container">
      <header className="manager-dashboard-header">
        <div>
            <h1>Manager Dashboard</h1>
        </div>
        <button onClick={() => navigate('/history')} className="executant-btn-history">Arhiva</button>
        <button onClick={handleLogout} className="manager-logout-btn manager-delete-btn">Log Out</button>
      </header>

      <section className="manager-new-project-section">
        <h2>Adaugă un Proiect Nou</h2>
        {error && <div className="manager-error-message">{error}</div>}
        
        <form onSubmit={handleCreateProject} className="manager-project-form">
          <input 
            type="text" 
            placeholder="Numele Proiectului" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Scurtă descriere..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
          <button type="submit">Creează Proiect</button>
        </form>
      </section>

      <div className="manager-projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="manager-project-card">
            
            <div className="manager-project-card-header">
              <h3>{project.name}</h3>
              <span className="manager-task-count-badge">
                {project.tasks ? project.tasks.length : 0} Tasks
              </span>
            </div>
            
            <p className="manager-project-desc">{project.description}</p>

            <div className="manager-tasks-list-container">
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map(task => (
                  <div key={task.id} className="manager-task-card-item">
                    <div className="manager-task-info">
                      <strong>{task.title}</strong>
                      {task.description && <p style={{fontSize:'0.85em', color:'#666', margin:'2px 0'}}>{task.description}</p>}
                      <span className={`manager-status-badge manager-status-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="manager-task-actions-row">
                      {/* OPEN STATE */}
                      {task.status === 'OPEN' && (
                        <div className="manager-allocation-controls">
                          <select 
                            className="manager-executant-select-small"
                            onChange={(e) => setSelectedUser({...selectedUser, [task.id]: e.target.value})}
                            defaultValue=""
                          >
                            <option value="" disabled>Alege executant</option>
                            {executants.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                          <button className="manager-btn-small manager-btn-allocate" onClick={() => handleAllocate(task.id)}>Assign</button>
                          <button className="manager-btn-small manager-btn-delete-small" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                        </div>
                      )}

                      {/* PENDING STATE */}
                      {task.status === 'PENDING' && (
                        <div className="manager-allocation-controls">
                           <small>Assigned to: <strong>{task.assignedTo?.name}</strong></small>
                        </div>
                      )}

                      {/* COMPLETED STATE */}
                      {task.status === 'COMPLETED' && (
                        <div className="manager-allocation-controls">
                          <button className="manager-btn-small manager-btn-close-task" onClick={() => handleClose(task.id)}>Close Task ✅</button>
                          <button className="manager-btn-small manager-btn-delete-small" style={{marginLeft: '5px'}} onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="manager-no-tasks-text">Nu există task-uri.</p>
              )}
            </div>

            <div className="manager-project-card-footer">
                <div className="manager-add-task-box" style={{display: 'flex', flexDirection: 'column', gap: '5px', width: '100%'}}>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <input 
                            type="text" 
                            placeholder="Titlu task..."
                            value={newTaskTitle[project.id] || ''}
                            onChange={(e) => setNewTaskTitle({...newTaskTitle, [project.id]: e.target.value})}
                            style={{flex: 1}}
                        />
                        <button onClick={() => handleCreateTask(project.id)} style={{width:'40px'}}>+</button>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Descriere task (obligatoriu)..."
                        value={newTaskDesc[project.id] || ''}
                        onChange={(e) => setNewTaskDesc({...newTaskDesc, [project.id]: e.target.value})}
                    />
                </div>

                <button 
                    className="manager-delete-btn manager-full-width"
                    style={{marginTop: '15px'}}
                    onClick={() => handleDeleteProject(project.id, project.tasks || [])}
                >
                    Șterge Proiect
                </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;