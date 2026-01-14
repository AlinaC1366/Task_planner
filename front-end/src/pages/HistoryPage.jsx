import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from '../services/api'; 
import '../styles/HistoryPage.css';

const HistoryPage = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        
        if (decoded.role === 'MANAGER') {
            fetchGeneralHistoryForManager();
        } else {
            fetchMyHistory();
        }
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // --- API CALLS ---

  const fetchMyHistory = async () => {
      setLoading(true);
      try {
          const res = await api.get('/history/my');
          groupAndSetTasks(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
  };

  const fetchGeneralHistoryForManager = async () => {
      setLoading(true);
      try {
           const projectsRes = await api.get('/projects');
           const projectsData = projectsRes.data;
           
           // Luăm task-urile CLOSED pentru fiecare proiect
           const projectsWithTasks = await Promise.all(
             projectsData.map(async (p) => {
                try {
                    const tRes = await api.get(`/projects/${p.id}/tasks`);
                    // Filtrăm doar cele CLOSED
                    return { ...p, tasks: tRes.data.filter(t => t.status === 'CLOSED') };
                } catch { return { ...p, tasks: [] }; }
             })
           );

           const groups = {};
           projectsWithTasks.forEach((proj) => {
               if (proj.tasks.length > 0) groups[proj.name] = proj.tasks;
           });
           setGroupedTasks(groups);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
  };

  // --- HELPER FUNCTIONS ---

  const groupAndSetTasks = (tasksList) => {
      if(!Array.isArray(tasksList)) {
          setGroupedTasks({});
          return;
      }

      const groups = tasksList.reduce((acc, task) => {
        const projName = task.project?.name || 'Proiect Șters / Necunoscut';
        if (!acc[projName]) acc[projName] = [];
        acc[projName].push(task);
        return acc;
      }, {});
      setGroupedTasks(groups);
  };

  const formatDate = (dateString, onlyDate = false) => {
      if (!dateString) return <span style={{color:'#ccc'}}>-</span>;
      const options = onlyDate 
        ? { day: '2-digit', month: '2-digit', year: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit' };
      
      return new Date(dateString).toLocaleString('ro-RO', options);
  };

  // Helper pentru a randa Deadline-ul cu verificare de întârziere
  const renderDeadlineCell = (task) => {
      if (!task.deadline) return <span style={{color:'#ccc'}}>-</span>;

      const deadlineDate = new Date(task.deadline);
      const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
      
      // Verificam daca a fost finalizat DUPA deadline (ignoram orele, comparam doar zilele pentru simplitate, sau timestamp full)
      const isLate = completedDate > deadlineDate;

      return (
          <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{color: isLate ? '#d32f2f' : 'inherit', fontWeight: isLate ? 'bold' : 'normal'}}>
                  {formatDate(task.deadline, true)}
              </span>
              {isLate && <span style={{fontSize: '0.7em', color: '#d32f2f', fontWeight: 'bold'}}>(Depășit)</span>}
          </div>
      );
  };

  // --- RENDER ---

  return (
    <div className="history-container">
      <header className="history-header">
        <div style={{flex: 1}}>
            <h1>Arhivă / Istoric Task-uri</h1>
            {role === 'MANAGER' && <p style={{fontSize: '0.9rem', color: '#666'}}>Vizualizare completă a tuturor proiectelor închise.</p>}
        </div>
        
        <button className="btn-back" onClick={() => navigate(role === 'MANAGER' ? '/manager' : '/executant')}>
          ← Înapoi
        </button>
      </header>

      <div className="history-content">
        {loading ? (
          <p>Se încarcă datele...</p>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <div className="empty-state">Nu există task-uri în istoric.</div>
        ) : (
          Object.entries(groupedTasks).map(([projectName, tasks]) => (
            <div key={projectName} className="project-history-card">
              <h3 className="project-title-history">{projectName}</h3>
              <div className="table-responsive">
                <table className="history-table">
                  
                  <thead>
                    <tr>
                      <th style={{width: '20%'}}>Task</th>
                      <th style={{width: '12%'}}>Deadline</th> {/* COLOANĂ NOUĂ */}
                      
                      {/* Coloane specifice Executant */}
                      {role === 'EXECUTANT' && (
                          <>
                            <th style={{width: '35%'}}>Descriere</th>
                            <th style={{width: '10%'}}>Status</th>
                            <th style={{width: '23%'}}>Finalizat la</th>
                          </>
                      )}

                      {/* Coloane specifice Manager */}
                      {role === 'MANAGER' && (
                          <>
                            <th style={{width: '15%'}}>Executant</th>
                            <th>Status</th>
                            <th>Alocat la</th>
                            <th>Finalizat la</th>
                            <th>Închis la</th>
                          </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td><strong>{task.title}</strong></td>
                        
                        {/* CELULA DEADLINE (COMUNĂ) */}
                        <td>{renderDeadlineCell(task)}</td>

                        {/* --- EXECUTANT ROWS --- */}
                        {role === 'EXECUTANT' && (
                            <>
                                <td style={{ color: '#555', fontSize: '0.9rem' }}>
                                    {task.description || '-'}
                                </td>
                                <td>
                                    <span className={`badge badge-${task.status.toLowerCase()}`}>{task.status}</span>
                                </td>
                                <td style={{color: '#27ae60', fontWeight: 'bold'}}>
                                    {formatDate(task.completedAt)}
                                </td>
                            </>
                        )}

                        {/* --- MANAGER ROWS --- */}
                        {role === 'MANAGER' && (
                            <>
                                <td style={{color: '#4a148c', fontWeight: '600'}}>
                                    {task.assignedTo ? task.assignedTo.name : <span style={{color:'red'}}>Neasignat</span>}
                                </td>

                                <td>
                                    <span className={`badge badge-${task.status.toLowerCase()}`}>{task.status}</span>
                                </td>
                                <td style={{fontSize:'0.85rem'}}>
                                    {formatDate(task.allocatedAt)}
                                </td>
                                <td style={{fontSize:'0.85rem', color: '#27ae60'}}>
                                    {formatDate(task.completedAt)}
                                </td>
                                <td style={{fontSize:'0.85rem', color: '#d32f2f'}}>
                                    {formatDate(task.closedAt)}
                                </td>
                            </>
                        )}

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