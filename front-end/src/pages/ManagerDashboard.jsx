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
  const [newTaskDeadline, setNewTaskDeadline] = useState({});
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    fetchProjects();
    fetchExecutants();
  }, []);

  // --- FUNCȚIE AJUTĂTOARE PENTRU DATA MINIMĂ (AZI + ORA CURENTĂ) ---
  const getMinDateTime = () => {
      const now = new Date();
      // Ajustăm fusul orar pentru a obține ora locală corectă în format ISO
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16); // Returnează formatul "YYYY-MM-DDTHH:mm"
  };

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

  const handleDeleteProject = async (id) => {
      if (window.confirm('Ești sigur că vrei să ștergi proiectul? Toate task-urile vor fi șterse.')) {
          try {
              await api.delete(`/projects/${id}`);
              fetchProjects();
          } catch (err) { alert("Eroare la ștergere proiect."); }
      }
  };

  const handleCreateTask = async (projectId) => {
    const title = newTaskTitle[projectId];
    const desc = newTaskDesc[projectId];
    const deadline = newTaskDeadline[projectId];

    if (!title || !deadline) return alert("Titlul și Deadline-ul sunt obligatorii!");

    // --- VALIDARE DATĂ TRECUTĂ ---
    const selectedDate = new Date(deadline);
    const now = new Date();
    
    if (selectedDate < now) {
        return alert("Nu poți seta un termen limită (deadline) în trecut!");
    }
    // ----------------------------
    
    try {
      await api.post(`/projects/${projectId}/tasks`, { 
        title, 
        description: desc, 
        deadline: deadline 
      });
      
      setNewTaskTitle({ ...newTaskTitle, [projectId]: "" }); 
      setNewTaskDesc({ ...newTaskDesc, [projectId]: "" }); 
      setNewTaskDeadline({ ...newTaskDeadline, [projectId]: "" });

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
    } catch (err) { alert("Eroare: Doar task-urile COMPLETED pot fi închise!"); }
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

  const renderDeadlineInfo = (task) => {
      if (!task.deadline) return null;
      
      let styleClass = "deadline-normal";
      
      const formattedDate = new Date(task.deadline).toLocaleString('ro-RO', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });

      let text = `📅 Termen: ${formattedDate} (${task.daysRemaining} zile)`;

      if (task.status === 'COMPLETED' || task.status === 'CLOSED') {
          return <div className="deadline-row deadline-finished">Finalizat (Termen: {formattedDate})</div>;
      }

      if (task.isOverdue) {
          styleClass = "deadline-overdue";
          text = `⚠️ Întârziat cu ${Math.abs(task.daysRemaining)} zile!`;
      } else if (task.daysRemaining <= 1) {
          styleClass = "deadline-urgent";
          text = `🔥 Urgent: ${task.daysRemaining === 0 ? 'Azi!' : '1 zi rămasă!'}`;
      }

      return <div className={`deadline-row ${styleClass}`}>{text}</div>;
  };

  return (
    <div className="manager-dashboard-container">
      <header className="manager-dashboard-header">
        <div>
            <h1>Manager Dashboard</h1>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={() => navigate('/history')} className="executant-btn-history">Arhiva</button>
            <button onClick={handleLogout} className="manager-logout-btn manager-delete-btn">Log Out</button>
        </div>
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
                    <div className="manager-task-title-row">
                        <strong>{task.title}</strong>
                        <span className={`manager-status-badge manager-status-${task.status.toLowerCase()}`}>
                            {task.status}
                        </span>
                    </div>

                    <div className="manager-task-content-row">
                        <div className="manager-task-description">
                             {task.description || <em style={{color:'#999'}}>Fără descriere</em>}
                        </div>
                        
                        <div className="manager-task-actions">
                            {(task.status === 'OPEN' || task.status === 'PENDING') && (
                                <>
                                    <div className="manager-assign-wrapper">
                                        <select 
                                            className="manager-executant-select-small"
                                            onChange={(e) => setSelectedUser({...selectedUser, [task.id]: e.target.value})}
                                            defaultValue=""
                                            value={selectedUser[task.id] || (task.assignedToId ? task.assignedToId : "")}
                                        >
                                            <option value="" disabled>
                                                {task.assignedTo ? `${task.assignedTo.name}` : "Alege"}
                                            </option>
                                            {executants.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button className="manager-btn-small manager-btn-allocate" title="Assign" onClick={() => handleAllocate(task.id)}>
                                            {task.status === 'OPEN' ? '➕' : '🔄'}
                                        </button>
                                    </div>
                                    {task.status === 'OPEN' && (
                                         <button className="manager-btn-small manager-btn-delete-small" title="Șterge Task" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                                    )}
                                </>
                            )}
                            {task.status === 'COMPLETED' && (
                                <div className="manager-assign-wrapper" style={{width: '100%', justifyContent: 'flex-end'}}>
                                    <span style={{fontSize:'0.75rem', color:'green', marginRight:'5px'}}>
                                        by <b>{task.assignedTo?.name}</b>
                                    </span>
                                    <button className="manager-btn-small manager-btn-close-task" onClick={() => handleClose(task.id)}>
                                        Închide ✅
                                    </button>
                                </div>
                            )}
                            {task.status === 'CLOSED' && (
                                <button className="manager-btn-small manager-btn-delete-small" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                            )}
                        </div>
                    </div>
                    {renderDeadlineInfo(task)}
                  </div>
                ))
              ) : (
                <p className="manager-no-tasks-text">Nu există task-uri.</p>
              )}
            </div>

            <div className="manager-project-card-footer">
                
                <div className="manager-add-task-box">
                    <input 
                        type="text" 
                        placeholder="Titlu task..."
                        value={newTaskTitle[project.id] || ''}
                        onChange={(e) => setNewTaskTitle({...newTaskTitle, [project.id]: e.target.value})}
                        className="manager-input-full"
                    />

                    <input 
                        type="text" 
                        placeholder="Descriere task..."
                        value={newTaskDesc[project.id] || ''}
                        onChange={(e) => setNewTaskDesc({...newTaskDesc, [project.id]: e.target.value})}
                        className="manager-input-full"
                    />

                    <div className="manager-add-task-row-bottom">
                         <input 
                            type="datetime-local" 
                            /* AICI ESTE VALIDAREA HTML */
                            min={getMinDateTime()} 
                            value={newTaskDeadline[project.id] || ''}
                            onChange={(e) => setNewTaskDeadline({...newTaskDeadline, [project.id]: e.target.value})}
                            className="manager-input-date-full"
                        />
                        <button onClick={() => handleCreateTask(project.id)} className="manager-btn-add-task">+</button>
                    </div>
                </div>

                <button 
                    className="manager-delete-btn manager-full-width"
                    style={{marginTop: '15px'}}
                    onClick={() => handleDeleteProject(project.id)}
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