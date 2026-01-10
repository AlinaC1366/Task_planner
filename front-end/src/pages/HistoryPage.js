import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // Asigură-te că ai: npm install jwt-decode
import api from '../services/api';
import '../styles/HistoryPage.css';

const HistoryPage = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Identificăm rolul din token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        fetchHistory(decoded.role);
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchHistory = async (userRole) => {
    setLoading(true);
    try {
      if (userRole === 'EXECUTANT') {
        // --- LOGICA EXECUTANT ---
        // Luăm istoricul personal (/history/my returnează o listă plată de task-uri)
        const response = await api.get('/history/my');
        const tasks = response.data;

        // Grupăm task-urile după numele proiectului
        const groups = tasks.reduce((acc, task) => {
          const projName = task.project?.name || 'Fără Proiect';
          if (!acc[projName]) acc[projName] = [];
          acc[projName].push(task);
          return acc;
        }, {});
        
        setGroupedTasks(groups);

      } else if (userRole === 'MANAGER') {
        // --- LOGICA MANAGER ---
        // Managerul vrea să vadă proiectele cu task-urile ÎNCHISE (CLOSED)
        
        // 1. Luăm proiectele
        const projectsRes = await api.get('/projects');
        const projectsData = projectsRes.data;

        // 2. Luăm task-urile pentru fiecare proiect (N+1 fetch)
        const projectsWithTasks = await Promise.all(
             projectsData.map(async (p) => {
                try {
                    const tRes = await api.get(`/projects/${p.id}/tasks`);
                    return { ...p, tasks: tRes.data };
                } catch {
                    return { ...p, tasks: [] };
                }
             })
        );

        // 3. Filtrăm și Grupăm: Păstrăm doar task-urile CLOSED
        const groups = {};
        
        projectsWithTasks.forEach((proj) => {
            // Aici definim ce înseamnă "Istoric" pentru manager. 
            // De obicei înseamnă status CLOSED.
            const archivedTasks = proj.tasks.filter((t) => t.status === 'CLOSED');
            
            if (archivedTasks.length > 0) {
                groups[proj.name] = archivedTasks;
            }
        });

        setGroupedTasks(groups);
      }
    } catch (error) {
      console.error("Eroare la încărcarea istoricului", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    switch (role) {
      case 'MANAGER':
        navigate('/manager');
        break;
      case 'EXECUTANT':
        navigate('/executant');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <div>
            <h1>Arhivă Task-uri</h1>
            <p className="subtitle">
                {role === 'MANAGER' 
                    ? 'Vizualizare task-uri închise pe proiecte' 
                    : 'Istoricul activității tale'}
            </p>
        </div>
        <button className="btn-back" onClick={handleBack}>
          ← Înapoi la Dashboard
        </button>
      </header>

      <div className="history-content">
        {loading ? (
          <p>Se încarcă arhiva...</p>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <div className="empty-state">Nu există task-uri în arhivă.</div>
        ) : (
          Object.entries(groupedTasks).map(([projectName, tasks]) => (
            <div key={projectName} className="project-history-card">
              <h3 className="project-title-history">{projectName}</h3>
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      {role === 'MANAGER' && <th>Executant</th>}
                      <th>Data Închiderii</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                            <strong>{task.title}</strong>
                            <div className="small-desc">{task.description}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${task.status.toLowerCase()}`}>
                            {task.status}
                          </span>
                        </td>
                        {role === 'MANAGER' && (
                            <td>{task.assignedTo?.name || '-'}</td>
                        )}
                        <td>
                            {task.closedAt 
                                ? new Date(task.closedAt).toLocaleDateString('ro-RO') 
                                : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;