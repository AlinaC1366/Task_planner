import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from '../services/api'; 
import '../styles/HistoryPage.css';

const HistoryPage = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  
  // State-uri pentru Manager
  const [executants, setExecutants] = useState([]);
  const [selectedExecutantId, setSelectedExecutantId] = useState('');
  
  // viewMode decide dacă arătăm tot (DEFAULT) sau filtrat pe om (USER_SPECIFIC)
  const [viewMode, setViewMode] = useState('DEFAULT'); 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        
        if (decoded.role === 'MANAGER') {
            fetchExecutants();
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

  const fetchExecutants = async () => {
      try {
          const res = await api.get('/users'); 
          setExecutants(res.data.filter(u => u.role === 'EXECUTANT'));
      } catch (err) { console.error("Eroare la încărcarea executanților"); }
  };

  const fetchMyHistory = async () => {
      setLoading(true);
      try {
          const res = await api.get('/history/my');
          groupAndSetTasks(res.data);
          setViewMode('DEFAULT');
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
  };

  const fetchSubordinateHistory = async (userId) => {
      setLoading(true);
      try {
          const res = await api.get(`/history/subordinates/${userId}`);
          groupAndSetTasks(res.data);
          setViewMode('USER_SPECIFIC'); // Setăm modul specific
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
  };

  const fetchGeneralHistoryForManager = async () => {
      setLoading(true);
      try {
           const projectsRes = await api.get('/projects');
           const projectsData = projectsRes.data;
           
           const projectsWithTasks = await Promise.all(
             projectsData.map(async (p) => {
                try {
                    const tRes = await api.get(`/projects/${p.id}/tasks`);
                    return { ...p, tasks: tRes.data.filter(t => t.status === 'CLOSED') };
                } catch { return { ...p, tasks: [] }; }
             })
           );

           const groups = {};
           projectsWithTasks.forEach((proj) => {
               if (proj.tasks.length > 0) groups[proj.name] = proj.tasks;
           });
           setGroupedTasks(groups);
           setViewMode('DEFAULT'); // Setăm modul general
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
  };

  // --- HELPER FUNCTIONS ---

  const groupAndSetTasks = (tasksList) => {
      const groups = tasksList.reduce((acc, task) => {
        const projName = task.project?.name || 'Fără Proiect';
        if (!acc[projName]) acc[projName] = [];
        acc[projName].push(task);
        return acc;
      }, {});
      setGroupedTasks(groups);
  };

  const handleExecutantChange = (e) => {
      const userId = e.target.value;
      setSelectedExecutantId(userId);
      if (userId === "") {
          fetchGeneralHistoryForManager();
      } else {
          fetchSubordinateHistory(userId);
      }
  };

  const formatDate = (dateString) => {
      if (!dateString) return <span style={{color:'#ccc'}}>-</span>;
      return new Date(dateString).toLocaleString('ro-RO', { 
          day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit' 
      });
  };

  // --- RENDER ---

  return (
    <div className="history-container">
      <header className="history-header">
        <div style={{flex: 1}}>
            <h1>
                {viewMode === 'USER_SPECIFIC' ? 'Fișă Activitate Individuală' : 'Istoric / Arhivă'}
            </h1>
            
            {role === 'MANAGER' && (
                <div style={{marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <label style={{fontWeight: 'bold', color: 'var(--brand-main)'}}>Caută după angajat:</label>
                    <select 
                        value={selectedExecutantId} 
                        onChange={handleExecutantChange}
                        className="manager-executant-select-small"
                        style={{maxWidth: '250px', height: '40px', padding: '5px'}}
                    >
                        <option value="">-- Toate Proiectele (General) --</option>
                        {executants.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
        
        <button className="btn-back" onClick={() => navigate(role === 'MANAGER' ? '/manager' : '/executant')}>
          ← Înapoi
        </button>
      </header>

      <div className="history-content">
        {loading ? (
          <p>Se încarcă datele...</p>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <div className="empty-state">Nu există task-uri în istoric pentru selecția curentă.</div>
        ) : (
          Object.entries(groupedTasks).map(([projectName, tasks]) => (
            <div key={projectName} className="project-history-card">
              <h3 className="project-title-history">{projectName}</h3>
              <div className="table-responsive">
                <table className="history-table">
                  
                  {/* --- HEADER --- */}
                  <thead>
                    <tr>
                      <th style={{width: '20%'}}>Task</th>
                      
                      {/* --- EXECUTANT VIEW --- */}
                      {role === 'EXECUTANT' && (
                          <>
                            <th style={{width: '40%'}}>Descriere</th>
                            <th style={{width: '15%'}}>Status</th>
                            <th style={{width: '25%'}}>Finalizat la</th>
                          </>
                      )}

                      {/* --- MANAGER VIEW --- */}
                      {role === 'MANAGER' && (
                          <>
                            {/* MODIFICARE: Arătăm coloana Executant DOAR dacă suntem pe modul DEFAULT (General) */}
                            {viewMode === 'DEFAULT' && (
                                <th style={{width: '15%'}}>Executant</th>
                            )}

                            <th>Status</th>
                            <th>Alocat la</th>
                            <th>Finalizat la</th>
                            <th>Închis la</th>
                          </>
                      )}
                    </tr>
                  </thead>

                  {/* --- BODY --- */}
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td><strong>{task.title}</strong></td>

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
                                {/* MODIFICARE: Celula Executant apare doar la modul DEFAULT */}
                                {viewMode === 'DEFAULT' && (
                                    <td style={{color: '#4a148c', fontWeight: '600'}}>
                                        {task.assignedTo ? task.assignedTo.name : 'Necunoscut'}
                                    </td>
                                )}

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