import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ExecutantDashboard.css';

const ExecutantDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funcție ajutătoare: Verificăm dacă un ID este arhivat local
  const isArchivedLocally = (id) => {
    const archivedList = JSON.parse(localStorage.getItem('archivedTasks') || '[]');
    return archivedList.includes(id);
  };

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my');
      
      // FILTRARE:
      // 1. Păstrăm tot ce vine din backend (PENDING, COMPLETED, CLOSED).
      // 2. Excludem DOAR ce a fost arhivat manual de tine (salvat în localStorage).
      const visibleTasks = response.data.filter(task => !isArchivedLocally(task.id));
      
      setTasks(visibleTasks);
    } catch (error) {
      console.error("Eroare la încărcarea task-urilor", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchMyTasks(); 
    // Opțional: Poți pune un interval aici dacă vrei să vezi automat când Managerul dă Close
    // const interval = setInterval(fetchMyTasks, 5000);
    // return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Pasul 1: Tu termini treaba
  const handleFinalize = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/finalize`);
      fetchMyTasks(); // Reîmprospătăm ca să vedem statusul nou (COMPLETED)
    } catch (error) {
      console.error("Eroare la finalizare:", error);
      alert("Eroare la finalizare.");
    }
  };

  // Pasul 3: Managerul a dat Close, tu dai Arhivează
  const handleArchive = (taskId) => {
    // 1. Salvăm ID-ul în localStorage ca "ascuns"
    const currentArchived = JSON.parse(localStorage.getItem('archivedTasks') || '[]');
    const newArchived = [...currentArchived, taskId];
    localStorage.setItem('archivedTasks', JSON.stringify(newArchived));

    // 2. Scoatem task-ul din lista vizibilă instantaneu
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const projectName = task.project?.name || 'Sarcini fără proiect';
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);
    return acc;
  }, {});

  // Funcție pentru a determina culoarea și textul statusului
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return { class: 'executant-status-pending', text: 'PENDING' };
      case 'COMPLETED': return { class: 'executant-status-completed', text: 'Așteaptă Manager' };
      case 'CLOSED': return { class: 'executant-status-closed', text: 'CLOSED' };
      default: return { class: '', text: status };
    }
  };

  return (
    <div className="executant-dashboard-container">
      <header className="executant-dashboard-header">
        <h1 className="executant-dashboard-title">Dashboard-ul Meu</h1>
        <button className="executant-btn-logout" onClick={handleLogout}>Log Out</button>
      </header>

      <main className="executant-section-card">
        <h3 className="executant-section-title">Lista Sarcini</h3>

        {loading ? (
          <p className="executant-status-text">Se încarcă task-urile...</p>
        ) : Object.keys(groupedTasks).length > 0 ? (
          Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
            <div key={projectName} className="executant-project-group">
              <h4 className="executant-project-header">{projectName}</h4>
              <div className="executant-table-wrapper">
                <table className="executant-user-table">
                  <thead>
                    <tr>
                      <th>Titlu</th>
                      <th>Descriere</th>
                      <th>Status</th>
                      <th className="executant-actions-header">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectTasks.map(task => {
                      const badge = getStatusBadge(task.status);
                      return (
                        <tr key={task.id}>
                          <td><strong>{task.title}</strong></td>
                          <td>{task.description}</td>
                          
                          {/* Coloana Status */}
                          <td>
                            <span className={`executant-status-badge ${badge.class}`}>
                              {badge.text}
                            </span>
                          </td>

                          {/* Coloana Acțiuni - Logica cerută de tine */}
                          <td className="executant-actions-cell">
                            
                            {/* CAZ 1: PENDING -> Buton Finalizează */}
                            {task.status === 'PENDING' && (
                              <button 
                                className="executant-btn-finalize" 
                                onClick={() => handleFinalize(task.id)}
                              >
                                Finalizează
                              </button>
                            )}

                            {/* CAZ 2: COMPLETED -> Doar text informativ */}
                            {task.status === 'COMPLETED' && (
                              <span style={{  color: 'orange', fontSize: '0.9rem' }}>
                                ⏳ Managerul verifică...
                              </span>
                            )}

                            {/* CAZ 3: CLOSED -> Buton Arhivează */}
                            {task.status === 'CLOSED' && (
                              <button 
                                className="executant-btn-archive" 
                                onClick={() => handleArchive(task.id)}
                                title="Ascunde din listă"
                                style={{
                                    backgroundColor: '#e74c3c', 
                                    color: 'white', 
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                              >
                                ✖ Arhivează
                              </button>
                            )}

                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="executant-status-text">Nu ai task-uri vizibile.</p>
        )}
      </main>

      <button className="executant-btn-history" onClick={() => navigate('/history')}>
        <span>📋</span> Vezi Istoric Complet
      </button>
    </div>
  );
};

export default ExecutantDashboard;